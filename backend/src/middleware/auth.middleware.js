const { verifyToken } = require('../utils/jwt');
const userRepository = require('../repositories/user.repository');
const { error } = require('../utils/response');

/**
 * Authentication middleware.
 * Reads JWT from Authorization header, verifies it,
 * and attaches the user to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication required.', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return error(res, 'Authentication required.', 401);
    }

    const decoded = verifyToken(token);

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return error(res, 'User not found.', 401);
    }

    if (!user.is_active) {
      return error(res, 'Your account has been deactivated.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401);
  }
}

module.exports = { authenticate };
