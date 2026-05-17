from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
from services.supabase_client import supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/timeline", tags=["Timeline"])


class TimelineEventCreate(BaseModel):
    event_title: str
    description: Optional[str] = ""
    event_date: date


@router.post("")
async def add_timeline_event(request: TimelineEventCreate, user=Depends(get_current_user)):
    """Add a life event to the user's timeline."""
    result = supabase.table("timeline").insert({
        "user_id": user.id,
        "event_title": request.event_title,
        "description": request.description,
        "event_date": str(request.event_date)
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to add timeline event")
    return {"message": "Timeline event added", "event": result.data[0]}


@router.get("")
async def get_timeline(user=Depends(get_current_user)):
    """Get all timeline events for the authenticated user, ordered by date."""
    result = supabase.table("timeline")\
        .select("*")\
        .eq("user_id", user.id)\
        .order("event_date", desc=True)\
        .execute()
    return {"events": result.data or []}


@router.delete("/{event_id}")
async def delete_timeline_event(event_id: str, user=Depends(get_current_user)):
    """Delete a timeline event."""
    supabase.table("timeline")\
        .delete()\
        .eq("id", event_id)\
        .eq("user_id", user.id)\
        .execute()
    return {"message": "Event deleted"}
