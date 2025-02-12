// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const AuthController = require("../../controllers/auth.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  signupValidator,
  authValidators,
} = require("../../validators/auth.validator");

// Initialize controller using IIFE to handle errors immediately
const authController = (() => {
  try {
    return new AuthController();
  } catch (error) {
    console.error("Failed to initialize AuthController:", error);
    process.exit(1);
  }
})();

// Route definitions
router
  .post(
    "/signup",
    validateMiddleware(signupValidator),
    authController.signup.bind(authController)
  )
  .post(
    "/sign-in",
    validateMiddleware(authValidators.signIn),
    authController.signIn.bind(authController)
  );

module.exports = router;
