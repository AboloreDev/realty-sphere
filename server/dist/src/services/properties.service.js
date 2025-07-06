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
exports.createPropertyListingService = exports.getSinglePropertyService = exports.getAllPropertiesService = void 0;
const client_1 = require("@prisma/client");
const propertyFilter_1 = require("../utils/propertyFilter");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const getAllPropertiesService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    return {
        success: true,
        message: "All properties fetched successfully",
        properties,
    };
});
exports.getAllPropertiesService = getAllPropertiesService;
const getSinglePropertyService = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.getSinglePropertyService = getSinglePropertyService;
const createPropertyListingService = (req, res) => __awaiter(void 0, void 0, void 0, function* () { });
exports.createPropertyListingService = createPropertyListingService;
