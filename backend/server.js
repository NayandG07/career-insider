import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import connectDB from './config/db.js';
import { startSyncCron } from './services/syncOrchestrator.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import telemetryRoutes from './routes/telemetryRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import githubRoutes from './routes/githubRoutes.js';
import codeforcesRoutes from './routes/codeforcesRoutes.js';
import leetcodeRoutes from './routes/leetcodeRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Log OAuth initialization status safely
console.log(`[CareerOS] Server running on port ${PORT}`);
console.log(`[CareerOS] GitHub OAuth App ID: ${process.env.GITHUB_CLIENT_ID ? process.env.GITHUB_CLIENT_ID.slice(0, 6) + '...' : 'Not Configured'}`);

// ─── Middleware ───────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(logger.httpMiddleware);

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/codeforces', codeforcesRoutes);
app.use('/api/leetcode', leetcodeRoutes);


// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10MB.' });
  }

  // Multer file type error
  if (err.message === 'Only PDF files are allowed.') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error.' });
});

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  // Seed default AI configs if none exist
  const { default: AiConfig } = await import('./models/AiConfig.js');
  const existingConfigs = await AiConfig.countDocuments();
  if (existingConfigs === 0) {
    console.log('📦 Seeding default AI configurations...');
    await AiConfig.insertMany([
      {
        task: 'resume_parse',
        label: 'Resume Parsing',
        primaryProvider: 'gemini',
        primaryModel: 'gemini-1.5-flash',
        fallbackChain: ['openai', 'huggingface'],
      },
      {
        task: 'skill_analyze',
        label: 'Skill Analysis',
        primaryProvider: 'gemini',
        primaryModel: 'gemini-1.5-pro',
        fallbackChain: ['openai', 'huggingface'],
      },
      {
        task: 'roadmap_gen',
        label: 'Roadmap Generation',
        primaryProvider: 'gemini',
        primaryModel: 'gemini-1.5-pro',
        fallbackChain: ['openai', 'huggingface'],
      },
      {
        task: 'company_match',
        label: 'Company Matching',
        primaryProvider: 'gemini',
        primaryModel: 'gemini-1.5-pro',
        fallbackChain: ['openai', 'huggingface'],
      },
      {
        task: 'mentor_chat',
        label: 'AI Mentor Chat',
        primaryProvider: 'openai',
        primaryModel: 'gpt-4o-mini',
        fallbackChain: ['gemini', 'huggingface'],
      },
    ]);
    console.log('📦 Default AI configurations seeded.');
  }

  // Start the sync cron job
  startSyncCron();

  app.listen(PORT, () => {
    logger.success('SERVER', `CareerOS API Gateway online and ready on port ${PORT}`);
    logger.info('SERVER', `Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'} | AI Service: ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}`);
  });
};

startServer().catch((err) => {
  logger.error('SERVER', 'Failed to start server', err);
  process.exit(1);
});
