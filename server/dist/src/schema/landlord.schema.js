"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLandlordSchema = exports.createLandlordSchema = exports.getLandlordSchema = void 0;
const zod_1 = require("zod");
exports.getLandlordSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.createLandlordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    id: zod_1.z.string(),
});
exports.updateLandlordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
});
