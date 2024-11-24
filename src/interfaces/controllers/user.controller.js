const {
  SignupUseCase,
  SignInUseCase,
  UpdateProfileUseCase,
  UpgradeAccountUseCase,
} = require("../../use-cases/user");
const UserRepository = require("../repositories/user.repository");
const JWTService = require("../../frameworks/services/jwt.service");

class UserController {
  constructor(signInUseCase, updateProfileUseCase, upgradeAccountUseCase) {
    try {
      this.signInUseCase = signInUseCase;
      this.updateProfileUseCase = updateProfileUseCase;
      this.upgradeAccountUseCase = upgradeAccountUseCase;
      this.userRepository = new UserRepository();
      this.jwtService = new JWTService();

      // Verify if SignupUseCase is available
      if (!SignupUseCase) {
        throw new Error("SignupUseCase is not defined");
      }

      this.signupUseCase = new SignupUseCase(
        this.userRepository,
        this.jwtService
      );
    } catch (error) {
      console.error("Error initializing UserController:", error);
      throw error;
    }
  }

  signup = async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      console.log("🚀 ~ UserController ~ signup= ~ req:", req.body);

      const result = await this.signupUseCase.execute({
        email,
        password,
        firstName,
        lastName,
      });

      return res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
          },
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);

      if (error.message === "Email already registered") {
        return res.status(409).json({
          status: "error",
          message: error.message,
        });
      }

      return res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  };

  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.signInUseCase.execute(email, password);
      res.json(result);
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
