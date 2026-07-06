// Node-side admin auth helpers for API routes.
import crypto from 'crypto';
import { verifySessionToken } from './adminSession';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

// Returns the session payload ({email, role}) or null.
// role: 'staff' allows both roles; 'owner' requires owner.
export async function requireAdmin(request, role = 'staff') {
  const token = request.cookies.get('admin_session')?.value;
  const session = await verifySessionToken(token);
  if (!session) return null;
  if (role === 'owner' && session.role !== 'owner') return null;
  return session;
}
