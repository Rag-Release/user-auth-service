// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const UserController = require("../../../interfaces/controllers/user.controller");
const validateMiddleware = require("../../../interfaces/middlewares/validate.middleware");
const {
  signupValidator,
  userValidators,
} = require("../../../interfaces/validators/user.validator");

// Create controller instance with error handling
let userController;
try {
  userController = new UserController();
} catch (error) {
  console.error("Failed to initialize UserController:", error);
  throw error;
}

// Signup route with validation middleware
router.post(
  "/signup",
  validateMiddleware(signupValidator),
  userController.signup
);

// Auth routes
router.post(
  "/sign-in",
  // validateMiddleware(userValidators.signIn),
  userController.signIn.bind(userController)
);

// Protected routes
// router.use(auth); // Apply auth middleware to all routes below

router.put(
  "/profile",
  // validateMiddleware(userValidators.updateProfile),
  userController.updateProfile.bind(userController)
);

router.post(
  "/upgrade",
  // validateMiddleware(userValidators.upgradeAccount),
  userController.upgradeAccount.bind(userController)
);

// Export the router
module.exports = router;
