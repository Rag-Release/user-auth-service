"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CoverDesign extends Model {
    static associate(models) {
      CoverDesign.belongsTo(models.Book, {
        foreignKey: "bookId",
        as: "book",
        onDelete: "CASCADE",
      });
      CoverDesign.belongsTo(models.User, {
        foreignKey: "authorId",
        as: "author",
        onDelete: "CASCADE",
      });
      CoverDesign.belongsTo(models.User, {
        foreignKey: "assignedDesignerId",
        as: "assignedDesigner",
        onDelete: "SET NULL",
      });
      CoverDesign.hasMany(models.CoverDesignBid, {
        foreignKey: "coverDesignId",
        as: "bids",
        onDelete: "CASCADE",
      });
    }
  }

  CoverDesign.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Books",
          key: "id",
        },
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      assignedDesignerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "Users",
          key: "id",
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "REQUESTED",
        validate: {
          isIn: [
            [
              "REQUESTED",
              "CLAIMED",
              "ASSIGNED",
              "SUBMITTED",
              "APPROVED",
              "REJECTED",
              "CANCELLED",
              "ASK_FOR_MODERATION",
            ],
          ],
        },
      },
      designUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "CoverDesign",
      tableName: "CoverDesigns",
      timestamps: true,
    }
  );

  return CoverDesign;
};
