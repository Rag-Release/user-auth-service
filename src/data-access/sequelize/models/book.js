"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.User, {
        foreignKey: "authorId",
        as: "author",
        onDelete: "CASCADE",
      });

      // Associate Book with BookStatus
      Book.hasMany(models.BookStatus, {
        foreignKey: "bookId",
        as: "statuses",
        onDelete: "CASCADE",
      });

      // Associate Book with CoverDesign
      Book.hasMany(models.CoverDesign, {
        foreignKey: "bookId",
        as: "coverDesigns",
        onDelete: "CASCADE",
      });
    }
  }

  Book.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "Books",
      timestamps: true,
    }
  );

  return Book;
};
