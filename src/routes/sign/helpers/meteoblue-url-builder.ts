import type { z } from 'zod';
import { METEOBLUE_API_BASE_URL } from '../../../shared/constants';
import { signMeteoblueUrl } from '../../../shared/helpers/sign-meteoblue-url';
import type {
  DataPackagesV13PayloadSchema,
  DataPackagesV1PayloadSchema,
  WarningsForLocationV1PayloadSchema,
  WarningsInfoV1PayloadSchema,
} from '../schemas';
import type { MeteoblueCredentials } from './get-meteoblue-credentials';

/**
 * Utility function to build a signed or unsigned URL.
 */
const buildMeteoblueUrl = async ({
  path,
  credentials,
  searchParams = {},
}: {
  path: string;
  credentials: MeteoblueCredentials;
  searchParams?: Record<string, string | undefined>;
}): Promise<string> => {
  const { meteoblueApiSharedSecret } = credentials;
  const url = new URL(path, METEOBLUE_API_BASE_URL);

  /** Remove properties with undefined values */
  const filteredParams = Object.fromEntries(
    Object.entries(searchParams).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;

  url.search = new URLSearchParams({
    ...filteredParams,
    apikey: credentials.meteoblueApiKey,
  }).toString();

  /**
   * Only sign the URL if a shared secret is provided.
   * Depending on the environment (e.g. in development) the shared secret
   * is not needed and therefore not provided.
   */
  if (meteoblueApiSharedSecret) {
    return await signMeteoblueUrl({
      url,
      sharedSecret: meteoblueApiSharedSecret,
    });
  }

  return url.toString();
};

export const buildMeteoblueDataPackagesUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof DataPackagesV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { packages, location, units } = payload;

  return buildMeteoblueUrl({
    path: `packages/${packages.join('_')}`,
    searchParams: {
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
      apikey: credentials.meteoblueApiKey,
    },
    credentials,
  });
};

export const buildMeteoblueDataPackagesUrlV13 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof DataPackagesV13PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { packages, location, units, forecastDays } = payload;

  return buildMeteoblueUrl({
    path: `packagesV2/${packages.join('_')}`,
    searchParams: {
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
    },
    credentials,
  });
};

export const buildMeteoblueWarningsForLocationUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof WarningsForLocationV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { latitude, longitude } = payload;

  return buildMeteoblueUrl({
    path: 'warnings/list',
    searchParams: {
      lat: latitude.toString(),
      lon: longitude.toString(),
    },
    credentials,
  });
};

export const buildMeteoblueWarningInfoUrlV1 = async ({
  payload,
  credentials,
}: {
  payload: z.infer<typeof WarningsInfoV1PayloadSchema>;
  credentials: MeteoblueCredentials;
}) => {
  const { id } = payload;

  return buildMeteoblueUrl({
    path: 'warnings/select',
    searchParams: {
      id,
    },
    credentials,
  });
};
