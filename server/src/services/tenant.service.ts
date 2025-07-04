import { NOT_FOUND, OK } from "../constants/httpStatus";
import prisma from "../prismaClient";
import { createTenant, getTenantId, updateTenant } from "../types/tenant.types";
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
