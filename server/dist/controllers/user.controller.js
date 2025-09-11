"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = void 0;
const httpStatus_1 = require("../constants/httpStatus");
const prismaClient_1 = __importDefault(require("../prismaClient"));
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
exports.getUserProfile = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // get the user
    const user = yield prismaClient_1.default.user.findUnique({
        // @ts-ignore
        where: { id: req.user.id },
    });
    // asserts if there is no user found
    (0, appAssert_1.default)(user, httpStatus_1.NOT_FOUND, "user not found");
    // return the response
    res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        },
    });
}));
