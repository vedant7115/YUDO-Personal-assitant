from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from services.supabase_client import supabase
from services.gemini_service import generate_embedding, generate_response
from middleware.auth import get_current_user
from utils.text_splitter import split_text
import pdfplumber
import io
import os

router = APIRouter(prefix="/api/documents", tags=["Documents"])


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

    return {"message": "Document uploaded successfully", "file_url": file_url}

@router.get("/list-documents")
async def list_documents(user=Depends(get_current_user)):
    """
    Retrieve all uploaded documents for the current user.
    """
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
        
        # Extract filename from file_url (it looks like .../user.id/timestamp_filename)
        filename = file_url.split("_", 1)[-1] if "_" in file_url.split("/")[-1] else file_url.split("/")[-1]
        
        # Format date
        created_at = row.get("created_at", "")
        date_str = created_at.split("T")[0] if "T" in created_at else created_at
        
        docs.append({
            "id": row["id"],
            "name": filename or "Unknown Document",
            "description": row.get("context", ""),
            "size": "Unknown", # Size isn't stored in embeddings table
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
