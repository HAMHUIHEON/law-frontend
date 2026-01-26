-- Supabase SQL Editor: run all

create extension if not exists "pgcrypto";

create table if not exists recent_thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  target_type text not null,
  target_id text not null,
  last_viewed_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

alter table recent_thoughts enable row level security;

drop policy if exists "user can manage own recent thoughts" on recent_thoughts;

-- lock down: client anon/authenticated cannot read/write this table directly
create policy "deny all select"
on recent_thoughts
for select
using (false);

create policy "deny all insert"
on recent_thoughts
for insert
with check (false);

create policy "deny all update"
on recent_thoughts
for update
using (false)
with check (false);

create policy "deny all delete"
on recent_thoughts
for delete
using (false);

---trace thoughts---
create table thought_traces (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,

  parent_type text not null,
  parent_id text not null,

  trace_type text not null,
  trace_id text not null,

  viewed_at timestamptz not null default now()
);

create index idx_thought_traces_user_time
on thought_traces (user_id, viewed_at desc);

alter table thought_traces enable row level security;

create policy "deny all select"
on thought_traces for select using (false);

create policy "deny all insert"
on thought_traces for insert with check (false);

create policy "deny all update"
on thought_traces for update using (false);

create policy "deny all delete"
on thought_traces for delete using (false);

---saved_thoughts---

-- 1️⃣ 저장 테이블
create table saved_thoughts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,

  -- 저장 대상 (직접 클릭한 것)
  target_type text not null
    check (target_type in ('case', 'law', 'strategy', 'document', 'block')),
  target_id text not null,

  -- 🔥 컨텍스트 (어디에 속한 사고인지)
  parent_type text not null
    check (parent_type in ('case', 'law', 'strategy')),
  parent_id text not null,

  saved_at timestamptz not null default now()
);

-- 2️⃣ 유저별 최신 조회용 인덱스
create index idx_saved_thoughts_user_time
on saved_thoughts (user_id, saved_at desc);

-- 3️⃣ 동일 항목 중복 저장 방지 (매우 중요)
create unique index uq_saved_thoughts_unique
on saved_thoughts (
  user_id,
  target_type,
  target_id,
  parent_type,
  parent_id
);

-- 4️⃣ RLS 활성화
alter table saved_thoughts enable row level security;

-- 5️⃣ 서버 전용 접근 (supabaseAdmin 기준)
create policy "server select saved_thoughts"
on saved_thoughts
for select using (true);

create policy "server insert saved_thoughts"
on saved_thoughts
for insert with check (true);

create policy "server delete saved_thoughts"
on saved_thoughts
for delete using (true);


--
alter table saved_thoughts
add constraint saved_thoughts_target_type_check
check (
  target_type in (
    'case',
    'law',
    'strategy',
    'document',
    'block',
    'article',
    'semantic',
    'reasoning',
    'summary'
  )
);
