/**
 * Standard API response helpers.
 * All API responses follow a consistent format.
 */

function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function successWithPagination(res, data, pagination, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination,
  });
}

function error(res, message, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { success, successWithPagination, error };
