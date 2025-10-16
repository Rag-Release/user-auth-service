const models = require("../data-access/sequelize/models");

class PaymentRecordRepository {
  constructor() {
    this.PaymentRecord = models.PaymentRecord;
  }

  async create(paymentData) {
    const { userId, paymentMethod, amount, currency } = paymentData;

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      throw new Error("Invalid or missing userId");
    }
    if (!paymentMethod || typeof paymentMethod !== "string") {
      throw new Error("Invalid or missing paymentMethod");
    }
    if (!amount || typeof amount !== "number") {
      throw new Error("Invalid or missing amount");
    }
    if (!currency || typeof currency !== "string") {
      throw new Error("Invalid or missing currency");
    }

    try {
      const paymentRecord = await this.PaymentRecord.create({
        userId,
        paymentMethod,
        amount,
        currency,
        status: "pending",
      });
      return paymentRecord.toJSON();
    } catch (error) {
      throw new Error(`Failed to create payment record: ${error.message}`);
    }
  }

  async findAll(options = {}) {
    return await this.PaymentRecord.findAll({
      ...options,
      order: [["createdAt", "DESC"]],
    });
  }

  async findByUserId(userId) {
    return await this.PaymentRecord.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findLatestByUserId(userId) {
    return await this.PaymentRecord.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findById(id) {
    return await this.PaymentRecord.findByPk(id);
  }

  async findByTransactionId(transactionId) {
    return await this.PaymentRecord.findOne({
      where: { transactionId },
    });
  }

  async findByAccountUpgradeId(accountUpgradeId) {
    return await this.PaymentRecord.findOne({
      where: { accountUpgradeId },
    });
  }

  async update(id, data) {
    const paymentRecord = await this.PaymentRecord.findByPk(id);
    if (!paymentRecord) {
      throw new Error("Payment record not found");
    }
    return await paymentRecord.update(data);
  }

  async updateAccountUpgradeId(id, data) {
    const paymentRecord = await this.PaymentRecord.findByPk(id);
    if (!paymentRecord) {
      throw new Error("Payment record not found");
    }
    return await this.PaymentRecord.update(
      { accountUpgradeId: data.accountUpgradeId },
      { where: { id } }
    );
  }

  async updateStatus(id, status) {
    const paymentRecord = await this.PaymentRecord.findByPk(id);
    if (!paymentRecord) {
      throw new Error("Payment record not found");
    }
    return await paymentRecord.update({ status });
  }

  async delete(id) {
    const paymentRecord = await this.PaymentRecord.findByPk(id);
    if (!paymentRecord) {
      throw new Error("Payment record not found");
    }
    await paymentRecord.destroy();
    return true;
  }

  async findAll(filters = {}) {
    return await this.PaymentRecord.findAll({
      where: filters,
      order: [["createdAt", "DESC"]],
    });
  }
}

module.exports = PaymentRecordRepository;
