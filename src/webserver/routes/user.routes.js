const express = require("express");
const router = express.Router();
const { UserController } = require("../../controllers/index");
const {
  verifyToken,
  checkRoles,
} = require("../../middlewares/auth.middleware");
const { UserRepository } = require("../../repositories/index");
const { JWTService, PasswordService } = require("../../services/index");

// Create controller instance with error handling
let userController;
try {
  const dependencies = {
    userRepository: new UserRepository(),
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
router.use(verifyToken);

// Admin only routes
if (boundMethods.getUsers) {
  router.get("/users", checkRoles(["publisher"]), boundMethods.getUsers);
}

// User routes
if (boundMethods.getUsers) {
  router.get("/profile", boundMethods.getUsers);
}

if (boundMethods.getUser) {
  router.get("/profile/:id", boundMethods.getUser);
}

if (boundMethods.updateProfile) {
  router.put("/profile/:id", boundMethods.updateProfile);
}

if (boundMethods.softDeleteUser) {
  router.patch("/profile/:id", boundMethods.softDeleteUser);
}

if (boundMethods.deleteUserById) {
  router.delete("/profile/:id", boundMethods.deleteUserById);
}

if (boundMethods.verifyEmail) {
  router.patch("/profile-verify/:id", boundMethods.verifyEmail);
}

if (boundMethods.deVerifyEmail) {
  router.patch("/profile-de-verify/:id", boundMethods.deVerifyEmail);
}

if (boundMethods.upgradeAccount) {
  router.post("/upgrade", boundMethods.upgradeAccount);
}

// Export the router
module.exports = router;
