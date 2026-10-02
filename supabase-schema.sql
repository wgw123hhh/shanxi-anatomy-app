-- 学习进度云同步建表 SQL
-- 在 Supabase 项目 → SQL Editor 中执行一次即可
-- 作用：为每个用户存一份学习进度 JSON（卡片复习状态、错题、打卡）

create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 开启行级安全（RLS）：每个用户只能读写自己的进度
alter table public.progress enable row level security;

create policy "select own progress" on public.progress
  for select using (auth.uid() = user_id);

create policy "insert own progress" on public.progress
  for insert with check (auth.uid() = user_id);

create policy "update own progress" on public.progress
  for update using (auth.uid() = user_id);
