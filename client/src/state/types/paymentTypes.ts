import { Payment } from "@/types/prismaTypes";

// Types for API responses
export interface PaymentWithDetails extends Payment {
  id: number;
  amountDue: number;
  dueDate: string;
  paymentStatus: string;
  leaseId: number;
  escrowStatus: string;
  amountPaid: number;
  paymentDate: string;
  lease: {
    id: number;
    rent: number;
    deposit: number;
    tenant: {
      name: string;
      email: string;
      phoneNumber?: string;
    };
    property: {
      address: string;
      name?: string;
      location?: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      manager?: {
        name: string;
        email: string;
        phoneNumber?: string;
      };
    };
  };
}

export interface PaymentStatusResponse {
  payment: PaymentWithDetails;
  status: {
    paymentStatus: string;
    escrowStatus: string;
    daysLeftInEscrow: number;
    canRelease: boolean;
    canPay: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ProcessPaymentRequest {
  amountPaid: number;
  paymentMethod?: string;
  stripePaymentId?: string;
}

export interface ConfirmSatisfactionRequest {
  tenantId: string;
}

export interface CreatePaymentRequest {
  amountDue: number;
  dueDate: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface CheckoutStatusResponse {
  payment: {
    id: number;
    paymentStatus: string;
    stripeSessionId?: string;
    amountPaid?: number;
    paidAt?: string;
  };
  session?: {
    id: string;
    status: string;
    paymentStatus: string;
  };
}
