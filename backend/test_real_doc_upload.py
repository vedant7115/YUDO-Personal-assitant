import asyncio
import io
import json
from dotenv import load_dotenv

load_dotenv()

from fastapi import UploadFile
from routers.documents import upload_document
from services.supabase_client import supabase
from routers.chat import chat, ChatRequest


class MockUser:
    def __init__(self, user_id):
        self.id = user_id


async def run():
    user = MockUser("41999af3-4b1a-49c8-a89d-763cd731e28f")

    # 1. Upload a new test document
    doc_text = (
        "Project Orion Specification:\n"
        "Project Orion is an autonomous deep learning agent for portfolio optimization.\n"
        "Security Token: ORION-AUTH-SECURE-9921\n"
        "Target quarterly revenue: 4.5 million USD."
    )
    f = UploadFile(
        filename="project_orion_spec.txt",
        file=io.BytesIO(doc_text.encode("utf-8")),
        headers={"content-type": "text/plain"}
    )

    print("Uploading test document 'project_orion_spec.txt'...")
    upload_res = await upload_document(file=f, context="Orion Architecture Spec", type="spec", user=user)
    print("Upload Response:", json.dumps(upload_res, indent=2))
    doc_id = upload_res.get("document_id")
    print(f"Document ID returned from upload: {doc_id}")

    # 2. Query documents table directly to verify row
    doc_row = supabase.table("documents").select("*").eq("id", doc_id).execute()
    print("\n=== SUPABASE DOCUMENTS TABLE ROW ===")
    print(json.dumps(doc_row.data, indent=2))

    # 3. Query embeddings table directly to confirm document_id is NOT NULL
    emb_rows = supabase.table("embeddings").select("id, document_id, content, source_type, created_at").eq("document_id", doc_id).execute()
    print("\n=== SUPABASE EMBEDDINGS TABLE CHUNK ROWS (CONFIRMING document_id IS NOT NULL) ===")
    print(json.dumps(emb_rows.data, indent=2))

    # Assert document_id is populated
    assert len(emb_rows.data) > 0, "No embeddings rows found for this document_id!"
    assert emb_rows.data[0]["document_id"] == doc_id, f"document_id mismatch: {emb_rows.data[0]['document_id']} vs {doc_id}"
    print("\nVERIFIED: document_id is strictly populated and matches documents.id!")

    # 4. Proceed with hybrid search chat test for exact keyword match
    print("\n=== RUNNING HYBRID SEARCH CHAT TEST ===")
    chat_req = ChatRequest(query="What is the security token for Project Orion?")
    chat_res = await chat(chat_req, user=user)
    print("\nChat Response Answer:")
    print(chat_res.get("answer"))
    print("\nContext Used (Hybrid + Reranked):")
    for c in chat_res.get("context_used", []):
        print(f" - [{c.get('source_type')}] (rerank_score: {c.get('rerank_score')}) {c.get('content')[:120]}...")


if __name__ == "__main__":
    asyncio.run(run())
