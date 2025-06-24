import { ErrorRequestHandler, Request, Response } from "express";
import { BAD_REQUEST, INTRENAL_SERVER_ERROR } from "../constants/httpStatus";
import { z } from "zod";
import AppError from "../utils/appError";

// handleZodError handles Zod validation errors and sends a structured response
// with the error details.
const handleZodError = (res: Response, error: z.ZodError) => {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  res.status(BAD_REQUEST).json({
    success: false,
    message: error.message,
    errors,
  });
};

//  handleAppError handles custom application errors and sends a structured
// response with the error details, including status code and error code.
const handleAppError = (res: Response, error: AppError) => {
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errorCode: error.errorCode,
  });
};

//  errorHandler is an Express middleware that catches errors thrown in the application.
// It checks if the error is a Zod validation error or a custom AppError,
// and handles them accordingly. If the error is not recognized, it sends a generic
// "Internal Server Error" response.
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(`PATH: ${req.path}`, error);

  if (error instanceof z.ZodError) {
    handleZodError(res, error);
    return;
  }

  if (error instanceof AppError) {
    return handleAppError(res, error);
  }
  res.status(INTRENAL_SERVER_ERROR).send("Internal Server Error");
};
