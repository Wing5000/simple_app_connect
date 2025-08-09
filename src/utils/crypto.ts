import crypto from 'node:crypto';

export function maybeEncryptResponse<T>(payload: T, publicKeyPem = process.env.RESPONSE_ENCRYPTION_PUBLIC_KEY) {
  if (!publicKeyPem) return payload;
  const buf = Buffer.from(JSON.stringify(payload), 'utf8');
  const enc = crypto.publicEncrypt({ key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING }, buf);
  return { data: enc.toString('base64') } as unknown as T;
}
