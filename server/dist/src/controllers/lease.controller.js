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
exports.updateLease = exports.deleteLease = exports.createLease = exports.getLeasePayment = exports.getAllLease = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
// get all lease
exports.getAllLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let leases;
    // check for leases based on roles
    // fetch all lease for tenant
    if (user.role === "TENANT") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { tenantId: user.id },
            include: { tenant: true, property: true },
        });
    }
    // fetch all lease for the property listed by the landlord
    else if (user.role === "MANAGER") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { property: { managerId: user === null || user === void 0 ? void 0 : user.id } },
            include: { property: true },
        });
    } // Assert an error if none is found
    else {
        (0, appAssert_1.default)(false, httpStatus_1.NOT_FOUND, "No lease found");
    }
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Lease fetched Successfully",
        leases,
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
    // assert an eror if no lease
    (0, appAssert_1.default)(lease, httpStatus_1.NOT_FOUND, "No Lease found");
    if (user.role === "TENANT" && lease.tenantId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your lease", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    if (user.role === "MANAGER" && lease.property.managerId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your property", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    const payments = yield prismaClient_1.default.payment.findMany({
        where: { leaseId: Number(id) },
    });
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Lease fetched Successfully",
        payments,
    });
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
        include: { manager: true, leases: true },
    });
    // if there is no property assert an error
    (0, appAssert_1.default)(property, httpStatus_1.NOT_FOUND, "Property not found", "Invalid PropertyId" /* AppErrorCode.InvalidPropertyId */);
    // if the item has been leased assert an error
    (0, appAssert_1.default)(property.leases.length === 0, httpStatus_1.NOT_FOUND, "This property has been leased", "Property Unavaialble" /* AppErrorCode.PropertyUnavailable */);
    // check if the application status has been approved before creating a lease
    const application = yield prismaClient_1.default.application.findFirst({
        where: {
            id: Number(applicationId),
            propertyId: Number(propertyId),
            tenantId,
            status: "Approved",
        },
    });
    // assert an error if there is no approved application status
    (0, appAssert_1.default)(application, httpStatus_1.BAD_REQUEST, "Application status not found");
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
            },
            include: { property: { include: { location: true } }, tenant: true },
        });
        // Update application with leaseId
        yield prisma.application.update({
            where: { id: Number(applicationId) },
            data: { lease: { connect: { id: newLease.id } } },
        });
        return newLease;
    }));
    res.status(httpStatus_1.CREATED).json({
        success: true,
        message: "Lease created successfully",
        lease,
    });
}));
exports.deleteLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    // restrict to landlord
    if (user.role !== "MANAGER") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Only Manager can delete a lease");
    }
    // fetch the lease
    const lease = yield prismaClient_1.default.lease.findUnique({
        where: { id: Number(id) },
    });
    // ASSERT AN ERROR
    (0, appAssert_1.default)(lease, httpStatus_1.NOT_FOUND, "Lease not found");
    // update the application data and delete the lease
    yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
        // update the application
        yield prisma.application.updateMany({
            where: { leaseId: Number(id) },
            data: { leaseId: null },
        });
        // delete the lease
        yield prisma.lease.delete({
            where: { id: Number(id) },
        });
    }));
}));
exports.updateLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { id } = req.params;
    // restrict to tenant alone
    if (user.role !== "TENANT") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "You aren't a tenant");
    }
    // update the lease status
    const updatedLease = yield prismaClient_1.default.lease.update({
        where: { id: Number(id) },
        data: { status: "Approved" },
        include: { property: { include: { location: true } }, tenant: true },
    });
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Lease accepted successfully",
        lease: updatedLease,
    });
}));
