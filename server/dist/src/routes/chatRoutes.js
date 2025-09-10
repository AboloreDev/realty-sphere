"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const isAuthenticated_1 = require("../middleware/isAuthenticated");
const chat_controller_1 = require("../controllers/chat.controller");
const router = express_1.default.Router();
// create a chat
router.post("/", isAuthenticated_1.isAuthenticated, chat_controller_1.createChat);
// GET all chats
router.get("/", isAuthenticated_1.isAuthenticated, chat_controller_1.fetchAllChats);
exports.default = router;
