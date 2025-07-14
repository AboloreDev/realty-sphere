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
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromFavorite = exports.addTenantFavoriteProperty = exports.getTenantResidences = exports.updateTenantDetails = exports.createTenant = exports.getTenant = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const tenant_schema_1 = require("../schema/tenant.schema");
const tenant_service_1 = require("../services/tenant.service");
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
// get tenant by id
exports.getTenant = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = tenant_schema_1.getTenantSchema.parse(req.params);
    // use the service
    const { tenant, message } = yield (0, tenant_service_1.getTenantById)(request);
    // return the response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        tenant,
    });
}));
// create a tenant
exports.createTenant = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = tenant_schema_1.createTenantSchema.parse(req.body);
    // use the service
    const { tenant, message } = yield (0, tenant_service_1.createTenantService)(request);
    // return the response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        tenant,
    });
}));
// Update the tenant
exports.updateTenantDetails = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const { id } = tenant_schema_1.getTenantSchema.parse(req.params);
    const { name, email } = tenant_schema_1.updateTenantSchema.parse(req.body);
    // use the service
    const { updatedTenant, message } = yield (0, tenant_service_1.updateTenantService)({
        id,
        email,
        name,
    });
    // return a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        updatedTenant,
    });
}));
// get tenant residences
exports.getTenantResidences = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = tenant_schema_1.getTenantSchema.parse(req.params);
    // use the service
    const { message, success, residencesWithFormattedLocation } = yield (0, tenant_service_1.getTenantResidenciesService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json({
        success,
        message,
        residencesWithFormattedLocation,
    });
}));
// add tenant favorite property
exports.addTenantFavoriteProperty = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = tenant_schema_1.addTenantFavorite.parse(req.params);
    // use the service
    const { success, message, updateTenantFavorite } = yield (0, tenant_service_1.addTenantFavoriteService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json({
        success,
        message,
        updateTenantFavorite,
    });
}));
// remove tenant favorite property
exports.removeFromFavorite = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const request = tenant_schema_1.addTenantFavorite.parse(req.params);
    // use the service
    const { success, message, updatedTenantFavorite } = yield (0, tenant_service_1.removeFromFavoriteService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json({
        success,
        message,
        updatedTenantFavorite,
    });
}));
