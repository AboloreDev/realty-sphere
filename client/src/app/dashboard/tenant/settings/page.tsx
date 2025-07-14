"use client";

import React from "react";
import DashboardPage from "../../page";
import Settings from "@/components/code/Settings";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useUpdateTenantMutation } from "@/state/api/tenantApi";
import { toast } from "sonner";
import { setUser } from "@/state/slice/userSlice";
import BouncingLoader from "@/components/code/BouncingLoader";

const TenantSettingsPage = () => {
  const dispatch = useAppDispatch();
  // get the user from the redux state using predefined AppSelector
  const user = useAppSelector((state) => state.user.user);
  // get the useTenantMutation from the API
  const [updateTenant, { isLoading }] = useUpdateTenantMutation();
  // set Initial Data
  const initialData = {
    name: user?.name,
    email: user?.email,
  };

  // handle the submit using the api
  const handleSubmit = async (data: typeof initialData) => {
    try {
      if (user?.id) {
        await updateTenant({
          id: user.id,
          data: {
            name: data.name,
            email: data.email,
          },
        }).unwrap();
        dispatch(
          setUser({
            ...user,
            name: data.name ?? "",
            email: data.email ?? "",
          })
        );
        toast.success("Tenant Updated Successfully");
      }
    } catch (error) {
      toast.error("Failed to update Tenant", error);
    }
  };

  return (
    <DashboardPage>
      {isLoading && (
        <div>
          <BouncingLoader />
        </div>
      )}
      <Settings
        initialData={initialData}
        onSubmit={handleSubmit}
        userType="tenant"
      />
    </DashboardPage>
  );
};

export default TenantSettingsPage;
