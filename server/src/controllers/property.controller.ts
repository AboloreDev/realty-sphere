import { Prisma } from "@prisma/client";
import { catchAsyncError } from "../utils/catchAsyncErrors";
import { buildPropertyWhereConditions } from "../utils/propertyFilter";
import prisma from "../prismaClient";
import { NOT_FOUND, OK } from "../constants/httpStatus";
import appAssert from "../utils/appAssert";
import { wktToGeoJSON } from "@terraformer/wkt";

export const getAllProperties = catchAsyncError(async (req, res) => {
  // get the property filters from utils folder
  const whereConditions = buildPropertyWhereConditions(req.query);

  // the complete search query
  // location === l, proprty === p
  const completeQuery = Prisma.sql`
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
        ${
          whereConditions.length > 0
            ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
            : Prisma.empty
        }
    `;
  // execute the complete query command
  const properties = await prisma.$queryRaw(completeQuery);

  // send a response
  return res.status(OK).json({
    success: true,
    message: "Property fetch successful",
    properties,
  });
});

export const getSingleProperty = catchAsyncError(async (req, res) => {
  // get the id from params
  const { id } = req.params;

  // get the property
  const singleProperty = await prisma.property.findUnique({
    where: { id: Number(id) },
    include: {
      location: true,
    },
  });
  // assert an error message if property doesnt exist
  appAssert(singleProperty, NOT_FOUND, "Property not found");

  // if the property exists
  if (singleProperty) {
    const coordinates: { coordinates: string }[] =
      await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${singleProperty.location.id}`;

    const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
    const longitude = geoJSON.coordinates[0];
    const latitude = geoJSON.coordinates[1];

    const propertyWithCoordinate = {
      ...singleProperty,
      location: {
        ...singleProperty.location,
        coordinates: {
          longitude,
          latitude,
        },
      },
    };
    // return a response
    return res.status(OK).json({
      success: true,
      message: "Property fetched",
      propertyWithCoordinate,
    });
  }
});

export const createPropertyListing = catchAsyncError(async (req, res) => {});
