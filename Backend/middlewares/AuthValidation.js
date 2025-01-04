const Joi = require("joi");

const SignUpValidation = (req, res, next) => {
  const { role, location } = req.body;

  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
    role: Joi.string().valid("Chef", "Customer").required(), // Role validation
    location: Joi.string()
      .min(3)
      .max(100)
      .when("role", {
        is: "Chef",
        then: Joi.required().messages({
          "any.required": "Location is required for Chef role",
        }),
        otherwise: Joi.optional(),
      }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error: error.details[0].message });
  }

  next();
};

const loginValidation = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: "Bad request", error: error.details[0].message });
  }
  next();
};

module.exports = {
  SignUpValidation,
  loginValidation,
};
