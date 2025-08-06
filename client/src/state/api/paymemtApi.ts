import { Payment } from "@/types/prismaTypes";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "paymentApi",
  tagTypes: ["Payments"],
  endpoints: (builder) => ({
    // GET ALL PAYMENTS
    getPayment: builder.query<Payment[], number>({
      query: (leaseId) => ({
        url: `/lease/${leaseId}/payment`,
      }),

      transformResponse: (response: { payments: Payment[] }) =>
        response.payments,

      providesTags: ["Payments"],
    }),
  }),
});

export const { useGetPaymentQuery } = paymentApi;
