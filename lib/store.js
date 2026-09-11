// Supabase(PostgREST)에 메모를 저장/조회한다. 테이블: notes
const URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = process.env.SUPABASE_TABLE || 'notes';

const rest = (path, init = {}) =>
  fetch(`${URL}/rest/v1/${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

async function ok(res, what) {
  if (!res.ok) throw new Error(`Supabase ${what} 실패: ${res.status} ${await res.text()}`);
  return res;
}

export async function readNotes() {
  if (!URL || !KEY) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정');
  const res = await ok(
    await rest(`${TABLE}?select=*&order=updated_at.desc`),
    'read'
  );
  const rows = await res.json();
  const notes = rows.map((r) => ({
    id: r.id,
    title: r.title || '',
    body: r.body || '',
    pinned: !!r.pinned,
    createdAt: Number(r.created_at) || 0,
    updatedAt: Number(r.updated_at) || 0,
  }));
  return { notes };
}

// 클라이언트가 보낸 전체 목록으로 테이블을 맞춘다 (upsert + 빠진 건 삭제)
export async function writeNotes(notes) {
  if (!URL || !KEY) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 미설정');
  const rows = notes.map((n) => ({
    id: String(n.id),
    title: n.title || '',
    body: n.body || '',
    pinned: !!n.pinned,
    created_at: n.createdAt || Date.now(),
    updated_at: n.updatedAt || Date.now(),
  }));

  if (rows.length) {
    await ok(
      await rest(TABLE, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rows),
      }),
      'upsert'
    );
    const keep = rows.map((r) => `"${r.id}"`).join(',');
    await ok(
      await rest(`${TABLE}?id=not.in.(${keep})`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      }),
      'delete'
    );
  } else {
    await ok(
      await rest(`${TABLE}?id=neq.__none__`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      }),
      'delete-all'
    );
  }
  return true;
}
