module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "accountType", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "common",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "accountType");
  },
};
