import express from "express";
import {
  checkPropertyLease,
  createLease,
  getAllLease,
  getLeaseDetails,
  getLeasePayment,
  updateLease,
} from "../controllers/lease.controller";
import { isAuthenticated, restrictTo } from "../middleware/isAuthenticated";
import { createPayment } from "../controllers/payment.controller";

const router = express.Router();

router.get("/", isAuthenticated, getAllLease);
router.get("/:id/payment", isAuthenticated, getLeasePayment);
router.post("/", isAuthenticated, restrictTo("MANAGER"), createLease);
router.patch("/:id/accept", isAuthenticated, restrictTo("TENANT"), updateLease);
router.get("/:id", isAuthenticated, getLeaseDetails);
router.get("/:propertyId/lease-status", isAuthenticated, checkPropertyLease);
// Create payment when lease is accepted
router.post(
  "/:leaseId/payment/create",
  isAuthenticated,
  restrictTo("TENANT"),
  createPayment
);
export default router;
