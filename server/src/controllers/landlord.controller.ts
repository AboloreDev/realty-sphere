import { OK } from "../constants/httpStatus";
import {
  createLandlordSchema,
  getLandlordSchema,
  updateLandlordSchema,
} from "../schema/landlord.schema";
import {
  createLandlordService,
  getLandlordPropertiesService,
  getLandlordService,
  updateLandlordService,
} from "../services/landlord.service";
import { catchAsyncError } from "../utils/catchAsyncErrors";

export const createLandlord = catchAsyncError(async (req, res) => {
  // VALIDATE THE REQUEST
  const request: any = createLandlordSchema.parse(req.body);
  // USE THE SERVICE
  const { landlord, message } = await createLandlordService(request);
  // RETURN THE RESPONSE
  return res.status(OK).json({
    success: true,
    message,
    landlord,
  });
});
export const getLandlord = catchAsyncError(async (req, res) => {
  // VALIDATE THE REQUEST
  const request: any = getLandlordSchema.parse(req.params);
  // USE THE SERVICE
  const { landlord, message } = await getLandlordService(request);
  // RETURN THE RESPONSE
  return res.status(OK).json({
    success: true,
    message,
    landlord,
  });
});

// update the landlord
export const updateLandlord = catchAsyncError(async (req, res) => {
  // VALIDATE THE REQUEST
  // get the landlord id
  const { id } = getLandlordSchema.parse(req.params);
  const { name, email } = updateLandlordSchema.parse(req.body);

  // USE THE SERVICE
  const { updatedLandlord, success, message } = await updateLandlordService({
    name,
    email,
    id,
  });
  // RETURN THE RESPONSE
  return res.status(OK).json({
    success,
    message,
    updatedLandlord,
  });
});

// GET landlordpROPERTY
export const getLandlordProperties = catchAsyncError(async (req, res) => {
  // validate the request
  const request: any = getLandlordSchema.parse(req.params);

  // use the service
  const { propertiesWithFormattedLocation } =
    await getLandlordPropertiesService(request);

  // return a response
  return res.status(OK).json(propertiesWithFormattedLocation);
});
