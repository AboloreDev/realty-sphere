import { useGetAllPropertiesQuery } from "@/state/api/api";
import { useGetUserProfileQuery } from "@/state/api/authApi";
import { useGetTenantQuery } from "@/state/api/tenantApi";
import React from "react";

const TenantFavoritePage = () => {
  const { auth: user } = useGetUserProfileQuery();
  const { data: tenant } = useGetTenantQuery(user.user.id || "");

  const { data: favorites, isLoading } = useGetAllPropertiesQuery({
    favoriteIds: tenant?.favorites?.map((fav) => fav.id) || [],
  });
  return <div>TenantFavoritePage</div>;
};

export default TenantFavoritePage;
