const { error } = require('../utils/response');

/**
 * Reusable request body validation middleware.
 * Takes an array of required field names and checks they exist in req.body.
 */
function validateRequired(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return error(res, `Missing required field(s): ${missing.join(', ')}`, 400);
    }

    next();
  };
}

/**
 * Validate that the :id param is a valid positive integer.
 */
function validateIdParam(req, res, next) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return error(res, 'Invalid ID parameter.', 400);
  }
  req.params.id = id;
  next();
}

module.exports = { validateRequired, validateIdParam };
