import { env } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';
import { app } from '../../app';
import { METEOBLUE_API_BASE_URL } from '../../shared/constants';

describe('/v1/sign', () => {
  it('should return a valid signed URL for DataPackages', async () => {
    const res = await app.request(
      '/v1/sign',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meteoblue_data_packages',
          packages: ['package1', 'package2'],
          location: {
            latitude: 47.3769,
            longitude: 8.5417,
            aboveSeaLevel: 500,
            timezone: 'Europe/Zurich',
          },
          units: {
            temperature: 'C',
            windSpeed: 'km/h',
            precipitationAmount: 'mm',
            windDirection: 'deg',
          },
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json<Record<string, unknown>>();

    expect(body.type).toBe('meteoblue_data_packages');
    expect(body.url).toContain(METEOBLUE_API_BASE_URL);
    expect(body.url).toContain('packages/package1_package2');
  });

  it('should return a valid signed URL for WarningsForLocation', async () => {
    const res = await app.request(
      '/v1/sign',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meteoblue_weather_warnings_for_location',
          latitude: 47.3769,
          longitude: 8.5417,
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json<Record<string, unknown>>();

    expect(body.type).toBe('meteoblue_weather_warnings_for_location');
    expect(body.url).toContain(METEOBLUE_API_BASE_URL);
    expect(body.url).toContain('warnings/list');
    expect(body.url).toContain('lat=47.3769');
    expect(body.url).toContain('lon=8.5417');
  });

  it('should return a valid signed URL for WarningsInfo', async () => {
    const res = await app.request(
      '/v1/sign',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meteoblue_weather_warnings_info',
          id: 'test-warning-id',
        }),
      },
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json<Record<string, unknown>>();

    expect(body.type).toBe('meteoblue_weather_warnings_info');
    expect(body.url).toContain(METEOBLUE_API_BASE_URL);
    expect(body.url).toContain('warnings/select');
    expect(body.url).toContain('id=test-warning-id');
  });

  it('should return 400 for an invalid payload', async () => {
    const res = await app.request(
      '/v1/sign',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'meteoblue_data_packages',
          invalidKey: 'value',
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });

  it('should return 400 for an unsupported API type', async () => {
    const res = await app.request(
      '/v1/sign',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unsupported_type',
        }),
      },
      env,
    );

    expect(res.status).toBe(400);
  });
});
