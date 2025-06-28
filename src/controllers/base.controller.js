const ErrorHandler = require("../shared/utils/ErrorHandler");

class BaseController {
  sendSuccess(res, data = {}, status = 200) {
    return res.status(status).json({
      status: "success",
      ...data,
    });
  }

  async handleRequest(req, res, handler) {
    try {
      await handler(req, res);
    } catch (error) {
      this.handleError(res, error);
    }
  }

  handleError(res, error) {
    console.error(`Operation error: ${error.message}`, error);

    if (error instanceof ErrorHandler) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

module.exports = BaseController;
