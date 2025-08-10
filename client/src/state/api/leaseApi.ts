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
      query: () => ({
        url: "/lease",
      }),
      transformResponse: (response: { leases: Lease[] }) => response.leases,
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
  }),
});
export const { useGetAllLeasesQuery, useGetPropertyLeasesQuery } = leaseApi;
