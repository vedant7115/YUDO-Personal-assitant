import os
from groq import Groq
from dotenv import load_dotenv
from fastembed import TextEmbedding

load_dotenv()

# Initialize FastEmbed for Embeddings (Runs locally, 768 dims, replaces Gemini)
# We use bge-base-en-v1.5 to match the 768 dimensionality previously used by Gemini
embedding_model = TextEmbedding(model_name="BAAI/bge-base-en-v1.5")

# Initialize Groq for Generation
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY must be set in .env")

groq_client = Groq(api_key=GROQ_API_KEY)


def generate_embedding(text: str) -> list[float]:
    """
    Generate a 768-dimension embedding using local FastEmbed model.
    Replaces Gemini because of rate limit / credit issues.
    """
    embeddings = list(embedding_model.embed([text]))
    # Convert numpy array to list of floats
    return embeddings[0].tolist()


def generate_response(query: str, context: str) -> str:
    """
    Generate a RAG-grounded response using Groq (llama-3.3-70b-versatile).
    """
    system_prompt = (
        "You are YUDO, an advanced personal AI assistant. "
        "You have access to the user's private memory/context. "
        "If the context contains relevant information, use it to answer. "
        "If the context is empty or irrelevant to the query, answer the query as a helpful, friendly AI assistant."
    )
    
    context_section = f"Context:\n{context}\n\n" if context.strip() else ""
    full_prompt = f"{system_prompt}\n\n{context_section}User Query: {query}"

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": full_prompt}
        ]
    )
    return response.choices[0].message.content


def process_notes(query: str, notes_context: str) -> str:
    """
    Perform summarization, reasoning, or math based on user notes using Groq.
    """
    prompt = (
        f"You are YUDO, a personal AI assistant.\n"
        f"Perform the user's requested action (summarization, reasoning, or math) based purely on the notes.\n\n"
        f"Notes:\n{notes_context}\n\nUser Query: {query}\n\nAnswer clearly and concisely."
    )
    
    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content
