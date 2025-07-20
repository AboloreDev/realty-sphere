"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const maps_controller_1 = require("../controllers/maps.controller");
const router = express_1.default.Router();
// API geocode endpoint
router.get("/geocode", maps_controller_1.handleLocationFetch);
exports.default = router;
