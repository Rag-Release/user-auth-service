const models = require("../data-access/sequelize/models");
const { PasswordService } = require("../services/index");
class AuthRepository {
  constructor() {
    this.passwordService = new PasswordService();

    if (!this.passwordService) {
      throw new Error(
        "Initialization error: Failed to create PasswordService instance"
      );
    }

    this.validateDependencies(this.passwordService);
    this.initializeRepository(this.passwordService);
  }

  validateDependencies(passwordService) {
    if (!passwordService) {
      throw new Error(
        "Validation error: PasswordService is required. Check your dependency injection."
      );
    }
    if (!models || !models.User) {
      throw new Error(
        "Validation error: User model is not properly initialized. Please verify your ORM configurations."
      );
    }
  }

  initializeRepository(passwordService) {
    this.passwordService = passwordService;
    this.User = models.User;
    this.defaultAttributes = [
      "id",
      "email",
      "firstName",
      "lastName",
      "password",
      "isActive",
      "isEmailVerified",
      "tokenVersion",
    ];
  }

  async findByEmail(email) {
    try {
      if (!email) {
        throw new Error("Email is required");
      }

      const user = await this.User.findOne({
        where: { email },
        attributes: [
          "id",
          "email",
          "password",
          "role",
          "firstName",
          "lastName",
          "isEmailVerified",
          "isActive",
          "homeAddress",
          "deliveryAddress",
          "phoneNumber",
          "pickupPoint",
          "company",
          "fiscalCode",
          "cardNumber",
          "cardExpiry",
          "createdAt",
          "updatedAt",
        ],
      });

      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      if (error.name === "SequelizeConnectionError") {
        throw new Error("Database connection error");
      }
      if (error.name === "SequelizeValidationError") {
        throw new Error("Invalid email format");
      }
      throw new Error("Failed to find user by email");
    }
  }

  async create(userData) {
    try {
      this.validateUserData(userData);

      const hashedPassword = await this.passwordService.hashPassword(
        userData.password
      );
      const user = await this.User.create({
        ...this.sanitizeUserData(userData),
        password: hashedPassword,
        tokenVersion: 0,
      });

      return this.formatUserResponse(user);
    } catch (error) {
      throw this.handleError("Failed to create user", error);
    }
  }

  async findById(id) {
    try {
      const user = await this.User.findByPk(id);

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw this.handleError("Failed to find user by ID", error);
    }
  }

  async update(id, updateData) {
    try {
      const [updated, [user]] = await this.User.update(
        this.sanitizeUpdateData(updateData),
        {
          where: { id },
          returning: true,
          attributes: this.defaultAttributes,
        }
      );

      if (!updated) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      throw this.handleError("Failed to update user", error);
    }
  }

  async verifyEmail(userId) {
    try {
      return await this.update(userId, {
        isEmailVerified: true,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw this.handleError("Failed to verify email", error);
    }
  }

  async incrementTokenVersion(userId) {
    try {
      const user = await this.findById(userId);
      return await this.update(userId, {
        tokenVersion: (user.tokenVersion || 0) + 1,
      });
    } catch (error) {
      throw this.handleError("Failed to increment token version", error);
    }
  }

  validateUserData(userData) {
    const requiredFields = ["email", "password", "firstName", "lastName"];
    const missingFields = requiredFields.filter((field) => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
  }

  sanitizeUserData(userData) {
    const allowedFields = ["email", "firstName", "lastName"];
    return Object.keys(userData)
      .filter((key) => allowedFields.includes(key))
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: userData[key],
        }),
        {}
      );
  }

  sanitizeUpdateData(updateData) {
    const forbiddenFields = ["id", "email", "password", "createdAt"];
    return Object.keys(updateData)
      .filter((key) => !forbiddenFields.includes(key))
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: updateData[key],
        }),
        {}
      );
  }

  formatUserResponse(user) {
    const { password, ...userData } = user.toJSON();
    return userData;
  }

  handleError(message, error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return new Error("Email already registered");
    }

    if (error.name === "SequelizeValidationError") {
      return new Error("Invalid user data");
    }

    return new Error(message);
  }
}

module.exports = AuthRepository;
