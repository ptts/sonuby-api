import { describe, expect, it } from 'vitest';
import { signMeteoblueUrl } from './sign-meteoblue-url';

describe('signMeteoblueUrl', () => {
  const mockUrl = new URL('https://my.meteoblue.com/weather/v1/forecast');
  const sharedSecret = 'test-secret';

  it('should return a valid signed URL', async () => {
    const signedUrl = await signMeteoblueUrl({ url: mockUrl, sharedSecret });
    const urlObject = new URL(signedUrl);

    expect(urlObject.searchParams.has('expires')).toBe(true);
    expect(urlObject.searchParams.has('sig')).toBe(true);
  });

  it('should include the correct expiration timestamp', async () => {
    const expireInMinutes = 5;
    const now = Math.floor(Date.now() / 1000);
    const signedUrl = await signMeteoblueUrl({
      url: mockUrl,
      sharedSecret,
      expireInMinutes,
    });

    const expiresParam = Number.parseInt(
      new URL(signedUrl).searchParams.get('expires') ?? '',
      10,
    );
    expect(expiresParam).toBeGreaterThanOrEqual(now + expireInMinutes * 60 - 1);
    expect(expiresParam).toBeLessThanOrEqual(now + expireInMinutes * 60 + 1);
  });

  it('should handle URLs without query parameters correctly', async () => {
    const urlWithoutQuery = new URL(
      'https://my.meteoblue.com/weather/v1/forecast',
    );
    const signedUrl = await signMeteoblueUrl({
      url: urlWithoutQuery,
      sharedSecret,
    });
    const urlObject = new URL(signedUrl);

    expect(urlObject.searchParams.has('expires')).toBe(true);
    expect(urlObject.searchParams.has('sig')).toBe(true);
  });

  it('should throw an error if sharedSecret is empty', async () => {
    await expect(
      signMeteoblueUrl({ url: mockUrl, sharedSecret: '' }),
    ).rejects.toThrow();
  });
});
