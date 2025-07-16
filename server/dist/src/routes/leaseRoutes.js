"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const lease_controller_1 = require("../controllers/lease.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
router.get("/", isAuthenticated_1.isAuthenticated, lease_controller_1.getAllLease);
router.get("/:id/payment", isAuthenticated_1.isAuthenticated, lease_controller_1.getLeasePayment);
router.post("/", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), lease_controller_1.createLease);
router.delete("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), lease_controller_1.deleteLease);
router.patch("/:id/accept", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("TENANT"), lease_controller_1.updateLease);
exports.default = router;
