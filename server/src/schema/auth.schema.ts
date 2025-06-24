import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string(),
    email: z.string().email().min(1).max(255),
    password: z.string().min(8).max(255),
    confirmPassword: z.string().min(8).max(255),
    role: z.enum(["Tenant", "Landlord"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email().min(1).max(255),
  password: z.string().min(8).max(255),
});

export const verifyEmailSchema = z.string().min(1).max(50);

export const resendVerificationSchema = z.object({
  email: z.string().email("A valid email is required"),
});
