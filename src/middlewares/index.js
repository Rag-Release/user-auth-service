const globalErrorMiddleware = require("./globalError.middleware");
const validateMiddleware = require("./validate.middleware");
const authMiddleware = require("./auth.middleware");

module.exports = {
  globalErrorMiddleware,
  validateMiddleware,
  authMiddleware,
};
