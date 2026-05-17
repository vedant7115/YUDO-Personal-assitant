from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
from services.supabase_client import supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/journal", tags=["Journal"])


class JournalEntry(BaseModel):
    entry_text: str
    mood: Optional[str] = "neutral"
    entry_date: Optional[date] = None


@router.post("")
async def add_journal_entry(request: JournalEntry, user=Depends(get_current_user)):
    """Add a new journal entry."""
    from datetime import date as today_date
    entry_date = str(request.entry_date) if request.entry_date else str(today_date.today())

    result = supabase.table("journal").insert({
        "user_id": user.id,
        "entry_text": request.entry_text,
        "mood": request.mood,
        "date": entry_date
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save journal entry")
    return {"message": "Journal entry saved", "entry": result.data[0]}


@router.get("")
async def get_journal(user=Depends(get_current_user)):
    """Get all journal entries for the authenticated user, most recent first."""
    result = supabase.table("journal")\
        .select("*")\
        .eq("user_id", user.id)\
        .order("date", desc=True)\
        .execute()
    return {"entries": result.data or []}


@router.delete("/{entry_id}")
async def delete_journal_entry(entry_id: str, user=Depends(get_current_user)):
    """Delete a journal entry."""
    supabase.table("journal")\
        .delete()\
        .eq("id", entry_id)\
        .eq("user_id", user.id)\
        .execute()
    return {"message": "Journal entry deleted"}
