const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { authRoutes, userRoutes, accountUpgradeRoutes } = require("./routes");
const {
  globalErrorMiddleware,
} = require("../middlewares/globalError.middleware");
const logger = require("../logger/logger");
const config = require("../config/config");

class ExpressApp {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupSecurity();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    // Request parsing
    this.app.use(express.json({ limit: "10kb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10kb" }));

    // Validate Content-Type header
    this.app.use((req, res, next) => {
      if (req.method === "POST" || req.method === "PUT") {
        const contentType = req.headers["content-type"];
        if (!contentType || !contentType.includes("application/json")) {
          return res.status(400).json({
            status: "error",
            message: "Content-Type must be application/json",
          });
        }
      }
      next();
    });

    // Handle JSON parsing errors
    this.app.use((err, req, res, next) => {
      if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
        return res.status(400).json({
          status: 400,
          message: "Invalid JSON payload",
        });
      }
      next();
    });

    // Compression
    this.app.use(compression());

    // Logging
    if (process.env.NODE_ENV !== "test") {
      this.app.use(
        morgan("combined", {
          stream: { write: (message) => logger.info(message.trim()) },
        })
      );
    }

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      res.status(200).json({ status: "healthy" });
    });
  }

  setupSecurity() {
    this.app.use(helmet());

    // CORS configuration
    const corsOptions = {
      origin: (origin, callback) => {
        const allowedOrigins = config.cors.allowedOrigins;
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      credentials: true,
      maxAge: 86400,
    };
    this.app.use(cors(corsOptions));

    // Handle preflight requests
    // this.app.options("*", cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use("/api/", limiter);

    // Security best practices
    this.app.disable("x-powered-by");
    this.app.set("trust proxy", 1);
  }

  setupRoutes() {
    // API versioning
    const apiVersion = "/api";

    // Routes
    this.app.use(`${apiVersion}/auth`, authRoutes);
    this.app.use(`${apiVersion}/users`, userRoutes);
    this.app.use(`${apiVersion}/users`, accountUpgradeRoutes);

    // Correctly define the wildcard route to handle unmatched routes
    this.app.use((req, res) => {
      res.status(404).json({ error: "Route not found" });
    });
  }

  setupErrorHandling() {
    // Global error handling middleware
    this.app.use(globalErrorMiddleware);

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught Exception:", error);
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (error) => {
      logger.error("Unhandled Rejection:", error);
      process.exit(1);
    });
  }

  getApp() {
    return this.app;
  }
}

// Create and export a singleton instance
const expressApp = new ExpressApp().getApp();
module.exports = expressApp;
