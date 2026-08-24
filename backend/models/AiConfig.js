import mongoose from 'mongoose';

const aiConfigSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    primaryProvider: {
      type: String,
      enum: ['gemini', 'openai', 'huggingface'],
      required: true,
    },
    primaryModel: {
      type: String,
      required: true,
    },
    fallbackChain: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const AiConfig = mongoose.model('AiConfig', aiConfigSchema);
export default AiConfig;
