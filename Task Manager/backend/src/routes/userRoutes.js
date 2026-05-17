import { Router } from "express";
import { body, param } from "express-validator";
import { deleteUser, getUsers, updateUserRole } from "../controllers/userController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect, requireAdmin);

router.get("/", getUsers);

router.patch(
  "/:id/role",
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("role").isIn(["Admin", "Member"]).withMessage("Invalid role")
  ],
  validate,
  updateUserRole
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user id")],
  validate,
  deleteUser
);

export default router;
