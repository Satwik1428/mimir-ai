# Mimir AI

**Your private AI memory for your computer.**

Mimir is an on-device AI desktop assistant that understands, searches, and organizes your files using natural language with everything running locally. No cloud APIs, no uploads, no internet required for the core experience.


## Why Mimir

Most "AI file search" tools quietly send your documents to a cloud API. Mimir doesn't. Every step text extraction, embeddings, vector search, and the LLM that answers your questions runs entirely on your machine. Your files never leave your device.

> Ask "find my internship offer letter" instead of remembering what you named the file.

## Features

### Core
- **Semantic Search** — search files by meaning, not filename. *"Find my internship offer."*
- **AI Summaries** — one-click summary of any indexed document.
- **Ask Questions** — ask a document a direct question and get a grounded answer. *"What's the notice period?"*
- **Automatic Indexing** — point Mimir at a folder once; it extracts, chunks, and indexes everything inside.
- **File Preview** — open the file directly, with the matching content highlighted.

### Extended
- **OCR Search** — search the text inside scanned PDFs and images.
- **Recent Searches & Recent Files** — quick access to what you looked at last.
- **Smart Folder Suggestions** — surfaces files that seem related based on content similarity.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + Tailwind CSS | Fast, modern UI |
| Backend | FastAPI | Best Python AI ecosystem |
| PDF Processing | PyMuPDF | Fast text extraction |
| Word Docs | python-docx | Read `.docx` files |
| Embeddings | all-MiniLM-L6-v2 | Lightweight semantic embeddings |
| Vector Search | FAISS | Fast, lightweight local similarity search |
| Local LLM | Qwen2.5 3B (via Ollama) | Summaries, Q&A, explanations — fully offline |
| OCR | EasyOCR | Search scanned images and screenshots |
| Metadata | SQLite | Filenames, paths, timestamps |

Everything above runs locally. No API keys, no cloud calls, no rate limits.

---

## Architecture

```
                         React (frontend)
                              │
                              ▼
                          FastAPI (backend)
                ┌─────────────┼─────────────┐
                ▼             ▼             ▼
          PyMuPDF /      Metadata        FAISS
          python-docx     (SQLite)     (vector index)
                │
                ▼
          chunk + embed
        (all-MiniLM-L6-v2)
                │
                ▼
             FAISS index
                │
                ▼
          Qwen2.5 (Ollama)
                │
                ▼
             Response
```

**Query flow:**
`User asks a question → embed the query → FAISS similarity search → retrieve relevant chunks → pass chunks + question to Qwen2.5 (via Ollama) → return answer to UI`

## Privacy

Mimir AI performs all AI inference locally.

Your files are never uploaded to external AI services.


## License

MIT
