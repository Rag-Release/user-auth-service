// src/frameworks/webserver/middlewares/globalErrorMiddleware.js
const ErrorHandler = require("../shared/utils/ErrorHandler");

const globalErrorMiddleware = (err, req, res, next) => {
  // If it's not our custom ErrorHandler, convert it
  const error =
    err instanceof ErrorHandler
      ? err
      : new ErrorHandler(
          err.message || "An unexpected error occurred",
          err.statusCode || 500,
          "UNEXPECTED_ERROR"
        );

  // Structured error response
  res.status(error.statusCode).json({
    success: false,
    timestamp: error.timestamp,
    errorCode: error.errorCode,
    message: error.message,
  });
};

module.exports = globalErrorMiddleware;
