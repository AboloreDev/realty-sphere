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
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.verifyResetPasswordCode = exports.resetPassword = exports.forgotPassword = exports.resendVerificationMail = exports.verifyEmail = exports.loginUser = exports.registerUser = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const auth_schema_1 = require("../schema/auth.schema");
const auth_service_1 = require("../services/auth.service");
const authCookies_1 = require("../utils/authCookies");
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
exports.registerUser = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.registerSchema.parse(req.body);
    //  use the service
    const { user, accessToken, refreshToken } = yield (0, auth_service_1.createAccount)(request);
    // set cookies and return the response
    (0, authCookies_1.setAuthCookies)({ res, accessToken, refreshToken });
    return res.status(httpStatus_1.CREATED).json({
        success: true,
        message: "User registered successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
}));
exports.loginUser = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.loginSchema.parse(req.body);
    // use the service
    const { user, accessToken, refreshToken } = yield (0, auth_service_1.Login)(request);
    //set the cookies and rey=turn the response
    (0, authCookies_1.setAuthCookies)({ res, accessToken, refreshToken });
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "User Logged in successfully",
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
}));
exports.verifyEmail = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const verification = auth_schema_1.verifyEmailSchema.parse(req.params.code);
    // use the service
    const { user, message } = yield (0, auth_service_1.verifyEmailService)(verification);
    // return the response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
}));
exports.resendVerificationMail = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.resendVerificationSchema.parse(req.body);
    // use the service
    const { user, message } = yield (0, auth_service_1.resendVerificationEmailService)(request);
    // return the response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        user,
    });
}));
exports.forgotPassword = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.forgotPasswordSchema.parse(req.body);
    // use the srvice
    const { user, message } = yield (0, auth_service_1.forgotPasswordService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
}));
exports.resetPassword = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.resetPasswordSchema.parse(req.body);
    // use the service
    const { user, message } = yield (0, auth_service_1.resetPasswordService)(request);
    // return a response
    // first define the cokies options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
    // clear the cookies (access and refresh token)
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", Object.assign(Object.assign({}, cookieOptions), { path: "/auth/refresh" }));
    // return the response
    return res.status(httpStatus_1.OK).json({
        succes: true,
        message,
        user,
    });
}));
exports.verifyResetPasswordCode = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = auth_schema_1.verifyResetCodeSchema.parse(req.body);
    // use the service
    const { user, message } = yield (0, auth_service_1.verifyResetCodeService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json({
        succes: true,
        message,
        user,
    });
}));
exports.logout = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = req.cookies.accessToken;
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    };
    // No token? Clear both cookies anyway
    if (!accessToken) {
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", Object.assign(Object.assign({}, cookieOptions), { path: "/auth/refresh" }));
        return res.status(httpStatus_1.OK).json({
            success: true,
            message: "User logged out successfully",
        });
    }
    try {
        // Clear both cookies with full options
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", Object.assign(Object.assign({}, cookieOptions), { path: "/auth/refresh" }));
        return res.status(httpStatus_1.OK).json({
            success: true,
            message: "User logged out from all devices",
        });
    }
    catch (error) {
        // On error, still clear both
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", Object.assign(Object.assign({}, cookieOptions), { path: "/auth/refresh" }));
        return res.status(httpStatus_1.OK).json({
            success: true,
            message: "Invalid token. Cookies cleared.",
        });
    }
}));
