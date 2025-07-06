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
exports.createPropertyListing = exports.getSingleProperty = exports.getAllProperties = void 0;
const client_1 = require("@prisma/client");
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
const propertyFilter_1 = require("../utils/propertyFilter");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const httpStatus_1 = require("../constants/httpStatus");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const wkt_1 = require("@terraformer/wkt");
exports.getAllProperties = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get the property filters from utils folder
    const whereConditions = (0, propertyFilter_1.buildPropertyWhereConditions)(req.query);
    // the complete search query
    // location === l, proprty === p
    const completeQuery = client_1.Prisma.sql `
    SELECT
        p.*,
        json_build_object(
        'id', l.id,
        "address", l.address,
        'state', l.state,
        'city', l.city,
        'country', l.country,
        'postalCode', l.'postalCode',
        'coordinates', json_build_object(
          'longitude', ST_X(l.'coordinates'::geometry),
          'latitude', ST_Y(l.'coordinates'::geometry)
          )
        ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" * l.id
        ${whereConditions.length > 0
        ? client_1.Prisma.sql `WHERE ${client_1.Prisma.join(whereConditions, " AND ")}`
        : client_1.Prisma.empty}
    `;
    // execute the complete query command
    const properties = yield prismaClient_1.default.$queryRaw(completeQuery);
    // send a response
    return res.status(httpStatus_1.OK).json({
        success: true,
        message: "Property fetch successful",
        properties,
    });
}));
exports.getSingleProperty = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // get the id from params
    const { id } = req.params;
    // get the property
    const singleProperty = yield prismaClient_1.default.property.findUnique({
        where: { id: Number(id) },
        include: {
            location: true,
        },
    });
    // assert an error message if property doesnt exist
    (0, appAssert_1.default)(singleProperty, httpStatus_1.NOT_FOUND, "Property not found");
    // if the property exists
    if (singleProperty) {
        const coordinates = yield prismaClient_1.default.$queryRaw `SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${singleProperty.location.id}`;
        const geoJSON = (0, wkt_1.wktToGeoJSON)(((_a = coordinates[0]) === null || _a === void 0 ? void 0 : _a.coordinates) || "");
        const longitude = geoJSON.coordinates[0];
        const latitude = geoJSON.coordinates[1];
        const propertyWithCoordinate = Object.assign(Object.assign({}, singleProperty), { location: Object.assign(Object.assign({}, singleProperty.location), { coordinates: {
                    longitude,
                    latitude,
                } }) });
        // return a response
        return res.status(httpStatus_1.OK).json({
            success: true,
            message: "Property fetched",
            propertyWithCoordinate,
        });
    }
}));
exports.createPropertyListing = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
