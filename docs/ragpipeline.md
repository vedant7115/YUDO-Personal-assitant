# YUDO RAG Pipeline (AI Memory System)

## What is RAG?

RAG = Retrieval Augmented Generation
It allows AI to answer questions using user documents and stored data.

---

## Document Upload Flow

```
Upload Document
→ Extract Text
→ Split into Chunks
→ Convert to Embeddings
→ Store in Vector Database
→ Store Document Info in PostgreSQL
```

---

## Chat Query Flow

```
User Question
→ Convert Question to Embedding
→ Search Vector Database
→ Retrieve Relevant Text Chunks
→ Send Context + Question to AI
→ AI Generates Answer
→ Return Response
```

---

## Embeddings

Embeddings convert text into vectors so similar text can be searched.

Used for:

* Document search
* Notes search
* Journal search
* Timeline search
* Memory retrieval

---

## Vector Database Options

* Supabase Vector
* Pinecone
* Weaviate
* Qdrant
* Chroma

---

## RAG Components

| Component       | Purpose                 |
| --------------- | ----------------------- |
| Embedding Model | Convert text to vectors |
| Vector DB       | Store embeddings        |
| Retriever       | Find relevant text      |
| LLM             | Generate answer         |
| Prompt          | Context + question      |

---

## Example Prompt Sent to AI

```
Context:
User uploaded ML certificate in 2025 from Coursera.

Question:
When did I get my ML certificate?

Answer:
```

AI will answer based on stored context.
