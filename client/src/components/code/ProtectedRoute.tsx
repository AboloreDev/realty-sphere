"use client";

import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setUser } from "@/state/slice/userSlice";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // route handler
  const router = useRouter();
  // dispatch handler
  const dispatch = useAppDispatch();
  // get the user state using select hook
  const user = useAppSelector((state) => state.user.user);
  // get the data from the query
  const { data, isLoading, isError } = useGetUserProfileQuery();

  // using use effect hook to render user data
  useEffect(() => {
    if (isLoading) return; // waiting for user data
    // check for error
    if (!data?.success || isError) {
      toast.error(data?.message || "Unauthorized Access");
      router.push("/auth/login");
      return;
    }
    // if there is user data and user state is false, update the user state
    if (data?.user && !user) {
      dispatch(
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role as "TENANT" | "MANAGER",
        })
      );
    }
  }, [isLoading, isError, user, dispatch, router, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!data?.success) {
    return null;
  }
  return <div>{children}</div>;
};

export default ProtectedRoute;
