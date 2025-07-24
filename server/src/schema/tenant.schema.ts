import { z } from "zod";

export const getTenantSchema = z.object({
  id: z.string(),
});

export const createTenantSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  id: z.string(),
});

export const updateTenantSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export const addTenantFavorite = z.object({
  id: z.string(),
  propertyId: z.coerce.number(),
});
