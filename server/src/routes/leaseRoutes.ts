import express from "express";
import {
  createLease,
  deleteLease,
  getAllLease,
  getLeasePayment,
  updateLease,
} from "../controllers/lease.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/", isAuthenticated, getAllLease);
router.get("/:id/payment", isAuthenticated, getLeasePayment);
router.post("/", isAuthenticated, restrictTo("MANAGER"), createLease);
router.delete("/:id", isAuthenticated, restrictTo("MANAGER"), deleteLease);
router.patch("/:id/accept", isAuthenticated, restrictTo("TENANT"), updateLease);
export default router;
