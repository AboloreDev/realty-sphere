"use client";

import React from "react";
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
import Link from "next/link";
import { useForgotPasswordMutation } from "@/state/api/authApi";
import { useRouter } from "next/navigation";
import { forgotPasswordSchema } from "@/lib/schemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  // get the mutation from redux
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  // route handler
  const router = useRouter();
  // zod resolver for hook form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  // submit function
  const onSubmit = async (data: z.infer<typeof forgotPasswordSchema>) => {
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
      await forgotPassword({ email: data.email }).unwrap();
      // store the email in local storage so we can use it later on the otp page
      localStorage.setItem("reset-email", data.email);
      // success toast
      toast.success("OTP sent to mail");
      // route handler
      router.push("/auth/verifyOtp");
    } catch (error: any) {
      toast.error(error.data?.message || "Something went wrong");
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
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPasswordPage;
