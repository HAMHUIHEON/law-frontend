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


-- =========================================
-- user_subscriptions: Clerk userId 기반 구독 상태 테이블
-- =========================================

-- 0) uuid 생성 함수 필요(대부분 기본 있음). 없으면 Supabase 기본 확장에 포함.
-- create extension if not exists "pgcrypto";  -- 필요 시만 (에러 나면 주석 해제하고 실행)

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id text not null,                 -- Clerk userId
  plan text not null,                    -- 예: 'CASE_PRO'
  status text not null,                  -- 'active' | 'inactive'

  started_at timestamptz not null default now(),
  ended_at timestamptz null,

  created_at timestamptz not null default now()
);

-- 1) 활성 구독은 유저당 1개만
create unique index if not exists uniq_active_subscription_per_user
on public.user_subscriptions (user_id)
where status = 'active';

-- 2) 조회 성능 인덱스
create index if not exists idx_user_subscriptions_user_id
on public.user_subscriptions (user_id);

-- 3) RLS 켜기
alter table public.user_subscriptions enable row level security;

-- 4) 정책은 중복 생성 방지 위해 먼저 제거
drop policy if exists "user can read own subscription" on public.user_subscriptions;
drop policy if exists "service role can write subscriptions" on public.user_subscriptions;

-- 5) 본인만 조회 가능 (로그인 유저)
create policy "user can read own subscription"
on public.user_subscriptions
for select
using (
  auth.uid()::text = user_id
);

-- 6) 쓰기(insert/update/delete)는 service_role만
create policy "service role can write subscriptions"
on public.user_subscriptions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');



-- Supabase SQL Editor
-- user_access_levels : SSOT for subscription / permission

create extension if not exists "pgcrypto";

-- 1️⃣ 테이블
create table if not exists user_access_levels (
  user_id text primary key,

  -- GUEST: 비로그인 / 기본
  -- MEMBER: 로그인만
  -- SUBSCRIBER: 결제 완료
  access_level text not null
    check (access_level in ('GUEST', 'MEMBER', 'SUBSCRIBER')),

  updated_at timestamptz not null default now()
);

-- 2️⃣ RLS 활성화
alter table user_access_levels enable row level security;

-- 3️⃣ 기존 정책 정리 (있어도 에러 안 나게)
drop policy if exists "deny all select" on user_access_levels;
drop policy if exists "deny all insert" on user_access_levels;
drop policy if exists "deny all update" on user_access_levels;
drop policy if exists "deny all delete" on user_access_levels;

-- 4️⃣ 클라이언트 접근 전면 차단 (server-only)
create policy "deny all select"
on user_access_levels
for select using (false);

create policy "deny all insert"
on user_access_levels
for insert with check (false);

create policy "deny all update"
on user_access_levels
for update using (false);

create policy "deny all delete"
on user_access_levels
for delete using (false);

-- 결제 주문 테이블 (merchant_uid ↔ user_id 매핑)
create table if not exists payment_orders (
  merchant_uid text primary key,   -- PG 주문번호
  user_id text not null,            -- Clerk userId
  status text not null default 'pending', -- pending | paid | failed
  created_at timestamptz not null default now()
);
