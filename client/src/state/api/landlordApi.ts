import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  updatedLandlordRequest,
  updatedLandlordResponse,
} from "../types/landlordTypes";

// CREATE API FUNCTION
export const landlordApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "tenantApi",
  tagTypes: ["updateLandlord"],
  endpoints: (builder) => ({
    // updadte Landlord details
    updateLandlord: builder.mutation<
      updatedLandlordResponse,
      updatedLandlordRequest
    >({
      query: ({ id, data }) => ({
        url: `/dashboard/landlord/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["updateLandlord"],
    }),
  }),
});

// export
export const { useUpdateLandlordMutation } = landlordApi;
