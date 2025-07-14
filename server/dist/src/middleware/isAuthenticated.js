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
exports.restrictTo = exports.isAuthenticated = void 0;
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const httpStatus_1 = require("../constants/httpStatus");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.cookies.accessToken;
        (0, appAssert_1.default)(accessToken, httpStatus_1.UNAUTHORIZED, "Unauthorized: No access token provided", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.JWT_SECRET);
        (0, appAssert_1.default)(decoded.userId, httpStatus_1.UNAUTHORIZED, "Unauthorized: Invalid token payload", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
        const user = yield prismaClient_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true },
        });
        (0, appAssert_1.default)(user, httpStatus_1.UNAUTHORIZED, "Unauthorized: User not found", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError ||
            error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return (0, appAssert_1.default)(false, httpStatus_1.UNAUTHORIZED, "Unauthorized: Invalid or expired token", "InvalidAccessToken" /* AppErrorCode.InvalidAccessToken */);
        }
        next(error);
    }
});
exports.isAuthenticated = isAuthenticated;
const restrictTo = (role) => {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, `Access denied: ${role} role required`, "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
        }
        next();
    };
};
exports.restrictTo = restrictTo;
