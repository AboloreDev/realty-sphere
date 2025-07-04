import { Role } from "@prisma/client";
import { NOT_FOUND } from "../constants/httpStatus";
import prisma from "../prismaClient";
import {
  createLandlord,
  getLandlordId,
  updateLandlord,
} from "../types/landlord.types";
import appAssert from "../utils/appAssert";

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
    where: { id: data.id, role: data.role as Role },
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
