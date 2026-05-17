import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";

const taskPopulate = [
  { path: "assignedTo", select: "name email role" },
  { path: "project", select: "name description teamMembers" },
  { path: "createdBy", select: "name email role" }
];

const hasProjectAccess = (project, user) => {
  if (user.role === "Admin") return true;

  return project.teamMembers.some(
    (memberId) => String(memberId) === String(user._id)
  );
};

const getProjectOrThrow = async (projectId) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return project;
};

const ensureAssigneeInProject = (project, assignedTo) => {
  const memberIds = project.teamMembers.map(String);

  if (!memberIds.includes(String(assignedTo))) {
    throw new AppError("Assigned user must be a member of the project", 422);
  }
};

const buildTaskFilters = (req) => {
  const filters = {};
  const { status, assignedTo, project } = req.query;

  if (status) filters.status = status;
  if (project) filters.project = project;

  if (req.user.role === "Admin") {
    if (assignedTo) filters.assignedTo = assignedTo;
  } else {
    filters.assignedTo = req.user._id;
    if (assignedTo && assignedTo !== String(req.user._id)) {
      throw new AppError("Members can only filter their own tasks", 403);
    }
  }

  return filters;
};

export const getTasks = asyncHandler(async (req, res) => {
  const filters = buildTaskFilters(req);
  const tasks = await Task.find(filters).populate(taskPopulate).sort({ dueDate: 1 });

  res.json({ tasks });
});

export const getProjectTasks = asyncHandler(async (req, res) => {
  const project = await getProjectOrThrow(req.params.projectId);

  if (!hasProjectAccess(project, req.user)) {
    throw new AppError("You do not have access to this project", 403);
  }

  const filters = { project: project._id };
  const { status, assignedTo } = req.query;

  if (status) filters.status = status;

  if (req.user.role === "Admin") {
    if (assignedTo) filters.assignedTo = assignedTo;
  } else {
    filters.assignedTo = req.user._id;
  }

  const tasks = await Task.find(filters).populate(taskPopulate).sort({ dueDate: 1 });
  res.json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description = "", assignedTo, status = "Todo", dueDate } = req.body;
  const project = await getProjectOrThrow(req.params.projectId);

  ensureAssigneeInProject(project, assignedTo);

  const task = await Task.create({
    title,
    description,
    assignedTo,
    status,
    dueDate,
    project: project._id,
    createdBy: req.user._id
  });

  await task.populate(taskPopulate);
  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const project = await getProjectOrThrow(task.project);

  if (req.user.role !== "Admin" && String(task.assignedTo) !== String(req.user._id)) {
    throw new AppError("You can only update tasks assigned to you", 403);
  }

  if (req.user.role === "Admin") {
    const { title, description, assignedTo, status, dueDate } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
      ensureAssigneeInProject(project, assignedTo);
      task.assignedTo = assignedTo;
    }
    if (status !== undefined) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
  } else {
    if (!req.body.status) {
      throw new AppError("Members can only update task status", 422);
    }

    task.status = req.body.status;
  }

  await task.save();
  await task.populate(taskPopulate);

  res.json({ task });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  await task.deleteOne();
  res.status(204).send();
});

export const getMyDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const [tasks, statusCounts, overdueCount] = await Promise.all([
    Task.find({ assignedTo: req.user._id })
      .populate(taskPopulate)
      .sort({ dueDate: 1 }),
    Task.aggregate([
      { $match: { assignedTo: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Task.countDocuments({
      assignedTo: req.user._id,
      status: { $ne: "Done" },
      dueDate: { $lt: now }
    })
  ]);

  const counts = {
    completed: 0,
    pending: 0,
    overdue: overdueCount
  };

  statusCounts.forEach(({ _id, count }) => {
    if (_id === "Done") counts.completed = count;
    if (_id === "Todo" || _id === "In Progress") counts.pending += count;
  });

  res.json({ tasks, counts });
});
