"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFetchAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api/applicationApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveTab } from "@/state/slice/applicationSlice";
import React from "react";

const Applications = () => {
  // get the user
  const { data: user } = useGetUserProfileQuery();
  const userRole = user?.user?.id;
  const userName = user?.user?.name;
  // get the active tab states from landlord slice
  const activeTab = useAppSelector((state) => state.application.activeTab);
  const dispatch = useAppDispatch();

  // fetch the applications()
  const { data: applications, isLoading } = useFetchAllApplicationsQuery();

  // fetch the updateApplicationStatus Api
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();

  // handle status change
  const handleStatusChange = async (id: number, status: string) => {
    await updateApplicationStatus({ id, status });
  };

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application?.status.toLowerCase() === activeTab;
  });
  console.log("Applications:", applications);

  if (isLoading) {
    return (
      <div>
        <BouncingLoader />
      </div>
    );
  }
  return (
    <div className="p-4">
      <Header
        title="Applications"
        subtitle="View and Manage Applications for your Properties"
      />
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          dispatch(
            setActiveTab(value as "all" | "pending" | "approved" | "declined")
          )
        }
        className="w-full my-5"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        {["all", "pending", "approved", "declined"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 w-full">
            {filteredApplications
              ?.filter(
                (application) =>
                  tab === "all" || application.status.toLowerCase() === tab
              )
              .map((application) => (
                <></>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Applications;
