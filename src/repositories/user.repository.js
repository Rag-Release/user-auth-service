// user.repository.js
const models = require("../data-access/sequelize/models"); // Make sure this path is correct
const PasswordService = require("../services/password.service");

class UserRepository {
  constructor() {
    this.passwordService = new PasswordService();
    if (!models || !models.User) {
      throw new Error("User model is not properly initialized");
    }
    this.User = models.User;
  }

  async findByEmail(email) {
    try {
      const user = await this.User.findOne({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error("Error in findByEmail:", error);
      throw error;
    }
  }

  // async create(userData) {
  //   try {
  //     const hashedPassword = await this.passwordService.hashPassword(
  //       userData.password
  //     );

  //     const user = await this.User.create({
  //       // Changed from User to this.User
  //       email: userData.email,
  //       password: hashedPassword,
  //       firstName: userData.firstName,
  //       lastName: userData.lastName,
  //     });

  //     return {
  //       id: user.id,
  //       email: user.email,
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //     };
  //   } catch (error) {
  //     console.error("Error in create:", error);
  //     throw error;
  //   }
  // }

  async findById(id) {
    return this.User.findByPk(id);
  }

  async findAll() {
    return this.User.findAll();
  }

  async update(id, updateData) {
    const [numAffected, [updatedUser]] = await this.User.update(updateData, {
      where: { id },
      returning: true,
    });
    return updatedUser;
  }

  async verifyEmail(userId) {
    return this.update(userId, { isEmailVerified: true });
  }
}

module.exports = UserRepository;
