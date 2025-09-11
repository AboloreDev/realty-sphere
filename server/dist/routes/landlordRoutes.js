"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const landlord_controller_1 = require("../controllers/landlord.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
// create a landlord
// get landlord by id
router.get("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), landlord_controller_1.getLandlord);
// router.post("/", isAuthenticated, createLandlord);
// updating the landlord data
router.patch("/:id", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), landlord_controller_1.updateLandlord);
// GET LANDLORD SINGLE PROPERTY
router.get("/:id/properties", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), landlord_controller_1.getLandlordProperties);
// GET LANDLORD PAYMENT
router.get("/:mangerId/payments", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), landlord_controller_1.getLandlordPayment);
exports.default = router;
