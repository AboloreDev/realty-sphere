import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  updatedLandlordRequest,
  updatedLandlordResponse,
} from "../types/landlordTypes";
import { Property, User } from "@/types/prismaTypes";

// CREATE API FUNCTION
export const landlordApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "landlordApi",
  tagTypes: ["updateLandlord", "Properties", "Landlords"],
  endpoints: (builder) => ({
    // updadte Landlord details
    updateLandlord: builder.mutation<
      updatedLandlordResponse,
      updatedLandlordRequest
    >({
      query: ({ id, data }) => ({
        url: `/landlord/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["updateLandlord"],
    }),

    // get tenant
    getLandlord: builder.query<User, string>({
      query: (id) => ({
        url: `/landlord/${id}`,
      }),
      providesTags: (result) => [{ type: "Landlords", id: result?.id }],
    }),

    // get the list of landlord properties
    getLandlordProperty: builder.query<Property[], string>({
      query: (id) => ({
        url: `/landlord/${id}/properties`,
      }),

      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Properties" as const, id })),
              { type: "Properties", id: "LIST" },
            ]
          : [{ type: "Properties", id: "LIST" }],
    }),
  }),
});

// export
export const {
  useUpdateLandlordMutation,
  useGetLandlordPropertyQuery,
  useGetLandlordQuery,
} = landlordApi;
