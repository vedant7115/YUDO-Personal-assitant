# YUDO System Architecture

## Overview

YUDO is a SaaS web application with AI memory and document storage.
The system follows a multi-layer architecture.

## High-Level Architecture

```
Client (Browser / Mobile)
        |
Frontend (Next.js)
        |
Backend API (Node.js / FastAPI)
        |
-----------------------------------
| PostgreSQL Database             |
| Vector Database (Embeddings)    |
| File Storage (Documents/Images) |
-----------------------------------
        |
AI APIs (OpenAI / Gemini)
```

---

## Components Description

### Frontend

* Dashboard UI
* Chat Interface
* Document Manager
* Notes
* Timeline
* Goals
* Journal
* Resume Builder
* Portfolio Builder

### Backend

Handles:

* Authentication
* API endpoints
* Database operations
* File uploads
* AI API calls
* RAG pipeline
* Security

### Database

Stores:

* Users
* Notes
* Documents
* Achievements
* Goals
* Journal
* Timeline
* Chat history

### File Storage

Stores:

* PDFs
* Certificates
* Images
* IDs
* Documents

### Vector Database

Stores:

* Embeddings of documents
* Embeddings of notes
* Embeddings of journal entries

### AI APIs

Used for:

* Chat assistant
* Resume generation
* Portfolio generation
* Document summarization
* Timeline summary
* Goal suggestions

---

## Data Flow Example (Chat with Documents)

```
User Question
→ Backend
→ Convert to Embedding
→ Search Vector DB
→ Retrieve Relevant Text
→ Send Context + Question to AI
→ AI Response
→ Frontend
```

This system is called **RAG (Retrieval Augmented Generation)**.
