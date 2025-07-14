import { wktToGeoJSON } from "@terraformer/wkt";
import { CONFLICT, NOT_FOUND, OK } from "../constants/httpStatus";
import prisma from "../prismaClient";
import {
  AddTenantFavoritePropertyType,
  createTenant,
  getTenantId,
  updateTenant,
} from "../types/tenant.types";
import appAssert from "../utils/appAssert";

// get tenant by id
export const getTenantById = async (data: getTenantId) => {
  // check if the tenant exists
  const tenant = await prisma.user.findUnique({
    where: { id: data.id, role: "TENANT" },
    include: { favorites: true },
  });
  // assert a function if no user found
  appAssert(tenant, NOT_FOUND, "Tenant not found");

  // send a response
  return {
    message: "Tenant Fetched",
    tenant: {
      id: tenant.id,
      role: tenant.role,
      favorites: tenant.favorites,
    },
  };
};

export const createTenantService = async (data: createTenant) => {
  // creare a new tenant
  const tenant = await prisma.user.create({
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
};

// servive for update tenant
export const updateTenantService = async (data: updateTenant) => {
  // check if the tenant exist
  const tenant = await prisma.user.findUnique({
    where: { id: data.id, role: "TENANT" },
  });
  // if no tenant, assert a message
  appAssert(tenant, NOT_FOUND, "Tenant not found");

  // check and update the tenant
  const updatedTenant = await prisma.user.update({
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
};

// export const getTenantResidences =
export const getTenantResidenciesService = async (data: getTenantId) => {
  // check if the tenant exist
  const user = await prisma.user.findUnique({
    where: { id: data.id, role: "TENANT" },
  });

  // IF NO USER ASSERT AN ERROR
  appAssert(user, NOT_FOUND, "Tenant not found");

  // get the residences
  const residencies = await prisma.property.findMany({
    where: { tenants: { some: { id: data.id } } },
    include: {
      location: true,
    },
  });

  // format the residencies location
  // fetch multiple residencies that belongsto this landlord
  const residencesWithFormattedLocation = await Promise.all(
    residencies.map(async (property) => {
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
    residencesWithFormattedLocation,
  };
};

// add tenant favorite service
export const addTenantFavoriteService = async (
  data: AddTenantFavoritePropertyType
) => {
  // chech 0f the user exist with tenant role
  const user = await prisma.user.findUnique({
    where: { id: data.id, role: "TENANT" },
    include: {
      favorites: true,
    },
  });
  // Assert an error if not found
  appAssert(user, NOT_FOUND, "Tenant not found");

  // convert the property id from string to number
  const propertyIdNumber = Number(data.propertyId);

  // check for existing favorites
  const existingFavorites = user?.favorites || "";

  // assert an error if it existing
  appAssert(existingFavorites, CONFLICT, "Property already added as favorite");

  // add to favorite
  let updateTenantFavorite = null;
  if (!existingFavorites.some((favorite) => favorite.id === propertyIdNumber)) {
    updateTenantFavorite = await prisma.user.update({
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
};

// remove from favorite
export const removeFromFavoriteService = async (
  data: AddTenantFavoritePropertyType
) => {
  // chech 0f the user exist with tenant role
  const user = await prisma.user.findUnique({
    where: { id: data.id, role: "TENANT" },
    include: {
      favorites: true,
    },
  });
  // Assert an error if not found
  appAssert(user, NOT_FOUND, "Tenant not found");

  // convert the property id from string to number
  const propertyIdNumber = Number(data.propertyId);

  const updatedTenantFavorite = await prisma.user.update({
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
};
