import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      index: { unique: true, sparse: true }, // sparse allows null for OAuth-only users
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      select: false, // never returned in queries by default
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    bio: {
      type: String,
      default: '',
    },
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    careerDirections: {
      type: [String],
      default: [],
    },

    // ─── OAuth provider identifiers ───────────────────
    auth: {
      github: {
        id: String,
        username: String,
        accessToken: { type: String, select: false },
      },
      google: {
        id: String,
      },
    },

    // ─── Connected platform handles ───────────────────
    connectedSources: {
      github: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      codeforces: { type: String, default: '' },
    },

    // ─── Aggregated scores ────────────────────────────
    readinessScore: {
      type: Number,
      default: 0,
    },
    // Historical snapshots for the progress chart in Reports
    readinessHistory: [
      {
        score: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    lastAnalyzedAt: { type: Date, default: null },


    // ─── Refresh tokens ───────────────────────────────
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now, expires: '7d' },
      },
    ],

    lastSyncedAt: Date,
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Indexes
userSchema.index({ 'auth.github.id': 1 });
userSchema.index({ 'auth.google.id': 1 });

const User = mongoose.model('User', userSchema);
export default User;
