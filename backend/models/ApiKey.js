import mongoose from 'mongoose';

const apiKeySchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'huggingface'],
      required: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    encryptedKey: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['ok', 'rate_limited', 'failed'],
      default: 'ok',
    },
    lastUsedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

apiKeySchema.index({ provider: 1, isActive: 1 });

const ApiKey = mongoose.model('ApiKey', apiKeySchema);
export default ApiKey;
