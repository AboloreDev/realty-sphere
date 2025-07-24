"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addTenantFavorite = exports.updateTenantSchema = exports.createTenantSchema = exports.getTenantSchema = void 0;
const zod_1 = require("zod");
exports.getTenantSchema = zod_1.z.object({
    id: zod_1.z.string(),
});
exports.createTenantSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
    id: zod_1.z.string(),
});
exports.updateTenantSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string(),
});
exports.addTenantFavorite = zod_1.z.object({
    id: zod_1.z.string(),
    propertyId: zod_1.z.coerce.number(),
});
