// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const AuthController = require("../../../interfaces/controllers/auth.controller");
const validateMiddleware = require("../../../interfaces/middlewares/validate.middleware");
const {
  signupValidator,
  authValidators,
} = require("../../../interfaces/validators/auth.validator");

// Create controller instance with error handling
let authController;
try {
  authController = new AuthController();
} catch (error) {
  console.error("Failed to initialize AuthController:", error);
  throw error;
}

// Signup route with validation middleware
router.post(
  "/signup",
  validateMiddleware(signupValidator),
  authController.signup
);

// Auth routes
router.post(
  "/sign-in",
  validateMiddleware(authValidators.signIn),
  async (req, res) => await authController.signIn(req, res)
);

module.exports = router;
