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
import { useAppDispatch } from "@/state/redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { setUser } from "@/state/slice/userSlice";

const LoginPage = () => {
  // get the mutation from redux
  const [loginMutation, { isLoading }] = useLoginUserMutation();
  // dispatch the function using dispatch
  const dispatch = useAppDispatch();
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
      dispatch(setUser(response.user));
      toast.success("Login Successful");
      router.push(
        response.user.role === "TENANT"
          ? "/dashboard/tenant"
          : "/dashboard/landlord"
      );
    } catch (error: any) {
      // "@ts-expect-error" type of any
      toast.error(error.data?.message || "Registration failed");
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
            <div className="text-right">
              <Link
                href={"/auth/forgotPassword"}
                className="text-blue-500 hover:underline"
              >
                forgot password?
              </Link>
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
