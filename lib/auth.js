import crypto from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'memo_auth';

export function token() {
  const secret = process.env.APP_PASSWORD || '';
  return crypto.createHash('sha256').update(`memo::${secret}`).digest('hex');
}

export function isAuthed() {
  return cookies().get(COOKIE)?.value === token();
}
