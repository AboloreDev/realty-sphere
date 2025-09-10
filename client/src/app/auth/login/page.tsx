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
import { loginSchema } from "@/lib/schemas";
import { useLoginUserMutation } from "@/state/api/authApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const LoginPage = () => {
  // get the mutation from redux
  const [loginMutation, { isLoading }] = useLoginUserMutation();

  // route handler
  const router = useRouter();
  // form types
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  // submit handler
  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
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
      const response = await loginMutation(data).unwrap();
      toast.success("Login Successful");
      router.push(
        response.user.role === "TENANT"
          ? "/dashboard/tenant"
          : "/dashboard/manager"
      );
    } catch (error: any) {
      toast.error(error.data?.message || "Login failed");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className=" w-[350px] md:w-[500px] p-4">
        {/* Card title */}
        <CardHeader>
          <CardTitle className="text-center prata-regular">Login</CardTitle>
        </CardHeader>
        {/* Card form */}
        <CardContent>
          <form
            className="flex space-y-4 flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Email */}
            <div className="flex flex-col space-y-2">
              <Label>Email</Label>
              <Input type="email" id="email" {...register("email")} />
            </div>
            {/* Password */}
            <div className="flex flex-col space-y-2">
              <Label>Password</Label>
              <Input type="password" id="password" {...register("password")} />
            </div>
            {/* forgot password */}
            <div className="flex justify-between items-center flex-row-reverse">
              <div className="text-right">
                <Link
                  href={"/auth/forgotPassword"}
                  className="text-blue-500 hover:underline"
                >
                  forgot password?
                </Link>
              </div>
              {/* back to home */}
              <div>
                <Link
                  href={"/homepage"}
                  className="text-blue-500 hover:underline"
                >
                  back to home
                </Link>
              </div>
            </div>
            {/* Button */}{" "}
            <Button variant="outline" disabled={isLoading}>
              {isLoading ? "Logging In..." : "Login"}
            </Button>
          </form>
        </CardContent>
        {/* Card footer */}
        <CardFooter>
          <p className="text-sm text-center w-full">
            Don&apos;t have an account?{" "}
            <Link
              href={"/auth/register"}
              className="text-blue-500 hover:underline"
            >
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
