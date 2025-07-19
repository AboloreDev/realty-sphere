"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useAppSelector } from "@/state/redux";
import { MapPin } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const PropertyListings = () => {
  // get the user from the store
  const user = useAppSelector((state) => state.user.user);
  // Get filters from Redux state
  const filters = useAppSelector((state) => state.global.filters);
  // get teh view mode state
  const viewModes = useAppSelector((state) => state.global.viewMode);
  // fetch properties from api
  const { data: properties, isLoading } = useGetAllPropertiesQuery(filters);
  console.log(properties.length);

  // function to handle favorites
  const handleFavorites = () => {
    if (!user) {
      toast.error("Please login to account to add favorites");
    }

    if (user?.role !== "TENANT") {
      toast.error("Only tenant can favorite a property");
    }
  };

  if (isLoading)
    return (
      <div>
        <BouncingLoader />
      </div>
    );

  if (!properties) {
    toast.error("Failed to Fetch Properties");
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-2">
        <h3 className="text-sm font-bold">{properties?.length}</h3>
        <MapPin />
        <span className="font-notmal text-sm">
          Places in {filters.location}
        </span>
      </div>

      <div className="flex">
        <div className="p-2 w-full">
          {properties?.map((property) =>
            viewModes === "grid" ? <>hELLO</> : <>Hi</>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListings;
