import { cleanParams } from "@/lib/utils";
import { Property } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FiltersState } from "../slice/globalSlice";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "pi",
  tagTypes: ["Properties"],
  endpoints: (build) => ({
    // all properties fetch
    getAllProperties: build.query<
      Property[],
      Partial<FiltersState> & { favoriteIds?: number[] }
    >({
      query: (filters) => {
        const params = cleanParams({
          location: filters.location,
          priceMin: filters.priceRange?.[0],
          priceMax: filters.priceRange?.[1],
          beds: filters.bed,
          baths: filters.bath,
          propertyType: filters.propertyType,
          squareFeetMin: filters.squareFeet?.[0],
          squareFeetMax: filters.squareFeet?.[1],
          amenities: filters.amenities?.join(","),
          availableFrom: filters.availableFrom,
          favoriteIds: filters.favoriteIds?.join(","),
          latitude: filters.coordinates?.[1],
          longitude: filters.coordinates?.[0],
        });
        console.log("Query Params:", params);
        return { url: "/properties", params };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        properties: Property[];
      }) => {
        console.log("API Response:", response);
        return response.properties || [];
      },
      providesTags: (result) => {
        if (!result || !Array.isArray(result)) {
          return [{ type: "Properties", id: "LIST" }];
        }
        return [
          ...result.map(({ id }) => ({ type: "Properties" as const, id })),
          { type: "Properties", id: "LIST" },
        ];
      },
    }),
  }),
});

export const { useGetAllPropertiesQuery } = api;
