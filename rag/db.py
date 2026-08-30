import os
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_PATH = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "mimir.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            filepath TEXT UNIQUE NOT NULL,
            file_type TEXT NOT NULL,
            file_size INTEGER DEFAULT 0,
            chunk_count INTEGER DEFAULT 0,
            indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            summary TEXT,
            status TEXT DEFAULT 'indexed'
        )
    """)
    conn.commit()
    conn.close()

def add_or_update_document(filename: str, filepath: str, file_type: str, file_size: int, chunk_count: int, summary: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat()
    cursor.execute("""
        INSERT INTO documents (filename, filepath, file_type, file_size, chunk_count, indexed_at, summary, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'indexed')
        ON CONFLICT(filepath) DO UPDATE SET
            filename = excluded.filename,
            file_type = excluded.file_type,
            file_size = excluded.file_size,
            chunk_count = excluded.chunk_count,
            indexed_at = excluded.indexed_at,
            summary = excluded.summary,
            status = 'indexed'
    """, (filename, filepath, file_type, file_size, chunk_count, now, summary))
    conn.commit()
    conn.close()

def get_all_documents() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM documents ORDER BY indexed_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_document_stats() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as count, SUM(file_size) as total_size, SUM(chunk_count) as total_chunks FROM documents")
    row = cursor.fetchone()
    conn.close()
    
    count = row["count"] if row and row["count"] else 0
    total_size = row["total_size"] if row and row["total_size"] else 0
    total_chunks = row["total_chunks"] if row and row["total_chunks"] else 0
    
    # Format size nicely
    if total_size < 1024 * 1024:
        size_str = f"{total_size / 1024:.1f} KB"
    elif total_size < 1024 * 1024 * 1024:
        size_str = f"{total_size / (1024 * 1024):.1f} MB"
    else:
        size_str = f"{total_size / (1024 * 1024 * 1024):.2f} GB"
        
    return {
        "indexed_files": count,
        "total_size_bytes": total_size,
        "storage_indexed": size_str if count > 0 else "0 KB",
        "total_chunks": total_chunks
    }
