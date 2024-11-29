const fs = require("fs");
const path = require("path");

class ErrorHandler extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date();
    this.logError();
  }

  logError() {
    try {
      // Get the stack trace
      const stack = this.stack.split("\n");
      const errorLocation = stack[1].trim();

      // Extract file and line information
      const match = errorLocation.match(/\((.+):(\d+):(\d+)\)/);
      const filePath = match ? match[1] : "Unknown";
      const lineNumber = match ? match[2] : "N/A";

      // Prepare error log
      const errorLog = `
      ===== ERROR LOG =====
      Timestamp: ${this.timestamp}
      Message: ${this.message}
      Error Code: ${this.errorCode || "N/A"}
      File: ${filePath}
      Line: ${lineNumber}
      Full Stack Trace:
      ${this.stack}
      ====================
      `;

      // Console log
      console.log("\x1b[31m%s\x1b[0m", errorLog);

      // Optional: Write to error log file
      const logDirectory = path.join(process.cwd(), "logs");
      if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
      }

      const logFile = path.join(logDirectory, "error.log");
      fs.appendFileSync(logFile, errorLog + "\n");
    } catch (logError) {
      console.log("Error logging failed:", logError);
    }
  }

  // Static method for creating common error types
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

  static internalServer(message) {
    return new ErrorHandler(message, 500, "INTERNAL_SERVER_ERROR");
  }
}

module.exports = ErrorHandler;
