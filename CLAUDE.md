# YUDO — Project Rules

YUDO is an AI personal memory SaaS: users store documents, notes, timeline
events, goals and journal entries, then query them through an agentic chat.
Stack: FastAPI, Supabase (Postgres, pgvector, Auth, Storage, RLS), Groq
(GROQ_MODEL env var), FastEmbed (local embeddings), React/TS/Vite frontend.

## Code principles (non-negotiable)
1. Explainability: every function that calls an LLM or embedding model has a
   docstring with: purpose, inputs, outputs, model used, approx cost.
2. Modularity: routers only handle HTTP; business logic lives in services/;
   DB access lives in one layer; prompts live in prompts/ (never inline).
3. Readability: small functions, clear names, no cleverness. The owner must
   be able to explain every file in an interview.
4. No fake features: no button, stat, or success message without real backend
   behavior behind it.
5. Security: every query scoped to the authenticated user; RLS on every table.
6. Cost awareness: every LLM call is logged to agent_logs (tokens, cost,
   latency). Prefer cheap models; cache where sensible.
7. Done means verified: show real test output and real DB rows, never
   "it should work."
8. Migrations: numbered SQL files in backend/migrations/, each ending with
   NOTIFY pgrst, 'reload schema';

## Workflow
- Plan first, wait for approval, then implement.
- After each phase, append to docs/DECISIONS.md: what, why, trade-offs,
  and a 60-second interview explanation.
