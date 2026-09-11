'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const fmt = (ts) => {
  const d = new Date(ts);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default function Page() {
  const [stage, setStage] = useState('loading'); // loading | login | app
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [notes, setNotes] = useState([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('updated');
  const [editing, setEditing] = useState(null); // {id,title,body}
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('light');
  const timer = useRef(null);

  useEffect(() => {
    const t = localStorage.getItem('memo-theme') || 'light';
    setTheme(t);
    document.documentElement.dataset.theme = t;
    load();
  }, []);

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    setTheme(t);
    localStorage.setItem('memo-theme', t);
    document.documentElement.dataset.theme = t;
  };

  async function load() {
    const res = await fetch('/api/notes', { cache: 'no-store' });
    if (res.status === 401) return setStage('login');
    const j = await res.json();
    if (!res.ok) {
      setErr(j.error || '불러오기 실패');
      return setStage('app');
    }
    setNotes(j.notes || []);
    setStage('app');
  }

  async function login(e) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(j.error || '로그인 실패');
    setPw('');
    setStage('loading');
    load();
  }

  async function logout() {
    await fetch('/api/login', { method: 'DELETE' });
    setNotes([]);
    setStage('login');
  }

  // 목록을 통째로 저장 (연타 방지용 디바운스)
  function persist(next) {
    setNotes(next);
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/notes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: next }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErr(j.error || '저장 실패');
        } else setErr('');
      } catch (e) {
        setErr('저장 실패: ' + e.message);
      } finally {
        setSaving(false);
      }
    }, 600);
  }

  function saveEditor() {
    const { id, title, body } = editing;
    if (!title.trim() && !body.trim()) return setEditing(null);
    const now = Date.now();
    let next;
    if (id) {
      next = notes.map((n) => (n.id === id ? { ...n, title, body, updatedAt: now } : n));
    } else {
      next = [{ id: uid(), title, body, pinned: false, createdAt: now, updatedAt: now }, ...notes];
    }
    persist(next);
    setEditing(null);
  }

  const remove = (id) => {
    if (!confirm('이 메모를 삭제할까요?')) return;
    persist(notes.filter((n) => n.id !== id));
  };
  const togglePin = (id) =>
    persist(notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const view = useMemo(() => {
    const kw = q.trim().toLowerCase();
    let list = notes.filter(
      (n) =>
        !kw ||
        (n.title || '').toLowerCase().includes(kw) ||
        (n.body || '').toLowerCase().includes(kw)
    );
    const key = sort === 'created' ? 'createdAt' : sort === 'title' ? 'title' : 'updatedAt';
    list = [...list].sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1;
      if (key === 'title') return (a.title || '').localeCompare(b.title || '', 'ko');
      return (b[key] || 0) - (a[key] || 0);
    });
    return list;
  }, [notes, q, sort]);

  if (stage === 'loading') return <div className="empty">불러오는 중…</div>;

  if (stage === 'login')
    return (
      <form className="login" onSubmit={login}>
        <h2>🔒 메모</h2>
        <input
          className="input"
          type="password"
          autoFocus
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <div className="err">{err}</div>
        <button className="btn primary" style={{ width: '100%' }} type="submit">
          들어가기
        </button>
      </form>
    );

  return (
    <div className="wrap">
      <header className="bar">
        <h1>메모</h1>
        {saving && <span className="saving">저장 중…</span>}
        <button className="btn icon" onClick={toggleTheme} title="테마">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button className="btn icon" onClick={logout} title="로그아웃">
          ⏻
        </button>
      </header>

      <div className="row" style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="검색…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="btn" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="updated">최근 수정순</option>
          <option value="created">작성순</option>
          <option value="title">제목순</option>
        </select>
      </div>

      {err && <div className="err">{err}</div>}

      {editing && (
        <div className="card">
          <input
            className="input"
            placeholder="제목"
            autoFocus
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            style={{ marginBottom: 8 }}
          />
          <textarea
            className="input"
            placeholder="내용을 적어보세요…"
            value={editing.body}
            onChange={(e) => setEditing({ ...editing, body: e.target.value })}
          />
          <div className="row" style={{ marginTop: 10 }}>
            <span className="spacer" />
            <button className="btn" onClick={() => setEditing(null)}>
              취소
            </button>
            <button className="btn primary" onClick={saveEditor}>
              저장
            </button>
          </div>
        </div>
      )}

      {view.length === 0 && !editing && (
        <div className="empty">{q ? '검색 결과가 없어요' : '아직 메모가 없어요. + 를 눌러보세요'}</div>
      )}

      {view.map((n) => (
        <div className="card" key={n.id}>
          {n.title && <div className="t">{n.pinned ? '📌 ' : ''}{n.title}</div>}
          {n.body && <div className="b">{n.body}</div>}
          <div className="meta">
            <span>{fmt(n.updatedAt || n.createdAt)}</span>
            <span className="spacer" />
            <button className="btn icon" onClick={() => togglePin(n.id)} title="고정">
              {n.pinned ? '📌' : '📍'}
            </button>
            <button
              className="btn icon"
              onClick={() => setEditing({ id: n.id, title: n.title || '', body: n.body || '' })}
              title="수정"
            >
              ✏️
            </button>
            <button className="btn icon" onClick={() => remove(n.id)} title="삭제">
              🗑
            </button>
          </div>
        </div>
      ))}

      <button className="fab" onClick={() => setEditing({ id: null, title: '', body: '' })}>
        +
      </button>
    </div>
  );
}
