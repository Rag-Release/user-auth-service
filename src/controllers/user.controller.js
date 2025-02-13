const BaseController = require("./base.controller");
const {
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../use-cases/user");
const ErrorHandler = require("../shared/utils/ErrorHandler");

class UserController extends BaseController {
  constructor(dependencies) {
    super();
    this.initializeDependencies(dependencies);
  }

  initializeDependencies({ userRepository, jwtService, passwordService }) {
    if (!userRepository || !jwtService || !passwordService) {
      throw new Error("Missing required dependencies");
    }

    this.userRepository = userRepository;
    this.jwtService = jwtService;
    this.passwordService = passwordService;

    this.initializeUseCases();
  }

  initializeUseCases() {
    this.updateProfileUseCase = new UpdateProfileUseCase({
      userRepository: this.userRepository,
      passwordService: this.passwordService,
    });
    this.upgradeAccountUseCase = new UpgradeAccountUseCase(this.userRepository);
  }

  async getUser(req, res) {
    const userId = req.params.id;
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ErrorHandler("User not found", 404, "USER_NOT_FOUND");
    }

    return this.sendSuccess(res, { user: this.sanitizeUserData(user) });
  }

  async getUsers(req, res) {
    const users = await this.userRepository.findAll();
    return this.sendSuccess(res, { users: users.map(this.sanitizeUserData) });
  }

  async updateProfile(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await this.updateProfileUseCase.execute(id, updateData);

    if (!updatedUser) {
      throw new ErrorHandler("User update failed", 500, "USER_UPDATE_FAILED");
    }

    return this.sendSuccess(res, {
      user: this.sanitizeUserData(updatedUser.data),
      token: this.jwtService.generateTokenPair(updatedUser),
    });
  }

  async upgradeAccount(req, res) {
    const { accountType, paymentDetails } = req.body;
    const userId = req.user.id;

    const result = await this.upgradeAccountUseCase.execute(
      userId,
      accountType,
      paymentDetails
    );

    return this.sendSuccess(res, { result });
  }

  async softDeleteUser(req, res) {
    const userId = req.params.id;
    const updateData = req.body;
    const result = await this.userRepository.softDelete(userId, updateData);

    return this.sendSuccess(res, { user: this.sanitizeUserData(result) });
  }

  async deleteUserById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.deleteUserUseCase.execute(id, userId);

    return this.sendSuccess(res, { result });
  }

  async verifyEmail(req, res) {
    const userId = req.params.id;
    const result = await this.userRepository.verifyEmail(userId);

    return this.sendSuccess(res, { user: this.sanitizeUserData(result) });
  }

  async deVerifyEmail(req, res) {
    const userId = req.params.id;
    const result = await this.userRepository.deVerifyEmail(userId);

    return this.sendSuccess(res, { user: this.sanitizeUserData(result) });
  }

  async getUserOrders(req, res) {
    const userId = req.user.id;

    const result = await this.getUserOrdersUseCase.execute(userId);

    return this.sendSuccess(res, { result });
  }

  async getUserOrderDetails(req, res) {
    const { orderId } = req.params;
    const userId = req.user.id;

    const result = await this.getUserOrderDetailsUseCase.execute(
      orderId,
      userId
    );

    return this.sendSuccess(res, { result });
  }

  async getUserPaymentMethods(req, res) {
    const userId = req.user.id;

    const result = await this.getUserPaymentMethodsUseCase.execute(userId);

    return this.sendSuccess(res, { result });
  }

  async addPaymentMethod(req, res) {
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    const result = await this.addPaymentMethodUseCase.execute(
      userId,
      paymentMethod
    );

    return this.sendSuccess(res, { result });
  }

  async deletePaymentMethod(req, res) {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    const result = await this.deletePaymentMethodUseCase.execute(
      paymentMethodId,
      userId
    );

    return this.sendSuccess(res, { result });
  }

  async getUserNotifications(req, res) {
    const userId = req.user.id;

    const result = await this.getUserNotificationsUseCase.execute(userId);

    return this.sendSuccess(res, { result });
  }

  sanitizeUserData(user) {
    const allowedFields = [
      "email",
      "firstName",
      "lastName",
      "role",
      "isEmailVerified",
      "isActive",
      "homeAddress",
      "deliveryAddress",
      "phoneNumbers",
      "pickupPoint",
      "company",
      "fiscalCode",
      "cardNumber",
      "cardExpiry",
    ];

    return allowedFields.reduce((acc, field) => {
      if (user[field] !== undefined) {
        // Handle special cases for sensitive fields
        if (field === "cardNumber") {
          // Only show last 4 digits
          acc[field] = user[field]
            ? `****-****-****-${user[field].slice(-4)}`
            : null;
        } else if (field === "cardExpiry") {
          // Format as MM/YY
          acc[field] = user[field]
            ? user[field].replace(/(\d{2})(\d{2})/, "$1/$2")
            : null;
        } else {
          acc[field] = user[field];
        }
      }
      return acc;
    }, {});
  }
}

module.exports = UserController;
