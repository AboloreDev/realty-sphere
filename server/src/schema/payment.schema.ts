import { z } from "zod";

export const ProcessPaymentRequestSchema = z.object({
  amountPaid: z.number().positive("Amount must be positive"),
  stripePaymentId: z.string().optional(),
});
export const processPaymentSchema = z.object({
  id: z
    .string()
    .refine((val) => !isNaN(parseInt(val)), { message: "Invalid payment ID" }),
  amountPaid: z.number().positive("Amount must be positive"),
  stripePaymentId: z.string().optional(),
});
