// Signed admin session tokens. Edge-safe (Web Crypto only) so middleware can verify.
// Token format: base64url(payloadJson).base64url(hmacSha256(payloadJson))

const SECRET = () => process.env.ADMIN_SECRET_TOKEN || '';

function b64url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(SECRET()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

export async function createSessionToken({ email, role }, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const payload = JSON.stringify({ email, role, exp: Date.now() + maxAgeSeconds * 1000 });
  const sig = await hmac(payload);
  return `${b64url(new TextEncoder().encode(payload))}.${b64url(sig)}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes('.') || !SECRET()) return null;
  try {
    const [payloadB64, sigB64] = token.split('.');
    const payloadJson = new TextDecoder().decode(b64urlDecode(payloadB64));
    const expected = await hmac(payloadJson);
    const given = new Uint8Array(b64urlDecode(sigB64));
    if (expected.length !== given.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ given[i];
    if (diff !== 0) return null;
    const payload = JSON.parse(payloadJson);
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (!['owner', 'staff'].includes(payload.role)) return null;
    return payload;
  } catch {
    return null;
  }
}
