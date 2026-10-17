import os
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from contextlib import asynccontextmanager
import db
from indexer import index_folder, index_files, search_documents, get_embedding_model
from llm import ask_question

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    db.init_db()
    # Pre-warm local embedding model so first upload or search has zero cold-start delay
    try:
        get_embedding_model()
    except Exception as e:
        import logging
        logging.getLogger("mimir.api").warning(f"Embedding model pre-warming deferred: {e}")
    yield

app = FastAPI(
    title="Mimir AI API",
    description="Private on-device AI backend for local file indexing, semantic search, and RAG Q&A",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for local frontend integration (supports dev 5173, preview 4173, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/health")
def health_check():
    """
    Health check endpoint returning system status and document database stats.
    """
    stats = db.get_document_stats()
    return {
        "status": "healthy",
        "service": "Mimir AI API",
        "on_device": True,
        "llm_engine": os.getenv("OLLAMA_MODEL", "qwen2.5:3b"),
        "stats": stats
    }

# ─── Pydantic Request Models ──────────────────────────────────────────────────

class IndexRequest(BaseModel):
    folder_path: Optional[str] = None
    file_paths: Optional[List[str]] = None
    recursive: Optional[bool] = True

class SearchRequest(BaseModel):
    query: str
    k: Optional[int] = 5

class AskRequest(BaseModel):
    query: str
    file_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None
    k: Optional[int] = 4

# ─── 4 Core Endpoints ────────────────────────────────────────────────────────

@app.post("/index")
def index_endpoint(req: IndexRequest):
    """
    1. POST /index
    Process/index local files or a directory into FAISS and SQLite.
    Validates folder existence, allowed file types, and handles errors cleanly.
    """
    try:
        if req.folder_path:
            clean_folder = req.folder_path.strip().strip('"\'')
            abs_folder = os.path.abspath(os.path.expanduser(clean_folder))
            if not os.path.exists(abs_folder):
                raise HTTPException(status_code=400, detail=f"Folder not found: {req.folder_path}")
            if not os.path.isdir(abs_folder):
                raise HTTPException(status_code=400, detail=f"Path is not a directory: {req.folder_path}")
            result = index_folder(abs_folder, recursive=req.recursive if req.recursive is not None else True)
            return {"status": "success", "data": result}
        
        elif req.file_paths:
            valid_paths = []
            for p in req.file_paths:
                clean_p = p.strip().strip('"\'')
                abs_p = os.path.abspath(os.path.expanduser(clean_p))
                if os.path.isfile(abs_p):
                    valid_paths.append(abs_p)
            if not valid_paths:
                raise HTTPException(status_code=400, detail="None of the specified file paths exist or are files.")
            result = index_files(valid_paths)
            return {"status": "success", "data": result}
        
        else:
            raise HTTPException(status_code=400, detail="Must provide either folder_path or file_paths")
    except HTTPException:
        raise
    except Exception as e:
        import logging
        logging.getLogger("mimir.api").error(f"Error during indexing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An error occurred while indexing files.")


from fastapi import UploadFile, File
import shutil

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploaded_docs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_files_endpoint(files: List[UploadFile] = File(...)):
    """
    Allow users to select files from their OS File Manager (Finder / File Explorer)
    and index them into Mimir.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    saved_paths = []
    for file in files:
        safe_name = os.path.basename(file.filename)
        dest_path = os.path.join(UPLOAD_DIR, safe_name)
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_paths.append(dest_path)

    try:
        result = index_files(saved_paths)
        return {"status": "success", "data": result}
    except Exception as e:
        import logging
        logging.getLogger("mimir.api").error(f"Error indexing uploaded files: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to index uploaded files.")


@app.get("/documents")
def documents_endpoint():
    """
    2. GET /documents
    Get files Mimir has indexed along with storage & file count stats.
    """
    docs = db.get_all_documents()
    stats = db.get_document_stats()
    return {
        "status": "success",
        "stats": stats,
        "documents": docs
    }


@app.post("/search")
def search_endpoint(req: SearchRequest):
    """
    3. POST /search
    Semantic natural-language file search.
    """
    if not req.query.strip():
        return {"status": "success", "query": req.query, "results": []}

    try:
        results = search_documents(query=req.query.strip(), k=req.k or 5)
        return {
            "status": "success",
            "query": req.query,
            "results": results
        }
    except Exception as e:
        import logging
        logging.getLogger("mimir.api").error(f"Error during search: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Search operation failed. Please check local vector index.")


@app.post("/ask")
def ask_endpoint(req: AskRequest):
    """
    4. POST /ask
    Ask a question and get a grounded AI answer from indexed local files.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    try:
        res = ask_question(
            query=req.query.strip(),
            file_filter=req.file_id,
            history=req.history,
            k=req.k or 4
        )
        return {
            "status": "success",
            "query": req.query,
            "answer": res["answer"],
            "sources": res["sources"],
            "context": res["context"]
        }
    except Exception as e:
        import logging
        logging.getLogger("mimir.api").error(f"Error during Q&A generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process question with local models.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)