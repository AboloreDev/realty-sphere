"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
router.get("/:id", isAuthenticated_1.isAuthenticated, payment_controller_1.getPaymentById);
// Process payment
router.post("/:id/pay", isAuthenticated_1.isAuthenticated, payment_controller_1.processPayment);
// Confirm satisfaction and release escrow
router.post("/:id/confirm-satisfaction", isAuthenticated_1.isAuthenticated, payment_controller_1.confirmSatisfaction);
// Get payment status
router.get("/:id/status", isAuthenticated_1.isAuthenticated, payment_controller_1.getPaymentStatus);
// Add these to your existing payment routes
router.post("/:id/checkout", isAuthenticated_1.isAuthenticated, payment_controller_1.createCheckoutSession);
router.get("/:id/checkout-status", isAuthenticated_1.isAuthenticated, payment_controller_1.getCheckoutStatus);
exports.default = router;
