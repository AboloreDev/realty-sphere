import express from "express";

import { isAuthenticated } from "../middleware/isAuthenticated";
import { createChat, fetchAllChats } from "../controllers/chat.controller";

const router = express.Router();

// create a chat
router.post("/", isAuthenticated, createChat);

// GET all chats
router.get("/", isAuthenticated, fetchAllChats);

export default router;
