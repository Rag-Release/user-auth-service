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
        validate: {
          isUUID: 4, // Ensure userId is a valid UUID
        },
        field: "userId",
        references: {
          model: "Users",
          key: "id",
        },
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
        validate: {
          isUUID: 4, // Ensure paymentId is a valid UUID
        },
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
      additionalInfo: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      organizationName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      publishingExperience: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      portfolioLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shopName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      businessRegistrationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      purposeOfUpgrade: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      reviewPlatform: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      genresOfInterest: {
        type: DataTypes.STRING,
        allowNull: true,
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
