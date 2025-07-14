"use client";

import React from "react";
import DashboardPage from "../../page";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useUpdateLandlordMutation } from "@/state/api/landlordApi";
import { toast } from "sonner";
import { setUser } from "@/state/slice/userSlice";
import Settings from "@/components/code/Settings";
import BouncingLoader from "@/components/code/BouncingLoader";

const SettingsPage = () => {
  // api from landlordApi
  const [updateLandlord, { isLoading }] = useUpdateLandlordMutation();
  // get the dispatch to update the landlord state in redux
  const dispatch = useAppDispatch();
  // get the user details from redux using selector
  const user = useAppSelector((state) => state.user.user);

  // use the user to set the initial data
  const initialData = {
    name: user?.name,
    email: user?.email,
  };

  // Perform api function
  const handleSubmit = async (data: typeof initialData) => {
    try {
      // check if user exist
      if (user?.id) {
        // call the update tenant function
        await updateLandlord({
          id: user.id,
          data: {
            name: data.name,
            email: data.email,
          },
        }).unwrap();
        // dispatch updated data into the redux state
        dispatch(
          setUser({
            ...user,
            name: data.name ?? "",
            email: data.email ?? "",
          })
        );
        // set a toast
        toast.success("Landlord updated Successfully");
      }
    } catch (error) {
      toast.error("Error updating landlord details", error);
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
        userType="manager"
      />
    </DashboardPage>
  );
};

export default SettingsPage;
