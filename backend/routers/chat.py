from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, groq_client, GROQ_MODEL
from services.cost_tracker import log_agent_call
from middleware.auth import get_current_user
import json
import time
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agent", tags=["Chat"])



class ChatRequest(BaseModel):
    query: str


# Tool definitions for Groq tool calling
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_timeline_event",
            "description": "Add a new event or milestone (e.g. course target, assignment deadline) to the user's timeline.",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_title": {"type": "string", "description": "Title of the event, e.g. 'Complete EPAM Course'"},
                    "event_date": {"type": "string", "description": "Date of the event in YYYY-MM-DD format."},
                    "description": {"type": "string", "description": "Optional description of the event."}
                },
                "required": ["event_title", "event_date"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_timeline_events",
            "description": "Get all current events on the user's timeline.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_note",
            "description": "Save a new note/thought/summarization/insight to the user's notes database.",
            "parameters": {
                "type": "object",
                "properties": {
                    "content": {"type": "string", "description": "The text content of the note."}
                },
                "required": ["content"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_notes",
            "description": "Retrieve all saved notes for the user.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_goal",
            "description": "Create a new goal for the user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "goal_title": {"type": "string", "description": "Title of the goal."},
                    "description": {"type": "string", "description": "Optional description of the goal."},
                    "deadline": {"type": "string", "description": "Optional deadline in YYYY-MM-DD format."}
                },
                "required": ["goal_title"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_goals",
            "description": "Get all goals for the user.",
            "parameters": {"type": "object", "properties": {}}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_journal_entry",
            "description": "Add a new journal entry reflecting on the user's day.",
            "parameters": {
                "type": "object",
                "properties": {
                    "entry_text": {"type": "string", "description": "The journal entry text."},
                    "mood": {"type": "string", "description": "The user's mood, e.g., 'happy', 'neutral', 'stressed'."},
                    "entry_date": {"type": "string", "description": "Optional date in YYYY-MM-DD format (defaults to today)."}
                },
                "required": ["entry_text"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_journal_entries",
            "description": "Get all journal entries for the user.",
            "parameters": {"type": "object", "properties": {}}
        }
    }
]


async def execute_tool(name: str, arguments: dict, user_id: str):
    if name == "add_timeline_event":
        res = supabase.table("timeline").insert({
            "user_id": user_id,
            "event_title": arguments.get("event_title"),
            "event_date": arguments.get("event_date"),
            "description": arguments.get("description", "")
        }).execute()
        return {"status": "success", "message": f"Added timeline event: {arguments.get('event_title')}"}

    elif name == "list_timeline_events":
        res = supabase.table("timeline").select("*").eq("user_id", user_id).order("event_date", desc=True).execute()
        return {"events": res.data or []}

    elif name == "add_note":
        content = arguments.get("content")
        embedding = generate_embedding(content)
        res = supabase.table("embeddings").insert({
            "user_id": user_id,
            "content": content,
            "embedding": embedding,
            "source_type": "note"
        }).execute()
        return {"status": "success", "message": "Saved note to Brain"}

    elif name == "list_notes":
        res = supabase.table("embeddings").select("id, content, created_at").eq("user_id", user_id).eq("source_type", "note").order("created_at", desc=True).execute()
        return {"notes": res.data or []}

    elif name == "add_goal":
        res = supabase.table("goals").insert({
            "user_id": user_id,
            "goal_title": arguments.get("goal_title"),
            "description": arguments.get("description", ""),
            "status": "pending",
            "deadline": arguments.get("deadline")
        }).execute()
        return {"status": "success", "message": f"Created goal: {arguments.get('goal_title')}"}

    elif name == "list_goals":
        res = supabase.table("goals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {"goals": res.data or []}

    elif name == "add_journal_entry":
        from datetime import date as today_date
        entry_date = arguments.get("entry_date") or str(today_date.today())
        res = supabase.table("journal").insert({
            "user_id": user_id,
            "entry_text": arguments.get("entry_text"),
            "mood": arguments.get("mood", "neutral"),
            "date": entry_date
        }).execute()
        return {"status": "success", "message": "Saved journal entry"}

    elif name == "list_journal_entries":
        res = supabase.table("journal").select("*").eq("user_id", user_id).order("date", desc=True).execute()
        return {"entries": res.data or []}

    else:
        return {"error": f"Unknown tool: {name}"}


@router.post("/chat")
async def chat(request: ChatRequest, user=Depends(get_current_user)):
    """
    RAG-powered chat with tool execution capabilities.
    """
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required")

    # 1. Convert query to embedding
    query_embedding = generate_embedding(request.query)

    # 2. Search across all source types for context
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

    # 4. Construct Agent prompt & messages
    system_prompt = (
        "You are YUDO, an advanced personal AI assistant. "
        "You have access to the user's private memory/context. "
        "If the context contains relevant information, use it to answer. "
        "If the context is empty or irrelevant to the query, answer the query as a helpful, friendly AI assistant.\n\n"
        "You also have active tools that allow you to read and write to the user's personal assistant data (Timeline, Notes, Goals, and Journal). "
        "Use these tools whenever the user asks you to save, list, or schedule things.\n\n"
        "IMPORTANT: When calling tools, you must output native tool call structures. Never write XML tags like '<function=...>' or '<tool_call>' in your conversational output."
    )

    context_section = f"Context:\n{context_text}\n\n" if context_text.strip() else ""
    
    messages = [
        {"role": "system", "content": f"{system_prompt}\n\n{context_section}"},
        {"role": "user", "content": request.query}
    ]

    # 5. Agent Run Loop (Max 5 tool iterations)
    for iteration_idx in range(1, 6):
        start_time = time.time()
        try:
            response = groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )
            latency_ms = int((time.time() - start_time) * 1000)
            
            response_message = response.choices[0].message
            usage = getattr(response, "usage", None)
            input_tokens = getattr(usage, "prompt_tokens", 0) if usage else 0
            output_tokens = getattr(usage, "completion_tokens", 0) if usage else 0

            tool_calls_list = []
            tools_called_for_log = []
            if response_message.tool_calls:
                for tc in response_message.tool_calls:
                    try:
                        args_parsed = json.loads(tc.function.arguments)
                    except Exception:
                        args_parsed = tc.function.arguments

                    tools_called_for_log.append({
                        "name": tc.function.name,
                        "arguments": args_parsed
                    })
                    tool_calls_list.append({
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    })

            # Record per-call agent log (1 row per iteration)
            await log_agent_call(
                user_id=user.id,
                conversation_turn=request.query,
                iteration=iteration_idx,
                model=GROQ_MODEL,
                latency_ms=latency_ms,
                status="success",
                tools_called=tools_called_for_log,
                input_tokens=input_tokens,
                output_tokens=output_tokens
            )

            # If model doesn't request tool calling, return its content
            if not response_message.tool_calls:
                messages.append({"role": "assistant", "content": response_message.content})
                break

            # Append assistant's request for tool call
            messages.append({
                "role": "assistant",
                "content": response_message.content or "",
                "tool_calls": tool_calls_list
            })

            # Process each tool call
            for tc in response_message.tool_calls:
                name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments)
                except Exception:
                    args = {}
                
                tool_result = await execute_tool(name, args, user.id)
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": name,
                    "content": json.dumps(tool_result)
                })

        except Exception as groq_err:
            latency_ms = int((time.time() - start_time) * 1000)
            await log_agent_call(
                user_id=user.id,
                conversation_turn=request.query,
                iteration=iteration_idx,
                model=GROQ_MODEL,
                latency_ms=latency_ms,
                status="error",
                error_message=str(groq_err)
            )
            logger.warning(f"Groq API error on iteration {iteration_idx}: {groq_err}")
            if iteration_idx == 1:
                messages.append({
                    "role": "assistant",
                    "content": "I apologize, but I encountered an error communicating with the AI service. Please try your request again."
                })
            break

    # Retrieve final assistant answer
    answer = "I processed your request."
    for msg in reversed(messages):
        if msg.get("role") == "assistant" and msg.get("content"):
            answer = msg.get("content")
            break
    
    return {"answer": answer, "context_used": matches}
