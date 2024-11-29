const PasswordService = require("../../frameworks/services/password.service");
const JWTService = require("../../frameworks/services/jwt.service");
const passwordService = new PasswordService();
const jwtService = new JWTService();

class SignInUseCase {
  constructor(userRepository, passwordService, jwtService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  async execute(email, password) {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      const isValidPassword = await passwordService.comparePassword(
        password,
        user.password
      );

      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      const token = jwtService.generateToken(user);
      return {
        user: user.toJSON(),
        token,
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw new Error("Authentication failed");
    }
  }
}

module.exports = SignInUseCase;
