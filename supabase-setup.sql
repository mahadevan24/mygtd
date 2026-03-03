-- FlowGTD Database Setup
-- Run this SQL in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. Create tables
-- ============================================

-- Tasks (inbox items / projects)
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  outcome text,
  status text not null default 'inbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Actions (next-action steps for a task)
create table if not exists public.actions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- 2. Enable Row Level Security
-- ============================================

alter table public.tasks enable row level security;
alter table public.actions enable row level security;

-- ============================================
-- 3. RLS Policies
-- ============================================

-- Tasks: users can only CRUD their own tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- Actions: users can only CRUD actions on their own tasks
create policy "Users can view own actions"
  on public.actions for select
  using (task_id in (select id from public.tasks where user_id = auth.uid()));

create policy "Users can insert own actions"
  on public.actions for insert
  with check (task_id in (select id from public.tasks where user_id = auth.uid()));

create policy "Users can update own actions"
  on public.actions for update
  using (task_id in (select id from public.tasks where user_id = auth.uid()));

create policy "Users can delete own actions"
  on public.actions for delete
  using (task_id in (select id from public.tasks where user_id = auth.uid()));

-- ============================================
-- 4. Indexes for performance
-- ============================================

create index if not exists idx_tasks_user_id on public.tasks(user_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_actions_task_id on public.actions(task_id);
