"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useVerifyOtpMutation } from "@/state/api/authApi";
import { useForm } from "react-hook-form";
import { verifyOtpSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const VerifyOtpPage = () => {
  // get the mutation from redux
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  // handle routes
  const router = useRouter();
  // resove zod errors
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof verifyOtpSchema>>({
    resolver: zodResolver(verifyOtpSchema),
  });

  // otp digits array
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    setValue("code", newOtpDigits.join(""), { shouldValidate: true });
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index - 1] = "";
      setOtpDigits(newOtpDigits);
      setValue("code", newOtpDigits.join(""), { shouldValidate: true });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtpDigits = pastedData.split("");
      setOtpDigits(newOtpDigits);
      setValue("code", pastedData, { shouldValidate: true });
      inputRefs.current[5]?.focus();
    }
  };

  // submit handler
  const onSubmit = async (data: z.infer<typeof verifyOtpSchema>) => {
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
      if (!email) {
        toast.error("No email found. Please start the process again.");
        router.push("/forgotPassword");
        return;
      }
      // @ts-expect-error "no error"
      await verifyOtp({ email, code: data.code }).unwrap();
      // store otp in local storage for use in the password reset page
      localStorage.setItem("reset-otp", data.code);
      toast.success("OTP verified successfully!");
      router.push("/auth/resetPassword");
    } catch (error: any) {
      toast.error(error.data.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className=" w-[350px] md:w-[500px] p-4">
        <CardHeader>
          <CardTitle className="text-center prata-regular">
            Verify OTP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 " onSubmit={handleSubmit(onSubmit)}>
            <div>
              <div className="flex space-x-2 mt-2 justify-center items-center">
                {otpDigits.map((digit, index) => (
                  <Input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center"
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                  />
                ))}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otpDigits.join("").length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-right text-slate-400 w-full">
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

export default VerifyOtpPage;
