import type { AppContext } from '../../../app';
import { UserError } from '../../../shared/user-error';

export type MeteoblueCredentials = {
  meteoblueApiKey: string;
  meteoblueApiSharedSecret: string | undefined;
  meteoblueMapsApiKey: string;
};

export const getMeteoblueCredentials = (
  c: AppContext,
): MeteoblueCredentials => {
  const meteoblueApiKey = c.env.METEOBLUE_API_KEY;
  const meteoblueApiSharedSecret = c.env.METEOBLUE_SHARED_SECRET;
  const meteoblueMapsApiKey = c.env.METEOBLUE_MAPS_API_KEY;

  if (!meteoblueApiKey || !meteoblueMapsApiKey) {
    throw new UserError({
      status: 500,
      cause: new Error('Missing Meteoblue API key or Meteoblue Maps API key'),
    });
  }

  return {
    meteoblueApiKey,
    meteoblueApiSharedSecret,
    meteoblueMapsApiKey,
  };
};
