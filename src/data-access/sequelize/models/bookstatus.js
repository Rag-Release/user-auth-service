"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookStatus extends Model {
    static associate(models) {
      // Associate BookStatus with Book
      BookStatus.belongsTo(models.Book, {
        foreignKey: "bookId",
        as: "book",
        onDelete: "CASCADE",
      });
    }
  }

  BookStatus.init(
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: [
            [
              "Draft",
              "Under Review",
              "Cover Page Uploaded",
              "ISBN Acquired",
              "Pending Moderation",
              "Published",
              "Rejected",
            ],
          ],
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BookStatus",
      tableName: "BookStatuses",
      timestamps: false,
    }
  );

  return BookStatus;
};
