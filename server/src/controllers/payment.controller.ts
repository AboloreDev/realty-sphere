import { OK } from "../constants/httpStatus";
import prisma from "../prismaClient";
import {
  confirmSatisfactionService,
  createPaymentForLease,
  getPaymentByIdService,
  processPaymentService,
} from "../services/payment.service";
import { PaymentStatusResponse } from "../types/payment.types";
import appAssert from "../utils/appAssert";
import { catchAsyncError } from "../utils/catchAsyncErrors";
import Stripe from "stripe";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/isAuthenticated";
import { processPaymentSchema } from "../schema/payment.schema";
import express from "express";
const router = express.Router();
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const getPaymentById = catchAsyncError(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const payment = await getPaymentByIdService(parseInt(id));

  appAssert(payment, 404, "Payment not found");

  return res.status(OK).json({
    success: true,
    payment,
  });
});

export const createPayment = catchAsyncError(async (req, res) => {
  const { leaseId } = req.params;
  const paymentData = req.body;

  const payment = await createPaymentForLease(parseInt(leaseId), paymentData);

  // return a response
  return res.status(OK).json({
    success: true,
    message: "Payment created successfully",
    data: payment,
  });
});

export const processPayment = catchAsyncError(async (req, res) => {
  const { id, amountPaid, stripePaymentId } = processPaymentSchema.parse({
    id: req.params.id,
    ...req.body,
  });

  const updatedPayment = await processPaymentService(parseInt(id), {
    amountPaid,
    stripePaymentId,
  });

  const isFullPayment = updatedPayment.amountPaid >= updatedPayment.amountDue;
  const message = isFullPayment
    ? "Payment successful! Money will be held in escrow for 3 days."
    : "Partial payment received.";

  // return a response
  return res.status(OK).json({
    success: true,
    message,
    updatedPayment,
  });
});

export const confirmSatisfaction = catchAsyncError(async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.body;

  const payment = await confirmSatisfactionService(id, tenantId);
  return res.status(OK).json({
    success: true,
    message: "Payment release to landlord ",
    payment,
  });
});

export const getPaymentStatus = catchAsyncError(async (req, res) => {
  const { id } = req.params;

  const payment = await getPaymentByIdService(parseInt(id));

  if (!payment) {
    appAssert(false, 404, "Payment not found");
  }

  const daysLeftInEscrow = payment.escrowReleaseDate
    ? Math.ceil(
        (payment.escrowReleaseDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const statusResponse: PaymentStatusResponse = {
    payment,
    status: {
      paymentStatus: payment.paymentStatus,
      escrowStatus: payment.escrowStatus,
      daysLeftInEscrow: Math.max(0, daysLeftInEscrow),
      canRelease: payment.escrowStatus === "IN_ESCROW",
      canPay: payment.paymentStatus === "Pending",
    },
  };

  return res.status(OK).json({
    success: true,
    data: statusResponse,
  });
});

export const createCheckoutSession = catchAsyncError(async (req, res) => {
  try {
    const { id } = req.params;

    // Get payment details from your database
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: {
        lease: {
          include: {
            tenant: true,
            property: { include: { location: true } },
          },
        },
      },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, error: "Payment not found" });
    }

    if (payment.paymentStatus === "Paid") {
      return res
        .status(400)
        .json({ success: false, error: "Payment already completed" });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Lease Payment - ${payment.lease.property.location.address}, ${payment.lease.property.location.city}`,
              description: `Yearly rent for ${new Date(
                payment.dueDate
              ).toLocaleDateString()}`,
              images: [], // Add property images if you have them
            },
            unit_amount: Math.round(payment.amountDue * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: payment.lease.tenant.email,
      client_reference_id: payment.id.toString(), // Important: links payment to session

      // Success/Cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel?payment_id=${payment.id}`,

      // Metadata for webhook
      metadata: {
        paymentId: payment.id.toString(),
        leaseId: payment.leaseId.toString(),
        tenantId: payment.lease.tenantId.toString(),
      },

      // Optional: Auto-tax calculation
      automatic_tax: { enabled: false },

      // Billing address collection
      billing_address_collection: "required",
    });

    // Optionally store session ID in database for tracking
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        stripePaymentId: session.id,
        // Keep status as PENDING until webhook confirms
      },
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        checkoutUrl: session.url,
      },
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
});

