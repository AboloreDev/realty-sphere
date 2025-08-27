import express from "express";
import {
  confirmSatisfaction,
  createCheckoutSession,
  getCheckoutStatus,
  getPaymentById,
  getPaymentStatus,
  handleStripeWebhook,
  processPayment,
} from "../controllers/payment.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";

const router = express.Router();

router.get("/:id", isAuthenticated, getPaymentById);

// Process payment
router.post("/:id/pay", isAuthenticated, processPayment);

// Confirm satisfaction and release escrow
router.post("/:id/confirm-satisfaction", isAuthenticated, confirmSatisfaction);

// Get payment status
router.get("/:id/status", isAuthenticated, getPaymentStatus);

// Add these to your existing payment routes
router.post("/:id/checkout", isAuthenticated, createCheckoutSession);
router.get("/:id/checkout-status", isAuthenticated, getCheckoutStatus);

export default router;
