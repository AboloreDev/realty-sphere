"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPropertyWhereConditions = void 0;
const client_1 = require("@prisma/client");
const buildPropertyWhereConditions = (query) => {
    const { priceMin, priceMax, favoriteIds, beds, bath, propertyType, squareFeetMin, squareFeetMax, amenities, availableFrom, latitude, longitude, } = query;
    let whereConditions = [];
    if (favoriteIds) {
        const favoriteIdsArray = favoriteIds.split(",").map(Number);
        whereConditions.push(client_1.Prisma.sql `p.id IN (${client_1.Prisma.join(favoriteIdsArray)})`);
    }
    if (priceMin) {
        whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" >= ${Number(priceMin)}`);
    }
    if (priceMax) {
        whereConditions.push(client_1.Prisma.sql `p."pricePerMonth" <= ${Number(priceMax)}`);
    }
    if (beds && beds !== "any") {
        whereConditions.push(client_1.Prisma.sql `p.beds >= ${Number(beds)}`);
    }
    if (bath && bath !== "any") {
        whereConditions.push(client_1.Prisma.sql `p.bath >= ${Number(bath)}`);
    }
    if (squareFeetMin) {
        whereConditions.push(client_1.Prisma.sql `p."squareFeet" >= ${Number(squareFeetMin)}`);
    }
    if (squareFeetMax) {
        whereConditions.push(client_1.Prisma.sql `p."squareFeet" <= ${Number(squareFeetMax)}`);
    }
    if (propertyType && propertyType !== "any") {
        whereConditions.push(client_1.Prisma.sql `p."propertyType" = ${propertyType}::"PropertyType"`);
    }
    if (amenities && amenities !== "any") {
        const amenitiesArray = amenities.split(",");
        whereConditions.push(client_1.Prisma.sql `p.amenities @> ${amenitiesArray}`);
    }
    if (availableFrom && availableFrom !== "any") {
        const date = typeof availableFrom === "string" ? new Date(availableFrom) : null;
        if (date && !isNaN(date.getTime())) {
            whereConditions.push(client_1.Prisma.sql `EXISTS (
          SELECT 1 FROM "Lease" l
          WHERE l."propertyId" = p.id
          AND l."startDate" <= ${date.toISOString()}
        )`);
        }
    }
    if (latitude && longitude) {
        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);
        const radiusInKilometers = 1000;
        const degrees = radiusInKilometers / 111;
        whereConditions.push(client_1.Prisma.sql `ST_DWithin(
        l.coordinates::geometry, 
        ST_setSRID(ST_MakePoint(${lat}, ${lon}), 4326), 
        ${degrees})`);
    }
    return whereConditions;
};
exports.buildPropertyWhereConditions = buildPropertyWhereConditions;
