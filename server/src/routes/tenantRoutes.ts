import express from "express";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";
import {
  addTenantFavoriteProperty,
  createTenant,
  getTenant,
  getTenantResidences,
  removeFromFavorite,
  updateTenantDetails,
} from "../controllers/tenant.controller";

const router = express.Router();

// Routes
// get tenant by ID
router.get("/:id", isAuthenticated, restrictTo("TENANT"), getTenant);
// CREATE A NEW TENANT : NOT NNEDED ALREADY HANDLED ON FRONTEND
router.post("/", isAuthenticated, createTenant);
// UPDATE A TENANT DETAILS
router.patch(
  "/:id",
  isAuthenticated,
  restrictTo("TENANT"),
  updateTenantDetails
);
// GET TENANT Residencies
router.get(
  "/:id/residencies",
  isAuthenticated,
  restrictTo("TENANT"),
  getTenantResidences
);
// ADD TO FAVORITE
router.post(
  "/:id/favorites/:propertyId",
  isAuthenticated,
  restrictTo("TENANT"),
  addTenantFavoriteProperty
);
// DELETE FROM FAVORITE
router.delete(
  "/:id/favorites/:propertyId",
  isAuthenticated,
  restrictTo("TENANT"),
  removeFromFavorite
);

export default router;
