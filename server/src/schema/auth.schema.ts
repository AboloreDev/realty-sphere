import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string(),
    email: z.string().email().min(1).max(255),
    password: z.string().min(8).max(255),
    confirmPassword: z.string().min(8).max(255),
    phoneNumber: z.string().min(11).max(255),
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
export const forgotPasswordSchema = z.object({
  email: z.string().email("A valid email is required"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifyResetCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});
