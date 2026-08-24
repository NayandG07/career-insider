/**
 * Admin role guard middleware.
 * Must be used AFTER the auth middleware (req.user must exist).
 * Returns 403 if the user is not an admin.
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
};

export default isAdmin;
