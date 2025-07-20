import express from "express";
import { handleLocationFetch } from "../controllers/maps.controller";

const router = express.Router();

// API geocode endpoint
router.get("/geocode", handleLocationFetch);

export default router;
