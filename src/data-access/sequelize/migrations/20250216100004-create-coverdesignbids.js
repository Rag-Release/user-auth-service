"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CoverDesignBids", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      coverDesignId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "CoverDesigns",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      designerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      bidStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "CLAIMED",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("CoverDesignBids");
  },
};
