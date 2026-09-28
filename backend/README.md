# YUDO Backend API

Personal AI Memory & Life Assistant – FastAPI / Groq / Supabase RAG Platform.

## 🚀 Running the Development Server

> **CRITICAL**: Always start the dev server via `run_dev.sh` (or `run_dev.bat` on Windows), never `uvicorn main:app` directly.

Running without `--reload` causes stale processes in memory where schema updates and new endpoints fail silently.

### On Linux / macOS / Git Bash:
```bash
./run_dev.sh
```

### On Windows PowerShell or CMD:
```bat
run_dev.bat
```

## 🗄️ Database Migrations

All database schema migrations are located in `backend/migrations/` in execution order:
- `0001_agent_logs.sql`: Observability table for Groq token costs and latency.
- `0002_documents_and_hybrid_search.sql`: Real documents table, foreign key linking to embeddings, full-text search (tsvector + GIN), and hybrid search RPC.

Each migration file concludes with:
```sql
NOTIFY pgrst, 'reload schema';
```
This forces PostgREST to automatically refresh its schema cache without manual intervention.
