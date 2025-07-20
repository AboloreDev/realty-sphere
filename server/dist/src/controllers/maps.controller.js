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
exports.handleLocationFetch = void 0;
const axios_1 = __importDefault(require("axios"));
const httpStatus_1 = require("../constants/httpStatus");
const appAssert_1 = __importDefault(require("../utils/appAssert"));
const catchAsyncErrors_1 = require("../utils/catchAsyncErrors");
exports.handleLocationFetch = (0, catchAsyncErrors_1.catchAsyncError)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.query;
    if (!query) {
        (0, appAssert_1.default)(false, httpStatus_1.BAD_REQUEST, "Query is required");
    }
    const response = yield axios_1.default.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(String(query))}&format=json&limit=1`, {
        headers: {
            // Nominatim requires a User-Agent identifying your app
            "User-Agent": "Nestora/1.0 (alabiabolore4@gmail.com)",
        },
    });
    const data = response.data;
    if (data.length === 0) {
        (0, appAssert_1.default)(false, httpStatus_1.NOT_FOUND, "Location not found");
    }
    const { lat, lon } = data[0];
    return res.status(200).json({
        success: true,
        data: {
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
        },
    });
}));
