"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyResetCodeSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.resendVerificationSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email().min(1).max(255),
    password: zod_1.z.string().min(8).max(255),
    confirmPassword: zod_1.z.string().min(8).max(255),
    phoneNumber: zod_1.z.string().min(11).max(255),
    role: zod_1.z.enum(["Tenant", "Landlord"]),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email().min(1).max(255),
    password: zod_1.z.string().min(8).max(255),
});
exports.verifyEmailSchema = zod_1.z.string().min(1).max(50);
exports.resendVerificationSchema = zod_1.z.object({
    email: zod_1.z.string().email("A valid email is required"),
});
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email("A valid email is required"),
});
exports.resetPasswordSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
    newPassword: zod_1.z.string().min(8),
    confirmPassword: zod_1.z.string().min(8),
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});
exports.verifyResetCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().length(6),
});
