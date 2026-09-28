-- ============================================================
-- YUDO – Complete Database Schema for Supabase
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN
-- ============================================================

-- Step 1: Enable pgvector
create extension if not exists vector;

-- ============================================================
-- DOCUMENTS TABLE (File & Upload Management)
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  filename text not null,
  description text default '',
  file_url text,
  size_bytes bigint default 0,
  mime_type text,
  status text not null default 'pending' check (status in ('pending', 'processed', 'failed')),
  error_message text,
  created_at timestamptz default now() not null
);

create index if not exists documents_user_created_idx
  on public.documents (user_id, created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_select" on public.documents;
drop policy if exists "documents_insert" on public.documents;
drop policy if exists "documents_update" on public.documents;
drop policy if exists "documents_delete" on public.documents;

create policy "documents_select" on public.documents
  for select using (auth.uid() = user_id);
create policy "documents_insert" on public.documents
  for insert with check (auth.uid() = user_id);
create policy "documents_update" on public.documents
  for update using (auth.uid() = user_id);
create policy "documents_delete" on public.documents
  for delete using (auth.uid() = user_id);

-- ============================================================
-- EMBEDDINGS TABLE (Core AI Memory / RAG)
-- ============================================================
create table if not exists public.embeddings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  document_id uuid references public.documents(id) on delete cascade,
  content text not null,
  embedding vector(768),
  source_type text not null check (source_type in ('document', 'memory', 'note')),
  file_url text,
  context text,
  created_at timestamptz default now() not null
);

create index if not exists embeddings_hnsw_idx
  on public.embeddings using hnsw (embedding vector_cosine_ops);

create index if not exists embeddings_user_source_idx
  on public.embeddings (user_id, source_type);

create index if not exists embeddings_document_id_idx
  on public.embeddings (document_id);

alter table public.embeddings enable row level security;

drop policy if exists "embeddings_select" on public.embeddings;
drop policy if exists "embeddings_insert" on public.embeddings;
drop policy if exists "embeddings_update" on public.embeddings;
drop policy if exists "embeddings_delete" on public.embeddings;

create policy "embeddings_select" on public.embeddings
  for select using (auth.uid() = user_id);
create policy "embeddings_insert" on public.embeddings
  for insert with check (auth.uid() = user_id);
create policy "embeddings_update" on public.embeddings
  for update using (auth.uid() = user_id);
create policy "embeddings_delete" on public.embeddings
  for delete using (auth.uid() = user_id);


-- ============================================================
-- match_embeddings FUNCTION (vector similarity search)
-- ============================================================
create or replace function public.match_embeddings (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  p_user_id uuid,
  p_source_type text default null
)
returns table (
  id uuid,
  content text,
  source_type text,
  file_url text,
  context text,
  similarity float
)
language sql stable
as $$
  select
    e.id,
    e.content,
    e.source_type,
    e.file_url,
    e.context,
    1 - (e.embedding <=> query_embedding) as similarity
  from public.embeddings e
  where e.user_id = p_user_id
    and (p_source_type is null or e.source_type = p_source_type)
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- TIMELINE TABLE
-- ============================================================
create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_title text not null,
  description text default '',
  event_date date not null,
  created_at timestamptz default now()
);

create index if not exists timeline_user_idx on public.timeline (user_id);
alter table public.timeline enable row level security;

drop policy if exists "timeline_all" on public.timeline;
create policy "timeline_all" on public.timeline
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- GOALS TABLE
-- ============================================================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_title text not null,
  description text default '',
  status text not null default 'pending'
    check (status in ('pending', 'in-progress', 'completed')),
  deadline date,
  created_at timestamptz default now()
);

create index if not exists goals_user_idx on public.goals (user_id);
alter table public.goals enable row level security;

drop policy if exists "goals_all" on public.goals;
create policy "goals_all" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- JOURNAL TABLE
-- ============================================================
create table if not exists public.journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_text text not null,
  date date not null default current_date,
  mood text default 'neutral',
  created_at timestamptz default now()
);

create index if not exists journal_user_idx on public.journal (user_id);
alter table public.journal enable row level security;

drop policy if exists "journal_all" on public.journal;
create policy "journal_all" on public.journal
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- AGENT_LOGS TABLE (Per-call Cost and Latency Tracking)
-- ============================================================
create table if not exists public.agent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  conversation_turn text,        -- the user's original message
  iteration integer,             -- which loop iteration this call was (1-5)
  tools_called jsonb,            -- names/args of any tools invoked this call
  model text not null,
  input_tokens integer,
  output_tokens integer,
  estimated_cost_usd numeric(10,6),
  latency_ms integer,
  status text not null,          -- 'success' | 'error'
  error_message text
);

create index if not exists agent_logs_user_created_idx
  on public.agent_logs (user_id, created_at desc);

alter table public.agent_logs enable row level security;

drop policy if exists "agent_logs_select" on public.agent_logs;
drop policy if exists "agent_logs_insert" on public.agent_logs;

create policy "agent_logs_select" on public.agent_logs
  for select using (auth.uid() = user_id);

create policy "agent_logs_insert" on public.agent_logs
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- Done! All tables created successfully.
-- ============================================================

