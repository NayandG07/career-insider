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
    categories: [
      {
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        tags: [String],
      },
    ],
    masteryItems: [
      {
        title: { type: String, required: true },
        level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' },
        score: { type: Number, default: 0 },
        trend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
      },
    ],
    gapAnalysis: [
      {
        name: { type: String, required: true },
        delta: { type: String, default: '' },
        priority: { type: String, default: '' },
      },
    ],
    trendingSkills: [
      {
        name: { type: String, required: true },
        demand: { type: String, default: '' },
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
