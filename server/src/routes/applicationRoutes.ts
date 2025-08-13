import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";
import {
  createApplication,
  getApplicationDetails,
  listApplications,
  updateApplications,
} from "../controllers/application.controller";

const router = express.Router();

// List all applications
router.get("/", isAuthenticated, listApplications);
// CREATE APPLICATION restrict to tenant alone
router.post("/", isAuthenticated, restrictTo("TENANT"), createApplication);
// update the application
router.patch(
  "/:id/status",
  isAuthenticated,
  restrictTo("MANAGER"),
  updateApplications
);

router.get("/:id", isAuthenticated, getApplicationDetails);

export default router;
