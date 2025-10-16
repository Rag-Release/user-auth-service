"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("CoverDesigns", {
      fields: ["assignedDesignerId"],
      type: "foreign key",
      name: "fk_coverdesigns_assignedDesignerId_users", // Custom constraint name
      references: {
        table: "Users",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "CoverDesigns",
      "fk_coverdesigns_assignedDesignerId_users"
    );
  },
};
