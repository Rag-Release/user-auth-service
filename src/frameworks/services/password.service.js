const bcrypt = require("bcrypt");
const bcryptjs = require("bcryptjs");
const config = require("../../config/config");

class PasswordService {
  hashPassword(password) {
    return bcryptjs.hashSync(password, config.bcrypt.saltRounds);
  }

  async comparePassword(plainPassword, hashedPassword) {
    try {
      // Explicitly use async comparison
      const isMatch = await bcryptjs.compareSync(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error("Password comparison error:", error);
      return false;
    }
  }
}

module.exports = PasswordService;
