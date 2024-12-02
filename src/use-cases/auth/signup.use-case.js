class SignupUseCase {
  constructor(authRepository, jwtService) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  async execute(userData) {
    try {
      const existingUser = await this.authRepository.findByEmail(
        userData.email
      );

      if (existingUser) {
        throw new Error("Email already registered");
      }

      const user = await this.authRepository.create(userData);
      const token = this.jwtService.generateToken(user);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }
}

// Export the class directly
module.exports = SignupUseCase;
