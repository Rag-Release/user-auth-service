const {
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../use-cases/user");
const { UserRepository } = require("../repositories/index");
const { JWTService, PasswordService } = require("../services/index");
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
      res.json({
        status: "success",
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userRepository.findAll();
      res.json({
        status: "success",
        message: "Users retrieved successfully",
        data: users,
      });
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

      if (!updatedUser) {
        return res.status(400).json({ error: "User update failed" });
      }

      res.json({
        status: "success",
        message: "User updated successfully",
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role,
            isEmailVerified: updatedUser.isEmailVerified,
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            homeAddress: updatedUser.homeAddress,
            deliveryAddress: updatedUser.deliveryAddress,
            phoneNumber: updatedUser.phoneNumber,
            pickupPoint: updatedUser.pickupPoint,
            company: updatedUser.company,
            fiscalCode: updatedUser.fiscalCode,
            cardNumber: updatedUser.cardNumber,
            cardExpiry: updatedUser.cardExpiry,
          },
          token: updatedUser.token,
        },
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUsers(req, res) {
    try {
      const updateData = req.body;
      const updatedUsers = await this.userRepository.updateAll(updateData);
      res.json({
        status: "success",
        message: "Users updated successfully",
        data: updatedUsers,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsersByIds(req, res) {
    try {
      const userIds = req.body;
      const users = await this.userRepository.findByIds(userIds);
      res.json({
        status: "success",
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async softDeleteUser(req, res) {
    try {
      const userId = req.params.id;
      const updateData = req.body;
      const user = await this.userRepository.softDelete(userId, updateData);
      res.json({
        status: "success",
        message: "User soft deleted successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.deleteUsers(userId);
      res.json({
        status: "success",
        message: "User deleted successfully",
        data: user,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUsers(req, res) {
    try {
      const users = await this.userRepository.deleteAll();
      res.json({
        status: "success",
        message: "All users deleted successfully",
        data: users,
      });
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
      res.json({
        status: "success",
        message: "Account upgraded successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async verifyEmail(req, res) {
    try {
      const userId = req.params.id;
      const result = await this.userRepository.verifyEmail(userId);
      res.json({
        status: "success",
        message: "Email verified successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deVerifyEmail(req, res) {
    try {
      const userId = req.params.id;
      const result = await this.userRepository.deVerifyEmail(userId);
      res.json({
        status: "success",
        message: "Email de-verified successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
