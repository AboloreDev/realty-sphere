import { cleanParams } from "@/lib/utils";
import { Property } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { FiltersState } from "../slice/globalSlice";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "api",
  tagTypes: ["Properties", "PropertyDetails"],
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
        return { url: "/properties", params };
      },
      transformResponse: (response: {
        success: boolean;
        message: string;
        properties: Property[];
      }) => {
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

    // get single property
    getSingleProperty: build.query<Property, number>({
      query: (id) => ({
        url: `/properties/${id}`,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        propertyWithCoordinate: Property[];
      }) => {
        return response.propertyWithCoordinate;
      },
      providesTags: (result, error, id) => [{ type: "PropertyDetails", id }],
    }),
  }),
});

export const { useGetAllPropertiesQuery, useGetSinglePropertyQuery } = api;
