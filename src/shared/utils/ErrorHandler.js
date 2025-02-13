const fs = require("fs");
const path = require("path");

// Base error handler class
class ErrorHandler extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    Error.captureStackTrace(this, this.constructor);
    this.logError();
  }

  logError() {
    try {
      // Get the stack trace
      const stack = this.stack.split("\n");
      const errorLocation = stack[1]?.trim() || "Unknown location";

      // Extract file and line information
      const match = errorLocation.match(/\((.+):(\d+):(\d+)\)/);
      const filePath = match ? match[1] : "Unknown";
      const lineNumber = match ? match[2] : "N/A";
      const columnNumber = match ? match[3] : "N/A";

      // Prepare error log with more details
      const errorLog = `
====================================
ERROR LOG
====================================
Timestamp: ${this.timestamp}
Error Type: ${this.name}
Message: ${this.message}
Error Code: ${this.errorCode || "N/A"}
Status Code: ${this.statusCode}
Location:
  File: ${filePath}
  Line: ${lineNumber}
  Column: ${columnNumber}
Full Stack Trace:
${this.stack}
====================================
`;

      // Console log with better formatting
      console.error("\x1b[31m%s\x1b[0m", errorLog);

      // Write to error log file with date-based organization
      const logDirectory = path.join(process.cwd(), "logs");
      const dateStr = new Date().toISOString().split("T")[0];
      const errorDirectory = path.join(logDirectory, "errors");

      // Create directories if they don't exist
      [logDirectory, errorDirectory].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      const logFile = path.join(errorDirectory, `error-${dateStr}.log`);
      fs.appendFileSync(logFile, errorLog + "\n");
    } catch (logError) {
      console.error("Error logging failed:", logError.message);
    }
  }

  // Static factory methods for common error types
  static badRequest(message) {
    return new ErrorHandler(message, 400, "BAD_REQUEST");
  }

  static unauthorized(message) {
    return new ErrorHandler(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message) {
    return new ErrorHandler(message, 403, "FORBIDDEN");
  }

  static notFound(message) {
    return new ErrorHandler(message, 404, "NOT_FOUND");
  }

  static internalServer(message = "Internal server error") {
    return new ErrorHandler(message, 500, "INTERNAL_SERVER_ERROR");
  }

  static serviceUnavailable(message) {
    return new ErrorHandler(message, 503, "SERVICE_UNAVAILABLE");
  }
}

// Authentication related errors
class AuthError extends ErrorHandler {
  constructor(message, statusCode = 401) {
    super(message, statusCode, "AUTH_ERROR");
  }
}

// Validation related errors
class ValidationError extends ErrorHandler {
  constructor(message) {
    super(message, 400, "VALIDATION_ERROR");
  }

  static invalidField(fieldName, reason) {
    return new ValidationError(`Invalid ${fieldName}: ${reason}`);
  }

  static requiredField(fieldName) {
    return new ValidationError(`${fieldName} is required`);
  }
}

// Invalid credentials specific error
class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid credentials provided") {
    super(message, 401);
  }
}

module.exports = {
  ErrorHandler,
  AuthError,
  ValidationError,
  InvalidCredentialsError,
};
