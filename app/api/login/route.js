import { NextResponse } from 'next/server';
import { COOKIE, token } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.APP_PASSWORD) {
    return NextResponse.json({ error: 'APP_PASSWORD 미설정' }, { status: 500 });
  }
  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: '비밀번호가 틀렸어요' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { path: '/', maxAge: 0 });
  return res;
}
