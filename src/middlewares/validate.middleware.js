const validateMiddleware = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: error.details.map((detail) => ({
          field: detail.context.key,
          message: detail.message,
        })),
      });
    }

    next();
  };
};

module.exports = { validateMiddleware };
