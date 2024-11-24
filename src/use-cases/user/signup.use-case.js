class SignupUseCase {
  constructor(userRepository, jwtService) {
    this.userRepository = userRepository;
    this.jwtService = jwtService;
  }

  async execute(userData) {
    try {
      const existingUser = await this.userRepository.findByEmail(
        userData.email
      );

      if (existingUser) {
        throw new Error("Email already registered");
      }

      const user = await this.userRepository.create(userData);
      const token = this.jwtService.generateToken(user);

      return { user, token };
    } catch (error) {
      throw error;
    }
  }
}

// Export the class directly
module.exports = SignupUseCase;
