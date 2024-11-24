// user-auth-service/src/data-access/sequelize/models/index.js
"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../../../config/config");

const db = {};

let sequelize;
try {
  sequelize = new Sequelize(
    config[env].database,
    config[env].username,
    config[env].password,
    {
      host: config[env].host,
      port: config[env].port,
      dialect: config[env].dialect,
      logging: config[env].logging,
      pool: config[env].pool,
    }
  );
} catch (error) {
  console.error("Error connecting to the database:", error);
  process.exit(1);
}

// Load models
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
    // console.log(`Loaded model: ${model.name}`); // Debug log
  });

// Initialize associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// console.log("Exported models:", Object.keys(db)); // Debug log to see exported models

module.exports = db;
