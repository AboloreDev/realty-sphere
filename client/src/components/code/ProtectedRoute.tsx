"use client";

import { useGetUserProfileQuery } from "@/state/api/authApi";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import BouncingLoader from "./BouncingLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: userResponse,
    isLoading,
    isError,
  } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (isLoading) return;

    // Handle authentication errors or token expiry
    if (isError || !userResponse) {
      toast.error("Session expired. Please login again.");
      router.push("/auth/login");
      return;
    }

    const userRole = userResponse?.user?.role;

    // Block unauthorized access
    if (pathname.startsWith("/dashboard/tenant") && userRole !== "TENANT") {
      toast.error("Access denied. Tenant access only.");
      router.push("/auth/login");
      return;
    }

    if (pathname.startsWith("/dashboard/manager") && userRole !== "MANAGER") {
      toast.error("Access denied. Manager access only.");
      router.push("/auth/login");
      return;
    }
  }, [userResponse, isLoading, isError, pathname, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BouncingLoader />
      </div>
    );
  }

  // Show error if auth failed
  if (isError || !userResponse) {
    return null; // Will redirect to login
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
