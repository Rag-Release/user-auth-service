const { SignInUseCase, SignupUseCase } = require("../use-cases/auth");
const AuthRepository = require("../repositories/auth.repository");
const JWTService = require("../services/jwt.service");
const ErrorHandler = require("../shared/utils/ErrorHandler");
const PasswordService = require("../services/password.service");
// const PaymentService = require("../services/payment.service");

class AuthController {
  constructor() {
    this.initializeDependencies();
  }

  initializeDependencies() {
    this.validateDependencies();
    this.initializeServices();
    this.initializeUseCases();
  }

  validateDependencies() {
    if (!SignInUseCase || !SignupUseCase) {
      throw new Error("Required use cases are not defined");
    }
  }

  initializeServices() {
    this.jwtService = new JWTService();
    this.passwordService = new PasswordService();
    this.authRepository = new AuthRepository();
    // this.paymentService = new PaymentService();

    if (!this.authRepository || !this.passwordService || !this.jwtService) {
      throw new Error("Failed to initialize required services");
    }
  }

  initializeUseCases() {
    this.signupUseCase = new SignupUseCase(
      this.authRepository,
      this.jwtService
    );
    this.signInUseCase = new SignInUseCase(
      this.authRepository,
      this.jwtService,
      this.passwordService
    );
  }

  signup = async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await this.signupUseCase.execute({
        email,
        password,
        firstName,
        lastName,
      });

      return this.sendSuccessResponse(
        res,
        201,
        "User registered successfully",
        {
          user: this.sanitizeUserData(result.user),
          token: result.token,
        }
      );
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  signIn = async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await this.signInUseCase.execute(email, password);

      return this.sendSuccessResponse(res, 200, "User logged in successfully", {
        user: this.sanitizeUserData(result.user),
        token: result.token,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  };

  // Helper methods
  sanitizeUserData(user) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      homeAddress: user.homeAddress,
      deliveryAddress: user.deliveryAddress,
      phoneNumber: user.phoneNumber,
      pickupPoint: user.pickupPoint,
      company: user.company,
      fiscalCode: user.fiscalCode,
      cardNumber: user.cardNumber,
      cardExpiry: user.cardExpiry,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
    console.error(`Auth error: ${error.message}`, error);

    if (error.message === "Email already registered") {
      return res.status(409).json({
        status: "error",
        message: error.message,
      });
    }

    if (
      error.message.includes("not defined") ||
      error.message.includes("invalid")
    ) {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

module.exports = AuthController;
