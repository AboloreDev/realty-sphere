"use client";

import ApplicationCard from "@/components/code/ApplicationCard";
import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useFetchAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from "@/state/api/applicationApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveTab } from "@/state/slice/applicationSlice";
import { CircleCheckBig, Download, File, Hospital } from "lucide-react";
import Link from "next/link";
import React from "react";

const Applications = () => {
  // get the user
  const { data: user } = useGetUserProfileQuery();
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

  console.log("Status Change:", handleStatusChange);

  const filteredApplications = applications?.filter((application) => {
    if (activeTab === "all") return true;
    return application?.status.toLowerCase() === activeTab;
  });
  console.log("Applications:", applications);

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
                        className={`p-4 text-green-700 grow ${
                          application.status === "Approved"
                            ? "bg-green-100"
                            : application.status === "Denied"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <div className="flex flex-wrap items-center">
                          <File className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="mr-2 text-sm">
                            Application submitted on{" "}
                            {new Date(
                              application.applicationDate
                            ).toLocaleDateString()}
                            .
                          </span>
                          <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span
                            className={`font-semibold ${
                              application.status === "Approved"
                                ? "text-green-800"
                                : application.status === "Denied"
                                ? "text-red-800"
                                : "text-yellow-800"
                            }`}
                          >
                            {application.status === "Approved" &&
                              "This application has been approved."}
                            {application.status === "Denied" &&
                              "This application has been denied."}
                            {application.status === "Pending" &&
                              "This application is pending review."}
                          </span>
                        </div>
                      </div>
                      {/* Right side */}
                      <div className="flex gap-2 justify-center items-center">
                        <Link
                          href={`/dashboard/manager/properties/${application.property.id}`}
                          scroll={false}
                        >
                          <Button>
                            <Hospital className="w-5 h-5 mr-2" />
                            Property Details
                          </Button>
                        </Link>
                        {application.status === "Approved" && (
                          <Button>
                            <Download className="w-5 h-5 mr-2" />
                            Create Lease
                          </Button>
                        )}
                        {application.status === "Pending" && (
                          <>
                            <Button
                              className="px-4 py-2 text-sm bg-green-600 rounded hover:bg-green-500"
                              onClick={() =>
                                handleStatusChange(application.id, "Approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              className="px-4 py-2 text-sm  bg-red-600 rounded hover:bg-red-500"
                              onClick={() =>
                                handleStatusChange(application.id, "Denied")
                              }
                            >
                              Deny
                            </Button>
                          </>
                        )}
                        {application.status === "Denied" && (
                          <Button
                            className={` py-2 px-4 rounded-md flex items-center
                          justify-center hover:bg-secondary-500 hover:text-primary-50`}
                          >
                            Contact User
                          </Button>
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
