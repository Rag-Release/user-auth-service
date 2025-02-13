const { PasswordService, JWTService } = require("../../services");
const { AuthRepository } = require("../../repositories");
const {
  AuthError,
  ValidationError,
} = require("../../shared/utils/ErrorHandler");

class SignupUseCase {
  constructor(
    authRepository = new AuthRepository(),
    jwtService = new JWTService(),
    passwordService = new PasswordService()
  ) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
    this.passwordService = passwordService;
  }

  async execute(userData) {
    if (!userData || !userData.email || !userData.password) {
      throw new ValidationError("Invalid user data provided");
    }

    const existingUser = await this.authRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new AuthError("Email already registered", 409);
    }

    const hashedPassword = this.passwordService.hashPassword(userData.password);
    const userToCreate = {
      ...userData,
      password: hashedPassword,
    };

    const user = await this.authRepository.create(userToCreate);
    const token = this.jwtService.generateTokenPair(user);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }
}

// Export the class directly
module.exports = SignupUseCase;
