class UpgradeAccountUseCase {
  constructor(userRepository, paymentService) {
    this.userRepository = userRepository;
    this.paymentService = paymentService;
  }

  async execute(userId, newAccountType, paymentDetails) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.canUpgradeAccount()) {
      throw new Error("Account cannot be upgraded. Please verify email first.");
    }

    // Process payment
    await this.paymentService.processPayment(paymentDetails);

    // Update account type
    const updatedUser = await this.userRepository.update(userId, {
      accountType: newAccountType,
    });
    return updatedUser.toJSON();
  }
}

module.exports = UpgradeAccountUseCase;
