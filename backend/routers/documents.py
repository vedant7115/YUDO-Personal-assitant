from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, generate_response
from middleware.auth import get_current_user
from utils.text_splitter import split_text
import pdfplumber
import io
import os

router = APIRouter(prefix="/api/documents", tags=["Documents"])


def format_file_size(size_bytes: int) -> str:
    """Format bytes into human-readable string (e.g. 15.1 MB, 420 KB)."""
    try:
        size = float(size_bytes)
    except (ValueError, TypeError):
        return "Unknown"

    if size <= 0:
        return "0 B"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}" if unit != 'B' else f"{int(size)} B"
        size /= 1024.0
    return f"{size:.1f} TB"


@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    context: str = Form(""),
    type: str = Form(""),
    user=Depends(get_current_user)
):
    """
    Uploads a document to Supabase Storage, extracts text (PDF supported),
    generates embeddings, and stores everything for RAG retrieval.
    """
    file_bytes = await file.read()
    size_bytes = len(file_bytes)
    file_path = f"{user.id}/{int(__import__('time').time())}_{file.filename}"

    # Upload to Supabase Storage
    supabase.storage.from_("documents").upload(
        path=file_path,
        file=file_bytes,
        file_options={"content-type": file.content_type}
    )

    supabase_url = os.getenv("SUPABASE_URL")
    file_url = f"{supabase_url}/storage/v1/object/public/documents/{file_path}"

    # Extract text
    extracted_text = ""
    if file.content_type == "application/pdf":
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            extracted_text = "\n".join(
                page.extract_text() or "" for page in pdf.pages
            )
    else:
        extracted_text = f"File: {file.filename}"

    doc_context = context or type or "Uploaded document"
    
    # Split text into chunks to optimize RAG vector search
    chunks = split_text(extracted_text, chunk_size=1000, chunk_overlap=200) if extracted_text else [f"File: {file.filename}"]
    
    # Generate embeddings and bulk insert chunks
    insert_data = []
    for i, chunk_text in enumerate(chunks):
        chunk_content = f"Context: {doc_context}\nChunk {i+1}/{len(chunks)}\nContent:\n{chunk_text}"
        embedding = generate_embedding(chunk_content)
        insert_data.append({
            "user_id": user.id,
            "content": chunk_content,
            "embedding": embedding,
            "source_type": "document",
            "file_url": file_url,
            "context": doc_context
        })
    
    if insert_data:
        supabase.table("embeddings").insert(insert_data).execute()

    return {
        "message": "Document uploaded successfully",
        "file_url": file_url,
        "size_bytes": size_bytes,
        "size": format_file_size(size_bytes)
    }

@router.get("/list-documents")
async def list_documents(user=Depends(get_current_user)):
    """
    Retrieve all uploaded documents for the current user with real file sizes.
    """
    # 1. Fetch file metadata from Supabase Storage
    storage_size_map = {}
    try:
        storage_items = supabase.storage.from_("documents").list(path=user.id)
        for item in storage_items or []:
            name = item.get("name")
            meta = item.get("metadata") or {}
            size = meta.get("size") or meta.get("contentLength") or 0
            if name:
                storage_size_map[name] = size
    except Exception as e:
        import logging
        logging.getLogger("uvicorn.error").warning(f"Failed to fetch storage file sizes: {e}")

    # 2. Fetch embeddings records
    response = supabase.table("embeddings") \
        .select("id, file_url, context, created_at") \
        .eq("user_id", user.id) \
        .eq("source_type", "document") \
        .order("created_at", desc=True) \
        .execute()
    
    docs = []
    seen_urls = set()
    for row in response.data or []:
        file_url = row.get("file_url", "")
        if not file_url or file_url in seen_urls:
            continue
        seen_urls.add(file_url)
        
        # Extract filename in storage (looks like 1779049471_Team-LogicLegends...)
        storage_filename = file_url.split("/")[-1]
        
        # Human-readable display name
        display_name = storage_filename.split("_", 1)[-1] if "_" in storage_filename else storage_filename
        
        # Real size lookup
        size_bytes = storage_size_map.get(storage_filename, 0)
        formatted_size = format_file_size(size_bytes) if size_bytes else "Unknown"
        
        # Format date
        created_at = row.get("created_at", "")
        date_str = created_at.split("T")[0] if "T" in created_at else created_at
        
        docs.append({
            "id": row["id"],
            "name": display_name or "Unknown Document",
            "description": row.get("context", ""),
            "size": formatted_size,
            "size_bytes": size_bytes,
            "date": date_str,
            "url": file_url
        })
        
    return docs


@router.get("/search-document")
async def search_document(query: str, user=Depends(get_current_user)):
    """
    Semantically search uploaded documents and generate a Gemini-powered answer.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    query_embedding = generate_embedding(query)

    result = supabase.rpc("match_embeddings", {
        "query_embedding": query_embedding,
        "match_threshold": 0.5,
        "match_count": 5,
        "p_user_id": user.id,
        "p_source_type": "document"
    }).execute()

    matches = result.data or []

    if not matches:
        return {"answer": "I couldn't find relevant documents for your query.", "matches": []}

    context_text = "\n---\n".join(m["content"] for m in matches)
    answer = generate_response(query, context_text)

    return {"answer": answer, "matches": matches}
