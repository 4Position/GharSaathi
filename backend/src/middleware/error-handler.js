function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;
  const message = error.publicMessage || "An unexpected server error occurred.";

  if (process.env.NODE_ENV !== "test") {
    console.error(error);
  }

  return res.status(statusCode).json({
    error: { message },
  });
}

module.exports = errorHandler;
