import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  createTenant,
  getTenant,
  updateTenantDetails,
} from "../controllers/tenant.controller";

const router = express.Router();

// Routes
// get tenant by ID
router.get("/:id", isAuthenticated, getTenant);
// CREATE A NEW TENANT : NOT NNEDED ALREADY HANDLED ON FRONTEND
router.post("/", isAuthenticated, createTenant);
// UPDATE A TENANT DETAILS
router.patch("/:id", isAuthenticated, updateTenantDetails);

export default router;
