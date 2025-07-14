import express from "express";
import {
  getLandlord,
  getLandlordProperties,
  updateLandlord,
} from "../controllers/landlord.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";

const router = express.Router();

// create a landlord
// get landlord by id
router.get("/:id", isAuthenticated, getLandlord);
// router.post("/", isAuthenticated, createLandlord);

// updating the landlord data
router.patch("/:id", isAuthenticated, updateLandlord);

// GET LANDLORD SINGLE PROPERTY
router.get(
  "/:id/properties",
  isAuthenticated,
  restrictTo("LANDLORD"),
  getLandlordProperties
);

export default router;
