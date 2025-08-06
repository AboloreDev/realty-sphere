"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import PaymentHistory from "@/components/code/PaymentHistory";
import PaymentMethod from "@/components/code/PaymentMethod";
import ResidenceCard from "@/components/code/ResidenceCard";
import { useGetSinglePropertyQuery } from "@/state/api/api";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useGetAllLeasesQuery } from "@/state/api/leaseApi";
import { useGetPaymentQuery } from "@/state/api/paymemtApi";
import { useParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const ResidentDetails = () => {
  const { id } = useParams();
  const propertyId = Number(id);
  const { data: user } = useGetUserProfileQuery();
  // get the single property details
  const { data: property, isLoading: propertyLoading } =
    useGetSinglePropertyQuery(propertyId);

  // GET ALL AVAILABLE LEASES FOR THE USER
  const { data: leases, isLoading: leasesLoading } = useGetAllLeasesQuery(
    parseInt(user.user.id || "0"),
    {
      skip: !user.user.id,
    }
  );

  // GET ALL PAYMENTS USING THE LEASE ID AND SKIP IF THERE IS NO USER ID
  const { data: payments, isLoading: PaymentLoading } = useGetPaymentQuery(
    leases?.[0]?.id,
    { skip: !user.user.id }
  );

  if (propertyLoading || leasesLoading || PaymentLoading)
    return (
      <div>
        <BouncingLoader />
      </div>
    );

  if (!property) {
    toast.error("Property doesn't exist");
  }

  // find the current lease AVAILABLE
  const currentLease = leases?.find(
    (lease) => lease.propertyId === property.id
  );

  console.log("Property:", property);
  console.log("leases:", leases);
  console.log("payments:", payments);
  console.log("Current Lease:", currentLease);
  return (
    <div>
      {currentLease && (
        <ResidenceCard property={property} currentLease={currentLease} />
      )}
      <PaymentHistory payments={payments || []} />
      <PaymentMethod />
    </div>
  );
};

export default ResidentDetails;
