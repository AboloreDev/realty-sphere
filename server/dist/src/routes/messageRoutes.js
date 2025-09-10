"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("../controllers/message.controller");
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const router = express_1.default.Router();
router.post("/", isAuthenticated_1.isAuthenticated, message_controller_1.sendMessage);
router.get("/:chatId", isAuthenticated_1.isAuthenticated, message_controller_1.getChatMessages);
exports.default = router;
