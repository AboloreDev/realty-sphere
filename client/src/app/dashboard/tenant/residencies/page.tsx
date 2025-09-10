"use client";

import BouncingLoader from "@/components/code/BouncingLoader";
import Card from "@/components/code/Card";
import Header from "@/components/code/Header";
import { useGetUserProfileQuery } from "@/state/api/authApi";

import {
  useGetTenantQuery,
  useGetTenantResidenciesQuery,
} from "@/state/api/tenantApi";
import React from "react";

const TenantResidencies = () => {
  const { data: user } = useGetUserProfileQuery();
  const { data: tenant } = useGetTenantQuery(user?.user?.id);

  const { data: residenciesData, isLoading } = useGetTenantResidenciesQuery(
    user.user.id
  );

  if (isLoading) {
    return (
      <div>
        <BouncingLoader />
      </div>
    );
  }

  console.log("Residencies Data:", residenciesData);
  return (
    <div className="p-2 md:p-4">
      <Header
        title="Current Residencies"
        subtitle="View your past and current residencies"
      />
      <hr />
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2  gap-4 p-4">
        {residenciesData?.map((property) => (
          <Card
            key={property.id}
            property={property}
            onFavoriteToggle={() => {}}
            showFavoriteButton={false}
            // propertyLink={`/dashboard/tenant/residencies/${property.id}`}
            isFavorite={tenant?.favorites.includes(property.id) || false}
          />
        ))}
      </div>

      {!residenciesData ||
        (residenciesData.length === 0 && (
          <div className="text-center text-2xl font-semibold prata-regular">
            You have no current residence available
          </div>
        ))}
    </div>
  );
};

export default TenantResidencies;
