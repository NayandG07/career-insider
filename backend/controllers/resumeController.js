import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import logger from '../utils/logger.js';

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

/**
 * POST /api/resume/upload
 * Upload a PDF resume. Extracts text via pdf-parse, sends to AI service
 * for structured skill extraction, then cleans up the file.
 */
export const uploadResume = async (req, res) => {
  let filePath = null;
  const resumeTask = logger.startTask('AI RESUME', 'PDF Resume Ingestion & Parsing', {
    user: req.user.email || req.user._id,
    fileName: req.file?.originalname || 'N/A',
    fileSize: req.file?.size ? `${Math.round(req.file.size / 1024)} KB` : 'N/A'
  });

  try {
    if (!req.file) {
      resumeTask.error(new Error('No file uploaded'), 'No file uploaded');
      return res.status(400).json({ error: 'No file uploaded. Please upload a PDF.' });
    }

    filePath = req.file.path;

    // Step 1: Extract text from PDF
    // pdf-parse is a CJS module, use dynamic import
    const pdfParse = (await import('pdf-parse')).default;
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(fileBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      resumeTask.error(new Error('Insufficient text in PDF'), 'Insufficient text extracted from PDF');
      return res.status(400).json({ error: 'Could not extract sufficient text from the PDF.' });
    }

    // Step 2: Send text to Python AI service for structured extraction
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    const aiResponse = await axios.post(
      `${aiServiceUrl}/ai/resume`,
      { resume_text: resumeText },
      { timeout: 60000 }
    );

    const extractedData = aiResponse.data;

    resumeTask.success({
      extractedSkills: extractedData.skills?.length || 0,
      extractedExperiences: extractedData.experience?.length || 0,
      extractedEducation: extractedData.education?.length || 0
    });

    res.json({
      message: 'Resume parsed successfully.',
      data: extractedData,
    });
  } catch (error) {
    resumeTask.error(error, 'Resume parsing failed');

    if (error.response) {
      // AI service returned an error
      return res.status(502).json({ error: 'AI service failed to parse the resume.' });
    }

    res.status(500).json({ error: 'Failed to process resume.' });
  } finally {
    // Clean up uploaded file
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};
