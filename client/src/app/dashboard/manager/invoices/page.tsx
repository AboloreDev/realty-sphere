"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import LeaseCard from "@/components/code/LeaseCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useGetAllLeasesQuery } from "@/state/api/leaseApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveTab } from "@/state/slice/applicationSlice";
import { CircleCheckBig, Clock, XCircle } from "lucide-react";

import React from "react";

const Invoices = () => {
  const { data: user } = useGetUserProfileQuery();
  const { data: leases, isLoading } = useGetAllLeasesQuery(user.user.id);
  const activeTab = useAppSelector((state) => state.application.activeTab);
  const dispatch = useAppDispatch();

  console.log(leases);

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

  const filteredLeases = leases?.filter((lease) => {
    if (activeTab === "all") return true;
    return lease?.status.toLowerCase() === activeTab;
  });

  if (isLoading) {
    return <BouncingLoader />;
  }

  return (
    <div className="p-6">
      <Header title="Leases" subtitle="View all your Leases" />

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
            {filteredLeases?.length ? (
              filteredLeases
                ?.filter(
                  (lease) => tab === "all" || lease.status.toLowerCase() === tab
                )
                .map((lease) => (
                  <LeaseCard key={lease.id} lease={lease} user={user}>
                    <div className="flex flex-col md:flex-row  justify-between gap-5 w-full pb-4 px-4">
                      {/* Colored Section Status */}
                      <div
                        className={`p-1 text-green-700 grow ${
                          lease.status === "Approved"
                            ? "bg-green-100"
                            : lease.status === "Denied"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        {lease.status === "Approved" ? (
                          <div className="bg-green-100 p-4 text-green-700 grow flex items-center">
                            <CircleCheckBig className="w-5 h-5 mr-2" />
                            This lease is active until{" "}
                            {new Date(lease.endDate).toLocaleDateString()}
                          </div>
                        ) : lease.status === "Pending" ? (
                          <div className="bg-yellow-100 p-4 text-yellow-700 grow flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            This lease is pending approval from the Tenant
                          </div>
                        ) : (
                          <div className="bg-red-100 p-4 text-red-700 grow flex items-center">
                            <XCircle className="w-5 h-5 mr-2" />
                            This lease has been denied
                          </div>
                        )}
                      </div>
                    </div>
                  </LeaseCard>
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

export default Invoices;
