import { z } from 'zod';
import { ApiType } from './enums';

export const DataPackagesV1PayloadSchema = z.object({
  type: z.literal(ApiType.MeteoblueDataPackages),
  packages: z.array(z.string()),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    aboveSeaLevel: z.number(),
    timezone: z.string().min(1),
  }),
  units: z.object({
    temperature: z.string(),
    windSpeed: z.string(),
    precipitationAmount: z.string(),
    windDirection: z.string(),
  }),
});

export const DataPackagesV13PayloadSchema = DataPackagesV1PayloadSchema.extend({
  forecastDays: z.number().min(0).optional(),
});

export const WarningsForLocationV1PayloadSchema = z.object({
  type: z.literal(ApiType.MeteoblueWarningsForLocation),
  latitude: z.number(),
  longitude: z.number(),
});

export const WarningsInfoV1PayloadSchema = z.object({
  type: z.literal(ApiType.MeteoblueWarningsInfo),
  id: z.string(),
});

export const SignApiV1PayloadSchema = z.discriminatedUnion('type', [
  DataPackagesV1PayloadSchema,
  WarningsForLocationV1PayloadSchema,
  WarningsInfoV1PayloadSchema,
]);

export const SignApiV13PayloadSchema = z.discriminatedUnion('type', [
  DataPackagesV13PayloadSchema,
  WarningsForLocationV1PayloadSchema,
  WarningsInfoV1PayloadSchema,
]);
