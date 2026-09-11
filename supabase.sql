-- Supabase SQL Editor 에서 한 번 실행하세요.
create table if not exists public.notes (
  id text primary key,
  title text default '',
  body text default '',
  pinned boolean default false,
  created_at bigint not null,
  updated_at bigint not null
);

-- 서버(service_role)로만 접근하므로 RLS 를 켜고 정책은 두지 않는다.
alter table public.notes enable row level security;
