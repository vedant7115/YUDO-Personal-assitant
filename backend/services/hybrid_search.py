import json
import time
import logging
from typing import List, Dict, Any, Optional
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, groq_client, GROQ_MODEL
from services.cost_tracker import log_agent_call

logger = logging.getLogger(__name__)


def reciprocal_rank_fusion(
    semantic_results: List[Dict[str, Any]],
    keyword_results: List[Dict[str, Any]],
    k: int = 60,
    top_n: int = 10
) -> List[Dict[str, Any]]:
    """
    Combines semantic and keyword search result rankings using Reciprocal Rank Fusion (RRF).
    RRF Score = 1 / (k + rank)
    """
    scores: Dict[str, float] = {}
    doc_map: Dict[str, Dict[str, Any]] = {}

    # Score semantic results
    for rank, doc in enumerate(semantic_results):
        doc_id = doc.get("id") or doc.get("content")
        doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))

    # Score keyword results
    for rank, doc in enumerate(keyword_results):
        doc_id = doc.get("id") or doc.get("content")
        if doc_id not in doc_map:
            doc_map[doc_id] = doc
        scores[doc_id] = scores.get(doc_id, 0.0) + (1.0 / (k + rank + 1))

    # Sort documents by accumulated RRF score descending
    sorted_doc_ids = sorted(scores.keys(), key=lambda did: scores[did], reverse=True)
    fused_results = []
    for did in sorted_doc_ids[:top_n]:
        item = dict(doc_map[did])
        item["rrf_score"] = round(scores[did], 6)
        fused_results.append(item)

    return fused_results


async def hybrid_search(
    query: str,
    user_id: str,
    source_type: Optional[str] = None,
    match_count: int = 8
) -> List[Dict[str, Any]]:
    """
    Performs hybrid search:
    1. Vector semantic search (768-dim embedding via pgvector match_embeddings RPC)
    2. Full-text / Keyword search across chunk content
    3. Merges result sets via Reciprocal Rank Fusion (RRF)
    """
    # 1. Semantic Search
    query_embedding = generate_embedding(query)
    try:
        sem_res = supabase.rpc("match_embeddings", {
            "query_embedding": query_embedding,
            "match_threshold": 0.25,
            "match_count": match_count * 2,
            "p_user_id": user_id,
            "p_source_type": source_type
        }).execute()
        semantic_matches = sem_res.data or []
    except Exception as e:
        logger.warning(f"Semantic match_embeddings error: {e}")
        semantic_matches = []

    # 2. Keyword Search
    keyword_matches = []
    try:
        # Split query into keywords (ignoring short stopwords)
        keywords = [w.strip() for w in query.split() if len(w.strip()) > 2]
        if keywords:
            # Query embeddings content for keywords
            kw_query = supabase.table("embeddings") \
                .select("id, content, source_type, file_url, context, created_at") \
                .eq("user_id", user_id)
            if source_type:
                kw_query = kw_query.eq("source_type", source_type)
            
            # Use ILIKE filter for primary keyword match
            primary_term = keywords[0]
            kw_res = kw_query.ilike("content", f"%{primary_term}%").limit(match_count * 2).execute()
            keyword_matches = kw_res.data or []
    except Exception as e:
        logger.warning(f"Keyword search error: {e}")
        keyword_matches = []

    # 3. Reciprocal Rank Fusion
    fused = reciprocal_rank_fusion(semantic_matches, keyword_matches, top_n=match_count)
    return fused


async def rerank_candidates(
    query: str,
    candidates: List[Dict[str, Any]],
    user_id: str,
    top_k: int = 5
) -> List[Dict[str, Any]]:
    """
    Lightweight re-ranking step using Groq (GROQ_MODEL).
    Scores candidates 0-10, logs cost & latency to agent_logs,
    and returns top_k most relevant snippets.
    """
    if not candidates:
        return []

    # If only 1 candidate, no need for full LLM re-ranking
    if len(candidates) <= 1:
        return candidates

    snippets_prompt = "\n".join(
        f"[{i+1}] {c.get('content', '')[:300]}" for i, c in enumerate(candidates)
    )

    system_prompt = (
        "You are an AI relevance re-ranker. Given a user query and candidate document snippets, "
        "score the relevance of each snippet to answering the query on a scale of 0 to 10 (10 = directly answers, 0 = irrelevant). "
        "Respond ONLY with a JSON object in this format: {\"scores\": [score_1, score_2, ...]}"
    )

    prompt = f"Query: {query}\n\nCandidate Snippets:\n{snippets_prompt}"

    start_time = time.time()
    try:
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.0
        )
        latency_ms = int((time.time() - start_time) * 1000)

        usage = getattr(response, "usage", None)
        in_tokens = getattr(usage, "prompt_tokens", 0) if usage else 0
        out_tokens = getattr(usage, "completion_tokens", 0) if usage else 0

        # Parse scores
        raw_content = response.choices[0].message.content or "{}"
        clean_content = raw_content.strip()
        if "```json" in clean_content:
            clean_content = clean_content.split("```json")[1].split("```")[0].strip()
        elif "```" in clean_content:
            clean_content = clean_content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(clean_content)
        scores = parsed.get("scores", [])

        # Log re-rank step to agent_logs
        await log_agent_call(
            user_id=user_id,
            conversation_turn=f"Re-rank for: {query[:60]}",
            iteration=1,
            model=GROQ_MODEL,
            latency_ms=latency_ms,
            status="success",
            tools_called=[{"name": "rerank", "arguments": {"candidates_count": len(candidates), "top_k": top_k}}],
            input_tokens=in_tokens,
            output_tokens=out_tokens
        )

        # Attach scores to candidates and sort
        scored_candidates = []
        for idx, cand in enumerate(candidates):
            score = float(scores[idx]) if idx < len(scores) else 0.0
            cand_copy = dict(cand)
            cand_copy["rerank_score"] = score
            scored_candidates.append(cand_copy)

        scored_candidates.sort(key=lambda x: x.get("rerank_score", 0.0), reverse=True)
        return scored_candidates[:top_k]

    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        logger.warning(f"Re-ranking failed, falling back to RRF order: {e}")
        # Log failure to agent_logs
        await log_agent_call(
            user_id=user_id,
            conversation_turn=f"Re-rank for: {query[:60]}",
            iteration=1,
            model=GROQ_MODEL,
            latency_ms=latency_ms,
            status="error",
            error_message=str(e)
        )
        return candidates[:top_k]
