import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  UpdatedTenantRequest,
  UpdatedTenantResponse,
} from "../types/tenantTypes";
import { Property, User } from "@/types/prismaTypes";
import { PaymentWithDetails } from "../types/paymentTypes";
import { withToast } from "@/lib/utils";

export const tenantApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "tenantApi",
  tagTypes: ["updateTenant", "Tenants", "Properties", "Payments"],
  endpoints: (builder) => ({
    // updateing tenant
    updateTenant: builder.mutation<UpdatedTenantResponse, UpdatedTenantRequest>(
      {
        query: ({ id, data }) => ({
          url: `/api/tenant/${id}`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["updateTenant"],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            error: "Failed to update tenant.",
          });
        },
      }
    ),

    // get tenant
    getTenant: builder.query<User, string>({
      query: (id) => ({
        url: `/api/tenant/${id}`,
      }),
      providesTags: (result) => [{ type: "Tenants", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch tenant.",
        });
      },
    }),

    // add to favorites
    addToFavorites: builder.mutation<User, { id: string; propertyId: number }>({
      query: ({ id, propertyId }) => ({
        url: `/api/tenant/${id}/favorites/${propertyId}`,
        method: "POST",
      }),
      invalidatesTags: (result) => [
        { type: "Tenants", id: result?.id },
        { type: "Properties", id: "LIST" },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to add favorites.",
        });
      },
    }),

    // remove favorites
    removeFavorites: builder.mutation<User, { id: string; propertyId: number }>(
      {
        query: ({ id, propertyId }) => ({
          url: `/api/tenant/${id}/favorites/${propertyId}`,
          method: "DELETE",
        }),
        invalidatesTags: (result) => [
          { type: "Tenants", id: result?.id },
          { type: "Properties", id: "LIST" },
        ],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            error: "Failed to remove favorites.",
          });
        },
      }
    ),

    // get the tenant current residencies and other previous ones
    getTenantResidencies: builder.query<Property[], string>({
      query: (id) => ({
        url: `/api/tenant/${id}/residencies`,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to get tenant residencies.",
        });
      },
    }),

    // Add to your payment API slice
    getTenantPayments: builder.query<
      { success: boolean; message: string; payments: PaymentWithDetails[] },
      string
    >({
      query: (tenantId) => ({
        url: `/api/tenant/${tenantId}/payments`,
      }),
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch tenant payments.",
        });
      },
    }),
  }),
});

// export
export const {
  useUpdateTenantMutation,
  useAddToFavoritesMutation,
  useRemoveFavoritesMutation,
  useGetTenantQuery,
  useGetTenantResidenciesQuery,
} = tenantApi;
