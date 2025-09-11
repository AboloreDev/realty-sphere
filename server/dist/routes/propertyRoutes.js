"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const property_controller_1 = require("../controllers/property.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const multerConfig_1 = __importDefault(require("../middleware/multerConfig"));
const router = express_1.default.Router();
// get all properties
router.get("/", property_controller_1.getAllProperties);
// get a singleProperty
router.get("/:id", property_controller_1.getSingleProperty);
// create a property listing (LANDLORD ONLY)
router.post("/", isAuthenticated_1.isAuthenticated, (0, isAuthenticated_1.restrictTo)("MANAGER"), multerConfig_1.default.array("images", 5), property_controller_1.createPropertyListing);
exports.default = router;
