import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Lease } from "@/types/prismaTypes";
import { withToast } from "@/lib/utils";

export const leaseApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "leaseApi",
  tagTypes: ["Leases"],
  endpoints: (builder) => ({
    // GET ALL LEASE
    getAllLeases: builder.query<Lease[], number>({
      query: () => "/api/lease",
      transformResponse: (response: { leases: Lease }) => response.leases,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch lease.",
        });
      },
    }),

    // get leases for a specific property
    getPropertyLeases: builder.query<Lease[], number>({
      query: (propertyId) => ({
        url: `/api/properties/${propertyId}/leases`,
      }),
      transformResponse: (response: { leases: Lease[] }) => response.leases,
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch lease.",
        });
      },
    }),

    // Create Lease
    createLease: builder.mutation<Lease, Partial<Lease>>({
      query: (data) => ({
        url: "/api/lease",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        newLease: Lease[];
      }) => {
        return response.newLease;
      },
      invalidatesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to create lease.",
        });
      },
    }),

    // UPDATE lease STATUS
    updateLeaseStatus: builder.mutation<Lease, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/api/lease/${id}/accept`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { updatedLease: Lease }) =>
        response.updatedLease,

      invalidatesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to update lease.",
        });
      },
    }),

    // get the lease details
    getLeaseDetails: builder.query<Lease[], number>({
      query: (id) => ({
        url: `/api/lease/${id}`,
      }),
      providesTags: ["Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch lease details.",
        });
      },
    }),
  }),
});
export const {
  useGetAllLeasesQuery,
  useGetPropertyLeasesQuery,
  useCreateLeaseMutation,
  useUpdateLeaseStatusMutation,
  useGetLeaseDetailsQuery,
} = leaseApi;
