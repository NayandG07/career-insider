import mongoose from 'mongoose';

const skillProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    readinessScore: {
      type: Number,
      default: 50,
    },
    scoreVersion: {
      type: Number,
      default: 2,
    },
    scoringModel: {
      type: String,
      default: 'v2-5dim',
    },
    categories: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 }, // 0-100 Evidence Strength
        level: { type: String, default: 'Developing' }, // Strong, Developing, Emerging, Insufficient Evidence
        skills: [{ type: String }],
        dimensions: {
          breadth: { type: Number, default: 0 },
          depth: { type: Number, default: 0 },
          recency: { type: Number, default: 0 },
          application: { type: Number, default: 0 },
          corroboration: { type: Number, default: 0 },
        },
      },
    ],
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        level: { type: String, enum: ['Advanced Evidence', 'Strong', 'Developing', 'Emerging', 'Insufficient Evidence', 'Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Developing' },
        confidence: { type: String, enum: ['High', 'Moderate', 'Low'], default: 'Moderate' },
        evidenceStrength: { type: Number, default: 50 },
        evidenceCount: { type: Number, default: 1 },
        evidenceSummary: { type: String, default: '' },
        evidenceRefs: [{ type: String }],
        explanation: { type: String, default: '' },
        whyItMatters: { type: String, default: '' },
        focusNext: { type: String, default: '' },
      },
    ],
    gapAnalysis: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'General' },
        delta: { type: String, default: '' },
        priority: { type: String, default: 'P2 PRIORITY' },
        recommendation: { type: String, default: '' },
        evidenceRefs: [{ type: String }],
      },
    ],
    sourceContributions: {
      leetcode: { type: Number, default: 0 },
      codeforces: { type: Number, default: 0 },
      github: { type: Number, default: 0 },
      project: { type: Number, default: 0 },
      counts: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    rawMetrics: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    previousSnapshots: [
      {
        computedAt: { type: Date, default: Date.now },
        readinessScore: Number,
        categories: Array,
        topSkills: Array,
      },
    ],
    lastComputedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SkillProfile = mongoose.model('SkillProfile', skillProfileSchema);
export default SkillProfile;
