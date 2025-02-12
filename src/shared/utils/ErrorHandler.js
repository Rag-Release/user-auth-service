const fs = require("fs").promises; // Using promise-based fs
const path = require("path");
const { format } = require("date-fns");

class ErrorHandler extends Error {
  static ERROR_TYPES = {
    BAD_REQUEST: { code: 400, name: "BAD_REQUEST" },
    UNAUTHORIZED: { code: 401, name: "UNAUTHORIZED" },
    FORBIDDEN: { code: 403, name: "FORBIDDEN" },
    NOT_FOUND: { code: 404, name: "NOT_FOUND" },
    INTERNAL_SERVER: { code: 500, name: "INTERNAL_SERVER_ERROR" },
  };

  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  async logError() {
    try {
      const errorDetails = this.extractErrorDetails();
      const formattedLog = this.formatErrorLog(errorDetails);
      console.log("formattedLog", formattedLog);
      await this.consoleLogError(formattedLog);
      await this.fileLogError(formattedLog);
    } catch (logError) {
      console.error("Error logging failed:", logError);
    }
  }

  extractErrorDetails() {
    const stack = this.stack.split("\n");
    const errorLocation = stack[1]?.trim() || "";
    const match = errorLocation.match(/\((.+):(\d+):(\d+)\)/);

    return {
      filePath: match?.[1] || "Unknown",
      lineNumber: match?.[2] || "N/A",
      stack: this.stack,
    };
  }

  formatErrorLog(errorDetails) {
    const timestamp = format(this.timestamp, "yyyy-MM-dd HH:mm:ss");

    return `
===== ERROR LOG =====
Timestamp: ${timestamp}
Message: ${this.message}
Error Code: ${this.errorCode || "N/A"}
File: ${errorDetails.filePath}
Line: ${errorDetails.lineNumber}
Full Stack Trace:
${errorDetails.stack}
====================
`;
  }

  async consoleLogError(errorLog) {
    // Using console.error for errors instead of console.log
    console.error("\x1b[31m%s\x1b[0m", errorLog);
  }

  async fileLogError(errorLog) {
    const logDirectory = path.join(process.cwd(), "logs");

    try {
      await fs.mkdir(logDirectory, { recursive: true });
      const logFile = path.join(
        logDirectory,
        `error-${format(new Date(), "yyyy-MM-dd")}.log`
      );
      await fs.appendFile(logFile, errorLog + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  // Static factory methods for common error types
  static badRequest(message) {
    const { code, name } = ErrorHandler.ERROR_TYPES.BAD_REQUEST;
    return new ErrorHandler(message, code, name);
  }

  static unauthorized(message) {
    const { code, name } = ErrorHandler.ERROR_TYPES.UNAUTHORIZED;
    return new ErrorHandler(message, code, name);
  }

  static forbidden(message) {
    const { code, name } = ErrorHandler.ERROR_TYPES.FORBIDDEN;
    return new ErrorHandler(message, code, name);
  }

  static notFound(message) {
    const { code, name } = ErrorHandler.ERROR_TYPES.NOT_FOUND;
    return new ErrorHandler(message, code, name);
  }

  static internalServer(message) {
    const { code, name } = ErrorHandler.ERROR_TYPES.INTERNAL_SERVER;
    return new ErrorHandler(message, code, name);
  }
}

class ValidationError extends ErrorHandler {
  constructor(message) {
    super(
      message,
      ErrorHandler.ERROR_TYPES.BAD_REQUEST.code,
      "VALIDATION_ERROR"
    );
  }
}

class NotFoundError extends ErrorHandler {
  constructor(message) {
    super(message, ErrorHandler.ERROR_TYPES.NOT_FOUND.code, "NOT_FOUND");
  }
}

module.exports = { ErrorHandler, ValidationError, NotFoundError };
