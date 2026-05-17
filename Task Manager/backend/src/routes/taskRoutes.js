import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  deleteTask,
  getMyDashboard,
  getTasks,
  updateTask
} from "../controllers/taskController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get(
  "/",
  [
    query("status").optional().isIn(["Todo", "In Progress", "Done"]),
    query("assignedTo").optional().isMongoId().withMessage("Invalid assigned user id"),
    query("project").optional().isMongoId().withMessage("Invalid project id")
  ],
  validate,
  getTasks
);

router.get("/my-dashboard", getMyDashboard);

router.patch(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid task id"),
    body("title").optional().trim().isLength({ min: 2, max: 160 }),
    body("description").optional().trim().isLength({ max: 2000 }),
    body("assignedTo").optional().isMongoId().withMessage("Invalid assigned user id"),
    body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
    body("dueDate").optional().isISO8601().withMessage("Invalid due date")
  ],
  validate,
  updateTask
);

router.delete(
  "/:id",
  requireAdmin,
  [param("id").isMongoId().withMessage("Invalid task id")],
  validate,
  deleteTask
);

export default router;
