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

export const buildMeteoblueDataPackagesUrlV1 = async ({
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

export const buildMeteoblueDataPackagesUrlV13 = async ({
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

export const buildMeteoblueWarningsForLocationUrlV1 = async ({
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

export const buildMeteoblueWarningInfoUrlV1 = async ({
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
