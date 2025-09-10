import { fetchBaseQuery } from "@reduxjs/toolkit/query";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  updatedLandlordRequest,
  updatedLandlordResponse,
} from "../types/landlordTypes";
import { Property, User } from "@/types/prismaTypes";
import { withToast } from "@/lib/utils";

// CREATE API FUNCTION
export const landlordApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "landlordApi",
  tagTypes: [
    "updateLandlord",
    "Properties",
    "Landlords",
    "Applications",
    "Leases",
  ],
  endpoints: (builder) => ({
    // create a new listing
    createNewProperty: builder.mutation<Property, FormData>({
      query: (newProperty) => ({
        url: `/api/properties`,
        method: "POST",
        body: newProperty,
      }),
      invalidatesTags: (result) => [
        {
          type: "Properties",
          id: "LIST",
        },
        { type: "Landlords", id: result?.manager?.id },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to create properties.",
        });
      },
    }),
    // updadte Landlord details
    updateLandlord: builder.mutation<
      updatedLandlordResponse,
      updatedLandlordRequest
    >({
      query: ({ id, data }) => ({
        url: `/api/landlord/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["updateLandlord"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to update landlord.",
        });
      },
    }),

    // get tenant
    getLandlord: builder.query<User, string>({
      query: (id) => ({
        url: `/api/landlord/${id}`,
      }),
      providesTags: (result) => [{ type: "Landlords", id: result?.id }],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch landlord.",
        });
      },
    }),

    // get the list of landlord properties
    getLandlordProperty: builder.query<Property[], string>({
      query: (id) => ({
        url: `/api/landlord/${id}/properties`,
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
          error: "Failed to fetch landlord properties.",
        });
      },
    }),
  }),
});

// export
export const {
  useUpdateLandlordMutation,
  useGetLandlordPropertyQuery,
  useGetLandlordQuery,
  useCreateNewPropertyMutation,
} = landlordApi;
