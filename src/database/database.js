const { Sequelize } = require("sequelize");
const config = require("../config/config");
const logger = require("../logger/logger");

class DatabaseConnection {
  constructor() {
    this._sequelize = null;
    this._isConnected = false;
    this.connectionRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  // Getter for connection status
  get isConnected() {
    return this._isConnected;
  }

  async connect() {
    for (let attempt = 1; attempt <= this.connectionRetries; attempt++) {
      try {
        await this.initializeConnection();
        await this.validateConnection();
        return this._sequelize;
      } catch (error) {
        await this.handleConnectionError(error, attempt);
      }
    }
    throw new Error("Failed to connect to database after multiple attempts");
  }

  async initializeConnection() {
    const dbConfig = this.getDatabaseConfig();
    this._sequelize = new Sequelize(this.createSequelizeConfig(dbConfig));
  }

  getDatabaseConfig() {
    const env = process.env.NODE_ENV || "development";
    const dbConfig = config.db[env];

    if (!dbConfig) {
      throw new Error(
        `Database configuration not found for environment: ${env}`
      );
    }

    return dbConfig;
  }

  createSequelizeConfig(dbConfig) {
    return {
      dialect: dbConfig.dialect,
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      logging: this.createLoggingFunction(),
      pool: this.createConnectionPool(dbConfig.pool),
      dialectOptions: this.createDialectOptions(),
    };
  }

  createLoggingFunction() {
    return (msg) => {
      if (process.env.NODE_ENV !== "production") {
        logger.debug(msg);
      }
    };
  }

  createConnectionPool(poolConfig = {}) {
    return {
      max: poolConfig.max || 5,
      min: poolConfig.min || 0,
      acquire: poolConfig.acquire || 30000,
      idle: poolConfig.idle || 10000,
    };
  }

  createDialectOptions() {
    return process.env.NODE_ENV === "production"
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          pool: {
            handleDisconnects: true,
          },
        }
      : {};
  }

  async validateConnection() {
    try {
      await this._sequelize.authenticate();
      this._isConnected = true;
      logger.info({
        message: "Database connection established successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error(`Connection validation failed: ${error.message}`);
    }
  }

  async handleConnectionError(error, attempt) {
    this._isConnected = false;
    logger.error({
      message: `Database connection attempt ${attempt} failed`,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    if (attempt < this.connectionRetries) {
      logger.info(
        `Retrying connection in ${this.retryDelay / 1000} seconds...`
      );
      await this.delay(this.retryDelay);
    }
  }

  async disconnect() {
    if (!this._sequelize) {
      return;
    }

    try {
      await this._sequelize.close();
      this._isConnected = false;
      this._sequelize = null;
      logger.info({
        message: "Database connection closed successfully",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error({
        message: "Error closing database connection",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      throw new Error(`Failed to close database connection: ${error.message}`);
    }
  }

  getConnection() {
    if (!this._isConnected || !this._sequelize) {
      throw new Error("Database connection is not established");
    }
    return this._sequelize;
  }

  async checkConnection() {
    if (!this._sequelize) {
      return false;
    }

    try {
      await this._sequelize.authenticate();
      return true;
    } catch (error) {
      logger.error({
        message: "Database connection check failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async healthCheck() {
    try {
      if (!this._isConnected) {
        return {
          status: "disconnected",
          message: "Database is not connected",
        };
      }

      await this._sequelize.query("SELECT 1");
      return {
        status: "connected",
        message: "Database is healthy",
      };
    } catch (error) {
      return {
        status: "error",
        message: `Database health check failed: ${error.message}`,
      };
    }
  }
}

// Create a single instance without freezing
const databaseConnection = new DatabaseConnection();

module.exports = databaseConnection;
