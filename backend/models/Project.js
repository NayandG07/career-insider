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
      maxlength: 120,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
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
      maxlength: 500,
    },
    solution: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    technologies: {
      type: [String],
      default: [],
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
    },
    liveDemoUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 300,
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

