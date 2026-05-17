from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, generate_response
from middleware.auth import get_current_user

router = APIRouter(prefix="/api/agent", tags=["Chat"])


class ChatRequest(BaseModel):
    query: str


@router.post("/chat")
async def chat(request: ChatRequest, user=Depends(get_current_user)):
    """
    RAG-powered chat: converts query to embedding, retrieves relevant context
    from all user data (documents, memory, notes), then asks Gemini.
    """
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")

    # 1. Convert query to embedding
    query_embedding = generate_embedding(request.query)

    # 2. Search across all source types
    result = supabase.rpc("match_embeddings", {
        "query_embedding": query_embedding,
        "match_threshold": 0.3,
        "match_count": 5,
        "p_user_id": user.id,
        "p_source_type": None
    }).execute()

    matches = result.data or []

    # 3. Build context
    if matches:
        context_text = "\n---\n".join(
            f"[Source: {m['source_type']}] {m['content']}" for m in matches
        )
    else:
        context_text = "No relevant context found in user's data."

    # 4. Generate answer with Gemini
    answer = generate_response(request.query, context_text)

    return {"answer": answer, "context_used": matches}
