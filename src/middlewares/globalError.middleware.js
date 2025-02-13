const logger = require("../logger/logger");

// Custom error class for operational errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response formatter
const formatError = (err, includeStack = false) => {
  const response = {
    status: err.status || "error",
    statusCode: err.statusCode || 500,
    message: err.message || "Internal server error",
    errorCode: err.errorCode,
  };

  if (includeStack && process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return response;
};

// Handle specific known errors
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again.", 401);

const handleSequelizeValidationError = (err) => {
  const message = `Invalid input data. ${err.errors
    .map((error) => error.message)
    .join(". ")}`;
  return new AppError(message, 400);
};

const handleSequelizeUniqueConstraintError = (err) => {
  const message = `Duplicate field value: ${err.errors[0].value}. Please use another value.`;
  return new AppError(message, 400);
};

// Global error handling middleware
const globalErrorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Log error
  logger.error({
    message: "Error caught in global error handler",
    error: {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    },
  });

  // Handle specific error types
  let error = { ...err };
  error.message = err.message;

  if (error.name === "JsonWebTokenError") error = handleJWTError();
  if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
  if (error.name === "SequelizeValidationError")
    error = handleSequelizeValidationError(error);
  if (error.name === "SequelizeUniqueConstraintError")
    error = handleSequelizeUniqueConstraintError(error);

  // Send response based on environment
  if (process.env.NODE_ENV === "development") {
    return sendDevError(err, req, res);
  }

  return sendProdError(error, req, res);
};

// Development error response
const sendDevError = (err, req, res) => {
  // API error response
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json(formatError(err, true));
  }

  // Rendered website error response
  return res.status(err.statusCode).json({
    title: "Something went wrong!",
    message: err.message,
    stack: err.stack,
  });
};

// Production error response
const sendProdError = (err, req, res) => {
  // API operational error response
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json(formatError(err));
    }

    // Programming or unknown error: don't leak error details
    logger.error("ERROR 💥:", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }

  // Rendered website error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      title: "Something went wrong!",
      message: err.message,
    });
  }

  return res.status(500).json({
    title: "Something went wrong!",
    message: "Please try again later.",
  });
};

module.exports = {
  globalErrorMiddleware,
  AppError,
  formatError,
};
