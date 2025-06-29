"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/lib/schemas";
import { useResetPasswordMutation } from "@/state/api/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const ResetPasswordPage = () => {
  // get the mutation from rtk
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  // the route handler
  const router = useRouter();
  // the zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
  });
  // submit handler
  const onSubmit = async (data: z.infer<typeof resetPasswordSchema>) => {
    // Handle any form validation errors
    if (Object.keys(errors).length > 0) {
      // Display each error as a toast notification
      (Object.keys(errors) as Array<keyof typeof errors>).forEach((key) => {
        const error = errors[key];
        if (error) {
          toast.error(error.message || "Something went wrong");
        }
      });
    }
    try {
      const email = localStorage.getItem("reset-email");
      const code = localStorage.getItem("reset-otp");
      if (!email || !code) {
        toast.error("Session expired. Please start the process again.");
        router.push("/auth/forgotPassword");
        return;
      }
      await resetPassword({
        email,
        code,
        newPassword: data.newPassword,
        confirmPassword: data.newPassword,
      }).unwrap();
      localStorage.removeItem("resetEmail");
      localStorage.removeItem("resetOtp");
      toast.success("Password reset successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      // "@ts-expects-error" type argument
      toast.error(err.data?.message || "Failed to reset password");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className=" w-[350px] md:w-[500px] p-4">
        <CardHeader>
          <CardTitle className="text-center prata-regular">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...register("confirmNewPassword")}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-right w-full text-slate-400">
            Back to{" "}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
