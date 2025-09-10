"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import LeaseCard from "@/components/code/LeaseCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import {
  useGetAllLeasesQuery,
  useUpdateLeaseStatusMutation,
} from "@/state/api/leaseApi";
import {
  useCreatePaymentForLeaseMutation,
  useGetTenantPaymentsQuery,
} from "@/state/api/paymemtApi";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setActiveTab } from "@/state/slice/applicationSlice";
import { CircleCheckBig, Download } from "lucide-react";

import { useRouter } from "next/navigation";

import React from "react";
import { toast } from "sonner";
import LeaseDetailsCard from "./LeaseDetailsCard";
import ConfirmSatisfaction from "./ConfirmSatisfaction";

const Invoices = () => {
  const { data: user } = useGetUserProfileQuery();
  const { data: leases = [], isLoading: leasesLoading } = useGetAllLeasesQuery(
    user.user.id
  );
  const activeTab = useAppSelector((state) => state.application.activeTab);
  const dispatch = useAppDispatch();
  const [updateLeaseStatus] = useUpdateLeaseStatusMutation();
  const [createPaymentForLease, { isLoading: isPaymentLoading }] =
    useCreatePaymentForLeaseMutation();
  // Fetch all payments for the tenant
  const { data: paymentsData, isLoading: paymentsLoading } =
    useGetTenantPaymentsQuery(user.user.id);
  const router = useRouter();

  // handle status change
  const handleStatusChange = async (id: number, status: string) => {
    await updateLeaseStatus({ id, status });
  };

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

  const handleProceedToPayment = async (leaseId: number) => {
    try {
      const paymentData = {
        amountDue: leases.find((lease) => lease.id === leaseId)?.rent,
        dueDate: new Date(
          new Date().setDate(new Date().getDate() + 365)
        ).toISOString(),
      };

      const response = await createPaymentForLease({
        leaseId,
        paymentData,
      }).unwrap();

      if (response.success && response.data?.id) {
        router.push(
          `/dashboard/tenant/invoices/[paymentId]/?paymentId=${response.data.id}`
        );
      } else {
        console.error(
          "Failed to create payment:",
          response.message || "Unknown error"
        );
        toast.error(response.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error("Error creating payment. Please try again.");
    }
  };
  if (leasesLoading || paymentsLoading) {
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
                    <div className="flex flex-col md:flex-row  justify-between items-center gap-5 w-full pb-4 px-4">
                      {/* Colored Section Status */}
                      <div
                        className={`p-4 text-green-700 grow ${
                          lease.status === "Approved"
                            ? "bg-green-100"
                            : lease.status === "Denied"
                            ? "bg-red-100"
                            : "bg-yellow-100"
                        }`}
                      >
                        <div className="flex items-center">
                          <CircleCheckBig className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span
                            className={`font-semibold ${
                              lease.status === "Approved"
                                ? "text-green-800"
                                : lease.status === "Denied"
                                ? "text-red-800"
                                : "text-yellow-800"
                            }`}
                          >
                            {paymentsData?.data?.some(
                              (payment) =>
                                payment?.leaseId === lease.id &&
                                payment.paymentStatus === "Paid"
                            )
                              ? "Thank you for your payment! Please check out the property and confirm your satisfaction."
                              : paymentsData?.data?.some(
                                  (payment) =>
                                    payment.leaseId === lease.id &&
                                    payment.paymentStatus === "Pending"
                                )
                              ? "Payment is pending. Please wait for the payment to complete."
                              : lease.status === "Approved"
                              ? "This lease has been approved. Please proceed to make a payment."
                              : null}
                            {lease.status === "Denied" &&
                              "This lease has been denied."}
                            {lease.status === "Pending" &&
                              "This lease is pending review."}
                          </span>
                        </div>
                      </div>
                      {/* Right side */}
                      <div className="flex gap-2 justify-center items-center">
                        {paymentsData?.data?.some(
                          (payment) =>
                            payment.leaseId === lease.id &&
                            payment.paymentStatus === "Paid"
                        ) ? (
                          <>
                            <Button
                              disabled
                              className="px-4 py-2 text-sm bg-gray-400 rounded flex items-center"
                            >
                              Payment Has Been Made
                            </Button>
                            <Button
                              className="px-4 py-2 text-sm  rounded  flex items-center"
                              onClick={() => {
                                toast.success("Downloading receipt...");
                              }}
                            >
                              <Download className="w-5 h-5 mr-2" />
                              Download Receipt
                            </Button>
                          </>
                        ) : paymentsData?.data?.some(
                            (payment) =>
                              payment.leaseId === lease.id &&
                              payment.paymentStatus === "Pending"
                          ) ? (
                          <Button
                            disabled
                            className="px-4 py-2 text-sm bg-yellow-600 rounded flex items-center"
                          >
                            Pending
                          </Button>
                        ) : lease.status === "Approved" ? (
                          <Button
                            disabled={isPaymentLoading}
                            onClick={() => handleProceedToPayment(lease.id)}
                            className="px-4 py-2 text-sm flex items-center"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            {isPaymentLoading
                              ? "Processing..."
                              : "Proceed to Payment"}
                          </Button>
                        ) : null}

                        {lease.status === "Pending" && (
                          <>
                            <Button
                              className="px-4 py-2 text-sm bg-green-600 rounded hover:bg-green-500"
                              onClick={() =>
                                handleStatusChange(lease.id, "Approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              className="px-4 py-2 text-sm  bg-red-600 rounded hover:bg-red-500"
                              onClick={() =>
                                handleStatusChange(lease.id, "Denied")
                              }
                            >
                              Deny
                            </Button>
                          </>
                        )}
                        {lease.status === "Denied" && (
                          <Button
                            className={` py-2 px-4 rounded-md flex items-center
                                  justify-center hover:bg-secondary-500 hover:text-primary-50`}
                          >
                            Contact Landlord
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="items-center">
                      <LeaseDetailsCard lease={lease} />
                    </div>
                    <div className="w-full px-4 mt-4">
                      {/* Additional actions or information can go here */}
                      {paymentsData?.data?.some(
                        (payment) =>
                          payment.leaseId === lease.id &&
                          payment.paymentStatus === "Paid" &&
                          payment.escrowStatus === "IN_ESCROW"
                      ) && (
                        <div className=" bg-green-50 text-green-800 rounded-lg flex justify-between items-center px-2 py-4">
                          <p>
                            Payment is still in escrow and waiting for your
                            confirmation, plesde check out the property.
                          </p>

                          <Button>
                            <ConfirmSatisfaction
                              // @ts-expect-error "no error"
                              paymentId={
                                paymentsData?.data?.find(
                                  (payment) =>
                                    payment.leaseId === lease.id &&
                                    payment.paymentStatus === "Paid" &&
                                    payment.escrowStatus === "IN_ESCROW"
                                )?.id
                              }
                            />
                          </Button>
                        </div>
                      )}
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
