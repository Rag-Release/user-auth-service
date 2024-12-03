"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "homeAddress", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "deliveryAddress", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "phoneNumber", {
      type: Sequelize.STRING, // Store as JSON to handle an array
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "pickupPoint", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "company", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "fiscalCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "cardNumber", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("Users", "cardExpiry", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "homeAddress");
    await queryInterface.removeColumn("Users", "deliveryAddress");
    await queryInterface.removeColumn("Users", "phoneNumber");
    await queryInterface.removeColumn("Users", "pickupPoint");
    await queryInterface.removeColumn("Users", "company");
    await queryInterface.removeColumn("Users", "fiscalCode");
    await queryInterface.removeColumn("Users", "cardNumber");
    await queryInterface.removeColumn("Users", "cardExpiry");
  },
};
