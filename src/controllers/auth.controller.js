const { SignInUseCase, SignupUseCase } = require("../use-cases/auth");
const {
  ValidationError,
  InvalidCredentialsError,
} = require("../shared/utils/ErrorHandler");

class AuthController {
  constructor() {
    this.initializeDependencies();
    this.signup = this.signup.bind(this);
    this.signIn = this.signIn.bind(this);
  }

  initializeDependencies() {
    this.validateDependencies();
    // this.initializeServices();
    this.initializeUseCases();
  }

  validateDependencies() {
    if (!SignInUseCase || !SignupUseCase) {
      throw new Error("Required use cases are not defined");
    }
  }

  // initializeServices() {
  //   // this.jwtService = new JWTService();
  //   // this.passwordService = new PasswordService();
  //   // this.authRepository = new AuthRepository();
  //   // this.paymentService = new PaymentService();
  // }

  initializeUseCases() {
    this.signupUseCase = new SignupUseCase();
    this.signInUseCase = new SignInUseCase();
  }

  async signup(req, res, next) {
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
  }

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new ValidationError("Email and password are required");
      }

      const result = await this.signInUseCase.execute(email, password);

      return this.sendSuccessResponse(res, 200, "User logged in successfully", {
        user: this.sanitizeUserData(result.user),
        token: result.token,
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

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
    console.error("Auth controller error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      errorCode: error.errorCode,
    });

    // Handle specific error types
    if (error instanceof ValidationError) {
      return res.status(400).json({
        status: "error",
        message: error.message,
        errorCode: "VALIDATION_ERROR",
      });
    }

    if (error instanceof InvalidCredentialsError) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
        errorCode: "INVALID_CREDENTIALS",
      });
    }

    // Default error response for unhandled errors
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      errorCode: "INTERNAL_SERVER_ERROR",
    });
  }
}

module.exports = AuthController;
