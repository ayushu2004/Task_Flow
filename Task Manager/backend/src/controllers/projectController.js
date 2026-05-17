import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";

const projectPopulate = [
  { path: "teamMembers", select: "name email role" },
  { path: "createdBy", select: "name email role" }
];

const uniqueIds = (ids = []) => [...new Set(ids.map(String))];

const ensureUsersExist = async (ids) => {
  const cleanIds = uniqueIds(ids).filter(Boolean);

  if (!cleanIds.length) {
    return [];
  }

  const users = await User.find({ _id: { $in: cleanIds } }).select("_id");

  if (users.length !== cleanIds.length) {
    throw new AppError("One or more team members do not exist", 422);
  }

  return cleanIds;
};

export const getProjects = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "Admin"
      ? {}
      : { teamMembers: new mongoose.Types.ObjectId(req.user._id) };

  const projects = await Project.find(query)
    .populate(projectPopulate)
    .sort({ createdAt: -1 });

  res.json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(projectPopulate);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const isMember = project.teamMembers.some(
    (member) => String(member._id) === String(req.user._id)
  );

  if (req.user.role !== "Admin" && !isMember) {
    throw new AppError("You do not have access to this project", 403);
  }

  res.json({ project });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description = "", teamMembers = [] } = req.body;
  const members = await ensureUsersExist(teamMembers);

  const project = await Project.create({
    name,
    description,
    teamMembers: members,
    createdBy: req.user._id
  });

  await project.populate(projectPopulate);
  res.status(201).json({ project });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { name, description, teamMembers } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (teamMembers !== undefined) {
    updates.teamMembers = await ensureUsersExist(teamMembers);
  }

  const project = await Project.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).populate(projectPopulate);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  if (teamMembers !== undefined) {
    await Task.deleteMany({
      project: project._id,
      assignedTo: { $nin: project.teamMembers.map((member) => member._id) }
    });
  }

  res.json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.status(204).send();
});
