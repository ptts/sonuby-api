import * as semver from 'semver';
import { z } from 'zod';

/**
 * The environments that the client (iOS / Android app) can be in.
 */
export const ClientEnvSchema = z.enum([
  'production',
  'staging',
  'beta',
  'development',
  'testing',
]);
export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export const ClientPlatformSchema = z.enum(['ios', 'android']);
export type ClientPlatform = z.infer<typeof ClientPlatformSchema>;

export const ClientEntitlementSchema = z.enum(['free', 'enthusiast']);
export type ClientEntitlement = z.infer<typeof ClientEntitlementSchema>;

export const SemverSchema = z
  .string()
  .refine((value) => semver.valid(value) !== null, {
    message: 'Invalid version format. Must adhere to https://semver.org/',
  });
