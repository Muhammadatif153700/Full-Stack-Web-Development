function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);

  const statusCode = error.statusCode || error.status || 500;
  if (statusCode >= 500) console.error(error);
  response.status(statusCode).json({
    error: statusCode >= 500 ? 'An unexpected server error occurred.' : error.message
  });
}

module.exports = errorHandler;
