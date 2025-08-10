"use client";

import ImagePreviews from "@/app/(landingPage)/search/[id]/ImagePreviews";
import PropertyDetails from "@/app/(landingPage)/search/[id]/PropertyDetails";
import PropertyOverview from "@/app/(landingPage)/search/[id]/PropertyOverview";
import BouncingLoader from "@/components/code/BouncingLoader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGetSinglePropertyQuery } from "@/state/api/api";
import { useGetPropertyLeasesQuery } from "@/state/api/leaseApi";
import { useGetPaymentQuery } from "@/state/api/paymemtApi";
import dynamic from "next/dynamic";

import { useParams, useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import TenantInquiriesPage from "./Inquiries";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ManagerPropertiesDetailsPage = () => {
  // Dynamically import your Map component with SSR disabled
  const PropertyLocation = dynamic(
    () => import("../../../../(landingPage)/search/[id]/PropertyLocation"),
    {
      ssr: false,
    }
  );
  const { id } = useParams();
  const propertyId = Number(id);
  const router = useRouter();

  const goBack = () => {
    router.back(); // Go back one step
  };

  const {
    data: propertyWithCoordinate,
    isLoading: propertyLoading,
    isError,
  } = useGetSinglePropertyQuery(propertyId);

  const { data: leases, isLoading: leasesLoading } =
    useGetPropertyLeasesQuery(propertyId);

  const { data: payments, isLoading: paymentLoading } =
    useGetPaymentQuery(propertyId);

  // Handle loading and error states
  if (propertyLoading || leasesLoading || paymentLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <BouncingLoader />
      </div>
    );
  }

  if (isError || !propertyWithCoordinate) {
    toast.error(` "Property not found"}`);
  }

  return (
    propertyWithCoordinate && (
      <>
        <Button onClick={goBack} className="bg-transparent" variant="secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Back to Properties</span>
        </Button>
        <div>
          {/* Image previews */}
          {propertyWithCoordinate.photoUrls ? (
            <ImagePreviews images={propertyWithCoordinate.photoUrls} />
          ) : (
            <div>No Image for this property</div>
          )}

          {/* // property details overview */}
          <div className="flex flex-col justify-between gap-6 p-4 md:p-8 md:mx-6 lg:mx-10">
            <div className="p-2">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-blue-600 underline text-sm cursor-pointer">
                    Click here to view the list of tenant inquiries
                  </button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Tenant Inquiries</DialogTitle>
                  </DialogHeader>

                  {/* 🧠 Pass in actual props from propertyWithCoordinate */}
                  <TenantInquiriesPage
                    leases={leases ?? []}
                    payments={payments ?? []}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="p-4 flex-1">
              <PropertyOverview propertyId={propertyId} />
              <PropertyDetails propertyId={propertyId} />
              <PropertyLocation propertyId={propertyId} />
            </div>
          </div>
        </div>
      </>
    )
  );
};

export default ManagerPropertiesDetailsPage;
