import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  UpdatedTenantRequest,
  UpdatedTenantResponse,
} from "../types/tenantTypes";

export const tenantApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "tenantApi",
  tagTypes: ["updateTenant"],
  endpoints: (builder) => ({
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
  }),
});

// export
export const { useUpdateTenantMutation } = tenantApi;
