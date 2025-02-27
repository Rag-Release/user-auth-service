"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("AccountUpgrades", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      previousType: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      newType: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      paymentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "PaymentRecords",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Add indexes
    await queryInterface.addIndex("AccountUpgrades", ["userId"], {
      name: "idx_accountUpgrades_userId",
    });

    await queryInterface.addIndex("AccountUpgrades", ["paymentId"], {
      name: "idx_account_upgrades_paymentId",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop tables in reverse order
    await queryInterface.dropTable("AccountUpgrades");
  },
};
