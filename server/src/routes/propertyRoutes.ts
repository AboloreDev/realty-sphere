import express from "express";
import multer from "multer";
import {
  createPropertyListing,
  getAllProperties,
  getSingleProperty,
} from "../controllers/property.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";

// multer configurations for file uploads
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// get all properties
router.get("/", getAllProperties);
// get a singleProperty
router.get("/:id", getSingleProperty);
// create a property listing (LANDLORD ONLY)
router.post(
  "/",
  isAuthenticated,
  restrictTo("LANDLORD"),
  upload.array("images", 5),
  createPropertyListing
);

export default router;
