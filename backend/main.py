from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ── Routers ──────────────────────────────────────────────────────────────────
from routers.auth import router as auth_router
from routers.chat import router as chat_router
from routers.documents import router as documents_router
from routers.memory import router as memory_router
from routers.notes import router as notes_router
from routers.timeline import router as timeline_router
from routers.goals import router as goals_router
from routers.journal import router as journal_router
from routers.dashboard import router as dashboard_router
from routers.usage import router as usage_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="YUDO Backend API",
    description="Personal AI Memory & Life Assistant – Python/FastAPI Backend",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route Registration ────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(chat_router)
app.include_router(documents_router)
app.include_router(memory_router)
app.include_router(notes_router)
app.include_router(timeline_router)
app.include_router(goals_router)
app.include_router(journal_router)
app.include_router(dashboard_router)
app.include_router(usage_router)


def get_git_commit_hash() -> str:
    try:
        import subprocess
        res = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, check=True)
        return res.stdout.strip()
    except Exception:
        return "unknown"


@app.on_event("startup")
async def startup_event():
    import logging
    from services.gemini_service import GROQ_MODEL
    commit_hash = get_git_commit_hash()
    logging.getLogger("uvicorn.info").info(
        f"🚀 YUDO Backend booted | Commit: {commit_hash} | GROQ_MODEL: {GROQ_MODEL}"
    )


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "YUDO Backend is running", "version": "2.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "YUDO FastAPI"}



# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
