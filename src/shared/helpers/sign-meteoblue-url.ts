/**
 * @see https://docs.meteoblue.com/en/weather-apis/introduction/overview#signing-api-calls
 * @returns the signed URL as a string
 */
export const signMeteoblueUrl = async ({
  url,
  sharedSecret,
  expireInMinutes = 10,
}: {
  url: URL;
  sharedSecret: string;
  expireInMinutes?: number;
}) => {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + expireInMinutes * 60;

  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(sharedSecret);
  const key = await crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const dataToSign = `${url.pathname}?${url.searchParams.toString()}&expires=${expiresAt.toString()}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign),
  );
  const hexEncodedSignature = [...new Uint8Array(signature)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const signedUrl = new URL(
    `${dataToSign}&sig=${hexEncodedSignature}`,
    url.origin,
  ).toString();

  return signedUrl;
};
