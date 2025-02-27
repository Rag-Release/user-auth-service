const models = require("../data-access/sequelize/models");

class PaymentRecordRepository {
  constructor() {
    this.PaymentRecord = models.PaymentRecord;
  }

  async create(paymentData) {
    return await this.PaymentRecord.create(paymentData);
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
