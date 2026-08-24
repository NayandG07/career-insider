import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [
      {
        sender: { type: String, enum: ['user', 'mentor'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

chatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);
export default ChatHistory;
