"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStripeWebhook = exports.getCheckoutStatus = exports.createCheckoutSession = exports.getPaymentStatus = exports.confirmSatisfaction = exports.processPayment = exports.createPayment = exports.getPaymentById = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const payment_service_1 = require("../services/payment.service");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const payment_schema_1 = require("../schema/payment.schema");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
exports.getPaymentById = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const payment = yield (0, payment_service_1.getPaymentByIdService)(parseInt(id));
    (0, appAssert_1.default)(payment, 404, "Payment not found");
    return res.status(httpStatus_1.OK).json({
        success: true,
        payment,
    });
}));
exports.createPayment = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { leaseId } = req.params;
    const paymentData = req.body;
    const payment = yield (0, payment_service_1.createPaymentForLease)(parseInt(leaseId), paymentData);
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Payment created successfully",
        data: payment,
    });
}));
exports.processPayment = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, amountPaid, stripePaymentId } = payment_schema_1.processPaymentSchema.parse(Object.assign({ id: req.params.id }, req.body));
    const updatedPayment = yield (0, payment_service_1.processPaymentService)(parseInt(id), {
        amountPaid,
        stripePaymentId,
    });
    const isFullPayment = updatedPayment.amountPaid >= updatedPayment.amountDue;
    const message = isFullPayment
        ? "Payment successful! Money will be held in escrow for 3 days."
        : "Partial payment received.";
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        updatedPayment,
    });
}));
exports.confirmSatisfaction = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { tenantId } = req.body;
    const payment = yield (0, payment_service_1.confirmSatisfactionService)(id, tenantId);
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Payment release to landlord ",
        payment,
    });
}));
exports.getPaymentStatus = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const payment = yield (0, payment_service_1.getPaymentByIdService)(parseInt(id));
    if (!payment) {
        (0, appAssert_1.default)(false, 404, "Payment not found");
    }
    const daysLeftInEscrow = payment.escrowReleaseDate
        ? Math.ceil((payment.escrowReleaseDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24))
        : 0;
    const statusResponse = {
        payment,
        status: {
            paymentStatus: payment.paymentStatus,
            escrowStatus: payment.escrowStatus,
            daysLeftInEscrow: Math.max(0, daysLeftInEscrow),
            canRelease: payment.escrowStatus === "IN_ESCROW",
            canPay: payment.paymentStatus === "Pending",
        },
    };
    return res.status(httpStatus_1.OK).json({
        success: true,
        data: statusResponse,
    });
}));
exports.createCheckoutSession = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Get payment details from your database
        const payment = yield prismaClient_1.default.payment.findUnique({
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
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Lease Payment - ${payment.lease.property.location.address}, ${payment.lease.property.location.city}`,
                            description: `Yearly rent for ${new Date(payment.dueDate).toLocaleDateString()}`,
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
        yield prismaClient_1.default.payment.update({
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
    }
    catch (error) {
        console.error("Stripe checkout error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to create checkout session",
        });
    }
}));
exports.getCheckoutStatus = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const payment = yield prismaClient_1.default.payment.findUnique({
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
        const calculateEscrowStatus = (payment) => {
            let daysLeftInEscrow = 0;
            let canRelease = false;
            if (payment.escrowReleaseDate && payment.escrowStatus === "IN_ESCROW") {
                const releaseDate = new Date(payment.escrowReleaseDate);
                const today = new Date();
                daysLeftInEscrow = Math.max(0, Math.ceil((releaseDate.getTime() - today.getTime()) / (3000 * 60 * 60 * 24)));
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
                sessionData = yield stripe.checkout.sessions.retrieve(payment.stripePaymentId);
            }
            catch (error) {
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
    }
    catch (error) {
        console.error("Get checkout status error:", error);
        res
            .status(500)
            .json({ success: false, error: "Failed to get checkout status" });
    }
}));
exports.handleStripeWebhook = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).json({
            error: `Webhook Error: ${err.message}`,
        });
    }
    // Handle the event
    try {
        yield processWebhookEvent(event);
        // Always return 200 for successful processing
        res.status(200).json({ received: true });
    }
    catch (error) {
        console.error("❌ Webhook processing failed:", error);
        // Return 500 so Stripe retries the webhook
        res.status(500).json({
            error: "Webhook processing failed",
        });
    }
}));
function processWebhookEvent(event) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`🔔 Processing webhook: ${event.type}`);
        switch (event.type) {
            case "checkout.session.completed":
                yield handleCheckoutCompleted(event.data.object);
                break;
            case "checkout.session.expired":
                yield handleCheckoutExpired(event.data.object);
                break;
            case "payment_intent.succeeded":
                yield handlePaymentSucceeded(event.data.object);
                break;
            case "payment_intent.payment_failed":
                yield handlePaymentFailed(event.data.object);
                break;
            case "invoice.payment_succeeded":
                // Handle recurring payments if needed
                console.log("📄 Invoice payment succeeded");
                break;
            default:
                console.log(`📝 Unhandled event type: ${event.type}`);
        }
    });
}
function handleCheckoutCompleted(session) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Validate session
        if (session.payment_status !== "paid") {
            console.log("⚠️ Session completed but payment not confirmed");
            return;
        }
        // Extract payment ID from metadata
        const paymentId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.paymentId;
        if (!paymentId || isNaN(parseInt(paymentId))) {
            console.error("❌ Invalid paymentId in metadata:", paymentId);
            throw new Error("Invalid payment ID in session metadata");
        }
        const paymentIdInt = parseInt(paymentId);
        console.log("🔍 Processing payment ID:", paymentIdInt);
        try {
            // Start database transaction for atomicity
            const result = yield prismaClient_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                // Find the payment
                const payment = yield tx.payment.findUnique({
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
                const updatedPayment = yield tx.payment.update({
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
            }));
            console.log("✅ Payment updated successfully:", {
                id: result.id,
                status: result.paymentStatus,
                escrowStatus: result.escrowStatus,
                amountPaid: result.amountPaid,
                escrowReleaseDate: result.escrowReleaseDate,
            });
        }
        catch (error) {
            console.error("❌ Database error processing payment:", error);
            throw error; // Re-throw to trigger webhook retry
        }
    });
}
function handleCheckoutExpired(session) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("⏰ Checkout session expired:", session.id);
        const paymentId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.paymentId;
        if (!paymentId) {
            console.log("No paymentId in expired session metadata");
            return;
        }
        try {
            yield prismaClient_1.default.payment.update({
                where: { id: parseInt(paymentId) },
                data: {
                    stripePaymentId: null, // Clear expired session
                    // Keep status as Pending so user can try again
                },
            });
            console.log("✅ Cleared expired session for payment:", paymentId);
        }
        catch (error) {
            console.error("Error handling expired session:", error);
        }
    });
}
function handlePaymentSucceeded(paymentIntent) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("💳 Payment intent succeeded:", paymentIntent.id);
        // Additional handling if needed
    });
}
function handlePaymentFailed(paymentIntent) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("💥 Payment failed:", paymentIntent.id);
        const paymentId = (_a = paymentIntent.metadata) === null || _a === void 0 ? void 0 : _a.paymentId;
        if (!paymentId)
            return;
        try {
            yield prismaClient_1.default.payment.update({
                where: { id: parseInt(paymentId) },
                data: {
                    paymentStatus: "Pending", // Reset to pending
                    // Keep stripePaymentId for reference
                },
            });
            console.log("✅ Marked payment as failed:", paymentId);
        }
        catch (error) {
            console.error("Error handling failed payment:", error);
        }
    });
}
if (process.env.NODE_ENV === "development") {
    router.post("/api/test/webhook/:sessionId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const session = yield stripe.checkout.sessions.retrieve(req.params.sessionId);
            if (session.status === "complete") {
                yield handleCheckoutCompleted(session);
                res.json({ success: true, message: "Webhook processed manually" });
            }
            else {
                res.json({
                    success: false,
                    message: "Session not complete",
                    status: session.status,
                });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }));
}
