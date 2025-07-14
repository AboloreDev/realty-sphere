import { Role } from "@prisma/client";
import { NOT_FOUND } from "../constants/httpStatus";
import prisma from "../prismaClient";
import {
  createLandlord,
  getLandlordId,
  getLandlordSingleProperty,
  updateLandlord,
} from "../types/landlord.types";
import appAssert from "../utils/appAssert";
import { wktToGeoJSON } from "@terraformer/wkt";

export const createLandlordService = async (data: createLandlord) => {
  // create the landlord
  // creare a new tenant
  const landlord = await prisma.user.create({
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
};
export const getLandlordService = async (data: getLandlordId) => {
  // check if landlord exist
  const landlord = await prisma.user.findUnique({
    where: { id: data.id, role: "MANAGER" },
  });
  //   assert an error
  appAssert(landlord, NOT_FOUND, "Landlord details not found");

  // if found return a response
  return {
    message: "Landlord fetched successfully",
    landlord: {
      id: landlord.id,
      role: landlord.role,
    },
  };
};
// update the landlord
export const updateLandlordService = async (data: updateLandlord) => {
  // check if landlord exist
  const landlord = await prisma.user.findUnique({
    where: { id: data.id, role: "MANAGER" },
  });
  // IF NO LANDLORD, assert an error
  appAssert(landlord, NOT_FOUND, "Landlord not found");

  // update the landlord
  const updatedLandlord = await prisma.user.update({
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
};

// landlord get propertIES service

export const getLandlordPropertiesService = async (
  data: getLandlordSingleProperty
) => {
  // GET THE USER FROM THE DATABASE
  const user = await prisma.user.findUnique({
    where: { id: data.id, role: "MANAGER" },
  });
  // assert an error message if property doesnt exist
  appAssert(user, NOT_FOUND, "User not found");

  // after confirming the user, get the property of user user where the manager
  const properties = await prisma.property.findMany({
    where: { managerId: user.id },
    include: {
      location: true,
    },
  });

  // format the properties location
  // fetch multiple properties that belongsto this landlord
  const propertiesWithFormattedLocation = await Promise.all(
    properties.map(async (property) => {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      return {
        ...property,
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
    })
  );
  return {
    success: true,
    message: "Property fetched successful",
    propertiesWithFormattedLocation,
  };
};
