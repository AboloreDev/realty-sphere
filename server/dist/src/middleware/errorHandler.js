"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const zod_1 = require("zod");
const appError_1 = __importDefault(require("../utils/appError"));
// handleZodError handles Zod validation errors and sends a structured response
// with the error details.
const handleZodError = (res, error) => {
    const errors = error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
    }));
    res.status(httpStatus_1.BAD_REQUEST).json({
        success: false,
        message: error.message,
        errors,
    });
};
//  handleAppError handles custom application errors and sends a structured
// response with the error details, including status code and error code.
const handleAppError = (res, error) => {
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
const errorHandler = (error, req, res, next) => {
    console.log(`PATH: ${req.path}`, error);
    if (error instanceof zod_1.z.ZodError) {
        handleZodError(res, error);
        return;
    }
    if (error instanceof appError_1.default) {
        return handleAppError(res, error);
    }
    res.status(httpStatus_1.INTRENAL_SERVER_ERROR).send("Internal Server Error");
};
exports.errorHandler = errorHandler;
