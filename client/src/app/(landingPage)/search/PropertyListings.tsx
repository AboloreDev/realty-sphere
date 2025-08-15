"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Card from "@/components/code/Card";
import ListCard from "@/components/code/ListCard";
import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import {
  useAddToFavoritesMutation,
  useGetTenantQuery,
  useRemoveFavoritesMutation,
} from "@/state/api/tenantApi";
import { useAppSelector } from "@/state/redux";
import { Property } from "@/types/prismaTypes";

import { MapPin } from "lucide-react";
import React from "react";
import { toast } from "sonner";

const PropertyListings = () => {
  const { data: user } = useGetUserProfileQuery();
  // Get filters from Redux state
  const filters = useAppSelector((state) => state.global.filters);
  // get teh view mode state
  const viewModes = useAppSelector((state) => state.global.viewMode);
  // fetch properties from api
  const { data: properties, isLoading } = useGetAllPropertiesQuery(filters);
  const [addFavorite] = useAddToFavoritesMutation();
  const [removeFavorite] = useRemoveFavoritesMutation();
  const { data: tenant } = useGetTenantQuery(user?.user?.id || "");

  // function to handle favorites
  const handleFavoriteToggle = async (propertyId: number) => {
    if (!user) {
      toast.info("Please login to favorite a property");
    }
    const isFavorite = tenant?.favorites?.some(
      (favorite: Property) => favorite.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({ id: user.user.id, propertyId });
      toast.error("Property removed from favorites");
    } else {
      await addFavorite({ id: user.user.id, propertyId });
      toast.success("Property added to favorites");
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
    <div className="w-full h-screen overflow-y-auto">
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
            viewModes === "grid" ? (
              <Card
                key={property.id}
                property={property}
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!user}
                propertyLink={`/search/${property.id}`}
                isFavorite={
                  tenant?.favorites?.some(
                    (favorite: Property) => favorite.id === property.id
                  ) || false
                }
              />
            ) : (
              <ListCard
                key={property.id}
                property={property}
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!user}
                propertyLink={`/search/${property.id}`}
                isFavorite={
                  tenant?.favorites?.some(
                    (favorite: Property) => favorite.id === property.id
                  ) || false
                }
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyListings;
