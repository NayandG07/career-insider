import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRoles: {
      type: [String],
      required: true,
    },
    milestones: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        desc: { type: String, default: '' },
        tags: [String],
        status: {
          type: String,
          enum: ['completed', 'in-progress', 'locked'],
          default: 'locked',
        },
        progress: { type: Number, default: 0 },
        subtasks: [
          {
            id: { type: String, required: true },
            text: { type: String, required: true },
            completed: { type: Boolean, default: false },
          },
        ],
      },
    ],
    readiness: {
      type: Number,
      default: 0,
    },
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
