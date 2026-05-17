from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, generate_response
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/memory", tags=["Memory"])


class MemoryRequest(BaseModel):
    memory: str


@router.post("/add-memory")
async def add_memory(request: MemoryRequest, user=Depends(get_current_user)):
    """
    Stores a life event or memory as an embedding for later retrieval.
    e.g. "My Cisco course ends tomorrow" or "Friend's birthday is on the 12th"
    """
    if not request.memory:
        raise HTTPException(status_code=400, detail="Memory content is required")

    embedding = generate_embedding(request.memory)

    supabase.table("embeddings").insert({
        "user_id": user.id,
        "content": request.memory,
        "embedding": embedding,
        "source_type": "memory"
    }).execute()

    return {"message": "Memory added successfully"}


@router.get("/query-memory")
async def query_memory(query: str, user=Depends(get_current_user)):
    """
    Retrieves relevant memories via vector similarity and generates a Gemini response.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    query_embedding = generate_embedding(query)

    result = supabase.rpc("match_embeddings", {
        "query_embedding": query_embedding,
        "match_threshold": 0.3,
        "match_count": 5,
        "p_user_id": user.id,
        "p_source_type": "memory"
    }).execute()

    matches = result.data or []
    context_text = "\n".join(m["content"] for m in matches) if matches else "No relevant memories found."

    answer = generate_response(query, context_text)
    return {"answer": answer, "matches": matches}
