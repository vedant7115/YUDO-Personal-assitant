from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import date
from services.supabase_client import supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["Goals"])


class GoalCreate(BaseModel):
    goal_title: str
    description: Optional[str] = ""
    deadline: Optional[date] = None


class GoalUpdate(BaseModel):
    status: Literal["pending", "in-progress", "completed"]


@router.post("")
async def add_goal(request: GoalCreate, user=Depends(get_current_user)):
    """Create a new goal."""
    result = supabase.table("goals").insert({
        "user_id": user.id,
        "goal_title": request.goal_title,
        "description": request.description,
        "status": "pending",
        "deadline": str(request.deadline) if request.deadline else None
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create goal")
    return {"message": "Goal created", "goal": result.data[0]}


@router.get("")
async def get_goals(user=Depends(get_current_user)):
    """Get all goals for the authenticated user."""
    result = supabase.table("goals")\
        .select("*")\
        .eq("user_id", user.id)\
        .order("created_at", desc=True)\
        .execute()
    return {"goals": result.data or []}


@router.put("/{goal_id}")
async def update_goal_status(goal_id: str, request: GoalUpdate, user=Depends(get_current_user)):
    """Update the status of a goal."""
    result = supabase.table("goals")\
        .update({"status": request.status})\
        .eq("id", goal_id)\
        .eq("user_id", user.id)\
        .execute()
    return {"message": "Goal updated", "goal": result.data[0] if result.data else None}


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, user=Depends(get_current_user)):
    """Delete a goal."""
    supabase.table("goals")\
        .delete()\
        .eq("id", goal_id)\
        .eq("user_id", user.id)\
        .execute()
    return {"message": "Goal deleted"}
