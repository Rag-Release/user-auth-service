const BaseController = require("./base.controller");
// const { AccountUpgradeUseCase } = require("../use-cases/user");
const {
  ErrorHandler,
  ValidationError,
} = require("../shared/utils/ErrorHandler");

class AccountUpgradeController extends BaseController {
  constructor(dependencies) {
    super();
    this.initializeDependencies(dependencies);

    this.upgradeAccount = this.upgradeAccount.bind(this);
    this.getUpgrades = this.getUpgrades.bind(this);
    this.getUserUpgrades = this.getUserUpgrades.bind(this);
    this.getUpgradesById = this.getUpgradesById.bind(this);
    this.getUpgradesPayments = this.getUpgradesPayments.bind(this);
    this.getUpgradesPaymentsById = this.getUpgradesPaymentsById.bind(this);
    this.updatePaymentStatus = this.updatePaymentStatus.bind(this);
    this.updateUpgradeStatus = this.updateUpgradeStatus.bind(this);
  }

  initializeDependencies({
    userRepository,
    accountUpgradeRepository,
    paymentRecordRepository,
  }) {
    if (
      !userRepository ||
      !accountUpgradeRepository ||
      !paymentRecordRepository
    ) {
      throw new Error("Missing required dependencies");
    }

    this.userRepository = userRepository;
    this.accountUpgradeRepository = accountUpgradeRepository;
    this.paymentRecordRepository = paymentRecordRepository;

    // no more using Use Cases

    // this.validateDependencies();
    // this.initializeUseCases();
  }

  // validateDependencies() {
  //   if (!AccountUpgradeUseCase) {
  //     throw new Error("Missing required use cases");
  //   }
  // }

  // initializeUseCases() {
  //   this.accountUpgradeUseCase = new AccountUpgradeUseCase(
  //     this.userRepository,
  //     this.accountUpgradeRepository,
  //     this.paymentRecordRepository
  //   );
  // }

  async upgradeAccount(req, res) {
    try {
      const {
        userId,
        newType,
        organizationName,
        publishingExperience,
        portfolioLink,
        shopName,
        businessRegistrationNumber,
        reviewPlatform,
        genresOfInterest,
        purposeOfUpgrade,
        paymentMethod,
        price,
        ...additionalInfo
      } = req.body;

      // Log the received data for debugging
      console.log("Received data:", req.body);

      // Ensure userId and paymentMethod are valid
      if (!userId || typeof userId !== "string") {
        throw new ValidationError("Invalid or missing userId");
      }
      if (!paymentMethod || typeof paymentMethod !== "string") {
        throw new ValidationError("Invalid or missing paymentMethod");
      }

      // Validate that the userId is a valid UUID
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        throw new ValidationError("Invalid userId format");
      }

      // Fetch the user using the userRepository
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new ValidationError("User not found");
      }
      if (user.role === "admin") {
        throw new ValidationError("Admin role cannot be upgraded");
      }

      // Create payment record
      const paymentRecord = await this.paymentRecordRepository.create({
        userId,
        paymentMethod,
        amount: price,
        currency: "USD",
      });

      // Create account upgrade request
      const accountUpgrade = await this.accountUpgradeRepository.create({
        userId,
        previousType: user.role,
        newType,
        organizationName,
        publishingExperience,
        portfolioLink,
        shopName,
        businessRegistrationNumber,
        reviewPlatform,
        genresOfInterest,
        purposeOfUpgrade,
        paymentId: paymentRecord.id,
        ...additionalInfo,
      });

      // Update payment record with account upgrade ID
      await this.paymentRecordRepository.update(paymentRecord.id, {
        accountUpgradeId: accountUpgrade.id,
      });

      res.status(201).json({
        status: "success",
        message: "Account upgrade request submitted successfully",
        data: accountUpgrade,
      });
    } catch (error) {
      console.error("Error in upgradeAccount:", error.message);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUpgrades(req, res) {
    try {
      const upgrades = await this.accountUpgradeRepository.findAll();
      res.status(200).json({
        status: "success",
        data: upgrades,
      });
    } catch (error) {
      console.error("Error in getUpgrades:", error.message);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserUpgrades(req, res) {
    try {
      const userId = req.params.id;
      if (!userId) {
        throw ValidationError.requiredField("userId");
      }

      const upgrades = await this.accountUpgradeRepository.findByUserId(userId);
      if (!upgrades || upgrades.length === 0) {
        throw ErrorHandler.notFound(`No upgrades found for user ${userId}`);
      }

      return this.sendSuccess(res, { upgrades });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getUpgradesById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        throw ValidationError.requiredField("id");
      }

      const upgrades = await this.accountUpgradeRepository.findById(id);
      if (!upgrades) {
        throw ErrorHandler.notFound(`Upgrade with id ${id} not found`);
      }

      return this.sendSuccess(res, { upgrades });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getUpgradesPayments(req, res) {
    try {
      const payments = await this.accountUpgradeRepository.findAllPayments();
      return this.sendSuccess(res, { payments });
    } catch (error) {
      return this.handleError(
        res,
        ErrorHandler.internalServer(
          `Failed to fetch payments: ${error.message}`
        )
      );
    }
  }

  async getUpgradesPaymentsById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        throw ValidationError.requiredField("id");
      }

      const payments = await this.accountUpgradeRepository.findPaymentsById(id);
      if (!payments || payments.length === 0) {
        throw ErrorHandler.notFound(`Payment with id ${id} not found`);
      }

      return this.sendSuccess(res, { payments });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updatePaymentStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      const paymentRecord = await this.paymentRecordRepository.update(id, {
        status,
      });
      res.status(200).json({
        status: "success",
        message: "Payment status updated successfully",
        data: paymentRecord,
      });
    } catch (error) {
      console.error("Error in updatePaymentStatus:", error.message);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUpgradeStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      // First, update the status of the upgrade request
      const updatedUpgrade =
        await this.accountUpgradeRepository.updateUpgradeStatus(id, status);

      // If the upgrade is accepted, also update the user's role
      if (status === "accepted" && updatedUpgrade) {
        await this.userRepository.update(updatedUpgrade.userId, {
          role: updatedUpgrade.newType,
        });
      }

      res.status(200).json({
        status: "success",
        message: "Account upgrade status updated successfully",
        data: updatedUpgrade,
      });
    } catch (error) {
      console.error("Error in updateUpgradeStatus:", error.message);
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }

  sanitizeUserData(user) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
    };
  }

  sendSuccessResponse(res, statusCode, message, data) {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  }

  handleError(res, error) {
    return res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message || "Internal server error",
    });
  }
}

module.exports = AccountUpgradeController;
