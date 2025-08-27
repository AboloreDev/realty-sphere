import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  CheckoutSessionResponse,
  CheckoutStatusResponse,
  ConfirmSatisfactionRequest,
  CreatePaymentRequest,
  PaymentStatusResponse,
  PaymentWithDetails,
  ProcessPaymentRequest,
} from "../types/paymentTypes";
import { Payment } from "@/types/prismaTypes";

export const paymentApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    credentials: "include",
  }),
  reducerPath: "paymentApi",
  tagTypes: ["Payment", "Payments"],
  endpoints: (builder) => ({
    // 1. CREATE PAYMENT FOR LEASE (when lease is accepted)
    createPaymentForLease: builder.mutation<
      ApiResponse<PaymentWithDetails>,
      { leaseId: number; paymentData: CreatePaymentRequest }
    >({
      query: ({ leaseId, paymentData }) => ({
        url: `/lease/${leaseId}/payment/create`,
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Payments", "Payment"],
    }),

    // 2. GET PAYMENT BY ID WITH STATUS
    getPaymentById: builder.query<ApiResponse<PaymentWithDetails>, number>({
      query: (paymentId) => ({
        url: `/payment/${paymentId}`,
      }),
      providesTags: (result, error, paymentId) => [
        { type: "Payment", id: paymentId },
      ],
    }),

    // 3. GET PAYMENT STATUS (detailed status info)
    getPaymentStatus: builder.query<ApiResponse<PaymentStatusResponse>, number>(
      {
        query: (paymentId) => ({
          url: `/payment/${paymentId}/status`,
        }),
        providesTags: (result, error, paymentId) => [
          { type: "Payment", id: paymentId },
        ],
      }
    ),

    // 4. PROCESS PAYMENT (tenant pays)
    processPayment: builder.mutation<
      ApiResponse<PaymentWithDetails>,
      { paymentId: number; paymentData: ProcessPaymentRequest }
    >({
      query: ({ paymentId, paymentData }) => ({
        url: `/payment/${paymentId}/pay`,
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: (result, error, { paymentId }) => [
        { type: "Payment", id: paymentId },
        "Payments",
      ],
    }),

    // 5. CONFIRM SATISFACTION (release escrow early)
    confirmSatisfaction: builder.mutation<
      ApiResponse<PaymentWithDetails>,
      { paymentId: number; satisfactionData: ConfirmSatisfactionRequest }
    >({
      query: ({ paymentId, satisfactionData }) => ({
        url: `/payment/${paymentId}/confirm-satisfaction`,
        method: "POST",
        body: satisfactionData,
      }),
      invalidatesTags: (result, error, { paymentId }) => [
        { type: "Payment", id: paymentId },
        "Payments",
      ],
    }),

    // 6. GET TENANT PAYMENTS (tenant dashboard)
    getTenantPayments: builder.query<ApiResponse<PaymentWithDetails[]>, string>(
      {
        query: (tenantId) => ({
          url: `/tenant/${tenantId}/payments`,
        }),
        providesTags: ["Payments"],
      }
    ),

    // 7. GET LANDLORD PAYMENTS (landlord dashboard)
    getLandlordPayments: builder.query<
      ApiResponse<PaymentWithDetails[]>,
      string
    >({
      query: (landlordId) => ({
        url: `/landlord/${landlordId}/payments`,
      }),
      providesTags: ["Payments"],
    }),

    // 8. GET PAYMENT FOR SPECIFIC LEASE (your original endpoint, updated)
    getPaymentForLease: builder.query<Payment, number>({
      query: (id) => `lease/${id}/payment`,
      providesTags: ["Payments"],
    }),

    createCheckoutSession: builder.mutation<
      ApiResponse<CheckoutSessionResponse>,
      number
    >({
      query: (paymentId) => ({
        url: `/payment/${paymentId}/checkout`,
        method: "POST",
      }),
      invalidatesTags: (result, error, paymentId) => [
        { type: "Payment", id: paymentId },
      ],
    }),

    getCheckoutStatus: builder.query<
      ApiResponse<CheckoutStatusResponse>,
      number
    >({
      query: (paymentId) => ({
        url: `/payment/${paymentId}/checkout-status`,
      }),
      providesTags: (result, error, paymentId) => [
        { type: "Payment", id: paymentId },
      ],
    }),
  }),
});

export const {
  useConfirmSatisfactionMutation,
  useCreatePaymentForLeaseMutation,
  useGetLandlordPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetTenantPaymentsQuery,
  useGetPaymentStatusQuery,
  useGetPaymentForLeaseQuery,
  useProcessPaymentMutation,
  useCreateCheckoutSessionMutation,
  useGetCheckoutStatusQuery,
} = paymentApi;
