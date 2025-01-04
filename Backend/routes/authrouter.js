const { signup, login } = require("../controllers/AuthController");
const { SignUpValidation, loginValidation } = require("../middlewares/AuthValidation");

const router = require("express").Router();


router.post("/login", loginValidation, login);
router.post("/signup", SignUpValidation, signup);

module.exports = router;
