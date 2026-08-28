import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['custom', 'github'],
      default: 'custom',
    },
    githubRepositoryId: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    primaryLanguage: {
      type: String,
      default: '',
      trim: true,
    },
    problem: {
      type: String,
      default: '',
      trim: true,
    },
    solution: {
      type: String,
      default: '',
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
    },
    liveDemoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate imports of the same GitHub repository for a single user
projectSchema.index({ userId: 1, githubRepositoryId: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;

