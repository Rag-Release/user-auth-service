const { Sequelize } = require("sequelize");
const models = require("../data-access/sequelize/models");
const UserRepository = require("./user.repository");
const PaymentRecordRepository = require("./paymentRecord.repository");

class AccountUpgradeRepository {
  constructor() {
    this.AccountUpgrade = models.AccountUpgrade;
    this.PaymentRecord = models.PaymentRecord;
    this.UserRepository = new UserRepository();
    this.PaymentRecordRepository = new PaymentRecordRepository();
  }

  async create(data) {
    const {
      userId,
      previousType,
      newType,
      organizationName,
      publishingExperience,
      portfolioLink,
      shopName,
      businessRegistrationNumber,
      reviewPlatform,
      genresOfInterest,
      purposeOfUpgrade,
      paymentId,
      ...additionalInfo
    } = data;

    try {
      const accountUpgrade = await this.AccountUpgrade.create({
        userId,
        previousType,
        newType,
        paymentId,
        organizationName,
        publishingExperience,
        portfolioLink,
        shopName,
        businessRegistrationNumber,
        reviewPlatform,
        genresOfInterest,
        purposeOfUpgrade,
        ...additionalInfo,
      });

      return accountUpgrade.toJSON();
    } catch (error) {
      throw new Error(`Account upgrade failed: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    return await this.AccountUpgrade.findAll({
      ...options,
      include: [
        {
          model: this.PaymentRecord,
          as: "paymentRecord",
        },
      ],
      order: [["createdAt", "DESC"]],
    });
  }

  async findByUserId(userId) {
    const result = await this.AccountUpgrade.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: this.PaymentRecord,
          as: "paymentRecord",
        },
      ],
    });
    return result.map((upgrade) => upgrade.toJSON());
  }

  async findById(id) {
    if (!id || typeof id !== "string") {
      throw new Error("Invalid or missing id for findById");
    }

    const result = await this.AccountUpgrade.findByPk(id, {
      include: [
        {
          model: this.PaymentRecord,
          as: "paymentRecord",
        },
      ],
    });
    return result ? result.toJSON() : null;
  }

  async findAllPayments() {
    try {
      const result = await this.PaymentRecord.findAll({
        include: [
          {
            model: this.AccountUpgrade,
            as: "accountUpgrade",
          },
        ],
        order: [["createdAt", "DESC"]],
      });
      return result.map((payment) => payment.toJSON());
    } catch (error) {
      throw new Error(`Failed to fetch payments: ${error.message}`);
    }
  }

  async findPaymentsById(id) {
    const result = await this.PaymentRecord.findAll({
      where: { id },
    });
    return result.map((payment) => payment.toJSON());
  }

  async updatePaymentStatus(id, status) {
    const result = await this.PaymentRecord.update(
      { status },
      { where: { id } }
    );
    return result.map((payment) => payment.toJSON());
  }

  async updatePaymentStatus(id, status) {
    await this.PaymentRecord.update({ status }, { where: { id } });

    const updatedPayment = await this.PaymentRecord.findByPk(id, {
      include: [
        {
          model: this.AccountUpgrade,
          as: "accountUpgrade",
        },
      ],
    });

    return updatedPayment ? updatedPayment.toJSON() : null;
  }

  async updateUpgradeStatus(id, status) {
    await this.AccountUpgrade.update({ status }, { where: { id } });

    const updatedUpgrade = await this.AccountUpgrade.findByPk(id, {
      include: [
        {
          model: this.PaymentRecord,
          as: "paymentRecord",
        },
      ],
    });
    return updatedUpgrade ? updatedUpgrade.toJSON() : null;
  }
}

module.exports = AccountUpgradeRepository;
