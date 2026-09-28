from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, generate_response
from services.hybrid_search import hybrid_search, rerank_candidates
from middleware.auth import get_current_user
from utils.text_splitter import split_text
import pdfplumber
import io
import os
import logging

logger = logging.getLogger(__name__)

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
    Uploads document following the 2-step pending -> processed/failed flow:
    1. Records document in 'documents' table with status='pending'
    2. Runs text extraction, chunking, and embedding generation
    3. Links embeddings with document_id and updates status to 'processed' or 'failed'
    """
    file_bytes = await file.read()
    size_bytes = len(file_bytes)
    doc_context = context or type or "Uploaded document"
    document_id = None

    # Step 1: Insert pending record in documents table
    try:
        doc_insert = supabase.table("documents").insert({
            "user_id": user.id,
            "filename": file.filename,
            "description": doc_context,
            "size_bytes": size_bytes,
            "mime_type": file.content_type,
            "status": "pending"
        }).execute()
        if doc_insert.data:
            document_id = doc_insert.data[0]["id"]
    except Exception as e:
        logger.warning(f"Failed to create pending document entry in documents table: {e}")

    try:
        # Step 2: Upload to Supabase Storage
        file_path = f"{user.id}/{int(__import__('time').time())}_{file.filename}"
        supabase.storage.from_("documents").upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )

        supabase_url = os.getenv("SUPABASE_URL")
        file_url = f"{supabase_url}/storage/v1/object/public/documents/{file_path}"

        # Step 3: Extract text
        extracted_text = ""
        if file.content_type == "application/pdf":
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    pages_text = [page.extract_text() or "" for page in pdf.pages]
                    extracted_text = "\n".join(pages_text).strip()
            except Exception as pdf_err:
                raise ValueError(f"Failed to parse PDF content: {pdf_err}")
        else:
            try:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                extracted_text = f"File: {file.filename}"

        if not extracted_text:
            extracted_text = f"File: {file.filename} (No extractable text found)"

        # Step 4: Split into chunks & generate embeddings
        chunks = split_text(extracted_text, chunk_size=1000, chunk_overlap=200)
        insert_data = []
        for i, chunk_text in enumerate(chunks):
            chunk_content = f"Context: {doc_context}\nChunk {i+1}/{len(chunks)}\nContent:\n{chunk_text}"
            embedding = generate_embedding(chunk_content)
            record = {
                "user_id": user.id,
                "content": chunk_content,
                "embedding": embedding,
                "source_type": "document",
                "file_url": file_url,
                "context": doc_context
            }
            if document_id:
                record["document_id"] = document_id
            insert_data.append(record)

        if insert_data:
            supabase.table("embeddings").insert(insert_data).execute()

        # Step 5: Mark document as processed
        if document_id:
            supabase.table("documents").update({
                "status": "processed",
                "file_url": file_url,
                "size_bytes": size_bytes
            }).eq("id", document_id).execute()

        return {
            "message": "Document processed and indexed successfully",
            "document_id": document_id,
            "status": "processed",
            "file_url": file_url,
            "size_bytes": size_bytes,
            "size": format_file_size(size_bytes)
        }

    except Exception as err:
        logger.error(f"Error processing document {file.filename}: {err}", exc_info=True)
        # Mark document as failed with exact error message
        if document_id:
            try:
                supabase.table("documents").update({
                    "status": "failed",
                    "error_message": str(err)
                }).eq("id", document_id).execute()
            except Exception as upd_err:
                logger.error(f"Failed to update document error status: {upd_err}")

        raise HTTPException(
            status_code=422 if isinstance(err, ValueError) else 500,
            detail=f"Document extraction/processing failed: {str(err)}"
        )


@router.get("/list-documents")
async def list_documents(user=Depends(get_current_user)):
    """
    Retrieve all uploaded documents for the user from the primary documents table.
    Falls back gracefully to embeddings table if documents table is empty/unmigrated.
    """
    # 1. Try querying primary documents table
    try:
        response = supabase.table("documents") \
            .select("*") \
            .eq("user_id", user.id) \
            .order("created_at", desc=True) \
            .execute()
        
        if response.data and len(response.data) > 0:
            docs = []
            for row in response.data:
                size_bytes = row.get("size_bytes", 0)
                created_at = row.get("created_at", "")
                date_str = created_at.split("T")[0] if "T" in created_at else created_at
                docs.append({
                    "id": row["id"],
                    "name": row.get("filename") or "Unknown Document",
                    "description": row.get("description", ""),
                    "size": format_file_size(size_bytes),
                    "size_bytes": size_bytes,
                    "status": row.get("status", "processed"),
                    "error_message": row.get("error_message"),
                    "date": date_str,
                    "url": row.get("file_url", "")
                })
            return docs
    except Exception as e:
        logger.warning(f"Could not read from documents table, falling back: {e}")

    # 2. Fallback to embeddings records for backwards compatibility
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
        storage_filename = file_url.split("/")[-1]
        display_name = storage_filename.split("_", 1)[-1] if "_" in storage_filename else storage_filename
        created_at = row.get("created_at", "")
        date_str = created_at.split("T")[0] if "T" in created_at else created_at
        docs.append({
            "id": row["id"],
            "name": display_name or "Unknown Document",
            "description": row.get("context", ""),
            "size": "Unknown",
            "size_bytes": 0,
            "status": "processed",
            "date": date_str,
            "url": file_url
        })

    return docs


@router.get("/search-document")
async def search_document(query: str, user=Depends(get_current_user)):
    """
    Hybrid semantic + keyword search over documents with LLM re-ranking.
    """
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    # 1. Hybrid Search (pgvector cosine + keyword full-text via RRF)
    candidates = await hybrid_search(query=query, user_id=user.id, source_type="document", match_count=8)

    if not candidates:
        return {"answer": "I couldn't find relevant documents for your query.", "matches": []}

    # 2. Re-rank Step using Groq (logged in agent_logs)
    reranked_matches = await rerank_candidates(query=query, candidates=candidates, user_id=user.id, top_k=5)

    # 3. Grounded generation using re-ranked context
    context_text = "\n---\n".join(m.get("content", "") for m in reranked_matches)
    answer = generate_response(query, context_text)

    return {"answer": answer, "matches": reranked_matches}

