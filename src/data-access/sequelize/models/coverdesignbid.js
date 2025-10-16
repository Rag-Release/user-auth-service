"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CoverDesignBid extends Model {
    static associate(models) {
      CoverDesignBid.belongsTo(models.CoverDesign, {
        foreignKey: "coverDesignId",
        as: "coverDesign",
        onDelete: "CASCADE",
      });
      CoverDesignBid.belongsTo(models.User, {
        foreignKey: "designerId",
        as: "designer",
        onDelete: "CASCADE",
      });
    }
  }

  CoverDesignBid.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      coverDesignId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "CoverDesigns",
          key: "id",
        },
      },
      designerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      bidStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "CLAIMED",
        validate: {
          isIn: [["CLAIMED", "ACCEPTED", "REJECTED", "WITHDRAWN"]],
        },
      },
    },
    {
      sequelize,
      modelName: "CoverDesignBid",
      tableName: "CoverDesignBids",
      timestamps: true,
    }
  );

  return CoverDesignBid;
};
