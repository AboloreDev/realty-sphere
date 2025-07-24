import { string } from "zod";
import { OK } from "../constants/httpStatus";
import {
  addTenantFavorite,
  createTenantSchema,
  getTenantSchema,
  updateTenantSchema,
} from "../schema/tenant.schema";
import {
  addTenantFavoriteService,
  createTenantService,
  getTenantById,
  getTenantResidenciesService,
  removeFromFavoriteService,
  updateTenantService,
} from "../services/tenant.service";
import { catchAsyncError } from "../utils/catchAsyncErrors";

// get tenant by id
export const getTenant = catchAsyncError(async (req, res) => {
  // validate the request
  const request: any = getTenantSchema.parse(req.params);
  // use the service
  const { tenant, message } = await getTenantById(request);
  // return the response
  return res.status(OK).json(tenant);
});

// create a tenant
export const createTenant = catchAsyncError(async (req, res) => {
  // validate the request
  const request: any = createTenantSchema.parse(req.body);
  // use the service
  const { tenant, message } = await createTenantService(request);
  // return the response
  return res.status(OK).json({
    success: true,
    message,
    tenant,
  });
});

// Update the tenant
export const updateTenantDetails = catchAsyncError(async (req, res) => {
  // validate the request
  const { id } = getTenantSchema.parse(req.params);
  const { name, email } = updateTenantSchema.parse(req.body);
  // use the service
  const { updatedTenant, message } = await updateTenantService({
    id,
    email,
    name,
  });
  // return a response
  return res.status(OK).json({
    success: true,
    message,
    updatedTenant,
  });
});

// get tenant residences
export const getTenantResidences = catchAsyncError(async (req, res) => {
  const request: any = getTenantSchema.parse(req.params);

  // use the service
  const { message, success, residencesWithFormattedLocation } =
    await getTenantResidenciesService(request);

  // return a response
  return res.status(OK).json({
    success,
    message,
    residencesWithFormattedLocation,
  });
});

// add tenant favorite property
export const addTenantFavoriteProperty = catchAsyncError(async (req, res) => {
  const request: any = addTenantFavorite.parse(req.params);

  // use the service
  const { success, message, updateTenantFavorite } =
    await addTenantFavoriteService(request);

  // return a response
  return res.status(OK).json({
    success,
    message,
    updateTenantFavorite,
  });
});

// remove tenant favorite property
export const removeFromFavorite = catchAsyncError(async (req, res) => {
  const request: any = addTenantFavorite.parse(req.params);

  // use the service
  const { success, message, updatedTenantFavorite } =
    await removeFromFavoriteService(request);

  // return a response
  return res.status(OK).json({
    success,
    message,
    updatedTenantFavorite,
  });
});
