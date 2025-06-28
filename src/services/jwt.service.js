const jwt = require("jsonwebtoken");
const config = require("../config/config");
const crypto = require("crypto");

class JWTService {
  constructor() {
    this.validateConfig();
    this.tokenTypes = {
      ACCESS: "access",
      REFRESH: "refresh",
    };
  }

  validateConfig() {
    if (!config.jwt.accessSecret) {
      throw new Error("JWT access secret is not configured");
    }
    if (!config.jwt.refreshSecret) {
      throw new Error("JWT refresh secret is not configured");
    }
  }

  generateTokenPair(user) {
    try {
      const accessToken = this.createAccessToken(user);
      const refreshToken = this.createRefreshToken(user);

      return {
        accessToken,
        refreshToken,
        tokenType: "Bearer",
      };
    } catch (error) {
      this.handleError("Token pair generation failed", error);
    }
  }

  createAccessToken(user) {
    return this.createToken(
      {
        id: user.id,
        email: user.email,
        type: this.tokenTypes.ACCESS,
      },
      config.jwt.accessSecret,
      config.jwt.accessExpiresIn || "15m"
    );
  }

  createRefreshToken(user) {
    const refreshToken = this.createToken(
      {
        id: user.id,
        type: this.tokenTypes.REFRESH,
        tokenVersion: user.tokenVersion || 0,
      },
      config.jwt.refreshSecret,
      config.jwt.refreshExpiresIn || "7d"
    );

    return this.hashToken(refreshToken);
  }

  createToken(payload, secret, expiresIn) {
    try {
      return jwt.sign({ ...payload, iat: Date.now() / 1000 }, secret, {
        expiresIn,
      });
    } catch (error) {
      this.handleError("Token creation failed", error);
    }
  }

  verifyAccessToken(token) {
    return this.verifyToken(
      token,
      config.jwt.accessSecret,
      this.tokenTypes.ACCESS
    );
  }

  verifyRefreshToken(token) {
    return this.verifyToken(
      token,
      config.jwt.refreshSecret,
      this.tokenTypes.REFRESH
    );
  }

  verifyToken(token, secret, type) {
    try {
      const decoded = jwt.verify(token, secret);

      if (decoded.type !== type) {
        throw new Error("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new Error("Invalid token");
      }
      this.handleError("Token verification failed", error);
    }
  }

  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  handleError(message, error) {
    console.error(`JWT Service Error - ${message}:`, error);
    throw new Error(message);
  }
}

module.exports = JWTService;
