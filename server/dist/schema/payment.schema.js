"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPaymentSchema = exports.ProcessPaymentRequestSchema = void 0;
const zod_1 = require("zod");
exports.ProcessPaymentRequestSchema = zod_1.z.object({
    amountPaid: zod_1.z.number().positive("Amount must be positive"),
    stripePaymentId: zod_1.z.string().optional(),
});
exports.processPaymentSchema = zod_1.z.object({
    id: zod_1.z
        .string()
        .refine((val) => !isNaN(parseInt(val)), { message: "Invalid payment ID" }),
    amountPaid: zod_1.z.number().positive("Amount must be positive"),
    stripePaymentId: zod_1.z.string().optional(),
});
