 # YUDO MVP Vision & Strategic Roadmap

## Core Philosophy
**Tagline:** "IT KNOWS YOU BETTER THAN YOU YOURSELF"
**Identity:** YUDO is not just a chatbot. It is an omniscient, highly personal AI Second Brain that centralizes your documents, life events, financial math, and secrets, allowing you to recall them instantly just by asking.

---

## The 3 Core MVP Pillars

### 1. The Document Vault (Contextual File Storage)
*   **Functionality:** A secure drop-zone for files, images, documents, certificates, and passwords.
*   **The AI Twist:** When a user uploads a file (e.g., a PDF of an Oracle Certificate or an image of a PAN card), they add short context. YUDO immediately absorbs this into its Vector Memory.
*   **The UX Outcome:** The user never has to search through folders again. They simply ask the chat, *"What is my PAN card number?"* or *"Show me my Oracle certificate,"* and YUDO extracts the exact phrasing or file instantly.

### 2. YUDO Memorizer (Life & Event Context)
*   **Functionality:** A dynamic, ambient memory engine for life events, deadlines, and personal connections.
*   **The AI Twist:** Users brain-dump casual thoughts into it: *"Tomorrow is my last day of the Cisco course,"* *"My friend's birthday is on the 12th,"* or *"The last date to submit the form is coming soon."*
*   **The UX Outcome:** YUDO maps these temporal events. It proactively understands time and relationships, actively remembering exactly who you are, who your friends are, and what your pressures are.

### 3. Effective Notes (Semantic Auto-Summarizing Notebook)
*   **Functionality:** A scratchpad for daily budgeting, rough logic, and continuous thought streaming.
*   **The AI Twist:** Unlike Apple Notes or Notion where math requires manual spreadsheets, YUDO understands *meaning* and *math* deep within the text.
*   **The UX Outcome:** Instead of manually calculating a budget, the user writes: *"Given 50 to Priyansh, 60 to Rahul."* Later, the user asks the chat, *"How much money does Priyansh owe me?"* and YUDO instantly cross-references the notes and provides the exact mathematical summary.

---

## The Core Interface: The YUDO AI Agent
*   **Functionality:** The simple, unified conversational interface that bridges the Vault, Memorizer, and Notes.
*   **The UX Outcome:** This is the singular master UI. Whether the user is searching for themselves, asking for a summary of their finances, or checking a deadline, they do it by talking natively to YUDO. It acts autonomously to fetch the exact context from the deep storage.

---

## Technical Mapping (How we build this)
To achieve this specific vision using our current stack (React + FastAPI + Supabase):

1.  **Vector Embeddings (Memory):** Everything written in Notes and Memorizer, and the text extracted from Documents, will be converted into mathematical vectors (OpenAI embeddings) and stored in **Supabase pgvector**.
2.  **RAG Pipeline (Retrieval-Augmented Generation):** When the user chats, FastAPI will instantly search the Vector database for the most relevant documents/notes, inject them into an LLM (like GPT-4), and stream the calculated, highly-contextual answer back to the UI.
3.  **Frontend Layout Updates:** We will tailor the Dashboard, Documents, Notes, and Chat UI to perfectly match these three core pillars.
