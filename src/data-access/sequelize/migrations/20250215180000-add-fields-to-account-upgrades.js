"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("AccountUpgrades", "organizationName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("AccountUpgrades", "publishingExperience", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("AccountUpgrades", "portfolioLink", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("AccountUpgrades", "shopName", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(
      "AccountUpgrades",
      "businessRegistrationNumber",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn("AccountUpgrades", "purposeOfUpgrade", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("AccountUpgrades", "reviewPlatform", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("AccountUpgrades", "genresOfInterest", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("AccountUpgrades", "organizationName");
    await queryInterface.removeColumn(
      "AccountUpgrades",
      "publishingExperience"
    );
    await queryInterface.removeColumn("AccountUpgrades", "portfolioLink");
    await queryInterface.removeColumn("AccountUpgrades", "shopName");
    await queryInterface.removeColumn(
      "AccountUpgrades",
      "businessRegistrationNumber"
    );
    await queryInterface.removeColumn("AccountUpgrades", "purposeOfUpgrade");
    await queryInterface.removeColumn("AccountUpgrades", "reviewPlatform");
    await queryInterface.removeColumn("AccountUpgrades", "genresOfInterest");
  },
};
