import { zValidator } from '@hono/zod-validator';
import { createRouter } from '../../shared/helpers/create-router';
import { UserError } from '../../shared/user-error';
import { ApiType } from './enums';
import { getMeteoblueCredentials } from './helpers/get-meteoblue-credentials';
import {
  buildMeteoblueDataPackagesUrlV1,
  buildMeteoblueDataPackagesUrlV13,
  buildMeteoblueWarningInfoUrlV1,
  buildMeteoblueWarningsForLocationUrlV1,
} from './helpers/meteoblue-url-builder';
import { SignApiV13PayloadSchema, SignApiV1PayloadSchema } from './schemas';

const signRouter = createRouter();

signRouter.post(
  '/v1/sign',
  zValidator('json', SignApiV1PayloadSchema),
  async (c) => {
    const payload = c.req.valid('json');
    const credentials = getMeteoblueCredentials(c);

    const apiType = payload.type;
    switch (apiType) {
      case ApiType.MeteoblueDataPackages: {
        const url = await buildMeteoblueDataPackagesUrlV1({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      case ApiType.MeteoblueWarningsForLocation: {
        const url = await buildMeteoblueWarningsForLocationUrlV1({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      case ApiType.MeteoblueWarningsInfo: {
        const url = await buildMeteoblueWarningInfoUrlV1({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      default: {
        apiType satisfies never;
        throw new UserError({
          status: 400,
        });
      }
    }
  },
);

signRouter.post(
  '/v1.3/sign',
  zValidator('json', SignApiV13PayloadSchema),
  async (c) => {
    const payload = c.req.valid('json');
    const credentials = getMeteoblueCredentials(c);

    const apiType = payload.type;
    switch (apiType) {
      case ApiType.MeteoblueDataPackages: {
        const url = await buildMeteoblueDataPackagesUrlV13({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      case ApiType.MeteoblueWarningsForLocation: {
        const url = await buildMeteoblueWarningsForLocationUrlV1({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      case ApiType.MeteoblueWarningsInfo: {
        const url = await buildMeteoblueWarningInfoUrlV1({
          payload,
          credentials,
        });
        return c.json({ type: apiType, url });
      }
      default: {
        apiType satisfies never;
        throw new UserError({
          status: 400,
        });
      }
    }
  },
);

export { signRouter };
