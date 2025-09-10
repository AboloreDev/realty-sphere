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
import { withToast } from "@/lib/utils";

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
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to create payment.",
        });
      },
    }),

    // 2. GET PAYMENT BY ID WITH STATUS
    getPaymentById: builder.query<ApiResponse<PaymentWithDetails>, number>({
      query: (paymentId) => ({
        url: `/payment/${paymentId}`,
      }),
      providesTags: (result, error, paymentId) => [
        { type: "Payment", id: paymentId },
      ],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch payment.",
        });
      },
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
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            error: "Failed to fetch payment status.",
          });
        },
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
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to process payment.",
        });
      },
    }),

    // 5. CONFIRM SATISFACTION (release escrow early)
    confirmSatisfaction: builder.mutation<
      ApiResponse<PaymentWithDetails>,
      { paymentId: string; satisfactionData: ConfirmSatisfactionRequest }
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
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to confirm satisfaction.",
        });
      },
    }),

    // 6. GET TENANT PAYMENTS (tenant dashboard)
    getTenantPayments: builder.query<ApiResponse<PaymentWithDetails[]>, string>(
      {
        query: (tenantId) => ({
          url: `/tenant/${tenantId}/payments`,
        }),
        providesTags: ["Payments"],
        async onQueryStarted(_, { queryFulfilled }) {
          await withToast(queryFulfilled, {
            error: "Failed to fetch tenant payment.",
          });
        },
      }
    ),

    // 7. GET LANDLORD PAYMENTS (landlord dashboard)
    getLandlordPayments: builder.query<
      ApiResponse<PaymentWithDetails[]>,
      string
    >({
      query: (managerId) => ({
        url: `/landlord/${managerId}/payments`,
      }),
      providesTags: ["Payments"],
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch landlord payment.",
        });
      },
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
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to create checkout.",
        });
      },
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
      async onQueryStarted(_, { queryFulfilled }) {
        await withToast(queryFulfilled, {
          error: "Failed to fetch checkout status.",
        });
      },
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
