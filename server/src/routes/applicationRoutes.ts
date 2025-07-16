import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";
import {
  createApplication,
  listApplications,
  updateApplications,
} from "../controllers/application.controller";

const router = express.Router();

// List all applications
router.get("/", isAuthenticated, listApplications);
// CREATE APPLICATION restrict to tenant alone
router.post("/", isAuthenticated, restrictTo("TENANT"), createApplication);
// update the appointment
router.patch(
  "/:id",
  isAuthenticated,
  restrictTo("MANAGER"),
  updateApplications
);

export default router;
