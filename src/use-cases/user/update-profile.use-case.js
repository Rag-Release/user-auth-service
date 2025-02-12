const {
  ValidationError,
  NotFoundError,
} = require("../../shared/utils/ErrorHandler");

class UpdateProfileUseCase {
  static ALLOWED_UPDATE_FIELDS = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "address",
    "profilePicture",
  ];

  constructor({ userRepository, eventEmitter, validator }) {
    this.validateDependencies({ userRepository, eventEmitter, validator });
    this.userRepository = userRepository;
    this.eventEmitter = eventEmitter;
    this.validator = validator;
  }

  async execute(userId, updateData) {
    try {
      await this.validateInput(userId, updateData);
      const user = await this.findUser(userId);
      const sanitizedData = this.sanitizeUpdateData(updateData);

      const updatedUser = await this.updateUser(user, sanitizedData);
      await this.notifyUpdate(updatedUser);

      return this.formatResponse(updatedUser);
    } catch (error) {
      this.handleError(error);
    }
  }

  validateDependencies({ userRepository, eventEmitter, validator }) {
    if (!userRepository) {
      throw new Error("UserRepository is required");
    }
    if (!eventEmitter) {
      throw new Error("EventEmitter is required");
    }
    if (!validator) {
      throw new Error("Validator is required");
    }
  }

  async validateInput(userId, updateData) {
    if (!userId) {
      throw new ValidationError("User ID is required");
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new ValidationError("Update data is required");
    }

    await this.validator.validateUpdateProfile(updateData);
  }

  async findUser(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return user;
  }

  sanitizeUpdateData(updateData) {
    const sanitizedData = {};

    for (const field of UpdateProfileUseCase.ALLOWED_UPDATE_FIELDS) {
      if (updateData[field] !== undefined) {
        sanitizedData[field] = updateData[field];
      }
    }

    if (Object.keys(sanitizedData).length === 0) {
      throw new ValidationError("No valid update fields provided");
    }

    return sanitizedData;
  }

  async updateUser(user, sanitizedData) {
    try {
      const updatedUser = await this.userRepository.update(
        user.id,
        sanitizedData
      );
      if (!updatedUser) {
        throw new Error("Failed to update user");
      }
      return updatedUser;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async notifyUpdate(user) {
    try {
      await this.eventEmitter.emit("user.updated", {
        userId: user.id,
        timestamp: new Date(),
        changes: user.changes,
      });
    } catch (error) {
      console.error("Failed to emit user update event:", error);
      // Don't throw here to not disrupt the main flow
    }
  }

  formatResponse(user) {
    return {
      success: true,
      data: user.toJSON(),
      timestamp: new Date(),
    };
  }

  handleError(error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

module.exports = UpdateProfileUseCase;
