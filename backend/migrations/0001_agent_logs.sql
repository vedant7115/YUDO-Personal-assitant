-- Migration 0001: Create agent_logs table for cost and latency observability
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

NOTIFY pgrst, 'reload schema';
