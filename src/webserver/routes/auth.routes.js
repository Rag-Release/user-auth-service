const express = require("express");
const router = express.Router();
const { AuthController } = require("../../controllers");
const { validateMiddleware } = require("../../middlewares");
const { authValidators } = require("../../validators/auth.validator");

class AuthRouter {
  constructor() {
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Signup route
    router.post(
      "/signup",
      validateMiddleware(authValidators.signup),
      this.asyncHandler(this.authController.signup)
    );

    // Sign in route
    router.post(
      "/sign-in",
      validateMiddleware(authValidators.signIn),
      this.asyncHandler(this.authController.signIn)
    );

    return router;
  }

  // Utility method to handle async routes and catch errors
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

// Export an instance of the router
module.exports = new AuthRouter().initializeRoutes();
