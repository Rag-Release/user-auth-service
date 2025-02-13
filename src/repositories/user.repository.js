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

  async findById(id) {
    return this.User.findByPk(id);
  }

  async findAll() {
    return this.User.findAll();
  }

  async findByIds(ids) {
    return this.User.findAll({
      where: { id: ids },
    });
  }

  async update(id, updateData) {
    const [numAffected, [updatedUser]] = await this.User.update(updateData, {
      where: { id },
      returning: true,
    });
    return updatedUser;
  }

  async softDelete(id, updateData) {
    return this.update(id, updateData);
  }

  async updateAll(updateData) {
    const [numAffected] = await this.User.update(updateData, {
      where: {},
    });
    return numAffected;
  }

  async verifyEmail(userId) {
    return this.update(userId, { isEmailVerified: true });
  }

  async deVerifyEmail(userId) {
    return this.update(userId, { isEmailVerified: false });
  }

  async deleteUsers(userIds) {
    const deletedUsers = await this.User.findAll({
      where: { id: userIds },
      attributes: ["id", "firstName", "lastName", "email"],
    });

    await this.User.destroy({
      where: { id: userIds },
    });

    return {
      success: true,
      message: "Users deleted successfully",
      deletedUsers: deletedUsers.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        details: user.email,
      })),
    };
  }

  async deleteAll() {
    return this.User.destroy({
      where: {},
    });
  }
}

module.exports = UserRepository;
