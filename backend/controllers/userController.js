import User from '../models/User.js';
import bcrypt from 'bcrypt';

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
      bio: user.bio,
      socialLinks: user.socialLinks,
      careerDirections: user.careerDirections,
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
    const allowedFields = ['name', 'avatar', 'connectedSources', 'bio', 'socialLinks', 'careerDirections'];
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
      lastSyncedAt: user.lastSyncedAt,
      createdAt: user.createdAt,
      bio: user.bio,
      socialLinks: user.socialLinks,
      careerDirections: user.careerDirections,
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

/**
 * POST /api/users/change-password
 * Change the current authenticated user's password.
 */
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In case user doesn't have a password yet (e.g. OAuth only)
    if (!user.passwordHash) {
      const hash = await bcrypt.hash(newPassword, 12);
      user.passwordHash = hash;
      await user.save();
      return res.status(200).json({ message: 'Password configured successfully' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = hash;
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
