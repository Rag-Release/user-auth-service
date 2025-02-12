// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/user.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const { userValidators } = require("../../validators/user.validator");
const {
  verifyToken,
  checkRoles,
} = require("../../middlewares/auth.middleware");
const AuthRepository = require("../../repositories/auth.repository");
const JWTService = require("../../services/jwt.service");
const PasswordService = require("../../services/password.service");

// Create controller instance with error handling
let userController;
try {
  const dependencies = {
    userRepository: new AuthRepository(),
    jwtService: new JWTService(),
    passwordService: new PasswordService(),
  };
  userController = new UserController(dependencies);
} catch (error) {
  console.error("Failed to initialize UserController:", error);
  throw error;
}

// Bind all controller methods to maintain proper 'this' context
const boundMethods = {
  getUsers: userController.getUsers?.bind(userController),
  getUser: userController.getUser?.bind(userController),
  updateProfile: userController.updateProfile?.bind(userController),
  softDeleteUser: userController.softDeleteUser?.bind(userController),
  deleteUserById: userController.deleteUserById?.bind(userController),
  verifyEmail: userController.verifyEmail?.bind(userController),
  deVerifyEmail: userController.deVerifyEmail?.bind(userController),
  upgradeAccount: userController.upgradeAccount?.bind(userController),
};

// Protected routes
router.use(verifyToken); // Protect all routes below

// Admin only routes
if (boundMethods.getUsers) {
  router.get("/users", checkRoles(["admin"]), boundMethods.getUsers);
}

// User routes
if (boundMethods.getUser) {
  router.get("/profile/:id", boundMethods.getUser);
}

if (boundMethods.updateProfile) {
  router.put(
    "/profile/:id",
    // validateMiddleware(userValidators.updateProfile),
    boundMethods.updateProfile
  );
}

if (boundMethods.softDeleteUser) {
  router.patch(
    "/profile/:id",
    // validateMiddleware(userValidators.updateProfile),
    boundMethods.softDeleteUser
  );
}

if (boundMethods.deleteUserById) {
  router.delete(
    "/profile/:id",
    // validateMiddleware(userValidators.updateProfile),
    boundMethods.deleteUserById
  );
}

if (boundMethods.verifyEmail) {
  router.patch(
    "/profile-verify/:id",
    // validateMiddleware(userValidators.updateProfile),
    boundMethods.verifyEmail
  );
}

if (boundMethods.deVerifyEmail) {
  router.patch(
    "/profile-de-verify/:id",
    // validateMiddleware(userValidators.updateProfile),
    boundMethods.deVerifyEmail
  );
}

if (boundMethods.upgradeAccount) {
  router.post(
    "/upgrade",
    // validateMiddleware(userValidators.upgradeAccount),
    boundMethods.upgradeAccount
  );
}

// Export the router
module.exports = router;
