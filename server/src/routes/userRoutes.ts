import express from "express";
import { getUserProfile } from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/", isAuthenticated, getUserProfile);

export default router;
