const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const { name, email, password } = userInput;
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
};
