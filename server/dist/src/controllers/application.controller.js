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
exports.deleteApplications = exports.updateApplications = exports.listApplications = exports.createApplication = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const nextPaymentDateCalcutions_1 = __importDefault(require("../utils/nextPaymentDateCalcutions"));
exports.createApplication = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user.role !== "TENANT") {
        (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Not a Tenant");
    }
    const { applicationDate, propertyId, name, email, message, phoneNumber } = req.body;
    // Validate required fields
    if (!propertyId || !name || !email || !phoneNumber) {
        return (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Missing required fields");
    }
    const property = yield prismaClient_1.default.property.findUnique({
        where: { id: propertyId },
        select: {
            pricePerMonth: true,
            securityDeposit: true,
        },
    });
    (0, appAssert_1.default)(property, httpStatus_1.NOT_FOUND, "Property not found");
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
        return Object.assign(Object.assign(Object.assign(Object.assign({}, application), { property: Object.assign(Object.assign({}, application.property), { address: application.property.location.address }), landlord: application.property.manager }), lease), { nextPaymentDate });
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
    const status = req.body;
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
        data: { status: "Approved" },
        include: {
            property: { include: { location: true, manager: true } },
            tenant: true,
        },
    });
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Apllication updated successfully",
        updateApplications,
    });
}));
exports.deleteApplications = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    // delete the application
    yield prismaClient_1.default.application.delete({
        where: { id: Number(id) },
    });
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Application deleted successfully",
    });
}));
