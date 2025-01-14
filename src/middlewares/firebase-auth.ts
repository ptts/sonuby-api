import {
  type VerifyFirebaseAuthConfig,
  type VerifyFirebaseAuthEnv,
  getFirebaseToken,
  verifyFirebaseAuth,
} from '@hono/firebase-auth';
import { createMiddleware } from 'hono/factory';
import { UserError } from '../shared/user-error';
import type { AppEnv } from '../types';

type KeyStorer = {
  get<ExpectedValue = unknown>(): Promise<ExpectedValue | null>;
  put(value: string, expirationTtl: number): Promise<void>;
};

type FirebaseToken = NonNullable<ReturnType<typeof getFirebaseToken>>;

export const firebaseAuthMiddleware = createMiddleware<
  AppEnv & {
    Bindings: VerifyFirebaseAuthEnv;
    Variables: { firebaseToken: FirebaseToken };
  }
>(async (c, next) => {
  if (c.env.ENVIRONMENT === 'development') {
    c.var.logger.info({
      message: 'Running in development mode, skipping Firebase authentication',
    });

    const TEST_USER_ID = 'dev-user-12345';
    const now = Math.floor(Date.now() / 1000);
    const demoToken: FirebaseToken = {
      aud: c.env.FIREBASE_PROJECT_ID,
      iss: `https://securetoken.google.com/${c.env.FIREBASE_PROJECT_ID}`,
      auth_time: now,
      exp: now + 3600,
      firebase: {
        identities: {
          email: ['testuser@example.com'],
        },
        sign_in_provider: 'custom',
      },
      iat: now,
      sub: TEST_USER_ID,
      uid: TEST_USER_ID,
    };

    c.set('firebaseToken', demoToken);
    return next();
  }

  const keyStore: KeyStorer = {
    get: async () => c.env.AUTHENTICATION_KV.get('firebase-jwks', 'json'),
    put: async (value, expirationTtl) =>
      c.env.AUTHENTICATION_KV.put('firebase-jwks', value, { expirationTtl }),
  };
  const config: VerifyFirebaseAuthConfig = {
    projectId: c.env.FIREBASE_PROJECT_ID,
    keyStore,
  };

  try {
    await verifyFirebaseAuth(config)(c, next);
    const token = getFirebaseToken(c);
    if (!token) {
      throw new Error('Firebase token not found');
    }
    c.set('firebaseToken', token);
  } catch (error) {
    throw new UserError({ status: 401, message: 'Unauthorized', cause: error });
  }

  await next();
});
