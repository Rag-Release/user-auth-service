const { Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

class AccountUpgradeUseCase {
  constructor(
    userRepository,
    accountUpgradeRepository,
    paymentRecordRepository
  ) {
    this.userRepository = userRepository;
    this.accountUpgradeRepository = accountUpgradeRepository;
    this.paymentRecordRepository = paymentRecordRepository;
  }

  async execute(userId, newAccountType, paymentDetails) {
    const user = await this.userRepository.findById(userId);

    const sequelize = await Sequelize.transaction();

    if (!user) {
      throw new Error("User not found");
    }

    // if (!user.canUpgradeAccount()) {
    //   throw new Error("Account cannot be upgraded. Please verify email first.");
    // }

    try {
      // Start a transaction

      try {
        // Process payment within transaction
        const paymentRecord = await this.paymentRecordRepository.create(
          {
            userId,
            paymentMethod: paymentDetails.paymentMethod,
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
          },
          { transaction: sequelize }
        );

        // Create upgrade record only if payment is successful
        const accountUpgrade = await this.accountUpgradeRepository.create(
          {
            userId,
            previousType: user.role,
            newType: newAccountType,
            paymentId: paymentRecord.id,
          },
          { transaction: sequelize }
        );

        await this.paymentRecordRepository.update(
          { accountUpgradeId: accountUpgrade.id },
          { where: { id: paymentRecord.id }, transaction: sequelize }
        );
        // If everything went well, commit the transaction

        return {
          upgrade: accountUpgrade,
          payment: paymentRecord,
        };
      } catch (error) {
        // If anything fails, rollback the transaction
        throw error;
      }
    } catch (error) {
      throw new Error(`Account upgrade failed: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    try {
      return await this.accountUpgradeRepository.findAll({
        ...options,
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(`Failed to fetch account upgrades: ${error.message}`);
    }
  }

  async findLatest() {
    try {
      return await this.accountUpgradeRepository.findAll({
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch latest account upgrade: ${error.message}`
      );
    }
  }

  async findByUserId(userId) {
    try {
      return await this.accountUpgradeRepository.findByUserId({
        where: { userId: userId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch user account upgrades: ${error.message}`
      );
    }
  }

  async findLatestByUserId(userId) {
    try {
      return await this.accountUpgradeRepository.findLatestByUserId({
        where: { userId: userId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch latest user account upgrade: ${error.message}`
      );
    }
  }

  async findAllOrders() {
    try {
      return await this.paymentRecordRepository.findAll();
    } catch (error) {
      throw new Error(`Failed to fetch all orders: ${error.message}`);
    }
  }

  async findOrdersByUserId(userId) {
    try {
      return await this.paymentRecordRepository.findByUserId({
        where: { userId: userId },
        order: [["createdAt", "DESC"]],
      });
    } catch (error) {
      throw new Error(`Failed to fetch orders for user: ${error.message}`);
    }
  }
}

module.exports = AccountUpgradeUseCase;
