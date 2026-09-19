const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a JWT token with the given payload.
 */
function signToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or throws an error.
 */
function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
