import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  }),
  reducerPath: "api",
  tagTypes: [],
  endpoints: (builder) => ({
    getKpis: builder.query<void, void>({
      query: () => "/api/kpis/",
    }),
  }),
});

export const {} = api;
