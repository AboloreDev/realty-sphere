import { baseQueryWithAuth } from "@/constants/baseQueryWithAuth";
import { withToast } from "@/lib/utils";
import { Application, Lease } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const applicationApi = createApi({
  baseQuery: baseQueryWithAuth,
  reducerPath: "applicationApi",
  tagTypes: ["Applications", "Leases", "Tenants"],
  endpoints: (builder) => ({
    // UPDATE APPLICATION STATUS
    updateApplicationStatus: builder.mutation<
      Application & { lease?: Lease },
      { id: number; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/api/applications/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: (response: { updateApplication: Application }) =>
        response.updateApplication,

      invalidatesTags: ["Applications", "Leases"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to update applications.",
        });
      },
    }),

    // get applications by id
    fetchAllApplications: builder.query<Application[], void>({
      query: () => "/api/applications",
      transformResponse: (response: { formattedApplications: Application }) =>
        response.formattedApplications,
      providesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch applications.",
        });
      },
    }),

    // Create Application
    createApplication: builder.mutation<Application, Partial<Application>>({
      query: (data) => ({
        url: "/api/applications",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: {
        success: boolean;
        message: string;
        newApplication: Application[];
      }) => {
        return response.newApplication;
      },
      invalidatesTags: ["Applications"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to create application.",
        });
      },
    }),
  }),
});

export const {
  useUpdateApplicationStatusMutation,
  useFetchAllApplicationsQuery,
  useCreateApplicationMutation,
} = applicationApi;
