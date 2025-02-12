const { JWTService } = require("../services");
const { AppError } = require("./globalError.middleware");
const { AuthRepository } = require("../repositories");

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
   * Attach user and token info to request
   */
  attachUserToRequest(req, user, token) {
    // Remove sensitive data
    const { password, ...safeUser } = user.toJSON();

    req.user = safeUser;
    req.token = token;
  }
}

// Create singleton instance
const authMiddleware = new AuthMiddleware();

module.exports = {
  verifyToken: authMiddleware.verifyToken,
  verifyRefreshToken: authMiddleware.verifyRefreshToken,
  checkRoles: authMiddleware.checkRoles,
};