export const getCheckoutStatus = catchAsyncError(async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
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

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, error: "Payment not found" });
    }

    // Calculate escrow status
    const calculateEscrowStatus = (payment: any) => {
      let daysLeftInEscrow = 0;
      let canRelease = false;

      if (payment.escrowReleaseDate && payment.escrowStatus === "IN_ESCROW") {
        const releaseDate = new Date(payment.escrowReleaseDate);
        const today = new Date();
        daysLeftInEscrow = Math.max(
          0,
          Math.ceil(
            (releaseDate.getTime() - today.getTime()) / (3000 * 60 * 60 * 24)
          )
        );
        canRelease = daysLeftInEscrow === 0;
      }

      const canPay = payment.paymentStatus === "Pending";

      return {
        paymentStatus: payment.paymentStatus,
        escrowStatus: payment.escrowStatus,
        daysLeftInEscrow,
        canRelease,
        canPay,
      };
    };

    let sessionData = null;
    if (payment.stripePaymentId) {
      try {
        sessionData = await stripe.checkout.sessions.retrieve(
          payment.stripePaymentId
        );
      } catch (error) {
        console.error("Error retrieving session:", error);
      }
    }

    res.json({
      success: true,
      payment: {
        payment: {
          id: payment.id,
          amountDue: payment.amountDue,
          amountPaid: payment.amountPaid,
          dueDate: payment.dueDate,
          paymentDate: payment.paymentDate,
          escrowReleaseDate: payment.escrowReleaseDate,
          paymentStatus: payment.paymentStatus,
          escrowStatus: payment.escrowStatus,
          stripePaymentId: payment.stripePaymentId,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
          leaseId: payment.leaseId,
          lease: payment.lease,
        },
        status: calculateEscrowStatus(payment),
        session: sessionData
          ? {
              id: sessionData.id,
              status: sessionData.status,
              paymentStatus: sessionData.payment_status,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get checkout status error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to get checkout status" });
  }
});

export const handleStripeWebhook = catchAsyncError(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Early validation
  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({
      error: "Webhook configuration error",
    });
  }

  if (!sig) {
    console.error("❌ No stripe-signature header found");
    return res.status(400).json({
      error: "No signature header",
    });
  }

  let event;

  try {
    // Construct event with signature verification
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook signature verified:", event.type);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).json({
      error: `Webhook Error: ${err.message}`,
    });
  }

  // Handle the event
  try {
    await processWebhookEvent(event);

    // Always return 200 for successful processing
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing failed:", error);

    // Return 500 so Stripe retries the webhook
    res.status(500).json({
      error: "Webhook processing failed",
    });
  }
});

async function processWebhookEvent(event: any) {
  console.log(`🔔 Processing webhook: ${event.type}`);

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object);
      break;

    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object);
      break;

    case "invoice.payment_succeeded":
      // Handle recurring payments if needed
      console.log("📄 Invoice payment succeeded");
      break;

    default:
      console.log(`📝 Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutCompleted(session: any) {
  // Validate session
  if (session.payment_status !== "paid") {
    console.log("⚠️ Session completed but payment not confirmed");
    return;
  }

  // Extract payment ID from metadata
  const paymentId = session.metadata?.paymentId;
  if (!paymentId || isNaN(parseInt(paymentId))) {
    console.error("❌ Invalid paymentId in metadata:", paymentId);
    throw new Error("Invalid payment ID in session metadata");
  }

  const paymentIdInt = parseInt(paymentId);
  console.log("🔍 Processing payment ID:", paymentIdInt);

  try {
    // Start database transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Find the payment
      const payment = await tx.payment.findUnique({
        where: { id: paymentIdInt },
        include: { lease: true },
      });

      if (!payment) {
        throw new Error(`Payment ${paymentIdInt} not found`);
      }

      if (payment.paymentStatus === "Paid") {
        console.log("⚠️ Payment already processed, skipping");
        return payment;
      }

      // Calculate escrow release date (3 days from now)
      const escrowReleaseDate = new Date();
      escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 3);

      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id: paymentIdInt },
        data: {
          paymentStatus: "Paid",
          escrowStatus: "IN_ESCROW",
          amountPaid: session.amount_total / 100, // Stripe uses cents
          paymentDate: new Date(),
          stripePaymentId: session.payment_intent || session.id,
          escrowReleaseDate,
        },
        include: {
          lease: {
            include: {
              tenant: { select: { name: true, email: true } },
              property: {
                include: {
                  location: true,
                  manager: { select: { name: true, email: true } },
                },
              },
            },
          },
        },
      });

      return updatedPayment;
    });

    console.log("✅ Payment updated successfully:", {
      id: result.id,
      status: result.paymentStatus,
      escrowStatus: result.escrowStatus,
      amountPaid: result.amountPaid,
      escrowReleaseDate: result.escrowReleaseDate,
    });
  } catch (error) {
    console.error("❌ Database error processing payment:", error);
    throw error; // Re-throw to trigger webhook retry
  }
}

async function handleCheckoutExpired(session: any) {
  console.log("⏰ Checkout session expired:", session.id);

  const paymentId = session.metadata?.paymentId;
  if (!paymentId) {
    console.log("No paymentId in expired session metadata");
    return;
  }

  try {
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        stripePaymentId: null, // Clear expired session
        // Keep status as Pending so user can try again
      },
    });

    console.log("✅ Cleared expired session for payment:", paymentId);
  } catch (error) {
    console.error("Error handling expired session:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  console.log("💳 Payment intent succeeded:", paymentIntent.id);
  // Additional handling if needed
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log("💥 Payment failed:", paymentIntent.id);

  const paymentId = paymentIntent.metadata?.paymentId;
  if (!paymentId) return;

  try {
    await prisma.payment.update({
      where: { id: parseInt(paymentId) },
      data: {
        paymentStatus: "Pending", // Reset to pending
        // Keep stripePaymentId for reference
      },
    });

    console.log("✅ Marked payment as failed:", paymentId);
  } catch (error) {
    console.error("Error handling failed payment:", error);
  }
}

if (process.env.NODE_ENV === "development") {
  router.post("/api/test/webhook/:sessionId", async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId
      );

      if (session.status === "complete") {
        await handleCheckoutCompleted(session);
        res.json({ success: true, message: "Webhook processed manually" });
      } else {
        res.json({
          success: false,
          message: "Session not complete",
          status: session.status,
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
