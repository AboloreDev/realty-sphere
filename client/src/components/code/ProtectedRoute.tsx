// app/components/code/ProtectedRoute.tsx
"use client";

import { authApi, useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setUser, clearUser } from "@/state/slice/userSlice";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import BouncingLoader from "./BouncingLoader";

// Define TypeScript types
interface User {
  id: string;
  email: string;
  name: string;
  role: "TENANT" | "MANAGER";
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const { data, isLoading, isError, error } = useGetUserProfileQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    }
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Handle initial load from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === "TENANT" || parsedUser.role === "MANAGER") {
          dispatch(setUser(parsedUser));
        } else {
          localStorage.removeItem("user");
          dispatch(clearUser());
        }
      } catch {
        localStorage.removeItem("user");
        dispatch(clearUser());
      }
    }

    // Wait for RTK Query to complete
    if (isLoading) {
      return;
    }

    setIsInitialLoad(false);

    // Handle errors or unsuccessful response
    if (isError || !data?.success) {
      toast.error(data?.message || "Unauthorized Access");
      localStorage.removeItem("user");
      dispatch(clearUser());
      dispatch(authApi.util.resetApiState());
      router.replace("/auth/login");
      return;
    }

    // Update Redux and localStorage with user data from API
    if (data?.user) {
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role as "TENANT" | "MANAGER",
      };
      if (!user || user.id !== userData.id || user.role !== userData.role) {
        dispatch(setUser(userData));
        localStorage.setItem("user", JSON.stringify(userData));
      }
    }

    // Get current role from API or Redux
    const currentRole = data?.user?.role || user?.role;

    if (!currentRole) {
      toast.error("No role assigned");
      localStorage.removeItem("user");
      dispatch(clearUser());
      dispatch(authApi.util.resetApiState());
      router.replace("/auth/login");
      return;
    }

    // Redirect for /dashboard based on role
    if (pathname === "/dashboard") {
      const redirectPath = `/dashboard/${currentRole.toLowerCase()}`;
      router.replace(redirectPath);
      return;
    }

    // Check role-based access for specific routes
    const expectedRole = pathname.startsWith("/dashboard/tenant")
      ? "TENANT"
      : pathname.startsWith("/dashboard/manager")
      ? "MANAGER"
      : null;
    if (expectedRole && currentRole !== expectedRole) {
      // Double-check localStorage role
      const storedUser = localStorage.getItem("user");
      let storedRole: string | null = null;
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          storedRole = parsedUser.role;
        } catch {
          localStorage.removeItem("user");

          dispatch(clearUser());
          dispatch(authApi.util.resetApiState());
        }
      }

      if (storedRole && storedRole !== expectedRole) {
        const redirectPath = `/dashboard/${storedRole.toLowerCase()}`;
        router.replace(redirectPath);
        return;
      } else if (currentRole !== expectedRole) {
        const redirectPath = `/dashboard/${currentRole.toLowerCase()}`;
        router.replace(redirectPath);
        return;
      }
    }
  }, [isLoading, isError, data, user, dispatch, router, pathname, error]);

  // Prevent rendering until role is validated
  if (isLoading || isInitialLoad || !data?.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BouncingLoader />
      </div>
    );
  }

  // Only render children if the role matches the route
  const currentRole = data?.user?.role || user?.role;
  const expectedRole = pathname.startsWith("/dashboard/tenant")
    ? "TENANT"
    : pathname.startsWith("/dashboard/manager")
    ? "MANAGER"
    : null;
  if (expectedRole && currentRole !== expectedRole) {
    // Double-check localStorage role
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== expectedRole) {
          return null; // Prevent rendering wrong dashboard
        }
      } catch {
        localStorage.removeItem("user");

        dispatch(clearUser());
        dispatch(authApi.util.resetApiState());
        return null;
      }
    }
    return null;
  }

  return <div>{children}</div>;
};

export default ProtectedRoute;
