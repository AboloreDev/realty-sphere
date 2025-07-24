"use client";

import { useParams } from "next/navigation";
import React from "react";
import ImagePreviews from "./ImagePreviews";
import PropertyOverview from "./PropertyOverview";
import { useGetSinglePropertyQuery } from "@/state/api/api";
import BouncingLoader from "@/components/code/BouncingLoader";
import { toast } from "sonner";
import PropertyDetails from "./PropertyDetails";
import dynamic from "next/dynamic";
import Widget from "./Widget";

const SingleListingPage = () => {
  // Dynamically import your Map component with SSR disabled
  const PropertyLocation = dynamic(() => import("./PropertyLocation"), {
    ssr: false,
  });
  const { id } = useParams();
  const propertyId = Number(id);

  const {
    data: propertyWithCoordinate,
    isLoading,
    isError,
  } = useGetSinglePropertyQuery(propertyId);

  // Handle loading and error states
  if (isLoading) {
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
      <div>
        {/* Image previews */}
        {propertyWithCoordinate.photoUrls ? (
          <ImagePreviews images={propertyWithCoordinate.photoUrls} />
        ) : (
          <div>No Image for this property</div>
        )}

        {/* // property details overview */}
        <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10 p-4 md:p-8 md:mx-6 lg:mx-10">
          <div className="p-4 flex-1">
            <PropertyOverview propertyId={propertyId} />
            <PropertyDetails propertyId={propertyId} />
            <PropertyLocation propertyId={propertyId} />
          </div>

          <div className="">
            <Widget property={propertyWithCoordinate.manager} />
          </div>
        </div>
      </div>
    )
  );
};

export default SingleListingPage;
