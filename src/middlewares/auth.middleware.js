const { JWTService } = require("../services/index");
const { AppError } = require("./globalError.middleware");
const { AuthRepository } = require("../repositories/index");

class AuthMiddleware {
  constructor() {
    this.jwtService = new JWTService();
    this.authRepository = new AuthRepository();
  }

  /**
   * Verify access token and attach user to request
   */
  verifyToken = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      const decoded = await this.verifyAndDecodeToken(token);
      const user = await this.validateUser(decoded);

      this.attachUserToRequest(req, user, token);
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Verify refresh token for token renewal
   */
  verifyRefreshToken = async (req, res, next) => {
    try {
      const token = this.extractToken(req);
      const decoded = await this.jwtService.verifyRefreshToken(token);
      const user = await this.validateUser(decoded);

      // Verify token version
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new AppError("Invalid refresh token", 401);
      }

      this.attachUserToRequest(req, user, token);
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if user has required roles
   */
  checkRoles = (roles = []) => {
    return (req, res, next) => {
      try {
        if (!req.user) {
          throw new AppError("User not authenticated", 401);
        }

        if (!roles.includes(req.user.role)) {
          throw new AppError("Insufficient permissions", 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Extract token from request headers
   */
  extractToken(req) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    return token;
  }

  /**
   * Verify and decode the token
   */
  async verifyAndDecodeToken(token) {
    try {
      return await this.jwtService.verifyAccessToken(token);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token has expired", 401);
      }
      throw new AppError("Invalid token", 401);
    }
  }

  /**
   * Validate user exists and is active
   */
  async validateUser(decoded) {
    const user = await this.authRepository.findById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    if (!user.isActive) {
      throw new AppError("User account is disabled", 403);
    }

    return user;
  }

  /**
   * Validate user exists and is active
   */
  // async validateUser(req, res, next) {
  //   try {
  //     // Ensure req and res objects exist
  //     if (!req || !res) {
  //       console.error("validateUser: req or res is undefined");
  //       throw new Error("Request or response object is missing");
  //     }

  //     // Ensure req.user exists and has an id
  //     if (!req.user || !req.user.id) {
  //       return res.status(401).json({
  //         status: "error",
  //         message: "Unauthorized: User information is missing",
  //       });
  //     }

  //     const userId = req.user.id;
  //     console.log("🚀 ~ AuthMiddleware ~ validateUser ~ userId:", userId);
  //     const user = await this.authRepository.findById(userId);

  //     if (!user) {
  //       return res.status(404).json({
  //         status: "error",
  //         message: `User with ID ${userId} not found`,
  //       });
  //     }

  //     req.userDetails = user; // Attach user details to the request
  //     next();
  //   } catch (error) {
  //     console.error("Error in validateUser middleware:", error.message);
  //     if (res && res.status) {
  //       res.status(500).json({
  //         status: "error",
  //         message: error.message || "Internal Server Error",
  //       });
  //     } else {
  //       console.error(
  //         "validateUser: Unable to send response, res is undefined"
  //       );
  //     }
  //   }
  // }

  /**
   * Attach user and token info to request
   */
  attachUserToRequest(req, user, token) {
    try {
      // Ensure user is valid
      if (!user) {
        throw new Error("User object is undefined or null");
      }

      // Check if user has a toJSON method
      const safeUser = typeof user.toJSON === "function" ? user.toJSON() : user;

      // Remove sensitive data
      const { password, ...filteredUser } = safeUser;

      req.user = filteredUser;
      req.token = token;
    } catch (error) {
      console.error("Error in attachUserToRequest:", error.message);
      throw new Error("Failed to attach user to request");
    }
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

module.exports = {
  verifyToken: authMiddleware.verifyToken,
  verifyRefreshToken: authMiddleware.verifyRefreshToken,
  checkRoles: authMiddleware.checkRoles,
};
