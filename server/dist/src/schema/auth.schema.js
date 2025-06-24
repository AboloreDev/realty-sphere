"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resendVerificationSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email().min(1).max(255),
    password: zod_1.z.string().min(8).max(255),
    confirmPassword: zod_1.z.string().min(8).max(255),
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
