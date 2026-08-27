import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['github', 'leetcode', 'codeforces'],
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: one latest record per user per source
telemetrySchema.index({ userId: 1, source: 1 });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
