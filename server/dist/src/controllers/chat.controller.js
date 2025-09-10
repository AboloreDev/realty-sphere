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
exports.fetchAllChats = exports.createChat = void 0;
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const httpStatus_1 = require("../constants/httpStatus");
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
// BACKEND: Updated createChat controller
exports.createChat = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { propertyId, userId } = req.body;
        if (!user) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "User not authenticated");
        }
        if (!propertyId || !userId) {
            return (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Property ID and Applicant ID are required");
        }
        // Verify the manager owns/manages this property
        const property = yield prismaClient_1.default.property.findFirst({
            where: {
                id: propertyId,
                managerId: user.id,
            },
        });
        if (!property) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Property not found or you don't have permission");
        }
        // Check if chat already exists for this applicant-property combination
        let existingChat = yield prismaClient_1.default.chat.findUnique({
            where: {
                userId_propertyId: {
                    userId: userId,
                    propertyId: propertyId,
                },
            },
            include: {
                user: {
                    select: { id: true, name: true, role: true },
                },
                property: {
                    select: { id: true, name: true },
                },
            },
        });
        if (existingChat) {
            return res.status(200).json({
                success: true,
                message: "Chat already exists",
                data: existingChat,
            });
        }
        // Create new chat with applicant as the userId
        const newChat = yield prismaClient_1.default.chat.create({
            data: {
                userId: userId,
                propertyId: propertyId,
            },
            include: {
                user: {
                    select: { id: true, name: true, role: true },
                },
                property: {
                    select: { id: true, name: true },
                },
            },
        });
        return res.status(201).json({
            success: true,
            message: "Chat created successfully",
            data: newChat,
        });
    }
    catch (error) {
        console.error("Error creating chat:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
exports.fetchAllChats = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "User not authenticated");
        }
        const chats = yield prismaClient_1.default.chat.findMany({
            where: { userId: user.id },
            include: {
                property: {
                    select: {
                        id: true,
                        name: true,
                        managerId: true,
                        location: true,
                        manager: true,
                        tenants: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        email: true,
                    },
                },
                messages: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                    include: {
                        sender: { select: { name: true, role: true } },
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            data: chats,
        });
    }
    catch (error) {
        console.error("Error fetching chats:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}));
