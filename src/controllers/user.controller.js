const BaseController = require("./base.controller");
const {
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../use-cases/user");
const { validateUserUpdate } = require("../validators/user.validator");
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

    await validateUserUpdate(updateData);

    const updatedUser = await this.updateProfileUseCase.execute(id, updateData);

    if (!updatedUser) {
      throw new ErrorHandler("User update failed", 500, "USER_UPDATE_FAILED");
    }

    return this.sendSuccess(res, {
      user: this.sanitizeUserData(updatedUser),
      token: this.jwtService.generateToken(updatedUser),
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
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.softDeleteUserUseCase.execute(id, userId);

    return this.sendSuccess(res, { result });
  }

  async deleteUserById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.deleteUserUseCase.execute(id, userId);

    return this.sendSuccess(res, { result });
  }

  async verifyEmail(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.verifyEmailUseCase.execute(id, userId);

    return this.sendSuccess(res, { result });
  }

  async deVerifyEmail(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await this.deVerifyEmailUseCase.execute(id, userId);

    return this.sendSuccess(res, { result });
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
      "id",
      "email",
      "firstName",
      "lastName",
      "role",
      "isEmailVerified",
      "isActive",
      "homeAddress",
      "deliveryAddress",
      "phoneNumber",
      "pickupPoint",
      "company",
      "fiscalCode",
      "cardNumber",
      "cardExpiry",
      "createdAt",
      "updatedAt",
    ];

    return allowedFields.reduce((acc, field) => {
      if (user[field] !== undefined) {
        acc[field] = user[field];
      }
      return acc;
    }, {});
  }
}

module.exports = UserController;
