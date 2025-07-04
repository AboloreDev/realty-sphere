import { OK } from "../constants/httpStatus";
import {
  createTenantSchema,
  getTenantSchema,
  updateTenantSchema,
} from "../schema/tenant.schema";
import {
  createTenantService,
  getTenantById,
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
  return res.status(OK).json({
    success: true,
    message,
    tenant,
  });
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
