import { z } from "zod";

export const getLandlordSchema = z.object({
  id: z.string(),
});

export const createLandlordSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  id: z.string(),
});

export const updateLandlordSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});
