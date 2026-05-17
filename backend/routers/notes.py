from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, process_notes
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["Notes"])


class NoteRequest(BaseModel):
    note: str


@router.post("/add-note")
async def add_note(request: NoteRequest, user=Depends(get_current_user)):
    """
    Saves a personal note as an embedding.
    """
    if not request.note:
        raise HTTPException(status_code=400, detail="Note content is required")

    embedding = generate_embedding(request.note)

    supabase.table("embeddings").insert({
        "user_id": user.id,
        "content": request.note,
        "embedding": embedding,
        "source_type": "note"
    }).execute()

    return {"message": "Note added successfully"}

@router.get("/list-notes")
async def list_notes(user=Depends(get_current_user)):
    """
    Retrieve all notes for the current user.
    """
    response = supabase.table("embeddings") \
        .select("id, content, created_at") \
        .eq("user_id", user.id) \
        .eq("source_type", "note") \
        .order("created_at", desc=True) \
        .execute()
    
    notes = []
    for row in response.data or []:
        created_at = row.get("created_at", "")
        date_str = created_at.split("T")[0] if "T" in created_at else created_at
        notes.append({
            "id": row["id"],
            "content": row["content"],
            "date": date_str
        })
        
    return notes



@router.get("/query-notes")
async def query_notes(query: str, user=Depends(get_current_user)):
    """
    Semantic search on notes + Gemini for summarization, math, or reasoning.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    query_embedding = generate_embedding(query)

    result = supabase.rpc("match_embeddings", {
        "query_embedding": query_embedding,
        "match_threshold": 0.4,
        "match_count": 5,
        "p_user_id": user.id,
        "p_source_type": "note"
    }).execute()

    matches = result.data or []
    notes_context = "\n---\n".join(m["content"] for m in matches)

    if not notes_context:
        return {"answer": "I couldn't find relevant notes.", "matches": []}

    answer = process_notes(query, notes_context)
    return {"answer": answer, "matches": matches}
