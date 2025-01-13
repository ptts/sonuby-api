import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { firebaseAuthMiddleware } from '../../middlewares/firebase-auth';
import { createRouter } from '../../shared/helpers/create-router';
import { UserError } from '../../shared/user-error';

const CredentialType = {
  WeatherMaps: 'weather-maps',
  MareaTidesApi: 'marea-tides',
} as const;
type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];

const credentialsRouter = createRouter();

credentialsRouter.get(
  '/v1/credentials/:id',
  firebaseAuthMiddleware,
  zValidator('param', z.object({ id: z.nativeEnum(CredentialType) })),
  (c) => {
    const { id } = c.req.valid('param');

    switch (id) {
      case CredentialType.WeatherMaps: {
        return c.json({ mapsKey: c.env.METEOBLUE_MAPS_API_KEY });
      }
      case CredentialType.MareaTidesApi: {
        return c.json({ mareaTidesKey: c.env.MAREA_TIDES_API_KEY });
      }
      default: {
        id satisfies never;
        throw new UserError({
          status: 400,
        });
      }
    }
  },
);

export { credentialsRouter };
