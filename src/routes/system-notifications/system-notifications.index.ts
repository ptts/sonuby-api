import { zValidator } from '@hono/zod-validator';
import * as semver from 'semver';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { SemverSchema } from '../../shared/schemas';

const systemNotificationsRouter = createRouter();

systemNotificationsRouter.get(
  '/v1/system_notifications',
  firebaseAuthMiddleware,
  zValidator(
    'query',
    z.object({
      platform: z.string(),
      client_env: z.string(),
      app_version: SemverSchema,
    }),
  ),
  (c) => {
    const { app_version: clientVersion } = c.req.valid('query');

    const isUpdateAvailable = semver.lt(
      c.env.CURRENT_APP_VERSION,
      clientVersion,
    );
    /** For now, this is always false */
    const isUpdateRequired = false;

    return c.json({
      update: {
        current_app_version: clientVersion,
        available: isUpdateAvailable,
        required: isUpdateRequired,
        show_app_store_link: c.env.ENVIRONMENT === 'production',
      },
    });
  },
);

export { systemNotificationsRouter };
