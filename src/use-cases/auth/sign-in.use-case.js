const {
  InvalidCredentialsError,
  ValidationError,
} = require("../../shared/utils/ErrorHandler");
const { PasswordService, JWTService } = require("../../services");
const { AuthRepository } = require("../../repositories");

class SignInUseCase {
  constructor() {
    this.authRepository = new AuthRepository();
    this.passwordService = new PasswordService();
    this.jwtService = new JWTService();
  }

  async execute(email, password) {
    this.validateInputs(email, password);

    try {
      const user = await this.findUser(email);

      // Check if password matches
      const isValidPassword = this.passwordService.comparePassword(
        password,
        user.password
      );

      if (!isValidPassword) {
        throw new InvalidCredentialsError("Invalid credentials");
      }

      const token = this.jwtService.generateTokenPair(user);

      return {
        user: this.sanitizeUserData(user),
        token,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Validates input parameters
   * @private
   */
  validateInputs(email, password) {
    if (!email || typeof email !== "string") {
      throw new ValidationError("Valid email is required");
    }

    if (!password || typeof password !== "string") {
      throw new ValidationError("Valid password is required");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters long");
    }
  }

  /**
   * Finds user by email
   * @private
   */
  async findUser(email) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError("Invalid credentials");
    }
    return user;
  }

  /**
   * Sanitizes user data before sending to client
   * @private
   */
  sanitizeUserData(user) {
    // Handle both Sequelize model and raw object cases
    const userData = user.toJSON ? user.toJSON() : { ...user };
    delete userData.password;
    delete userData.__v;
    return userData;
  }

  /**
   * Handles and transforms errors
   * @private
   */
  handleError(error) {
    console.error("[SignInUseCase] Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    if (
      error instanceof ValidationError ||
      error instanceof InvalidCredentialsError
    ) {
      throw error;
    }

    throw new Error("Authentication failed. Please try again later.");
  }
}

module.exports = SignInUseCase;
