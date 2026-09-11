import { NextResponse } from 'next/server';
import { isAuthed } from '../../../lib/auth';
import { readNotes, writeNotes } from '../../../lib/store';

export const dynamic = 'force-dynamic';

const deny = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });

export async function GET() {
  if (!isAuthed()) return deny();
  try {
    const { notes } = await readNotes();
    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}

// 전체 목록을 통째로 저장 (작성/수정/삭제/핀 모두 여기로)
export async function PUT(req) {
  if (!isAuthed()) return deny();
  try {
    const body = await req.json();
    const incoming = Array.isArray(body.notes) ? body.notes : [];
    await writeNotes(incoming);
    return NextResponse.json({ ok: true, notes: incoming });
  } catch (e) {
    return NextResponse.json({ error: String(e.message || e) }, { status: 500 });
  }
}
