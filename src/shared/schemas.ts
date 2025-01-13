import { z } from 'zod';

/**
 * The environments that the client (iOS / Android app) can be in.
 */
export const ClientEnvSchema = z.union([
  z.literal('production'),
  z.literal('staging'),
  z.literal('beta'),
  z.literal('development'),
]);
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export const ClientPlatformSchema = z.union([
  z.literal('ios'),
  z.literal('android'),
]);
export type ClientPlatform = z.infer<typeof ClientPlatformSchema>;
