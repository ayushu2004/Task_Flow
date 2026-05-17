import { asyncHandler } from "../middleware/asyncHandler.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

export const getUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ name: 1 }).select("-password");
  res.json({ users });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot change your own role", 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === String(req.user._id)) {
    throw new AppError("You cannot delete your own account", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await Project.updateMany(
    { teamMembers: user._id },
    { $pull: { teamMembers: user._id } }
  );
  await Task.deleteMany({ assignedTo: user._id });
  await user.deleteOne();

  res.status(204).send();
});
