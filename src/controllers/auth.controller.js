const { SignInUseCase, SignupUseCase } = require("../use-cases/auth");
const AuthRepository = require("../repositories/auth.repository");
const JWTService = require("../services/jwt.service");
const ErrorHandler = require("../shared/utils/ErrorHandler");
const PasswordService = require("../services/password.service");
// const PaymentService = require("../services/payment.service");

class AuthController {
  constructor() {
    try {
      this.authRepository = new AuthRepository();
      this.jwtService = new JWTService();
      this.passwordService = new PasswordService();
      // this.paymentService = new PaymentService();

      if (!this.authRepository || !this.passwordService || !this.jwtService) {
        throw new Error("Missing dependencies in SignInUseCase");
      }

      // Validate that all use cases are defined before instantiation
      if (!SignInUseCase) {
        throw new Error("SignInUseCase is not defined");
      }
      if (!SignupUseCase) {
        throw new Error("SignupUseCase is not defined");
      }

      // Initialize use cases
      this.signupUseCase = new SignupUseCase(
        this.authRepository,
        this.jwtService
      );

      this.signInUseCase = new SignInUseCase(
        this.authRepository,
        this.jwtService,
        this.passwordService
      );
    } catch (error) {
      console.error("Error initializing AuthController:", error);
      throw error;
    }
  }

  signup = async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

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
            role: result.user.role,
            isEmailVerified: result.user.isEmailVerified,
            isActive: result.user.isActive,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
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

  signIn = async (req, res) => {
    try {
      if (!this.signInUseCase) {
        console.error("signInUseCase is not initialized");
        throw new Error("signInUseCase is not defined");
      }
      const { email, password } = req.body;
      const result = await this.signInUseCase.execute(email, password);
      res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            isEmailVerified: result.user.isEmailVerified,
            isActive: result.user.isActive,
            homeAddress: result.user.homeAddress,
            deliveryAddress: result.user.deliveryAddress,
            phoneNumber: result.user.phoneNumber,
            pickupPoint: result.user.pickupPoint,
            company: result.user.company,
            fiscalCode: result.user.fiscalCode,
            cardNumber: result.user.cardNumber,
            cardExpiry: result.user.cardExpiry,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          },
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Error in signIn:", error.message, error.stack);
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = AuthController;
