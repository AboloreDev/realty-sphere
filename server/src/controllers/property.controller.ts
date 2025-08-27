import {  Prisma, Location } from "@prisma/client";
import { catchAsyncError } from "../utils/catchAsyncErrors";
import { buildPropertyWhereConditions } from "../utils/propertyFilter";
import { NOT_FOUND, OK } from "../constants/httpStatus";
import appAssert from "../utils/appAssert";
import { wktToGeoJSON } from "@terraformer/wkt";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import prisma from "../prismaClient";

// Enhanced UploadStreamResult type (simplified)
interface UploadStreamResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

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
        'address', l.address,
        'state', l.state,
        'city', l.city,
        'country', l.country,
        'postalCode', l."postalCode",
        'coordinates', json_build_object(
          'longitude', ST_X(l."coordinates"::geometry),
          'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
        FROM "Property" p
        JOIN "Location" l ON p."locationId" = l.id
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
      manager: true,
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

export const createPropertyListing = catchAsyncError(async (req, res) => {
  const files = req.files as Express.Multer.File[];

  // get the request from the body
  const {
    address,
    city,
    state,
    country,
    postalCode,
    managerId,
    ...propertyData
  } = req.body;

  // upload photos
  const imageUrls = [];
  if (files && files.length > 0) {
    for (const file of files) {
      const result = await new Promise<UploadStreamResult>(
        (resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: `properties/${Date.now()}-${file.originalname}`,
                quality: "auto",
              },
              (error, result) =>
                error ? reject(error) : resolve(result as UploadStreamResult)
            )
            .end(file.buffer);
        }
      );
      imageUrls.push(result.secure_url);
    }
  }

  // construct the url via new urlSearchParams
  const geoCodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
    {
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }
  ).toString()}`;

  const geoCodingResponse = await axios.get(geoCodingUrl, {
    headers: {
      "User-Agent": "NestoraRealEstate (taikoxyz@gmail.com)",
    },
  });
  const [longitude, latitude] =
    geoCodingResponse.data[0]?.lon && geoCodingResponse.data[0]?.lat
      ? [
          parseFloat(geoCodingResponse.data[0]?.lon),
          parseFloat(geoCodingResponse.data[0]?.lon),
        ]
      : [0, 0];

  // create location
  // insert into the location table
  // pass the values
  // return the values as coordinates
  const [location] = await prisma.$queryRaw<Location[]>`

      INSERT INTO "Location" (address, city, state,country,"postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_Makepoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country,"postalCode", ST_AsText(coordinates) as coordinates
      `;

  // create the property
  const newProperty = await prisma.property.create({
    data: {
      ...propertyData,
      photoUrls: imageUrls,
      locationId: location.id,
      managerId,
      amenities:
        typeof propertyData.amenities == "string"
          ? propertyData.amenities.split(",")
          : [],
      highlights:
        typeof propertyData.highlights == "string"
          ? propertyData.highlights.split(",")
          : [],
      isPetsAllowed: propertyData.isPetsAllowed === "true",
      isParkingIncluded: propertyData.isParkingIncluded === "true",
      pricePerMonth: parseFloat(propertyData.pricePerMonth),
      securityDeposit: parseFloat(propertyData.securityDeposit),
      applicationFee: parseFloat(propertyData.applicationFee),
      beds: parseInt(propertyData.beds),
      baths: parseInt(propertyData.baths),
      squareFeet: parseInt(propertyData.squareFeet),
    },
    include: {
      location: true,
      manager: true,
    },
  });

  // return a response
  res.status(OK).json(newProperty);
});
