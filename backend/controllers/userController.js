import User from '../models/User.js';

/**
 * GET /api/users/me
 * Get the current authenticated user's profile.
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      connectedSources: user.connectedSources,
      readinessScore: user.readinessScore,
      lastSyncedAt: user.lastSyncedAt,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * PUT /api/users/me
 * Update the current user's profile (name, connected source handles).
 */
export const updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar', 'connectedSources'];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      connectedSources: user.connectedSources,
      readinessScore: user.readinessScore,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * DELETE /api/users/me
 * Delete the current user's account.
 */
export const deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
