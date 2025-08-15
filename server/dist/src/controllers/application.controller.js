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
exports.getApplicationDetails = exports.updateApplications = exports.listApplications = exports.createApplication = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const nextPaymentDateCalcutions_1 = __importDefault(require("../utils/nextPaymentDateCalcutions"));
exports.createApplication = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        console.log("Request body:", req.body); // Debug: Log the incoming body
        // Check if req.body is defined
        if (!req.body) {
            return (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Request body is missing");
        }
        const { applicationDate, propertyId, name, email, message, phoneNumber } = req.body;
        if (user.role !== "TENANT") {
            return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Not a Tenant");
        }
        // Validate required fields
        if (!propertyId || !name || !email || !phoneNumber) {
            return (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Missing required fields");
        }
        // Validate propertyId exists
        const property = yield prismaClient_1.default.property.findUnique({
            where: { id: propertyId },
            select: {
                pricePerMonth: true,
                securityDeposit: true,
            },
        });
        (0, appAssert_1.default)(property, httpStatus_1.NOT_FOUND, "Property not found");
        // Create the application
        const newApplication = yield prismaClient_1.default.application.create({
            data: {
                applicationDate: new Date(applicationDate || Date.now()),
                status: "Pending",
                name,
                email,
                phoneNumber,
                message,
                property: { connect: { id: propertyId } },
                tenant: { connect: { id: user.id } },
            },
            include: {
                property: { include: { location: true, manager: true } },
                tenant: true,
            },
        });
        return res.status(httpStatus_1.CREATED).json({
            success: true,
            message: "Application was successful",
            newApplication,
        });
    }
    catch (error) {
        console.error("Error in createApplication:", error); // Log the error
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message, // Include error details for debugging
        });
    }
}));
exports.listApplications = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let applications = [];
    // fetch Applications based on roles
    // for tenant
    if (user.role === "TENANT") {
        applications = yield prismaClient_1.default.application.findMany({
            where: { tenantId: user.id },
            include: {
                property: { include: { location: true, manager: true } },
                tenant: true,
            },
        });
    }
    // for landlord
    else if (user.role === "MANAGER") {
        applications = yield prismaClient_1.default.application.findMany({
            where: { property: { managerId: user.id } },
            include: {
                property: { include: { location: true, manager: true } },
                tenant: true,
            },
        });
    }
    // after getting the applications, format the application fetch to only show the lease associated with it
    const formattedApplications = yield Promise.all(applications.map((application) => __awaiter(void 0, void 0, void 0, function* () {
        const lease = yield prismaClient_1.default.lease.findFirst({
            where: {
                tenant: { id: application.tenantId },
                propertyId: application.propertyId,
            },
            orderBy: { startDate: "desc" },
        });
        // show next payment date if lease exists
        const nextPaymentDate = lease
            ? (0, nextPaymentDateCalcutions_1.default)(lease.startDate, lease.endDate)
            : null;
        return {
            id: application.id,
            applicationDate: application.applicationDate,
            status: application.status,
            propertyId: application.propertyId,
            tenantId: application.tenantId,
            name: application.name,
            email: application.email,
            phoneNumber: application.phoneNumber,
            message: application.message,
            leaseId: application.leaseId,
            property: Object.assign(Object.assign({}, application.property), { address: application.property.location.address }),
            landlord: application.property.manager,
            lease: lease
                ? {
                    id: lease.id,
                    startDate: lease.startDate,
                    endDate: lease.endDate,
                    rent: lease.rent,
                    deposit: lease.deposit,
                    propertyId: lease.propertyId,
                    tenantId: lease.tenantId,
                    leaseStatus: lease.status,
                }
                : undefined,
            nextPaymentDate,
        };
    })));
    // RETURN A RESPONSE
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Applications fetched Successfully",
        formattedApplications,
    });
}));
exports.updateApplications = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //GET THE ID FROM THE PARAMS
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;
    if (user.role !== "MANAGER") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Only landlords can update application");
    }
    // validate the application and check if it exists
    const applications = yield prismaClient_1.default.application.findUnique({
        where: { id: Number(id) },
        include: { property: true, tenant: true },
    });
    // asert an error if no applications
    (0, appAssert_1.default)(applications, httpStatus_1.NOT_FOUND, "Application not found");
    // update appliation
    const updateApplications = yield prismaClient_1.default.application.update({
        where: { id: Number(id) },
        data: { status },
        include: {
            property: { include: { location: true, manager: true } },
            tenant: true,
        },
    });
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Application updated successfully",
        updateApplications,
    });
}));
// GET A APPLICATION DETAILS
exports.getApplicationDetails = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // fetch the user
    const user = req.user;
    // get the leaseid
    const { id } = req.params;
    const application = yield prismaClient_1.default.lease.findUnique({
        where: { id: Number(id) },
        include: { property: true, tenant: true },
    });
    // assert an eror if no lease
    (0, appAssert_1.default)(application, httpStatus_1.NOT_FOUND, "No Application found");
    if (user.role === "TENANT" && application.tenantId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your application", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    if (user.role === "MANAGER" && application.property.managerId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your property", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    res.status(200).json(application);
}));
