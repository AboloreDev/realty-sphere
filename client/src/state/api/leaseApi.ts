import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Lease } from "@/types/prismaTypes";

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
      query: () => "/lease",
      transformResponse: (response: { leases: Lease }) => response.leases,
      providesTags: ["Leases"],
    }),

    // get leases for a specific property
    getPropertyLeases: builder.query<Lease[], number>({
      query: (propertyId) => ({
        url: `properties/${propertyId}/leases`,
      }),
      transformResponse: (response: { leases: Lease[] }) => response.leases,
      providesTags: ["Leases"],
    }),

    // Create Lease
    createLease: builder.mutation<Lease, Partial<Lease>>({
      query: (data) => ({
        url: "/lease",
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
    }),

    // UPDATE lease STATUS
    updateLeaseStatus: builder.mutation<Lease, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/lease/${id}/accept`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { updatedLease: Lease }) =>
        response.updatedLease,

      invalidatesTags: ["Leases"],
    }),

    // get the lease details
    getLeaseDetails: builder.query<Lease[], number>({
      query: (id) => ({
        url: `/lease/${id}`,
      }),
      providesTags: ["Leases"],
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
