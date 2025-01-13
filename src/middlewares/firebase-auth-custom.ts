import { createMiddleware } from 'hono/factory';
import type { AppEnv } from '../types';

import * as jose from 'jose';
import { UserError } from '../shared/user-error';

type GoogleJSONWebKeySet = {
  keys: {
    use: string;
    kty: string;
    kid: string;
    alg: string;
    e: string;
    n: string;
  }[];
};

export const verifyFirebaseRequest = async ({
  request,
  firebaseProjectId,
  jwks,
}: {
  request: Request;
  firebaseProjectId: string;
  jwks: GoogleJSONWebKeySet;
}) => {
  const authorizationHeader = request.headers.get('Authorization');
  const jwt = authorizationHeader?.replace(/Bearer\s+/i, '') ?? undefined;

  if (!jwt) {
    throw new UserError({
      status: 401,
      message: 'Authorization header or token is missing',
    });
  }

  try {
    const result = await jose.jwtVerify(jwt, jose.createLocalJWKSet(jwks), {
      // Ref.: https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
      algorithms: ['RS256'],
      audience: firebaseProjectId,
      issuer: `https://securetoken.google.com/${firebaseProjectId}`,
    });

    const subject = result.payload.sub;

    // Must be a non-empty string and must be the UID of the user or device.
    if (!subject || typeof subject !== 'string') {
      throw new UserError({
        status: 403,
        message: 'Invalid auth token',
        cause: new Error(
          'Failed to validate Firebase JWT: Payload "sub" is missing or invalid',
        ),
      });
    }

    return {
      ...result.payload,
      sub: subject,
    };
  } catch (error) {
    throw new UserError({
      status: 403,
      message: 'Invalid auth token',
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
};

export const getRemoteGoogleJwks = async () => {
  const response = await fetch(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch JWKS: ${response.status.toString()} ${response.statusText}`,
    );
  }

  const data = await response.json<GoogleJSONWebKeySet>();
  const cacheControlHeader = response.headers.get('Cache-Control');
  const maxAgeMatch = cacheControlHeader?.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? Number.parseInt(maxAgeMatch[1], 10) : undefined;

  if (maxAge === undefined || Number.isNaN(maxAge)) {
    throw new Error('Invalid or missing Cache-Control max-age');
  }

  const expiresAt = Date.now() + maxAge * 1000;
  return { keys: data.keys, expiresAt };
};

const getJwks = async (kv: AppEnv['Bindings']['AUTHENTICATION_KV']) => {
  type KVGoogleJwks = {
    keys: Awaited<ReturnType<typeof getRemoteGoogleJwks>>['keys'];
  };
  const KEY = 'firebase-jwks';

  const cachedJwks = await kv.get<KVGoogleJwks>(KEY, 'json');

  if (cachedJwks === null) {
    const jwks = await getRemoteGoogleJwks();
    await kv.put(
      KEY,
      JSON.stringify({ keys: jwks.keys } satisfies KVGoogleJwks),
      {
        expiration: jwks.expiresAt,
      },
    );
    return jwks;
  }

  return cachedJwks;
};

export const customFirebaseAuthMiddleware = createMiddleware<
  AppEnv & {
    Variables: {
      firebaseUserId: string;
    };
  }
>(async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    const TEST_USER_ID = 'development';
    c.var.logger.info(
      'Running in development mode, skipping Firebase authentication',
    );

    c.set('firebaseUserId', TEST_USER_ID);
    return next();
  }

  const jwks = await getJwks(c.env.AUTHENTICATION_KV);
  /** This will throw if the user is not authenticated */
  const token = await verifyFirebaseRequest({
    request: c.req.raw,
    firebaseProjectId: c.env.FIREBASE_PROJECT_ID,
    jwks,
  });
  c.set('firebaseUserId', token.sub);

  await next();
});
