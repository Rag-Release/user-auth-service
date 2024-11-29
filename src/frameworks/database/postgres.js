const { Sequelize } = require("sequelize");
const logger = require("../logger/logger");
require("dotenv").config();

class DatabaseConnection {
  constructor() {
    this.sequelize = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const env = process.env.NODE_ENV || "development";
      const isProduction = env === "production";
      const databaseUrl = process.env.DATABASE_URL;

      // Initialize Sequelize instance
      this.sequelize = new Sequelize(databaseUrl, {
        dialect: "postgres",
        protocol: "postgres",
        logging: (msg) => logger.debug(msg),
        dialectOptions: isProduction
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false, // Needed for Railway SSL support
              },
            }
          : {},
      });

      // Authenticate with the database
      await this.sequelize.authenticate();
      this.isConnected = true;
      logger.info("Database connection established successfully.");

      return this.sequelize;
    } catch (error) {
      logger.error("Unable to connect to the database:", error);
      this.isConnected = false;
      throw new Error("Database connection failed");
    }
  }

  async disconnect() {
    try {
      if (this.sequelize) {
        await this.sequelize.close();
        this.isConnected = false;
        logger.info("Database connection closed successfully.");
      }
    } catch (error) {
      logger.error("Error closing database connection:", error);
      throw error;
    }
  }

  getConnection() {
    if (!this.isConnected) {
      throw new Error("Database is not connected");
    }
    return this.sequelize;
  }

  async checkConnection() {
    try {
      if (this.sequelize) {
        await this.sequelize.authenticate();
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Database connection check failed:", error);
      return false;
    }
  }
}

const databaseConnection = new DatabaseConnection();
module.exports = databaseConnection;
