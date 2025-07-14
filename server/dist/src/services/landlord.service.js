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
exports.getLandlordPropertiesService = exports.updateLandlordService = exports.getLandlordService = exports.createLandlordService = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const wkt_1 = require("@terraformer/wkt");
const createLandlordService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // create the landlord
    // creare a new tenant
    const landlord = yield prismaClient_1.default.user.create({
        // @ts-ignore
        data: {
            id: data.id,
            name: data.name,
            email: data.email,
        },
    });
    //   return
    return {
        message: "Landlord created successfully",
        landlord: {
            id: landlord.id,
            name: landlord.name,
            email: landlord.email,
            role: landlord.role,
        },
    };
});
exports.createLandlordService = createLandlordService;
const getLandlordService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // check if landlord exist
    const landlord = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "MANAGER" },
    });
    //   assert an error
    (0, appAssert_1.default)(landlord, httpStatus_1.NOT_FOUND, "Landlord details not found");
    // if found return a response
    return {
        message: "Landlord fetched successfully",
        landlord: {
            id: landlord.id,
            role: landlord.role,
        },
    };
});
exports.getLandlordService = getLandlordService;
// update the landlord
const updateLandlordService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // check if landlord exist
    const landlord = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "MANAGER" },
    });
    // IF NO LANDLORD, assert an error
    (0, appAssert_1.default)(landlord, httpStatus_1.NOT_FOUND, "Landlord not found");
    // update the landlord
    const updatedLandlord = yield prismaClient_1.default.user.update({
        where: { id: data.id },
        data: {
            name: data.name,
            email: data.email,
        },
    });
    // return a response
    return {
        success: true,
        message: "Landlord updated successfully",
        updatedLandlord: {
            id: updatedLandlord.id,
            name: updatedLandlord.name,
            email: updatedLandlord.email,
        },
    };
});
exports.updateLandlordService = updateLandlordService;
// landlord get propertIES service
const getLandlordPropertiesService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // GET THE USER FROM THE DATABASE
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "MANAGER" },
    });
    // assert an error message if property doesnt exist
    (0, appAssert_1.default)(user, httpStatus_1.NOT_FOUND, "User not found");
    // after confirming the user, get the property of user user where the manager
    const properties = yield prismaClient_1.default.property.findMany({
        where: { managerId: user.id },
        include: {
            location: true,
        },
    });
    // format the properties location
    // fetch multiple properties that belongsto this landlord
    const propertiesWithFormattedLocation = yield Promise.all(properties.map((property) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const coordinates = yield prismaClient_1.default.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;
        const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];
        return Object.assign(Object.assign({}, property), { location: Object.assign(Object.assign({}, property.location), { coordinates: {
                    longitude,
                    latitude,
                } }) });
    })));
    return {
        success: true,
        message: "Property fetched successful",
        propertiesWithFormattedLocation,
    };
});
exports.getLandlordPropertiesService = getLandlordPropertiesService;
