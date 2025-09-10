"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatMessages = exports.sendMessage = void 0;
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
exports.sendMessage = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { chatId, content } = req.body;
        if (!user) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "User not authenticated");
        }
        if (!content || content.trim().length === 0) {
            return (0, appAssert_1.default)(false, 400, "Message content cannot be empty");
        }
        // Verify chat exists and user has access (either tenant who owns chat OR manager of the property)
        const chat = yield prismaClient_1.default.chat.findUnique({
            where: { id: chatId },
            include: {
                property: {
                    select: {
                        managerId: true,
                        manager: { select: { id: true, name: true } },
                    },
                },
                user: { select: { id: true, name: true, role: true } },
            },
        });
        if (!chat) {
            return (0, appAssert_1.default)(false, httpStatus_1.NOT_FOUND, "Chat not found");
        }
        // Check if user has permission to send message in this chat
        const hasPermission = chat.userId === user.id || // Tenant who owns the chat
            (user.role === "MANAGER" && chat.property.managerId === user.id); // Manager of the property
        if (!hasPermission) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "You don't have permission to send messages in this chat");
        }
        // Create the message and update chat's updatedAt
        const [newMessage] = yield Promise.all([
            prismaClient_1.default.message.create({
                data: {
                    content: content.trim(),
                    senderId: user.id,
                    chatId,
                },
                include: {
                    sender: { select: { id: true, name: true, role: true } },
                },
            }),
            // Update chat's updatedAt timestamp
            prismaClient_1.default.chat.update({
                where: { id: chatId },
                data: { updatedAt: new Date() },
            }),
        ]);
        return res.status(201).json({
            success: true,
            message: "Message sent successfully",
            data: newMessage,
        });
    }
    catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
exports.getChatMessages = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { chatId } = req.params;
        if (!user) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "User not authenticated");
        }
        // First, get the chat with property info to check user access
        const chat = yield prismaClient_1.default.chat.findUnique({
            where: {
                id: parseInt(chatId),
            },
            include: {
                property: {
                    include: {
                        manager: true,
                    },
                },
                user: true,
            },
        });
        if (!chat) {
            return (0, appAssert_1.default)(false, httpStatus_1.NOT_FOUND, "Chat not found");
        }
        // Check if user has access to this chat
        // User has access if they are:
        // 1. The chat owner (tenant who created it)
        // 2. The property owner/manager
        const hasAccess = chat.userId === user.id || // Chat owner
            chat.property.manager.id === user.id; // Property owner
        if (!hasAccess) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "You don't have access to this chat");
        }
        // Fetch messages for the chat
        const messages = yield prismaClient_1.default.message.findMany({
            where: {
                chatId: parseInt(chatId),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        // Mark messages as read (messages not sent by current user)
        yield prismaClient_1.default.message.updateMany({
            where: {
                chatId: parseInt(chatId),
                senderId: { not: user.id },
                isRead: false,
            },
            data: {
                isRead: true,
            },
        });
        return res.status(200).json({
            success: true,
            data: {
                messages,
                chat: {
                    id: chat.id,
                    property: {
                        id: chat.property.id,
                        title: chat.property.name,
                    },
                    participants: {
                        tenant: chat.user,
                        propertyOwner: chat.property.manager,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
