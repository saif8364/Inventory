const { error } = require('../utils/response');

/**
 * Middleware that restricts access to SUPER_ADMIN users only.
 */
function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return error(res, 'Authentication required.', 401);
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    return error(res, 'Access denied. Super Admin privileges required.', 403);
  }

  next();
}

module.exports = { requireSuperAdmin };
