import asyncio
import io
import os
import sys
from dotenv import load_dotenv

load_dotenv()

from fastapi import UploadFile, HTTPException
from routers.documents import upload_document, list_documents, search_document
from services.hybrid_search import hybrid_search, rerank_candidates
from services.supabase_client import supabase
from routers.usage import get_usage_summary


class MockUser:
    def __init__(self, user_id):
        self.id = user_id


async def run_tests():
    user = MockUser("41999af3-4b1a-49c8-a89d-763cd731e28f")
    print("=== TEST 1: Varied Document Uploads (Processed vs Failed) ===")

    # 1. Clean Text/Markdown Document
    clean_content = b"# Architecture Overview\nThis document covers Quantum Financial Intelligence and algorithmic execution."
    f_clean = UploadFile(filename="clean_doc.txt", file=io.BytesIO(clean_content), headers={"content-type": "text/plain"})
    res_clean = await upload_document(file=f_clean, context="System Architecture", type="doc", user=user)
    print("1. Clean Doc Upload Result:", res_clean)
    assert res_clean.get("status") == "processed", "Clean doc should be processed"

    # 2. Unique Keyword Document for Hybrid Search test
    kw_content = b"Special Project Alpha: The cryptographic secret token is XYZZY-SECRET-7788-TOKEN."
    f_kw = UploadFile(filename="secret_key.txt", file=io.BytesIO(kw_content), headers={"content-type": "text/plain"})
    res_kw = await upload_document(file=f_kw, context="Cryptographic Token", type="doc", user=user)
    print("2. Keyword Doc Upload Result:", res_kw)
    assert res_kw.get("status") == "processed", "Keyword doc should be processed"

    # 3. Broken / Corrupt PDF File
    broken_content = b"%PDF-1.4 Corrupted binary content that will fail pdfplumber parsing \x00\xff\xfe"
    f_broken = UploadFile(filename="corrupted.pdf", file=io.BytesIO(broken_content), headers={"content-type": "application/pdf"})
    try:
        await upload_document(file=f_broken, context="Corrupted PDF", type="doc", user=user)
        print("Error: Corrupted PDF should have raised an exception!")
    except HTTPException as e:
        print(f"3. Broken file correctly failed loudly with status {e.status_code}: {e.detail}")

    print("\n=== TEST 2: List Documents from Single Source of Truth ===")
    docs = await list_documents(user=user)
    print(f"Fetched {len(docs)} documents:")
    for d in docs[:5]:
        print(f" - [{d.get('status')}] {d.get('name')} | Size: {d.get('size')} | Error: {d.get('error_message')}")

    print("\n=== TEST 3: Hybrid Search (Exact Keyword Match) ===")
    hybrid_matches = await hybrid_search(query="XYZZY-SECRET-7788-TOKEN", user_id=user.id, match_count=5)
    print(f"Hybrid search returned {len(hybrid_matches)} matches for keyword 'XYZZY-SECRET-7788-TOKEN'")
    found_secret = any("XYZZY-SECRET-7788-TOKEN" in m.get("content", "") for m in hybrid_matches)
    print("Secret token successfully retrieved by Hybrid Search:", found_secret)
    assert found_secret, "Hybrid search failed to retrieve exact keyword document!"

    print("\n=== TEST 4: Re-Ranking Step & Agent Logs Observability ===")
    reranked = await rerank_candidates(query="Find the secret cryptographic token", candidates=hybrid_matches, user_id=user.id, top_k=3)
    print(f"Reranked {len(reranked)} items. Top score: {reranked[0].get('rerank_score')}")

    usage = await get_usage_summary(user=user)
    print("Current Usage Summary:", usage)
    assert usage.get("total_calls", 0) > 0, "Usage summary should show logged calls"

    print("\nALL PHASE 2 RAG HARDENING TESTS PASSED!")


if __name__ == "__main__":
    asyncio.run(run_tests())
