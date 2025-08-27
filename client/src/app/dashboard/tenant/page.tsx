"use client";

import BouncingLoader from "@/components/code/BouncingLoader";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useFetchAllApplicationsQuery } from "@/state/api/applicationApi";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useGetAllLeasesQuery } from "@/state/api/leaseApi";
import { useGetPaymentForLeaseQuery } from "@/state/api/paymemtApi";
import {
  useGetTenantQuery,
  useGetTenantResidenciesQuery,
} from "@/state/api/tenantApi";

import React from "react";

const TenantPage = () => {
  // Get the user
  const { data: user } = useGetUserProfileQuery();

  // Get the lease
  // GET ALL AVAILABLE LEASES FOR THE USER
  const { data: leases, isLoading: leasesLoading } = useGetAllLeasesQuery(
    parseInt(user.user.id || "0"),
    {
      skip: !user.user.id,
    }
  );

  // Get the acive lease payment
  const { data: payments, isLoading: PaymentLoading } =
    useGetPaymentForLeaseQuery(leases?.[0]?.id, { skip: !user.user.id });
  console.log("Payment:", payments);

  const { data: tenant } = useGetTenantQuery(user.user.id || "", {
    refetchOnMountOrArgChange: true,
  });

  const { data: favorites, isLoading: favoritesLoading } =
    useGetAllPropertiesQuery({
      favoriteIds:
        tenant?.favorites?.map((favorite: { id: number }) => favorite.id) || [],
    });

  const { data: residencies, isLoading: residenciesLoading } =
    useGetTenantResidenciesQuery(user.user.id || "", { skip: !user?.user?.id });

  const { data: applications, isLoading: applicationsLoading } =
    useFetchAllApplicationsQuery(user.user.id || "", { skip: !user?.user?.id });

  if (
    leasesLoading ||
    PaymentLoading ||
    favoritesLoading ||
    residenciesLoading ||
    applicationsLoading
  )
    return (
      <div>
        <BouncingLoader />
      </div>
    );

  return (
    <div className="p-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Leases</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {leases?.length || 0}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-2 text-sm">
          {leases && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Approved:</span>
                <span>
                  {
                    leases.filter(
                      (lease) => lease.status?.toLowerCase() === "approved"
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Pending:</span>
                <span>
                  {
                    leases.filter(
                      (lease) => lease.status?.toLowerCase() === "pending"
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Terminated:</span>
                <span>
                  {
                    leases.filter(
                      (lease) => lease.status?.toLowerCase() === "declined"
                    ).length
                  }
                </span>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Payment</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $ {payments?.amountPaid?.toLocaleString()}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex flex-col items-start gap-2 text-sm">
          <div className="flex items-center gap-2">
            <p className="font-medium">Amount Due:</p>
            <span>${payments?.amountDue?.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-medium">Payment Status:</p>
            <span>{payments?.paymentStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-medium">Escrow Status:</p>
            <span>{payments?.escrowStatus}</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-medium">Payment Date:</p>
            <span>{new Date(payments?.paymentDate).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            <p className="font-medium">Due Date:</p>
            <span>{new Date(payments?.dueDate).toLocaleDateString()}</span>
          </div>

          {payments?.escrowReleaseDate && (
            <div className="flex items-center gap-2">
              <p className="font-medium">Escrow Release Date:</p>
              <span>
                {new Date(payments.escrowReleaseDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Favorited Properties</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {favorites?.length}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Current Residence</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {residencies?.length}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Applications</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {applications?.length || 0}
          </CardTitle>
        </CardHeader>

        <CardFooter className="flex-col items-start gap-2 text-sm">
          {applications && (
            <div className="space-y-2 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Approved:</span>
                <span>
                  {
                    applications.filter(
                      (app) => app.status.toLowerCase() === "approved"
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Pending:</span>
                <span>
                  {
                    applications.filter(
                      (app) => app.status.toLowerCase() === "pending"
                    ).length
                  }
                </span>
              </div>

              <div className="flex items-center justify-between w-full">
                <span className="font-medium">Denied:</span>
                <span>
                  {
                    applications.filter(
                      (app) => app.status.toLowerCase() === "declined"
                    ).length
                  }
                </span>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TenantPage;
