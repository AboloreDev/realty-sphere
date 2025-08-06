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
exports.getLandlordProperties = exports.updateLandlord = exports.getLandlord = exports.createLandlord = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const landlord_schema_1 = require("../schema/landlord.schema");
const landlord_service_1 = require("../services/landlord.service");
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
exports.createLandlord = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // VALIDATE THE REQUEST
    const request = landlord_schema_1.createLandlordSchema.parse(req.body);
    // USE THE SERVICE
    const { landlord, message } = yield (0, landlord_service_1.createLandlordService)(request);
    // RETURN THE RESPONSE
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        landlord,
    });
}));
exports.getLandlord = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // VALIDATE THE REQUEST
    const request = landlord_schema_1.getLandlordSchema.parse(req.params);
    // USE THE SERVICE
    const { landlord, message } = yield (0, landlord_service_1.getLandlordService)(request);
    // RETURN THE RESPONSE
    return res.status(httpStatus_1.OK).json({
        success: true,
        message,
        landlord,
    });
}));
// update the landlord
exports.updateLandlord = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // VALIDATE THE REQUEST
    // get the landlord id
    const { id } = landlord_schema_1.getLandlordSchema.parse(req.params);
    const { name, email } = landlord_schema_1.updateLandlordSchema.parse(req.body);
    // USE THE SERVICE
    const { updatedLandlord, success, message } = yield (0, landlord_service_1.updateLandlordService)({
        name,
        email,
        id,
    });
    // RETURN THE RESPONSE
    return res.status(httpStatus_1.OK).json({
        success,
        message,
        updatedLandlord,
    });
}));
// GET landlordpROPERTY
exports.getLandlordProperties = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validate the request
    const request = landlord_schema_1.getLandlordSchema.parse(req.params);
    // use the service
    const { propertiesWithFormattedLocation } = yield (0, landlord_service_1.getLandlordPropertiesService)(request);
    // return a response
    return res.status(httpStatus_1.OK).json(propertiesWithFormattedLocation);
}));
