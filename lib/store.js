// Supabase Postgres 에 메모를 저장/조회한다 (테이블: public.notes)
import { Pool } from 'pg';

const globalForPg = globalThis;

function pool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL 미설정');
  if (!globalForPg.__memoPool) {
    globalForPg.__memoPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
    });
  }
  return globalForPg.__memoPool;
}

export async function readNotes() {
  const { rows } = await pool().query(
    'select id, title, body, pinned, created_at, updated_at from public.notes order by updated_at desc'
  );
  return {
    notes: rows.map((r) => ({
      id: r.id,
      title: r.title || '',
      body: r.body || '',
      pinned: !!r.pinned,
      createdAt: Number(r.created_at) || 0,
      updatedAt: Number(r.updated_at) || 0,
    })),
  };
}

// 클라이언트가 보낸 전체 목록으로 테이블을 맞춘다
export async function writeNotes(notes) {
  const client = await pool().connect();
  try {
    await client.query('begin');
    const ids = notes.map((n) => String(n.id));
    for (const n of notes) {
      await client.query(
        `insert into public.notes (id, title, body, pinned, created_at, updated_at)
         values ($1,$2,$3,$4,$5,$6)
         on conflict (id) do update set
           title = excluded.title,
           body = excluded.body,
           pinned = excluded.pinned,
           updated_at = excluded.updated_at`,
        [
          String(n.id),
          n.title || '',
          n.body || '',
          !!n.pinned,
          n.createdAt || Date.now(),
          n.updatedAt || Date.now(),
        ]
      );
    }
    if (ids.length) {
      await client.query('delete from public.notes where not (id = any($1::text[]))', [ids]);
    } else {
      await client.query('delete from public.notes');
    }
    await client.query('commit');
    return true;
  } catch (e) {
    await client.query('rollback').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
