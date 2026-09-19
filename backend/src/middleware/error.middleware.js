const { error } = require('../utils/response');

/**
 * Centralized error handling middleware.
 * Catches errors thrown by controllers/services and returns a consistent response.
 */
function errorHandler(err, req, res, _next) {
  // Handle known service errors with status
  if (err.status) {
    return error(res, err.message, err.status);
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return error(res, 'A record with this value already exists.', 409);
  }
  if (err.code === 'P2003') {
    return error(res, 'Cannot perform this operation due to related records.', 400);
  }
  if (err.code === 'P2025') {
    return error(res, 'Record not found.', 404);
  }

  // Log unexpected errors
  console.error('[ERROR]', err.message || err);

  return error(res, 'An unexpected error occurred.', 500);
}

module.exports = { errorHandler };
