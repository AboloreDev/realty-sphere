import express from "express";
import {
  getLandlord,
  updateLandlord,
} from "../controllers/landlord.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

// create a landlord
// get landlord by id
router.get("/:id", isAuthenticated, getLandlord);
// router.post("/", isAuthenticated, createLandlord);

// updating the landlord data
router.patch("/:id", isAuthenticated, updateLandlord);

export default router;
