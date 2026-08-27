import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ['Foundation', 'Core Skill', 'Advanced Skill', 'Practical Application', 'Project'],
      default: 'Core Skill',
    },
    description: { type: String, default: '' },
    whyItMatters: { type: String, default: '' },
    skills: [{ type: String }],
    evidenceState: {
      type: String,
      enum: ['strong', 'partial', 'missing'],
      default: 'partial',
    },
    gapLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    estimatedHours: { type: Number, default: 12 },
    prerequisites: [{ type: String }],
    sequenceIndex: { type: Number, default: 1 },
    outcome: { type: String, default: '' },
    suggestedProject: { type: String, default: null },
    evidenceRefs: [{ type: String }],
  },
  { _id: false }
);

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    targetRoles: {
      type: [String],
      required: true,
      default: ['Senior Backend Engineer'],
    },
    summary: {
      title: { type: String, default: 'Personalized Career Growth Roadmap' },
      description: { type: String, default: '' },
      primaryFocus: [{ type: String }],
      currentEvidenceLevel: { type: String, default: 'Moderate' },
    },
    weeklyHours: { type: Number, default: 10 },
    estimatedTotalHours: { type: Number, default: 0 },
    estimatedTotalWeeks: { type: Number, default: 0 },
    milestones: [milestoneSchema],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
