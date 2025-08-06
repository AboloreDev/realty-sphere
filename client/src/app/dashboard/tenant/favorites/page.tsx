"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Header from "@/components/code/Header";
import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useGetTenantQuery } from "@/state/api/tenantApi";
import React from "react";
import Card from "@/components/code/Card";

const TenantFavoritePage = () => {
  const { data: user } = useGetUserProfileQuery();
  const { data: tenant } = useGetTenantQuery(user.user.id || "", {
    refetchOnMountOrArgChange: true,
  });

  const { data: favorites, isLoading } = useGetAllPropertiesQuery({
    favoriteIds:
      tenant?.favorites?.map((favorite: { id: number }) => favorite.id) || [],
  });

  if (isLoading) {
    return (
      <div>
        <BouncingLoader />
      </div>
    );
  }
  return (
    <div className="p-2 ">
      <Header
        title="Favorited Properties"
        subtitle="View your favorited properties"
      />
      <hr />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 p-4">
        {favorites?.map((property) => (
          <Card
            key={property.id}
            property={property}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            propertyLink={`/search/${property.id}`}
            isFavorite={false}
          />
        ))}
      </div>

      {!tenant?.favorites ||
        (tenant?.favorites.length === 0 && (
          <div className="font-semibold text-center text-2xl prata-regular">
            You have no favorited property
          </div>
        ))}
    </div>
  );
};

export default TenantFavoritePage;
