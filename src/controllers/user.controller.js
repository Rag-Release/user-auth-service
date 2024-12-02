const {
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../use-cases/user");
const UserRepository = require("../repositories/user.repository");
const JWTService = require("../services/jwt.service");
const ErrorHandler = require("../shared/utils/ErrorHandler");
const PasswordService = require("../services/password.service");
// const PaymentService = require("../../frameworks/services/payment.service");

class UserController {
  constructor() {
    try {
      this.userRepository = new UserRepository();
      this.jwtService = new JWTService();
      this.passwordService = new PasswordService();
      // this.paymentService = new PaymentService();

      if (!this.userRepository || !this.passwordService || !this.jwtService) {
        throw new Error("Missing dependencies in SignInUseCase");
      }

      // Validate that all use cases are defined before instantiation
      if (!UpdateProfileUseCase) {
        throw new Error("UpdateProfileUseCase is not defined");
      }
      if (!UpgradeAccountUseCase) {
        throw new Error("UpgradeAccountUseCase is not defined");
      }

      // Initialize use cases
      this.updateProfileUseCase = new UpdateProfileUseCase(this.userRepository);

      // this.upgradeAccountUseCase = new UpgradeAccountUseCase(
      //   this.userRepository,
      //   this.paymentService
      // );
    } catch (error) {
      console.error("Error initializing UserController:", error);
      throw error;
    }
  }

  // signup = async (req, res) => {
  //   try {
  //     const { email, password, firstName, lastName } = req.body;
  //     console.log("🚀 ~ UserController ~ signup= ~ req:", req.body);

  //     const result = await this.signupUseCase.execute({
  //       email,
  //       password,
  //       firstName,
  //       lastName,
  //     });

  //     return res.status(201).json({
  //       status: "success",
  //       message: "User registered successfully",
  //       data: {
  //         user: {
  //           id: result.user.id,
  //           email: result.user.email,
  //           firstName: result.user.firstName,
  //           lastName: result.user.lastName,
  //         },
  //         token: result.token,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Signup error:", error);

  //     if (error.message === "Email already registered") {
  //       return res.status(409).json({
  //         status: "error",
  //         message: error.message,
  //       });
  //     }

  //     return res.status(500).json({
  //       status: "error",
  //       message: "Internal server error",
  //     });
  //   }
  // };

  // signIn = async (req, res) => {
  //   try {
  //     const { email, password } = req.body;
  //     console.log("🚀 ~ UserController ~ signIn= ~ password:", password);
  //     console.log("🚀 ~ UserController ~ signIn= ~ email:", email);

  //     // Validation
  //     if (!email || !password) {
  //       throw ErrorHandler.badRequest("Email and password are required");
  //     }

  //     const result = await this.signInUseCase.execute(email, password);
  //     console.log("🚀 ~ UserController ~ signIn= ~ result:", result);

  //     if (!result) {
  //       throw ErrorHandler.unauthorized("Invalid credentials");
  //     }
  //     return res.status(200).json({
  //       status: "success",
  //       message: "User logged in successfully",
  //       data: {
  //         user: {
  //           id: result.user.id,
  //           email: result.user.email,
  //           firstName: result.user.firstName,
  //           lastName: result.user.lastName,
  //         },
  //         token: result.token,
  //       },
  //     });
  //   } catch (error) {
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  // signIn = async (req, res) => {
  //   try {
  //     if (!this.signInUseCase) {
  //       console.error("signInUseCase is not initialized");
  //       throw new Error("signInUseCase is not defined");
  //     }
  //     const { email, password } = req.body;
  //     const result = await this.signInUseCase.execute(email, password);
  //     res.status(200).json({
  //       status: "success",
  //       message: "User logged in successfully",
  //       data: {
  //         user: {
  //           id: result.user.id,
  //           email: result.user.email,
  //           firstName: result.user.firstName,
  //           lastName: result.user.lastName,
  //         },
  //         token: result.token,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Error in signIn:", error.message, error.stack);
  //     res.status(400).json({ error: error.message });
  //   }
  // };

  async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.findById(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await this.userRepository.findAll();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await this.userRepository.deleteById(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUsers(req, res) {
    try {
      const users = await this.userRepository.deleteAll();
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const updatedUser = await this.userRepository.updateById(
        userId,
        updateData
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUsers(req, res) {
    try {
      const updateData = req.body;
      const updatedUsers = await this.userRepository.updateAll(updateData);
      res.json(updatedUsers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUser(req, res) {
    try {
      const userData = req.body;
      const newUser = await this.userRepository.create(userData);
      res.json(newUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createUsers(req, res) {
    try {
      const usersData = req.body;
      const newUsers = await this.userRepository.createAll(usersData);
      res.json(newUsers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.findById(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUsersByIds(req, res) {
    try {
      const userIds = req.body;
      const users = await this.userRepository.findByIds(userIds);
      res.json(users);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUserById(req, res) {
    try {
      const userId = req.params.id;
      const user = await this.userRepository.deleteById(userId);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const updateData = req.body;
      const updatedUser = await this.updateProfileUseCase.execute(
        userId,
        updateData
      );
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async upgradeAccount(req, res) {
    try {
      const userId = req.user.id;
      const { accountType, paymentDetails } = req.body;
      const result = await this.upgradeAccountUseCase.execute(
        userId,
        accountType,
        paymentDetails
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = UserController;
