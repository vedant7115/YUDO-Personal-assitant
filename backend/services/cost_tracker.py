import time
import logging
from typing import Optional, List, Dict, Any
from services.supabase_client import supabase

logger = logging.getLogger(__name__)

# ==============================================================================
# Model Pricing Table ($ per 1 Million tokens)
# IMPORTANT: Update this dictionary whenever GROQ_MODEL or provider pricing changes.
# ==============================================================================
MODEL_PRICING_PER_1M = {
    # Default model: openai/gpt-oss-120b ($0.15 / $0.60 per 1M)
    "openai/gpt-oss-120b": {
        "input": 0.15,   # $0.15 per 1,000,000 input tokens
        "output": 0.60   # $0.60 per 1,000,000 output tokens
    },
    "llama-3.3-70b-versatile": {
        "input": 0.59,
        "output": 0.79
    },
    "llama-3.1-8b-instant": {
        "input": 0.05,
        "output": 0.08
    }
}

DEFAULT_PRICING = {
    "input": 0.15,
    "output": 0.60
}


def calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    """
    Calculate estimated cost in USD based on model pricing and token counts.
    """
    pricing = MODEL_PRICING_PER_1M.get(model, DEFAULT_PRICING)
    cost = (input_tokens / 1_000_000.0) * pricing["input"] + (output_tokens / 1_000_000.0) * pricing["output"]
    return round(cost, 6)


async def log_agent_call(
    user_id: str,
    conversation_turn: str,
    iteration: int,
    model: str,
    latency_ms: int,
    status: str,
    tools_called: Optional[List[Dict[str, Any]]] = None,
    input_tokens: Optional[int] = 0,
    output_tokens: Optional[int] = 0,
    error_message: Optional[str] = None
) -> None:
    """
    Record a single Groq agent iteration log into agent_logs table.
    Fails safely without raising exceptions to ensure the user conversation is never interrupted.
    """
    try:
        in_tok = int(input_tokens or 0)
        out_tok = int(output_tokens or 0)
        cost = calculate_cost(model, in_tok, out_tok) if status == "success" else 0.0

        log_payload = {
            "user_id": user_id,
            "conversation_turn": conversation_turn,
            "iteration": iteration,
            "tools_called": tools_called or [],
            "model": model,
            "input_tokens": in_tok,
            "output_tokens": out_tok,
            "estimated_cost_usd": cost,
            "latency_ms": latency_ms,
            "status": status,
            "error_message": error_message
        }

        # Insert into Supabase agent_logs
        supabase.table("agent_logs").insert(log_payload).execute()
    except Exception as e:
        logger.warning(f"Failed to write agent_log (safe fallback): {e}")
