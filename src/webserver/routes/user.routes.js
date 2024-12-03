// src/frameworks/webserver/routes/user.routes.js

const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/user.controller");
const validateMiddleware = require("../../middlewares/validate.middleware");
const {
  signupValidator,
  userValidators,
} = require("../../validators/user.validator");

// Create controller instance with error handling
let userController;
try {
  userController = new UserController();
} catch (error) {
  console.error("Failed to initialize UserController:", error);
  throw error;
}

router.get(
  "/profile/:id",
  // validateMiddleware(userValidators.updateProfile),
  userController.getUser.bind(userController)
);

router.get(
  "/profile",
  // validateMiddleware(userValidators.updateProfile),
  userController.getUsers.bind(userController)
);

router.put(
  "profile/:id",
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
