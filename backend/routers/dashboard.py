from fastapi import APIRouter, Depends
from services.supabase_client import supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(user=Depends(get_current_user)):
    """
    Returns aggregated stats for the user's dashboard:
    document count, note count, goal counts, recent memories, and latest journal entry.
    """
    uid = user.id

    # Count documents
    docs = supabase.table("embeddings")\
        .select("id", count="exact")\
        .eq("user_id", uid)\
        .eq("source_type", "document")\
        .execute()

    # Count notes
    notes = supabase.table("embeddings")\
        .select("id", count="exact")\
        .eq("user_id", uid)\
        .eq("source_type", "note")\
        .execute()

    # Count memories
    memories = supabase.table("embeddings")\
        .select("id", count="exact")\
        .eq("user_id", uid)\
        .eq("source_type", "memory")\
        .execute()

    # Goals breakdown
    goals_all = supabase.table("goals")\
        .select("status")\
        .eq("user_id", uid)\
        .execute()

    goals_data = goals_all.data or []
    goals_pending = sum(1 for g in goals_data if g["status"] == "pending")
    goals_in_progress = sum(1 for g in goals_data if g["status"] == "in-progress")
    goals_completed = sum(1 for g in goals_data if g["status"] == "completed")

    # Latest journal entry
    journal = supabase.table("journal")\
        .select("entry_text, date, mood")\
        .eq("user_id", uid)\
        .order("date", desc=True)\
        .limit(1)\
        .execute()

    # Recent timeline events
    timeline = supabase.table("timeline")\
        .select("event_title, event_date")\
        .eq("user_id", uid)\
        .order("event_date", desc=True)\
        .limit(3)\
        .execute()

    return {
        "documents": docs.count or 0,
        "notes": notes.count or 0,
        "memories": memories.count or 0,
        "goals": {
            "total": len(goals_data),
            "pending": goals_pending,
            "in_progress": goals_in_progress,
            "completed": goals_completed
        },
        "latest_journal": journal.data[0] if journal.data else None,
        "recent_timeline": timeline.data or []
    }
