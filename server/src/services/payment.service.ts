import { EscrowStatus, PaymentStatus } from "@prisma/client";
import prisma from "../prismaClient";
import {
  CreatePaymentRequest,
  PaymentWithDetails,
  ProcessPaymentRequest,
} from "../types/payment.types";
import appAssert from "../utils/appAssert";
import AppErrorCode from "../constants/appErrorCode";
import { ProcessPaymentRequestSchema } from "../schema/payment.schema";

export const createPaymentForLease = async (
  leaseId: number,
  paymentData?: any
) => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: { payments: true },
  });

  appAssert(lease, 404, "Lease not found");
  appAssert(!lease.payments, 409, "Payment already exist for this property");

  const payment = await prisma.payment.create({
    data: {
      leaseId,
      amountDue: paymentData?.amountDue || lease.rent,
      dueDate: paymentData?.dueDate
        ? new Date(paymentData.dueDate)
        : new Date(lease.startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      paymentStatus: PaymentStatus.Pending,
      escrowStatus: EscrowStatus.NONE,
    },
    include: {
      lease: {
        include: {
          tenant: { select: { name: true, email: true, phoneNumber: true } },
          property: {
            include: {
              location: true,
              manager: {
                select: { name: true, email: true, phoneNumber: true },
              },
            },
          },
        },
      },
    },
  });
  return payment as PaymentWithDetails;
};

export const processPaymentService = async (
  paymentId: number,
  data: ProcessPaymentRequest
) => {
  const validatedData = ProcessPaymentRequestSchema.parse(data);
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { lease: true },
  });

  appAssert(payment, 404, "Payment not found");

  if (payment.paymentStatus === PaymentStatus.Paid) {
    appAssert(false, 409, "Payment already processed");
  }

  // Calculate escrow release date (3 days from now)
  const escrowReleaseDate = new Date();
  escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 3);

  const isFullPayment = data.amountPaid >= payment.amountDue;

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amountPaid: validatedData.amountPaid,
      paymentDate: new Date(),
      paymentStatus: isFullPayment ? PaymentStatus.Paid : PaymentStatus.Pending,
      escrowStatus: isFullPayment ? EscrowStatus.IN_ESCROW : EscrowStatus.NONE,
      escrowReleaseDate: isFullPayment ? escrowReleaseDate : null,
      stripePaymentId: validatedData.stripePaymentId,
    },
    include: {
      lease: {
        include: {
          tenant: { select: { name: true, email: true, phoneNumber: true } },
          property: {
            include: {
              location: true,
              manager: {
                select: { name: true, email: true, phoneNumber: true },
              },
            },
          },
        },
      },
    },
  });

  return updatedPayment as PaymentWithDetails;
};

export const confirmSatisfactionService = async (
  paymentId: number,
  tenantId: string
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { lease: true },
  });

  appAssert(payment, 400, "Payment not found");

  // Verify tenant owns this lease
  if (payment.lease.tenantId !== tenantId) {
    appAssert(
      false,
      403,
      "Unauthorized: Not your payment",
      AppErrorCode.UnauthorizedRole
    );
  }

  if (payment.escrowStatus !== EscrowStatus.IN_ESCROW) {
    appAssert(false, 404, "Payment not in Escrow");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      escrowStatus: EscrowStatus.RELEASED,
      escrowReleaseDate: new Date(), // Release immediately
    },
    include: {
      lease: {
        include: {
          tenant: { select: { name: true, email: true, phoneNumber: true } },
          property: {
            include: {
              location: true,
              manager: {
                select: { name: true, email: true, phoneNumber: true },
              },
            },
          },
        },
      },
    },
  });

  return updatedPayment as PaymentWithDetails;
};

export const getPaymentByIdService = async (paymentId: number) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      lease: {
        include: {
          tenant: { select: { name: true, email: true, phoneNumber: true } },
          property: {
            include: {
              location: true,
              manager: {
                select: { name: true, email: true, phoneNumber: true },
              },
            },
          },
        },
      },
    },
  });

  return payment as PaymentWithDetails | null;
};

export const autoReleaseEscrow = async () => {
  const paymentsToRelease = await prisma.payment.findMany({
    where: {
      escrowStatus: EscrowStatus.IN_ESCROW,
      escrowReleaseDate: { lte: new Date() },
    },
    include: {
      lease: { include: { property: { select: { managerId: true } } } },
    },
  });

  const updatePromises = paymentsToRelease.map(async (payment) => {
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { escrowStatus: EscrowStatus.RELEASED },
    });
    // TODO: Notify landlord (managerId) via email/SMS
    return updatedPayment;
  });

  await Promise.all(updatePromises);

  return paymentsToRelease.length;
};
