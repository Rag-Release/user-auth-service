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
      const { userId, newAccountType, paymentDetails } = req.body;

      if (!userId) {
        throw ValidationError.requiredField("userId");
      }
      if (!newAccountType) {
        throw ValidationError.requiredField("newAccountType");
      }
      if (!paymentDetails) {
        throw ValidationError.requiredField("paymentDetails");
      }

      const result = await this.accountUpgradeRepository.create(
        userId,
        newAccountType,
        paymentDetails
      );

      return this.sendSuccessResponse(
        res,
        201,
        "Account upgrade request sent successfully",
        { upgrade: result.upgrade }
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        return this.handleError(res, error);
      }
      return this.handleError(
        res,
        ErrorHandler.internalServer(
          `Failed to upgrade account: ${error.message}`
        )
      );
    }
  }

  async getUpgrades(req, res) {
    try {
      const upgrades = await this.accountUpgradeRepository.findAll();
      return this.sendSuccess(res, { upgrades });
    } catch (error) {
      return this.handleError(
        res,
        ErrorHandler.internalServer(
          `Failed to fetch upgrades: ${error.message}`
        )
      );
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

      if (!id) {
        throw ValidationError.requiredField("id");
      }
      if (!status) {
        throw ValidationError.requiredField("status");
      }

      const payment = await this.accountUpgradeRepository.updatePaymentStatus(
        id,
        status
      );
      if (!payment) {
        throw ErrorHandler.notFound(`Payment with id ${id} not found`);
      }

      return this.sendSuccess(res, { payment });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateUpgradeStatus(req, res) {
    try {
      const id = req.params.id;
      const { status } = req.body;

      if (!id) {
        throw ValidationError.requiredField("id");
      }
      if (!status) {
        throw ValidationError.requiredField("status");
      }

      const upgrade = await this.accountUpgradeRepository.updateUpgradeStatus(
        id,
        status
      );
      if (!upgrade) {
        throw ErrorHandler.notFound(`Upgrade with id ${id} not found`);
      }

      return this.sendSuccess(res, { upgrade });
    } catch (error) {
      return this.handleError(res, error);
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
