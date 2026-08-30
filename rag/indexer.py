import os
from typing import List, Dict, Any, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

from extractor import extract_text_from_file
import db

INDEX_DIR = os.getenv("INDEX_DIR", os.path.join(os.path.dirname(__file__), "faiss_index"))
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")

_embedding_model = None
_vector_store = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    return _embedding_model

def get_vector_store():
    global _vector_store
    if _vector_store is None:
        emb = get_embedding_model()
        if os.path.exists(INDEX_DIR) and os.path.exists(os.path.join(INDEX_DIR, "index.faiss")):
            try:
                _vector_store = FAISS.load_local(INDEX_DIR, emb, allow_dangerous_deserialization=True)
            except Exception as e:
                print(f"Could not load existing FAISS index: {e}")
                _vector_store = None
    return _vector_store

def save_vector_store(vs):
    global _vector_store
    _vector_store = vs
    os.makedirs(INDEX_DIR, exist_ok=True)
    _vector_store.save_local(INDEX_DIR)

def index_files(file_paths: List[str]) -> Dict[str, Any]:
    db.init_db()
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    all_chunks: List[Document] = []
    indexed_files = []
    errors = []

    for path in file_paths:
        try:
            res = extract_text_from_file(path)
            text = res.get("text", "")
            if not text:
                continue

            chunks = splitter.split_text(text)
            if not chunks:
                continue

            for i, c in enumerate(chunks):
                doc = Document(
                    page_content=c,
                    metadata={
                        "filename": res["filename"],
                        "filepath": res["filepath"],
                        "file_type": res["type"],
                        "chunk_index": i
                    }
                )
                all_chunks.append(doc)

            # Store in DB
            db.add_or_update_document(
                filename=res["filename"],
                filepath=res["filepath"],
                file_type=res["type"],
                file_size=res["size"],
                chunk_count=len(chunks)
            )
            indexed_files.append(res["filename"])
        except Exception as e:
            errors.append({"file": path, "error": str(e)})

    if all_chunks:
        emb = get_embedding_model()
        current_vs = get_vector_store()
        if current_vs is None:
            current_vs = FAISS.from_documents(all_chunks, emb)
        else:
            current_vs.add_documents(all_chunks)
        save_vector_store(current_vs)

    return {
        "indexed_count": len(indexed_files),
        "total_chunks": len(all_chunks),
        "files": indexed_files,
        "errors": errors
    }

def index_folder(folder_path: str, recursive: bool = True) -> Dict[str, Any]:
    if not os.path.exists(folder_path):
        return {"error": f"Folder does not exist: {folder_path}", "indexed_count": 0}

    valid_extensions = {
        ".pdf", ".docx", ".doc", ".txt", ".md", ".py", ".js", ".json", 
        ".csv", ".html", ".png", ".jpg", ".jpeg"
    }

    file_paths = []
    if recursive:
        for root, _, files in os.walk(folder_path):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in valid_extensions and not file.startswith("."):
                    file_paths.append(os.path.join(root, file))
    else:
        for file in os.listdir(folder_path):
            full = os.path.join(folder_path, file)
            if os.path.isfile(full):
                ext = os.path.splitext(file)[1].lower()
                if ext in valid_extensions and not file.startswith("."):
                    file_paths.append(full)

    return index_files(file_paths)

def search_documents(query: str, k: int = 5) -> List[Dict[str, Any]]:
    vs = get_vector_store()
    if vs is None:
        return []

    # search with score (L2 distance or inner product)
    docs_and_scores = vs.similarity_search_with_score(query, k=k)
    results = []

    for doc, score in docs_and_scores:
        # FAISS returns L2 distance by default (lower is closer)
        # Convert distance to approximate percentage confidence
        confidence = max(10, min(99, int(100 / (1.0 + float(score)))))
        
        results.append({
            "title": doc.metadata.get("filename", "Unknown"),
            "filename": doc.metadata.get("filename", "Unknown"),
            "filepath": doc.metadata.get("filepath", ""),
            "file_type": doc.metadata.get("file_type", "txt"),
            "snippet": doc.page_content.strip().replace("\n", " ")[:300] + "...",
            "confidence": confidence,
            "score": float(score)
        })

    return results
