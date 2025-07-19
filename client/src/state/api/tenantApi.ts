import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  Tenant,
  UpdatedTenantRequest,
  UpdatedTenantResponse,
} from "../types/tenantTypes";

export const tenantApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "tenantApi",
  tagTypes: ["updateTenant", "Tenants", "Properties"],
  endpoints: (builder) => ({
    // updateing tenant
    updateTenant: builder.mutation<UpdatedTenantResponse, UpdatedTenantRequest>(
      {
        query: ({ id, data }) => ({
          url: `/tenant/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["updateTenant"],
      }
    ),

    // add to favorites
    addToFavorites: builder.mutation<
      Tenant,
      { id: string; propertyId: number }
    >({
      query: ({ id, propertyId }) => ({
        url: `/tenant/${id}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),

    // remove favorites
    removeFavorites: builder.mutation<
      Tenant,
      { id: string; propertyId: number }
    >({
      query: ({ id, propertyId }) => ({
        url: `/tenant/${id}/favorites/${propertyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
    }),
  }),
});

// export
export const {
  useUpdateTenantMutation,
  useAddToFavoritesMutation,
  useRemoveFavoritesMutation,
} = tenantApi;
