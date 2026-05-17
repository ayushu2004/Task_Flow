import { asyncHandler } from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";

const authResponse = (user, statusCode, res) => {
  res.status(statusCode).json({
    token: signToken(user),
    user
  });
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = "Member" } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({ name, email, password, role });
  authResponse(user, 201, res);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  authResponse(user, 200, res);
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
