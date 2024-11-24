class SignInUseCase {
  constructor(userRepository, passwordService, jwtService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await this.passwordService.comparePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = this.jwtService.generateToken(user);
    return { user: user.toJSON(), token };
  }
}

module.exports = SignInUseCase;
