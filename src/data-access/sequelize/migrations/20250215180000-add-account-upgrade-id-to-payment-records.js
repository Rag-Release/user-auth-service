"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("PaymentRecords", "accountUpgradeId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "AccountUpgrades",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    // Add an index for better query performance
    await queryInterface.addIndex("PaymentRecords", ["accountUpgradeId"], {
      name: "idx_payment_records_accountUpgradeId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "PaymentRecords",
      "idx_payment_records_accountUpgradeId"
    );
    await queryInterface.removeColumn("PaymentRecords", "accountUpgradeId");
  },
};
