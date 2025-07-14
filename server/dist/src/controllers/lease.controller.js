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
exports.getLeasePayment = exports.getAllLease = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
// get all lease, landlord only
exports.getAllLease = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let leases;
    // check for leases based on roles
    if (user.role === "TENANT") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { tenantId: user.id },
            include: { tenant: true, property: true },
        });
    }
    if (user.role === "LANDLORD") {
        leases = yield prismaClient_1.default.lease.findMany({
            where: { property: { managerId: user === null || user === void 0 ? void 0 : user.id } },
            include: { tenant: true, property: true },
        });
    }
    res.status(httpStatus_1.OK).json(leases);
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
    if (user.role === "LANDLORD" && lease.property.managerId !== user.id) {
        return (0, appAssert_1.default)(false, httpStatus_1.FORBIDDEN, "Access denied: Not your property", "Unauthorized Role" /* AppErrorCode.UnauthorizedRole */);
    }
    const payments = yield prismaClient_1.default.payment.findMany({
        where: { leaseId: Number(id) },
    });
    // return a response
    res.status(httpStatus_1.OK).json(payments);
}));
