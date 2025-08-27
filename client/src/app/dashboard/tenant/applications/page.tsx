"use client";

import ApplicationCard from "@/components/code/ApplicationCard";
import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFetchAllApplicationsQuery } from "@/state/api/applicationApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveTab } from "@/state/slice/applicationSlice";
import { CircleCheckBig, Clock, XCircle } from "lucide-react";
import React from "react";

const Applications = () => {
  const { data: user } = useGetUserProfileQuery();
  const activeTab = useAppSelector((state) => state.application.activeTab);
  const dispatch = useAppDispatch();

  const { data: applications, isLoading } = useFetchAllApplicationsQuery(
    user.user.id
  );

  const getEmptyMessage = (tab: string) => {
    switch (tab) {
      case "all":
        return "No applications found yet.";
      case "pending":
        return "No pending applications at the moment.";
      case "approved":
        return "No approved applications yet.";
      case "denied":
        return "No denied applications at the moment.";
      default:
        return "No applications found.";
    }
  };

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application?.status.toLowerCase() === activeTab;
  });

  if (isLoading) {
    return <BouncingLoader />;
  }

  console.log(applications);

  return (
    <div className="p-6">
      <Header
        title="Applications"
        subtitle="View your Applications for Properties"
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          dispatch(
            setActiveTab(value as "all" | "pending" | "approved" | "denied")
          )
        }
        className="w-full my-5 cursor-pointer"
      >
        <TabsList className="grid w-full grid-cols-4 cursor-pointer">
          <TabsTrigger value="all" className="cursor-pointer">
            All
          </TabsTrigger>
          <TabsTrigger value="pending" className="cursor-pointer">
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="cursor-pointer">
            Approved
          </TabsTrigger>
          <TabsTrigger value="denied" className="cursor-pointer">
            Denied
          </TabsTrigger>
        </TabsList>
        {["all", "pending", "approved", "denied"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-5 w-full">
            {filteredApplications?.length ? (
              filteredApplications
                ?.filter(
                  (application) =>
                    tab === "all" || application.status.toLowerCase() === tab
                )
                .map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    user={user}
                  >
                    <div className="flex flex-col md:flex-row  justify-between gap-5 w-full pb-4 px-4">
                      {/* Colored Section Status */}
                      <div
                        className={`p-1 text-green-700 grow ${
                          application.status === "Approved"
                            ? "bg-green-100"
                            : application.status === "Denied"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {application.status === "Approved" ? (
                          <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                            <CircleCheckBig className="w-5 h-5 mr-2" />
                            The property is being rented by you until{" "}
                            {new Date(
                              application.lease?.endDate
                            ).toLocaleDateString()}
                          </div>
                        ) : application.status === "Pending" ? (
                          <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Your application is pending approval
                          </div>
                        ) : (
                          <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                            <XCircle className="w-5 h-5 mr-2" />
                            Your application has been denied
                          </div>
                        )}
                      </div>
                    </div>
                  </ApplicationCard>
                ))
            ) : (
              <div className="text-center text-gray-500 py-10">
                {getEmptyMessage(tab)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Applications;
