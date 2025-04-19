const { StatusCodes } = require("http-status-codes");
const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const isUserExists = await User.exists({ email: email.toLowerCase() });

    if (isUserExists) {
      return res.status(StatusCodes.CONFLICT).json("Email already in use.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: email.toLowerCase(),
      username,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    res.status(StatusCodes.CREATED).json({
      userDetails: {
        _id: user._id,
        email: user.email,
        username: user.username,
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json("Registration failed. Please try again later.");
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json("Invalid email or password");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json("Invalid email or password");
    }

    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_LIFETIME,
      }
    );

    res.status(StatusCodes.OK).json({
      userDetails: {
        _id: user._id,
        email: user.email,
        username: user.username,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json("Login failed. Please try again later.");
  }
};

module.exports = { register, login };
