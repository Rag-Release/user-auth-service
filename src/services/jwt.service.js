const jwt = require("jsonwebtoken");
const config = require("../config/config");

class JWTService {
  constructor() {
    if (!config.jwt.secret) {
      throw new Error("JWT secret is not configured");
    }
  }

  generateToken(user) {
    try {
      const payload = {
        id: user.id,
        email: user.email,
      };

      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn || "24h",
      });
    } catch (error) {
      console.error("Token generation error:", error);
      throw new Error("Failed to generate token");
    }
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      console.error("Token verification error:", error);
      throw new Error("Invalid token");
    }
  }
}

module.exports = JWTService;
