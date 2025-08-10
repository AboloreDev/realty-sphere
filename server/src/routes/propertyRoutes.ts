import express from "express";
import multer from "multer";
import {
  createPropertyListing,
  getAllProperties,
  getSingleProperty,
} from "../controllers/property.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";
import upload from "../middleware/multerConfig";

const router = express.Router();

// get all properties
router.get("/", getAllProperties);
// get a singleProperty
router.get("/:id", getSingleProperty);
// create a property listing (LANDLORD ONLY)
router.post(
  "/",
  isAuthenticated,
  restrictTo("MANAGER"),
  upload.array("images", 5),
  createPropertyListing
);

export default router;
