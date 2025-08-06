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
exports.removeFromFavoriteService = exports.addTenantFavoriteService = exports.getTenantResidenciesService = exports.updateTenantService = exports.createTenantService = exports.getTenantById = void 0;
const wkt_1 = require("@terraformer/wkt");
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
// get tenant by id
const getTenantById = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the tenant exists
    const tenant = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "TENANT" },
        include: { favorites: true },
    });
    // assert a function if no user found
    (0, appAssert_1.default)(tenant, httpStatus_1.NOT_FOUND, "Tenant not found");
    // send a response
    return {
        message: "Tenant Fetched",
        tenant: {
            id: tenant.id,
            role: tenant.role,
            favorites: tenant.favorites,
        },
    };
});
exports.getTenantById = getTenantById;
const createTenantService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // creare a new tenant
    const tenant = yield prismaClient_1.default.user.create({
        // @ts-ignore
        data: {
            id: data.id,
            name: data.name,
            email: data.email,
            role: "TENANT",
        },
    });
    //   return
    return {
        message: "Tenant created",
        tenant: {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            role: tenant.role,
        },
    };
});
exports.createTenantService = createTenantService;
// servive for update tenant
const updateTenantService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the tenant exist
    const tenant = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "TENANT" },
    });
    // if no tenant, assert a message
    (0, appAssert_1.default)(tenant, httpStatus_1.NOT_FOUND, "Tenant not found");
    // check and update the tenant
    const updatedTenant = yield prismaClient_1.default.user.update({
        where: { id: data.id },
        data: {
            name: data.name,
            email: data.email,
        },
    });
    // send a response
    return {
        message: "Tenant Updated Successfully",
        updatedTenant: {
            name: updatedTenant.name,
            email: updatedTenant.email,
        },
    };
});
exports.updateTenantService = updateTenantService;
// export const getTenantResidences =
const getTenantResidenciesService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // check if the tenant exist
    const tenant = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "TENANT" },
    });
    // IF NO USER ASSERT AN ERROR
    (0, appAssert_1.default)(tenant, httpStatus_1.NOT_FOUND, "Tenant not found");
    // get the residences
    const residencies = yield prismaClient_1.default.property.findMany({
        where: { tenants: { some: { id: data.id } } },
        include: {
            location: true,
        },
    });
    // format the residencies location
    // fetch multiple residencies that belongsto this landlord
    const residencesWithFormattedLocation = yield Promise.all(residencies.map((property) => __awaiter(void 0, void 0, void 0, function* () {
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
        residencesWithFormattedLocation,
    };
});
exports.getTenantResidenciesService = getTenantResidenciesService;
// add tenant favorite service
const addTenantFavoriteService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // chech 0f the user exist with tenant role
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "TENANT" },
        include: {
            favorites: true,
        },
    });
    // Assert an error if not found
    (0, appAssert_1.default)(user, httpStatus_1.NOT_FOUND, "Tenant not found");
    // convert the property id from string to number
    const propertyIdNumber = Number(data.propertyId);
    // check for existing favorites
    const existingFavorites = (user === null || user === void 0 ? void 0 : user.favorites) || "";
    // assert an error if it existing
    (0, appAssert_1.default)(existingFavorites, httpStatus_1.CONFLICT, "Property already added as favorite");
    // add to favorite
    let updateTenantFavorite = null;
    if (!existingFavorites.some((favorite) => favorite.id === propertyIdNumber)) {
        updateTenantFavorite = yield prismaClient_1.default.user.update({
            where: { id: data.id },
            data: {
                favorites: { connect: { id: propertyIdNumber } },
            },
            include: {
                favorites: true,
            },
        });
    }
    return {
        success: true,
        message: "Added to favorite",
        updateTenantFavorite,
    };
});
exports.addTenantFavoriteService = addTenantFavoriteService;
// remove from favorite
const removeFromFavoriteService = (data) => __awaiter(void 0, void 0, void 0, function* () {
    // chech 0f the user exist with tenant role
    const user = yield prismaClient_1.default.user.findUnique({
        where: { id: data.id, role: "TENANT" },
        include: {
            favorites: true,
        },
    });
    // Assert an error if not found
    (0, appAssert_1.default)(user, httpStatus_1.NOT_FOUND, "Tenant not found");
    // convert the property id from string to number
    const propertyIdNumber = Number(data.propertyId);
    const updatedTenantFavorite = yield prismaClient_1.default.user.update({
        where: { id: data.id },
        data: {
            favorites: { disconnect: { id: propertyIdNumber } },
        },
        include: {
            favorites: true,
        },
    });
    return {
        success: true,
        message: "Added to favorite",
        updatedTenantFavorite,
    };
});
exports.removeFromFavoriteService = removeFromFavoriteService;
