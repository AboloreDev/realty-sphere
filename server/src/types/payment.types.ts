// types/payment.types.ts

import { PaymentStatus, EscrowStatus } from "@prisma/client";

export interface CreatePaymentRequest {
  leaseId: number;
  amountDue: number;
  dueDate: string;
}

export interface ProcessPaymentRequest {
  amountPaid: number;
  paymentMethod?: string;
  stripePaymentId?: string;
}

export interface PaymentWithDetails {
  id: number;
  amountDue: number;
  amountPaid: number;
  dueDate: Date;
  paymentDate: Date | null;
  escrowReleaseDate: Date | null;
  paymentStatus: PaymentStatus;
  escrowStatus: EscrowStatus;
  lease: {
    id: number;
    rent: number;
    deposit: number;
    tenant: {
      name: string;
      email: string;
      phoneNumber: string;
    };
    property: {
      location: {
        address: string;
        name?: string | null;
      };
      manager: {
        name: string;
        email: string;
        phoneNumber: string;
      };
    };
  };
}

export interface PaymentStatusResponse {
  payment: PaymentWithDetails;
  status: {
    paymentStatus: PaymentStatus;
    escrowStatus: EscrowStatus;
    daysLeftInEscrow: number;
    canRelease: boolean;
    canPay: boolean;
  };
}
