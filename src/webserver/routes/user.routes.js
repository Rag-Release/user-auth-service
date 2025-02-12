// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/user.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  signupValidator,
  userValidators,
} = require("../../validators/user.validator");
const {
  verifyToken,
  checkRoles,
} = require("../../middlewares/auth.middleware");

// Create controller instance with error handling
let userController;
try {
  userController = new UserController();
} catch (error) {
  console.error("Failed to initialize UserController:", error);
  throw error;
}

// Protected routes
router.use(verifyToken); // Protect all routes below

// Regular user routes
router.get("/profile", userController.getProfile);

// Admin only routes
router.get("/users", checkRoles(["admin"]), userController.getUsers);

router.get(
  "/profile/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.getUser.bind(userController)
);

router.put(
  "/profile/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.updateProfile.bind(userController)
);

router.patch(
  "/profile/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.softDeleteUser.bind(userController)
);

router.delete(
  "/profile/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.deleteUserById.bind(userController)
);

router.patch(
  "/profile-verify/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.verifyEmail.bind(userController)
);

router.patch(
  "/profile-de-verify/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.deVerifyEmail.bind(userController)
);

router.post(
  "/upgrade",
  // validateMiddleware(userValidators.upgradeAccount),
  userController.upgradeAccount.bind(userController)
);

// Export the router
module.exports = router;
