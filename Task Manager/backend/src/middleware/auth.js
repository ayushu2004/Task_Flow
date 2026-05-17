import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  req.user = user;
  next();
});

export const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== "Admin") {
    return next(new AppError("Admin access required", 403));
  }

  next();
};
