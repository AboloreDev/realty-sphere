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
router.get("/:id", isAuthenticated_1.isAuthenticated, landlord_controller_1.getLandlord);
// router.post("/", isAuthenticated, createLandlord);
// updating the landlord data
router.patch("/:id", isAuthenticated_1.isAuthenticated, landlord_controller_1.updateLandlord);
exports.default = router;
