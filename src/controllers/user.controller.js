const {
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../use-cases/user");
const UserRepository = require("../repositories/user.repository");
const JWTService = require("../services/jwt.service");
const ErrorHandler = require("../shared/utils/ErrorHandler");
const PasswordService = require("../services/password.service");
// const PaymentService = require("../../frameworks/services/payment.service");

class UserController {
  constructor() {
    try {
      this.userRepository = new UserRepository();
      this.jwtService = new JWTService();
      this.passwordService = new PasswordService();
      // this.paymentService = new PaymentService();

      if (!this.userRepository || !this.passwordService || !this.jwtService) {
        throw new Error("Missing dependencies in SignInUseCase");
      }

      // Validate that all use cases are defined before instantiation
      if (!UpdateProfileUseCase) {
        throw new Error("UpdateProfileUseCase is not defined");
      }
      if (!UpgradeAccountUseCase) {
        throw new Error("UpgradeAccountUseCase is not defined");
      }

      // Initialize use cases
      this.updateProfileUseCase = new UpdateProfileUseCase(this.userRepository);

      // this.upgradeAccountUseCase = new UpgradeAccountUseCase(
      //   this.userRepository,
      //   this.paymentService
      // );
    } catch (error) {
      console.error("Error initializing UserController:", error);
      throw error;
    }
  }

  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.findById(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.params.id; // From auth middleware
      const updateData = req.body;
      const updatedUser = await this.updateProfileUseCase.execute(
        userId,
        updateData
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUsers(req, res) {
    try {
      const updateData = req.body;
      const updatedUsers = await this.userRepository.updateAll(updateData);
      res.json(updatedUsers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsersByIds(req, res) {
    try {
      const userIds = req.body;
      const users = await this.userRepository.findByIds(userIds);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async softDeleteUser(req, res) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const user = await this.userRepository.softDelete(userId, updateData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.deleteUsers(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUsers(req, res) {
    try {
      const users = await this.userRepository.deleteAll();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async upgradeAccount(req, res) {
    try {
      const userId = req.user.id;
      const { accountType, paymentDetails } = req.body;
      const result = await this.upgradeAccountUseCase.execute(
        userId,
        accountType,
        paymentDetails
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const userId = req.params.id;
      const result = await this.userRepository.verifyEmail(userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deVerifyEmail(req, res) {
    try {
      const userId = req.params.id;
      console.log("🚀 ~ UserController ~ deVerifyEmail ~ userId:", userId);
      const result = await this.userRepository.deVerifyEmail(userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
