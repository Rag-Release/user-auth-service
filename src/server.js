const app = require("./webserver/express-app");
const config = require("./config/config");
const databaseConnection = require("./database/database");

class Server {
  constructor() {
    this.app = app;
    this.port = this.validatePort(config.port);
    this.server = null;
  }

  validatePort(port) {
    const parsedPort = parseInt(port, 10);
    if (isNaN(parsedPort)) {
      throw new Error("Invalid port configuration");
    }
    return parsedPort;
  }

  async initialize() {
    try {
      await this.connectDatabase();
      await this.startServer();
      this.setupGracefulShutdown();
    } catch (error) {
      console.error("Failed to initialize server:", error);
      this.handleFatalError(error);
    }
  }

  async connectDatabase() {
    try {
      await databaseConnection.connect();

      if (!databaseConnection.isConnected) {
        throw new Error("Database connection failed");
      }

      console.info("✓ Database connected successfully");
    } catch (error) {
      throw new Error(`Database connection error: ${error.message}`);
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, () => {
          console.info(`✓ Server running on port ${this.port}`);
          console.info(
            `✓ Environment: ${process.env.NODE_ENV || "development"}`
          );
          resolve();
        });

        this.server.on("error", (error) => {
          reject(new Error(`Server startup error: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Failed to start server: ${error.message}`));
      }
    });
  }

  setupGracefulShutdown() {
    const signals = ["SIGTERM", "SIGINT", "SIGUSR2"];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.info(
          `\n${signal} signal received. Starting graceful shutdown...`
        );
        await this.shutdown();
      });
    });

    process.on("uncaughtException", async (error) => {
      console.error("Uncaught Exception:", error);
      await this.shutdown(1);
    });

    process.on("unhandledRejection", async (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      await this.shutdown(1);
    });
  }

  async shutdown(exitCode = 0) {
    console.info("Shutting down server...");

    try {
      if (this.server) {
        await this.closeHttpServer();
      }

      await this.closeDatabaseConnection();

      console.info("Graceful shutdown completed");
      process.exit(exitCode);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  }

  async closeHttpServer() {
    return new Promise((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        console.info("✓ HTTP server closed");
        resolve();
      });
    });
  }

  async closeDatabaseConnection() {
    try {
      await databaseConnection.disconnect();
      console.info("✓ Database connection closed");
    } catch (error) {
      console.error("Error closing database connection:", error);
      throw error;
    }
  }

  handleFatalError(error) {
    console.error("Fatal error occurred:", error);
    process.exit(1);
  }
}

// Initialize and start the server
const server = new Server();
server.initialize().catch((error) => {
  console.error("Server initialization failed:", error);
  process.exit(1);
});

// ./src/server.js
