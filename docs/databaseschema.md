# YUDO Database Schema

## Overview

This document defines the database schema for **YUDO – Personal AI Assistant SaaS**.
The database is designed to store user data, documents, notes, AI interactions, and memory-related information.

---

# 1. Users Table

Stores user account information.

```sql
users
------
id (UUID, Primary Key)
name (TEXT)
email (TEXT, Unique)
password_hash (TEXT)
created_at (TIMESTAMP)
```

---

# 2. Documents Table

Stores uploaded files such as certificates, IDs, and PDFs.

```sql
documents
---------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
file_name (TEXT)
file_url (TEXT)
file_type (TEXT)
uploaded_at (TIMESTAMP)
```

---

# 3. Notes Table

Stores personal notes (second brain).

```sql
notes
-----
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
title (TEXT)
content (TEXT)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

---

# 4. Achievements Table

Stores certificates and achievements.

```sql
achievements
------------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
title (TEXT)
description (TEXT)
date (DATE)
certificate_url (TEXT)
```

---

# 5. Goals Table

Tracks user goals and progress.

```sql
goals
-----
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
goal_title (TEXT)
description (TEXT)
status (TEXT) -- (pending, in-progress, completed)
deadline (DATE)
created_at (TIMESTAMP)
```

---

# 6. Journal Table

Stores daily journal entries.

```sql
journal
-------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
entry_text (TEXT)
date (DATE)
mood (TEXT)
```

---

# 7. Timeline Table

Stores important life events.

```sql
timeline
--------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
event_title (TEXT)
description (TEXT)
event_date (DATE)
```

---

# 8. Chat History Table

Stores AI conversation history.

```sql
chat_history
------------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
message (TEXT)
response (TEXT)
timestamp (TIMESTAMP)
```

---

# 9. Embeddings Table (Vector DB Reference)

Stores embeddings for AI memory (RAG system).

```sql
embeddings
----------
id (UUID, Primary Key)
user_id (UUID, Foreign Key → users.id)
document_id (UUID)
embedding_vector (VECTOR)
text_chunk (TEXT)
```

---

# Relationships Summary

* One user → many documents
* One user → many notes
* One user → many goals
* One user → many journal entries
* One user → many timeline events
* One user → many chat messages

---

# Notes

* Use UUID for all primary keys
* Use foreign keys for data relationships
* Use indexing on `user_id` for performance
* Store files in storage (Supabase/S3), not directly in DB
* Embeddings stored in vector database (or pgvector)

---

# Future Enhancements

* Add roles (admin/user)
* Add sharing system
* Add team workspace
* Add notifications table
* Add activity logs

---

# End of File

**YUDO Database Schema Documentation**
