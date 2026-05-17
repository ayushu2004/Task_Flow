import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject
} from "../controllers/projectController.js";
import {
  createTask,
  getProjectTasks
} from "../controllers/taskController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const mongoIdArray = body("teamMembers")
  .optional()
  .isArray()
  .withMessage("Team members must be an array");

const taskFilters = [
  query("status").optional().isIn(["Todo", "In Progress", "Done"]),
  query("assignedTo").optional().isMongoId().withMessage("Invalid assigned user id")
];

router.use(protect);

router.get("/", getProjects);

router.post(
  "/",
  requireAdmin,
  [
    body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name is required"),
    body("description").optional().trim().isLength({ max: 2000 }),
    mongoIdArray,
    body("teamMembers.*").optional().isMongoId().withMessage("Invalid member id")
  ],
  validate,
  createProject
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid project id")],
  validate,
  getProject
);

router.patch(
  "/:id",
  requireAdmin,
  [
    param("id").isMongoId().withMessage("Invalid project id"),
    body("name").optional().trim().isLength({ min: 2, max: 120 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    mongoIdArray,
    body("teamMembers.*").optional().isMongoId().withMessage("Invalid member id")
  ],
  validate,
  updateProject
);

router.delete(
  "/:id",
  requireAdmin,
  [param("id").isMongoId().withMessage("Invalid project id")],
  validate,
  deleteProject
);

router.get(
  "/:projectId/tasks",
  [
    param("projectId").isMongoId().withMessage("Invalid project id"),
    ...taskFilters
  ],
  validate,
  getProjectTasks
);

router.post(
  "/:projectId/tasks",
  requireAdmin,
  [
    param("projectId").isMongoId().withMessage("Invalid project id"),
    body("title").trim().isLength({ min: 2, max: 160 }).withMessage("Title is required"),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("assignedTo").isMongoId().withMessage("Assigned user is required"),
    body("status").optional().isIn(["Todo", "In Progress", "Done"]),
    body("dueDate").isISO8601().withMessage("Valid due date is required")
  ],
  validate,
  createTask
);

export default router;
