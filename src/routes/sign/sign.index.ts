import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { METEOBLUE_API_BASE_URL } from '../../shared/constants';
import { createRouter } from '../../shared/helpers/create-router';
import { signMeteoblueUrl } from '../../shared/helpers/sign-meteoblue-url';
import { UserError } from '../../shared/user-error';
import {
  getMeteoblueCredentials,
  type MeteoblueCredentials,
} from './helpers/get-meteoblue-credentials';

export enum ApiType {
  MeteoblueDataPackages = 'meteoblue_data_packages',
  MeteoblueWarningsForLocation = 'meteoblue_weather_warnings_for_location',
  MeteoblueWarningsInfo = 'meteoblue_weather_warnings_info',
  Foo = 'foo',
}

const DataPackagesV1PayloadSchema = z.object({
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

const DataPackagesV13PayloadSchema = DataPackagesV1PayloadSchema.extend({
  forecastDays: z.number().min(0).optional(),
});

const WarningsForLocationV1PayloadSchema = z.object({
  type: z.literal(ApiType.MeteoblueWarningsForLocation),
  latitude: z.number(),
  longitude: z.number(),
});

const WarningsInfoV1PayloadSchema = z.object({
  type: z.literal(ApiType.MeteoblueWarningsInfo),
  id: z.string(),
});

const SignApiV1PayloadSchema = z.discriminatedUnion('type', [
  DataPackagesV1PayloadSchema,
  WarningsForLocationV1PayloadSchema,
  WarningsInfoV1PayloadSchema,
]);

const SignApiV13PayloadSchema = z.discriminatedUnion('type', [
  DataPackagesV13PayloadSchema,
  WarningsForLocationV1PayloadSchema,
  WarningsInfoV1PayloadSchema,
]);

const buildMeteoblueDataPackagesUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof DataPackagesV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { packages, location, units } = payload;
  const { meteoblueApiKey, meteoblueApiSharedSecret } = credentials;

  const url = new URL(`packages/${packages.join('_')}`, METEOBLUE_API_BASE_URL);
  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lon: location.longitude.toString(),
    asl: location.aboveSeaLevel.toString(),
    tz: location.timezone,
    temperature: units.temperature,
    windspeed: units.windSpeed,
    precipitationamount: units.precipitationAmount,
    winddirection: units.windDirection,
    history_days: '0',
    forecast_days: '7',
    apikey: meteoblueApiKey,
  });
  url.search = params.toString();

  /**
   * Currently, the Meteoblue API does not require signing the URL
   * in `development` or `testing` environments.
   */
  if (meteoblueApiSharedSecret) {
    const signedUrl = await signMeteoblueUrl({
      url,
      sharedSecret: meteoblueApiSharedSecret,
    });
    return signedUrl;
  }

  return url.toString();
};

const buildMeteoblueDataPackagesUrlV13 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof DataPackagesV13PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { packages, location, units, forecastDays } = payload;
  const { meteoblueApiKey, meteoblueApiSharedSecret } = credentials;

  const url = new URL(
    `packagesV2/${packages.join('_')}`,
    METEOBLUE_API_BASE_URL,
  );
  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lon: location.longitude.toString(),
    asl: location.aboveSeaLevel.toString(),
    tz: location.timezone,
    temperature: units.temperature,
    windspeed: units.windSpeed,
    precipitationamount: units.precipitationAmount,
    winddirection: units.windDirection,
    history_days: '0',
    forecast_days: forecastDays?.toString() ?? '7',
    apikey: meteoblueApiKey,
  });
  url.search = params.toString();

  /**
   * Currently, the Meteoblue API does not require signing the URL
   * in `development` or `testing` environments.
   */
  if (meteoblueApiSharedSecret) {
    const signedUrl = await signMeteoblueUrl({
      url,
      sharedSecret: meteoblueApiSharedSecret,
    });
    return signedUrl;
  }

  return url.toString();
};

const buildMeteoblueWarningsForLocationUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof WarningsForLocationV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { latitude, longitude } = payload;
  const { meteoblueApiKey, meteoblueApiSharedSecret } = credentials;

  const url = new URL('warnings/list', METEOBLUE_API_BASE_URL);
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lon: longitude.toString(),
    apikey: meteoblueApiKey,
  });
  url.search = params.toString();

  /**
   * Currently, the Meteoblue API does not require signing the URL
   * in `development` or `testing` environments.
   */
  if (meteoblueApiSharedSecret) {
    const signedUrl = await signMeteoblueUrl({
      url,
      sharedSecret: meteoblueApiSharedSecret,
    });
    return signedUrl;
  }
  return url.toString();
};

const buildMeteoblueWarningInfoUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof WarningsInfoV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { id } = payload;
  const { meteoblueApiKey, meteoblueApiSharedSecret } = credentials;

  const url = new URL('warnings/select', METEOBLUE_API_BASE_URL);
  const params = new URLSearchParams({
    id,
    apikey: meteoblueApiKey,
  });
  url.search = params.toString();

  /**
   * Currently, the Meteoblue API does not require signing the URL
   * in `development` or `testing` environments.
   */
  if (meteoblueApiSharedSecret) {
    const signedUrl = await signMeteoblueUrl({
      url,
      sharedSecret: meteoblueApiSharedSecret,
    });
    return signedUrl;
  }
  return url.toString();
};

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
