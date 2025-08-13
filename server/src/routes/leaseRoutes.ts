import express from "express";
import {
  createLease,
  getAllLease,
  getLeaseDetails,
  getLeasePayment,
  updateLease,
} from "../controllers/lease.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/", isAuthenticated, getAllLease);
router.get("/:id/payment", isAuthenticated, getLeasePayment);
router.post("/", isAuthenticated, restrictTo("MANAGER"), createLease);
router.patch("/:id/accept", isAuthenticated, restrictTo("TENANT"), updateLease);
router.get("/:id", isAuthenticated, getLeaseDetails);
export default router;
