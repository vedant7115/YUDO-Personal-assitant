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
