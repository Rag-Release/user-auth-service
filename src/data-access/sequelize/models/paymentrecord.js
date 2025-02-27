"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PaymentRecord.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });

      PaymentRecord.belongsTo(models.AccountUpgrade, {
        foreignKey: "accountUpgradeId",
        as: "accountUpgrade",
        onDelete: "CASCADE",
      });
    }
  }
  PaymentRecord.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        field: "userId",
      },
      accountUpgradeId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "AccountUpgrades",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "paymentMethod",
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: "USD",
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "completed",
        validate: {
          isIn: [["pending", "completed", "failed", "refunded"]],
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "createdAt",
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: "updatedAt",
      },
    },
    {
      sequelize,
      modelName: "PaymentRecord",
      tableName: "PaymentRecords",
      timestamps: true,
      underscored: false,
      indexes: [
        {
          name: "idx_payment_records_userId",
          fields: ["userId"],
        },
      ],
    }
  );
  return PaymentRecord;
};
