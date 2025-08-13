"use client";

import { useGetUserProfileQuery } from "@/state/api/authApi";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import BouncingLoader from "./BouncingLoader";

// Define user roles as constants for type safety
export const USER_ROLES = {
  MANAGER: "MANAGER",
  TENANT: "TENANT",
  ADMIN: "ADMIN", // Optional: if you have admin users
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Define route patterns that require specific roles
const ROLE_BASED_ROUTES = {
  "/dashboard/manager": [USER_ROLES.MANAGER],
  "/dashboard/tenant": [USER_ROLES.TENANT],
  "/dashboard/admin": [USER_ROLES.ADMIN],
  // Add more protected routes as needed
  "/manager": [USER_ROLES.MANAGER],
  "/tenant": [USER_ROLES.TENANT],
} as const;

// Define TypeScript types
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[]; // Optional: override route-based role checking
  fallbackPath?: string; // Optional: custom redirect path
}

interface User {
  id: string;
  role: UserRole;
  email?: string;
  name?: string;
  // Add other user properties as needed
}

interface UserResponse {
  user: User;
  token?: string;
}

const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackPath,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    data: userResponse,
    isLoading,
    isError,
    error,
  } = useGetUserProfileQuery();

  // Security check: Validate user data structure
  const isValidUserData = (data: any): data is UserResponse => {
    return (
      data &&
      typeof data === "object" &&
      data.user &&
      typeof data.user === "object" &&
      typeof data.user.id === "string" &&
      typeof data.user.role === "string" &&
      Object.values(USER_ROLES).includes(data.user.role)
    );
  };

  // Determine required roles for current route
  const getRequiredRolesForRoute = (path: string): UserRole[] => {
    // If requiredRole prop is provided, use it
    if (requiredRole) {
      return Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    }

    // Check exact path matches first
    for (const [route, roles] of Object.entries(ROLE_BASED_ROUTES)) {
      if (path === route) {
        return Array.from(roles) as UserRole[];
      }
    }

    // Check if path starts with any protected route pattern
    for (const [route, roles] of Object.entries(ROLE_BASED_ROUTES)) {
      if (path.startsWith(route)) {
        return Array.from(roles) as UserRole[];
      }
    }

    return []; // No specific role required
  };

  // Get default redirect path based on user role
  const getDefaultRedirectPath = (userRole: UserRole): string => {
    switch (userRole) {
      case USER_ROLES.MANAGER:
        return "/dashboard/manager";
      case USER_ROLES.TENANT:
        return "/dashboard/tenant";
      case USER_ROLES.ADMIN:
        return "/dashboard/admin";
      default:
        return "/auth/login";
    }
  };

  // Main access control logic
  useEffect(() => {
    // Skip checks while loading
    if (isLoading) return;

    // Handle authentication errors
    if (isError || !userResponse) {
      toast.error("Authentication failed. Please login again.");
      router.push("/auth/login");
      return;
    }

    // Validate user data structure for security
    if (!isValidUserData(userResponse)) {
      toast.error("Invalid user session. Please login again.");
      router.push("/auth/login");
      return;
    }

    const { user } = userResponse;
    const requiredRoles = getRequiredRolesForRoute(pathname);

    // If no specific role is required for this route, allow access
    if (requiredRoles.length === 0) {
      return;
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Security logging (in production, log this to your security monitoring system)
      console.warn(
        `Access denied: User ${user.id} with role ${user.role} attempted to access ${pathname}`
      );

      // Show security warning
      toast.error(
        `Access denied. This area is restricted to ${requiredRoles.join(
          " or "
        )} users only.`
      );

      // Redirect to appropriate dashboard based on user's actual role
      const redirectPath = fallbackPath || getDefaultRedirectPath(user.role);

      // Force navigation with replace to prevent back button exploitation
      router.replace(redirectPath);
      return;
    }

    // Additional security: Check for role tampering
    if (!Object.values(USER_ROLES).includes(user.role)) {
      toast.error("Invalid user role. Please contact support.");
      router.push("/auth/login");
      return;
    }
  }, [
    userResponse,
    isLoading,
    isError,
    error,
    pathname,
    router,
    requiredRole,
    fallbackPath,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <BouncingLoader />
          <p className="mt-4 text-gray-600">Verifying access permissions...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !userResponse) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Authentication required</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Validate user data one more time before rendering
  if (!isValidUserData(userResponse)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Invalid session data</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  const { user } = userResponse;
  const requiredRoles = getRequiredRolesForRoute(pathname);

  // Final access check before rendering children
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg font-semibold">Access Denied</p>
          <p className="text-gray-600 mt-2">
            You don&apos;t have permission to view this page
          </p>
          <button
            onClick={() => router.replace(getDefaultRedirectPath(user.role))}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // If all security checks pass, render the protected content
  return <div>{children}</div>;
};

export default ProtectedRoute;
