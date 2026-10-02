-- 云端内容下发：题库/卡片内容表
-- 在 Supabase → SQL Editor 执行一次

create table if not exists public.content (
  key text primary key,
  data jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

-- 公开可读（App 无需登录即可拉取最新题库）
alter table public.content enable row level security;

create policy "public can read content" on public.content
  for select using (true);

-- 说明：
-- 写入（更新题库）用 service_role key 通过脚本上传，绕开 RLS，
-- 所以这里不需要给 anon 开放 insert/update 权限。
