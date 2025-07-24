"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/lib/schemas";
import { useRegisterUserMutation } from "@/state/api/authApi";
import { useAppDispatch } from "@/state/redux";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { setUser } from "@/state/slice/userSlice";
import { toast } from "sonner";

const RegisterPage = () => {
  // getting the mutation from the redux toolkit
  const [registerMutation, { isLoading }] = useRegisterUserMutation();
  // dispatch function from useAppDispatch
  const dispatch = useAppDispatch();
  // router
  const router = useRouter();
  // zod schema
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: undefined },
  });

  //   watch for role on form
  const selectedRole = watch("role");

  // submit handler
  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
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
      const response = await registerMutation(data).unwrap();
      dispatch(setUser(response.user));

      toast.success("Registration successful!");
      router.push(
        response.user.role === "TENANT"
          ? "/dashboard/tenant"
          : "/dashboard/manager"
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
          <CardTitle className="text-center prata-regular">Register</CardTitle>
        </CardHeader>
        {/* Card form */}
        <CardContent>
          <form
            className="flex space-y-4 flex-col"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Name */}
            <div className="flex flex-col space-y-2">
              <Label>Name</Label>
              <Input type="name" id="name" {...register("name")} />
            </div>
            {/* Email */}
            <div className="flex flex-col space-y-2">
              <Label>Email</Label>
              <Input type="email" id="email" {...register("email")} />
            </div>
            {/* Pjone Number */}
            <div className="flex flex-col space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="phone number"
                id="phoneNumber"
                {...register("phoneNumber")}
              />
            </div>
            {/* Password */}
            <div className="flex flex-col space-y-2">
              <Label>Password</Label>
              <Input type="password" id="password" {...register("password")} />
            </div>
            {/* Confirm Password */}
            <div className="flex flex-col space-y-2">
              <Label>Confirm Paasword</Label>
              <Input
                type="confirm password"
                id="confirmPassword"
                {...register("confirmPassword")}
              />
            </div>
            {/* Role */}
            <div className="flex flex-col space-y-2">
              <Label>Role</Label>
              <div className="flex space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tenant"
                    checked={selectedRole === "Tenant"}
                    onCheckedChange={(checked) => {
                      //"@ts-expect-error " argument type
                      setValue("role", checked ? "Tenant" : "Landlord", {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <Label htmlFor="tenant">Tenant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="landlord"
                    checked={selectedRole === "Landlord"}
                    onCheckedChange={(checked) => {
                      //"@ts-expect-error " argument type
                      setValue("role", checked ? "Landlord" : "Tenant", {
                        shouldValidate: true,
                      });
                    }}
                  />
                  <Label htmlFor="landlord">Landlord</Label>
                </div>
              </div>
            </div>
            {/* Button */}
            <Button variant="outline" disabled={isLoading}>
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        {/* Card footer */}
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account?{" "}
            <Link
              href={"/auth/login"}
              className="text-blue-500 hover:underline"
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;
