const bcrypt = require("bcrypt");
const config = require("../../config/config");

class PasswordService {
  async hashPassword(password) {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = PasswordService;
