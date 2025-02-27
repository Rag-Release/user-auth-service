"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class AccountUpgrade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      AccountUpgrade.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
      });

      AccountUpgrade.belongsTo(models.PaymentRecord, {
        foreignKey: "paymentId",
        as: "paymentRecord",
        onDelete: "CASCADE",
      });
    }
  }
  AccountUpgrade.init(
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
        field: "userId",
        references: {
          model: "Users",
          key: "id",
        },
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "PaymentRecords",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      previousType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      newType: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [["pending", "accepted", "rejected", "hold-on-review"]],
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
      modelName: "AccountUpgrade",
      tableName: "AccountUpgrades",
      timestamps: true,
      underscored: false,
      indexes: [
        {
          name: "idx_account_upgrades_userId",
          fields: ["userId"],
        },
        {
          name: "idx_account_upgrades_paymentId",
          fields: ["paymentId"],
        },
      ],
    }
  );
  return AccountUpgrade;
};
