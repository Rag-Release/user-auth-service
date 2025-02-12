const PasswordService = require("../../services/password.service");
const JWTService = require("../../services/jwt.service");
const passwordService = new PasswordService();
const jwtService = new JWTService();

class SignInUseCase {
  constructor(authRepository, passwordService, jwtService) {
    this.validateDependencies(authRepository, passwordService, jwtService);
    this.authRepository = authRepository;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  validateDependencies(authRepository, passwordService, jwtService) {
    if (!authRepository) throw new Error("AuthRepository is required");
    if (!passwordService) throw new Error("PasswordService is required");
    if (!jwtService) throw new Error("JWTService is required");
  }

  async execute(email, password) {
    this.validateInputs(email, password);

    const user = await this.findAndValidateUser(email);
    await this.validatePassword(password, user.password);

    return this.generateAuthResponse(user);
  }

  validateInputs(email, password) {
    if (!email?.trim()) throw new Error("Email is required");
    if (!password?.trim()) throw new Error("Password is required");
  }

  async findAndValidateUser(email) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }

    return user;
  }

  async validatePassword(inputPassword, storedPassword) {
    try {
      const isValidPassword = await this.passwordService.comparePassword(
        inputPassword,
        storedPassword
      );

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  }

  async generateAuthResponse(user) {
    try {
      const tokens = this.jwtService.generateTokenPair(user);

      return {
        user: this.sanitizeUserData(user),
        ...tokens,
      };
    } catch (error) {
      throw new Error("Authentication failed");
    }
  }

  sanitizeUserData(user) {
    const userData = user.toJSON ? user.toJSON() : user;

    // Remove sensitive data
    const { password, ...sanitizedUser } = userData;
    return sanitizedUser;
  }
}

module.exports = SignInUseCase;
