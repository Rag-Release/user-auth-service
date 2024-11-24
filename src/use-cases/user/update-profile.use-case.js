class UpdateProfileUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, updateData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await this.userRepository.update(userId, updateData);
    return updatedUser.toJSON();
  }
}

module.exports = UpdateProfileUseCase;
