import { Application, Lease } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const applicationApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "applicationApi",
  tagTypes: ["Applications", "Leases"],
  endpoints: (builder) => ({
    // UPDATE APPLICATION STATUS
    updateApplicationStatus: builder.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/application/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { updateApplication: Application }) =>
        response.updateApplication,

      invalidatesTags: ["Applications", "Leases"],
    }),

    // get applications by id
    fetchAllApplications: builder.query<Application[], void>({
      query: () => "/applications",
      transformResponse: (response: { formattedApplications: Application }) =>
        response.formattedApplications,
      providesTags: ["Applications"],
    }),
  }),
});

export const {
  useUpdateApplicationStatusMutation,
  useFetchAllApplicationsQuery,
} = applicationApi;
