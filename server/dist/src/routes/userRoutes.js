"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
router.get("/", isAuthenticated_1.isAuthenticated, user_controller_1.getUserProfile);
exports.default = router;
