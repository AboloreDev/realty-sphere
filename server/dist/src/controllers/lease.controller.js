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
exports.getLeaseDetails = exports.updateLease = exports.createLease = exports.getLeasePayment = exports.getAllLease = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const nextPaymentDateCalcutions_1 = __importDefault(require("../utils/nextPaymentDateCalcutions"));
// get all lease
exports.getAllLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let leases;
    // check for leases based on roles
    // fetch all lease for tenant
    if (user.role === "TENANT") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { tenantId: user.id },
            include: {
                property: { include: { manager: true, location: true } },
                tenant: true,
            },
        });
    }
    // fetch all lease for the property listed by the landlord
    else if (user.role === "MANAGER") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { property: { managerId: user === null || user === void 0 ? void 0 : user.id } },
            include: {
                property: { include: { manager: true, location: true } },
                tenant: true,
            },
        });
    } // Assert an error if none is found
    else {
        (0, appAssert_1.default)(false, httpStatus_1.NOT_FOUND, "No lease found");
    }
    // Format leases with next payment date
    const formattedLeases = leases.map((lease) => {
        const nextPaymentDate = (0, nextPaymentDateCalcutions_1.default)(lease.startDate, lease.endDate);
        return Object.assign(Object.assign({}, lease), { nextPaymentDate });
    });
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Lease fetched Successfully",
        leases: formattedLeases,
    });
}));
exports.getLeasePayment = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const { id } = req.params;
    const user = req.user;
    // first check if there is a lease available
    const lease = yield prismaClient_1.default.lease.findUnique({
        where: { id: Number(id) },
        include: { property: true },
    });
    // assert an error if no lease
    (0, appAssert_1.default)(lease, httpStatus_1.NOT_FOUND, "No Lease found");
    if (user.role === "TENANT" && lease.tenantId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your lease", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    if (user.role === "MANAGER" && lease.property.managerId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your property", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    // ONE-TO-ONE: Find the single payment for this lease
    let payment = yield prismaClient_1.default.payment.findFirst({
        where: { leaseId: Number(id) },
        include: {
            lease: {
                include: {
                    tenant: true,
                    property: {
                        include: {
                            manager: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: "desc" }, // Get most recent if multiple exist
    });
    // Return a single payment object (not array)
    return res.status(httpStatus_1.OK).json(payment);
}));
exports.createLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // check for user id
    const user = req.user;
    // get the request from the body
    const { propertyId, tenantId, startDate, endDate, rent, deposit, applicationId, } = req.body;
    // restrict the role to landlord
    if (user.role !== "MANAGER") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "You are not a landlord", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    // validate input fields
    if (!propertyId ||
        !tenantId ||
        !startDate ||
        !endDate ||
        !rent ||
        !deposit ||
        !applicationId) {
        (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "All fields are required", "Inavlid Input" /* AppErrorCode.invalidInput */);
    }
    // check if the property belongs to the landlord
    const property = yield prismaClient_1.default.property.findUnique({
        where: { id: Number(propertyId) },
        include: {
            manager: true,
            leases: {
                where: {
                    status: { in: ["Approved", "Pending"] }, // Only check active/pending leases
                },
                include: { property: true },
            },
        },
    });
    // if there is no property assert an error
    (0, appAssert_1.default)(property, httpStatus_1.NOT_FOUND, "Property not found", "Invalid PropertyId" /* AppErrorCode.InvalidPropertyId */);
    // verify the property belongs to this manager
    (0, appAssert_1.default)(property.managerId === user.id, httpStatus_1.FORBIDDEN, "You don't have permission to create leases for this property");
    // check if property has active or pending leases
    (0, appAssert_1.default)(property.leases.length === 0, httpStatus_1.BAD_REQUEST, "This property has an active or pending lease", "Property Unavaialble" /* AppErrorCode.PropertyUnavailable */);
    // check if the application status has been approved before creating a lease
    const application = yield prismaClient_1.default.application.findFirst({
        where: {
            id: Number(applicationId),
            propertyId: Number(propertyId),
            tenantId,
            status: "Approved", // Fixed case sensitivity
        },
    });
    // assert an error if there is no approved application status
    (0, appAssert_1.default)(application, httpStatus_1.BAD_REQUEST, "Application status not approved or application not found");
    // create a lease and update the application then wait till the tenant approves it
    const lease = yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        const newLease = yield prisma.lease.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                rent: Number(rent),
                deposit: Number(deposit),
                property: { connect: { id: Number(propertyId) } },
                tenant: { connect: { id: tenantId } },
                status: "Pending",
                application: { connect: { id: Number(applicationId) } },
            },
            include: {
                property: { include: { location: true } },
                tenant: true,
                application: true,
            },
        });
        // Update application with leaseId - simplified approach
        yield prisma.application.update({
            where: { id: Number(applicationId) },
            data: { leaseId: newLease.id },
        });
        return newLease;
    }));
    res.status(httpStatus_1.CREATED).json({
        success: true,
        message: "Lease created successfully",
        lease,
    });
}));
exports.updateLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    const { status } = req.body;
    // restrict to tenant alone
    if (user.role !== "TENANT") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "You aren't a tenant");
    }
    // Validate input
    if (!status) {
        (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Status is required");
    }
    const allowedStatuses = ["Pending", "Approved", "Denied"];
    if (!allowedStatuses.includes(status)) {
        (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Invalid status value");
    }
    // Check if lease exists and belongs to tenant
    const existingLease = yield prismaClient_1.default.lease.findUnique({
        where: { id: Number(id) },
        include: { tenant: true, application: true },
    });
    (0, appAssert_1.default)(existingLease, httpStatus_1.NOT_FOUND, "Lease not found");
    // Check if the lease belongs to the current tenant
    (0, appAssert_1.default)(existingLease.tenantId === user.id, httpStatus_1.FORBIDDEN, "You can only update your own lease");
    // Prevent updating already finalized leases
    if (existingLease.status === "Approved" ||
        existingLease.status === "Denied") {
        (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Cannot update an already finalized lease");
    }
    // Update lease in transaction
    const updatedLease = yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const lease = yield prisma.lease.update({
            where: { id: Number(id) },
            data: { status },
            include: {
                property: { include: { location: true } },
                tenant: true,
                application: true,
            },
        });
        // If tenant approves lease, update application with leaseId
        if (status === "Approved" && ((_a = lease.application) === null || _a === void 0 ? void 0 : _a.id)) {
            yield prisma.application.update({
                where: { id: (_b = lease.application) === null || _b === void 0 ? void 0 : _b.id },
                data: { leaseId: lease.id },
            });
        }
        return lease;
    }));
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: `Lease ${status.toLowerCase()} successfully`,
        lease: updatedLease,
    });
}));
// GET A LEASE DETAILS
exports.getLeaseDetails = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch the user
    const user = req.user;
    // get the leaseid
    const { id } = req.params;
    const lease = yield prismaClient_1.default.lease.findUnique({
        where: { id: Number(id) },
        include: {
            property: { include: { location: true, manager: true } },
            tenant: true,
            application: true,
        },
    });
    // assert an eror if no lease
    (0, appAssert_1.default)(lease, httpStatus_1.NOT_FOUND, "No Lease found");
    if (user.role === "TENANT" && lease.tenantId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your lease", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    if (user.role === "MANAGER" && lease.property.managerId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your property", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    res.status(200).json(lease);
}));
