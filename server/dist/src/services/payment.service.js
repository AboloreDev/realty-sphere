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
exports.autoReleaseEscrow = exports.getPaymentByIdService = exports.confirmSatisfactionService = exports.processPaymentService = exports.createPaymentForLease = void 0;
const client_1 = require("@prisma/client");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const payment_schema_1 = require("../schema/payment.schema");
const createPaymentForLease = (leaseId, paymentData) => __awaiter(void 0, void 0, void 0, function* () {
    const lease = yield prismaClient_1.default.lease.findUnique({
        where: { id: leaseId },
        include: { payments: true },
    });
    (0, appAssert_1.default)(lease, 404, "Lease not found");
    (0, appAssert_1.default)(!lease.payments, 409, "Payment already exist for this property");
    const payment = yield prismaClient_1.default.payment.create({
        data: {
            leaseId,
            amountDue: (paymentData === null || paymentData === void 0 ? void 0 : paymentData.amountDue) || lease.rent,
            dueDate: (paymentData === null || paymentData === void 0 ? void 0 : paymentData.dueDate)
                ? new Date(paymentData.dueDate)
                : new Date(lease.startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
            paymentStatus: client_1.PaymentStatus.Pending,
            escrowStatus: client_1.EscrowStatus.NONE,
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
    return payment;
});
exports.createPaymentForLease = createPaymentForLease;
const processPaymentService = (paymentId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const validatedData = payment_schema_1.ProcessPaymentRequestSchema.parse(data);
    const payment = yield prismaClient_1.default.payment.findUnique({
        where: { id: paymentId },
        include: { lease: true },
    });
    (0, appAssert_1.default)(payment, 404, "Payment not found");
    if (payment.paymentStatus === client_1.PaymentStatus.Paid) {
        (0, appAssert_1.default)(false, 409, "Payment already processed");
    }
    // Calculate escrow release date (3 days from now)
    const escrowReleaseDate = new Date();
    escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 3);
    const isFullPayment = data.amountPaid >= payment.amountDue;
    const updatedPayment = yield prismaClient_1.default.payment.update({
        where: { id: paymentId },
        data: {
            amountPaid: validatedData.amountPaid,
            paymentDate: new Date(),
            paymentStatus: isFullPayment ? client_1.PaymentStatus.Paid : client_1.PaymentStatus.Pending,
            escrowStatus: isFullPayment ? client_1.EscrowStatus.IN_ESCROW : client_1.EscrowStatus.NONE,
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
    return updatedPayment;
});
exports.processPaymentService = processPaymentService;
const confirmSatisfactionService = (paymentId, tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prismaClient_1.default.payment.findUnique({
        where: { id: parseInt(paymentId) },
        include: { lease: true },
    });
    (0, appAssert_1.default)(payment, 400, "Payment not found");
    // Verify tenant owns this lease
    if (payment.lease.tenantId !== tenantId) {
        (0, appAssert_1.default)(false, 403, "Unauthorized: Not your payment", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    if (payment.escrowStatus !== client_1.EscrowStatus.IN_ESCROW) {
        (0, appAssert_1.default)(false, 404, "Payment not in Escrow");
    }
    const updatedPayment = yield prismaClient_1.default.payment.update({
        where: { id: parseInt(paymentId) },
        data: {
            escrowStatus: client_1.EscrowStatus.RELEASED,
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
    return updatedPayment;
});
exports.confirmSatisfactionService = confirmSatisfactionService;
const getPaymentByIdService = (paymentId) => __awaiter(void 0, void 0, void 0, function* () {
    const payment = yield prismaClient_1.default.payment.findUnique({
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
    return payment;
});
exports.getPaymentByIdService = getPaymentByIdService;
const autoReleaseEscrow = () => __awaiter(void 0, void 0, void 0, function* () {
    const paymentsToRelease = yield prismaClient_1.default.payment.findMany({
        where: {
            escrowStatus: client_1.EscrowStatus.IN_ESCROW,
            escrowReleaseDate: { lte: new Date() },
        },
        include: {
            lease: { include: { property: { select: { managerId: true } } } },
        },
    });
    const updatePromises = paymentsToRelease.map((payment) => __awaiter(void 0, void 0, void 0, function* () {
        const updatedPayment = yield prismaClient_1.default.payment.update({
            where: { id: payment.id },
            data: { escrowStatus: client_1.EscrowStatus.RELEASED },
        });
        // TODO: Notify landlord (managerId) via email/SMS
        return updatedPayment;
    }));
    yield Promise.all(updatePromises);
    return paymentsToRelease.length;
});
exports.autoReleaseEscrow = autoReleaseEscrow;
