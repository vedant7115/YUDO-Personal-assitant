from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from services.supabase_client import supabase
import logging

router = APIRouter(prefix="/api/usage", tags=["Usage"])
logger = logging.getLogger(__name__)


@router.get("/summary")
async def get_usage_summary(user=Depends(get_current_user)):
    """
    Returns aggregated agent usage summary for the current user:
    - total_calls: Total Groq API iterations called
    - total_cost_usd: Total estimated spend in USD
    - total_tokens: Total prompt + completion tokens
    - input_tokens: Total prompt tokens
    - output_tokens: Total completion tokens
    - avg_latency_ms: Average latency per API call
    - successful_calls: Count of successful iterations
    - failed_calls: Count of failed iterations
    """
    try:
        res = supabase.table("agent_logs") \
            .select("input_tokens, output_tokens, estimated_cost_usd, latency_ms, status") \
            .eq("user_id", user.id) \
            .execute()
        
        rows = res.data or []
        total_calls = len(rows)
        
        if total_calls == 0:
            return {
                "total_calls": 0,
                "total_cost_usd": 0.0,
                "total_tokens": 0,
                "input_tokens": 0,
                "output_tokens": 0,
                "avg_latency_ms": 0,
                "successful_calls": 0,
                "failed_calls": 0
            }

        total_cost = sum(float(r.get("estimated_cost_usd") or 0.0) for r in rows)
        input_tokens = sum(int(r.get("input_tokens") or 0) for r in rows)
        output_tokens = sum(int(r.get("output_tokens") or 0) for r in rows)
        total_latency = sum(int(r.get("latency_ms") or 0) for r in rows)
        successful_calls = sum(1 for r in rows if r.get("status") == "success")
        failed_calls = sum(1 for r in rows if r.get("status") == "error")
        avg_latency = round(total_latency / total_calls) if total_calls > 0 else 0

        return {
            "total_calls": total_calls,
            "total_cost_usd": round(total_cost, 6),
            "total_tokens": input_tokens + output_tokens,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "avg_latency_ms": avg_latency,
            "successful_calls": successful_calls,
            "failed_calls": failed_calls
        }
    except Exception as e:
        logger.error(f"Error fetching usage summary: {e}")
        # In case table does not exist or fetch fails, return a graceful response
        return {
            "total_calls": 0,
            "total_cost_usd": 0.0,
            "total_tokens": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "avg_latency_ms": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "warning": f"Could not retrieve agent logs: {str(e)}"
        }
