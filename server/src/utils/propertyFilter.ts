import { Prisma } from "@prisma/client";

export const buildPropertyWhereConditions = (query: any): Prisma.Sql[] => {
  const {
    priceMin,
    priceMax,
    favoriteIds,
    beds,
    bath,
    propertyType,
    squareFeetMin,
    squareFeetMax,
    amenities,
    availableFrom,
    latitude,
    longitude,
  } = query;

  let whereConditions: Prisma.Sql[] = [];

  if (favoriteIds) {
    const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
    whereConditions.push(
      Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
    );
  }

  if (priceMin) {
    whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
  }

  if (priceMax) {
    whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);
  }

  if (beds && beds !== "any") {
    whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
  }

  if (bath && bath !== "any") {
    whereConditions.push(Prisma.sql`p.bath >= ${Number(bath)}`);
  }

  if (squareFeetMin) {
    whereConditions.push(
      Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`
    );
  }

  if (squareFeetMax) {
    whereConditions.push(
      Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`
    );
  }

  if (propertyType && propertyType !== "any") {
    whereConditions.push(
      Prisma.sql`p."PropertyType" = ${propertyType}::"PropertyType"`
    );
  }

  if (amenities && amenities !== "any") {
    const amenitiesArray = (amenities as string).split(",");
    whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
  }

  if (availableFrom && availableFrom !== "any") {
    const date =
      typeof availableFrom === "string" ? new Date(availableFrom) : null;
    if (date && !isNaN(date.getTime())) {
      whereConditions.push(
        Prisma.sql`EXISTS (
          SELECT 1 FROM "Lease" l
          WHERE l."propertyId" = p.id
          AND l."startDate" <= ${date.toISOString()}
        )`
      );
    }
  }

  if (latitude && longitude) {
    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);
    const radiusInKilometers = 1000;
    const degrees = radiusInKilometers / 111;

    whereConditions.push(
      Prisma.sql`ST_DWithin(
        l.coordinates::geometry, 
        ST_setSRID(ST_MakePoint(${lat}, ${lon}), 4326), 
        ${degrees})`
    );
  }

  return whereConditions;
};
