"use strict";

const TABLE_NAME = "Users";
const COLUMN_NAME = "role";
const NEW_ROLE = "admin";

module.exports = {
  async up(queryInterface, Sequelize) {
    const enumName = `enum_${TABLE_NAME}_${COLUMN_NAME}`;

    // For PostgreSQL, we add a new value to the existing ENUM type.
    // This is generally safer than dropping and recreating the type.
    await queryInterface.sequelize.query(
      `ALTER TYPE "${enumName}" ADD VALUE '${NEW_ROLE}'`
    );
  },

  async down(queryInterface, Sequelize) {
    // Removing a value from an ENUM in PostgreSQL is a complex and potentially
    // destructive operation. It requires creating a new ENUM type, updating all
    // tables that use it, and then dropping the old type.
    //
    // For simplicity and safety, this down migration will not remove the 'admin' role.
    // If you need to roll back, you will need to handle this manually.
    console.log(
      `Skipping removal of '${NEW_ROLE}' from ${COLUMN_NAME} enum in ${TABLE_NAME} table.`
    );
    console.log(
      "Manual intervention is required to safely remove an ENUM value in PostgreSQL."
    );
    return Promise.resolve();
  },
};
