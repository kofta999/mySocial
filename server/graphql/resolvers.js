const User = require("../models/user");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const { name, email, password } = userInput;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({
        message: "Invalid Email",
      });
    }
    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, {
        min: 5,
      })
    ) {
      errors.push({
        message: "Invalid password",
      });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input");
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.code = 401;
      throw error;
    }
    const isEqual = bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Password incorrect");
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "secretsecretlololol",
      {
        expiresIn: "1h",
      }
    );
    return {
      token,
      userId: user._id.toString(),
    };
  },
};
