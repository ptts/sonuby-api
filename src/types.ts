import type { getFirebaseToken } from '@hono/firebase-auth';
import type { PinoLogger } from 'hono-pino';
import type { RequestIdVariables } from 'hono/request-id';

type FirebaseToken = NonNullable<ReturnType<typeof getFirebaseToken>>;

type CloudflareBindingsWithOverrides = Omit<
  CloudflareBindings,
  'ENVIRONMENT'
> & {
  /**
   * Some types within CloudflareBindings are too strict
   * @see: https://github.com/cloudflare/workers-sdk/pull/5086
   * Make sure the values in here correspond to the values in wrangler.toml
   */
  ENVIRONMENT: 'production' | 'staging' | 'beta' | 'development';
};

export type AppEnv = {
  Bindings: CloudflareBindingsWithOverrides;
  Variables: RequestIdVariables & {
    logger: PinoLogger;
    firebaseToken?: FirebaseToken;
  };
};
