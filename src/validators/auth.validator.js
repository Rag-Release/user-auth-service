const Joi = require("joi");

/**
 * Defines a Joi object schema for validating user signup data.
 * The schema includes validation rules for the following fields:
 * - email: Must be a valid email address and is required.
 * - password: Must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, and one number. The password is required.
 * - firstName: Must be between 2 and 50 characters long, and is required.
 * - lastName: Must be between 2 and 50 characters long, and is required.
 */
const signupValidator = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      "any.required": "Password is required",
    }),

  firstName: Joi.string().min(2).max(50).required().messages({
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 50 characters",
    "any.required": "First name is required",
  }),

  lastName: Joi.string().min(2).max(50).required().messages({
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 50 characters",
    "any.required": "Last name is required",
  }),
});

const authValidators = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
  }),

  signIn: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50),
    email: Joi.string().email(),
  }),

  upgradeAccount: Joi.object({
    accountType: Joi.string().valid("premium", "enterprise").required(),
    paymentDetails: Joi.object({
      cardNumber: Joi.string().required(),
      expiryMonth: Joi.number().required(),
      expiryYear: Joi.number().required(),
      cvv: Joi.string().required(),
    }).required(),
  }),
};

module.exports = {
  signupValidator,
  authValidators,
};
