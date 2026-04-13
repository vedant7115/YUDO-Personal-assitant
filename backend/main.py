from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="YUDO Backend API", description="Foundation for YUDO Personal AI Assistant", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to YUDO SaaS Backend Framework"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Phase 2 & 4 API placeholders
@app.post("/auth/login")
def login():
    return {"status": "not_implemented"}

@app.post("/auth/signup")
def signup():
    return {"status": "not_implemented"}

from connector import db_connector

@app.get("/documents")
def get_documents():
    return {"data": db_connector.get_documents()}

@app.get("/chat/history")
def get_chat_history():
    return {"data": db_connector.get_chat_history()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
