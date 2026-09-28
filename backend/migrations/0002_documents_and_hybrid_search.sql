-- ============================================================
-- Migration 0002: Documents Table, Foreign Key & Hybrid Search
-- ============================================================

-- 1. Create real documents table
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

-- 2. Link embeddings to documents table via document_id foreign key
alter table public.embeddings 
  add column if not exists document_id uuid references public.documents(id) on delete cascade;

create index if not exists embeddings_document_id_idx 
  on public.embeddings (document_id);

-- 3. Hybrid search: Full Text Search (tsvector + GIN index) on embeddings content
alter table public.embeddings 
  add column if not exists fts tsvector 
  generated always as (to_tsvector('english', content)) stored;

create index if not exists embeddings_fts_idx 
  on public.embeddings using gin (fts);

-- 4. Hybrid Match RPC combining Vector Cosine Similarity and Full-Text Search
create or replace function public.hybrid_match_embeddings(
  query_text text,
  query_embedding vector(768),
  match_count int,
  p_user_id uuid,
  p_source_type text default null,
  full_text_weight float default 0.3,
  semantic_weight float default 0.7
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  source_type text,
  file_url text,
  context text,
  similarity float
)
language sql stable
as $$
  with semantic_search as (
    select
      e.id,
      e.document_id,
      e.content,
      e.source_type,
      e.file_url,
      e.context,
      1 - (e.embedding <=> query_embedding) as sem_score
    from public.embeddings e
    where e.user_id = p_user_id
      and (p_source_type is null or e.source_type = p_source_type)
      and 1 - (e.embedding <=> query_embedding) > 0.2
    order by e.embedding <=> query_embedding
    limit match_count * 2
  ),
  keyword_search as (
    select
      e.id,
      e.document_id,
      e.content,
      e.source_type,
      e.file_url,
      e.context,
      ts_rank_cd(e.fts, websearch_to_tsquery('english', query_text)) as fts_score
    from public.embeddings e
    where e.user_id = p_user_id
      and (p_source_type is null or e.source_type = p_source_type)
      and e.fts @@ websearch_to_tsquery('english', query_text)
    order by fts_score desc
    limit match_count * 2
  )
  select
    coalesce(s.id, k.id) as id,
    coalesce(s.document_id, k.document_id) as document_id,
    coalesce(s.content, k.content) as content,
    coalesce(s.source_type, k.source_type) as source_type,
    coalesce(s.file_url, k.file_url) as file_url,
    coalesce(s.context, k.context) as context,
    (coalesce(s.sem_score, 0.0) * semantic_weight + coalesce(k.fts_score, 0.0) * full_text_weight) as similarity
  from semantic_search s
  full outer join keyword_search k on s.id = k.id
  order by similarity desc
  limit match_count;
$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
