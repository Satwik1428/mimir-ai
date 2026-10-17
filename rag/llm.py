import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

from indexer import get_vector_store

logger = logging.getLogger("mimir.llm")

def get_llm():
    """
    Instantiate local Ollama model.
    Strictly on-device: does NOT fall back to cloud providers.
    """
    model = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
    try:
        from langchain_community.llms import Ollama
        llm = Ollama(model=model, timeout=90)
        return llm
    except Exception as e:
        logger.warning(f"Could not initialize local Ollama model '{model}': {e}")
        return None

def query_ollama_direct(model: str, messages: List[Dict[str, str]], timeout: int = 90) -> Optional[str]:
    try:
        import httpx
        base_host = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").rstrip("/")
        url = f"{base_host}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        res = httpx.post(url, json=payload, timeout=timeout)
        if res.status_code == 200:
            data = res.json()
            return data.get("message", {}).get("content", "").strip()
    except Exception as e:
        logger.debug(f"Direct Ollama HTTP chat call failed: {e}")
    return None

def ask_question(query: str, file_filter: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None, k: int = 4) -> Dict[str, Any]:
    vs = get_vector_store()
    if vs is None:
        return {
            "answer": "No documents have been indexed yet. Please index a folder or file first in Mimir!",
            "sources": [],
            "context": ""
        }

    # If file_filter is specified, retrieve within file scope rather than retrieving global results and post-filtering
    fetch_k = k
    if file_filter:
        fetch_k = max(k * 10, 50)

    try:
        raw_docs = vs.similarity_search(query, k=fetch_k)
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return {
            "answer": "An internal error occurred while searching the vector index.",
            "sources": [],
            "context": ""
        }

    if file_filter:
        norm_filter = os.path.basename(file_filter).lower()
        retrieved_docs = [
            d for d in raw_docs
            if os.path.basename(d.metadata.get("filename", "")).lower() == norm_filter or
               d.metadata.get("filename", "").lower() == norm_filter or
               d.metadata.get("filepath", "").lower() == file_filter.lower()
        ][:k]
    else:
        retrieved_docs = raw_docs[:k]

    if not retrieved_docs:
        scope_msg = f" in '{file_filter}'" if file_filter else " in your indexed files"
        return {
            "answer": f"I couldn't find any relevant information{scope_msg} for this query.",
            "sources": [],
            "context": ""
        }

    # Build context and source list
    context_blocks = []
    sources = []
    seen_sources = set()

    for doc in retrieved_docs:
        fn = doc.metadata.get("filename", "Unknown")
        fp = doc.metadata.get("filepath", "")
        content = doc.page_content.strip()
        context_blocks.append(f"Document: {fn}\nContent:\n{content}")

        if fn not in seen_sources:
            seen_sources.add(fn)
            sources.append({
                "filename": fn,
                "filepath": fp,
                "file_type": doc.metadata.get("file_type", "txt"),
                "snippet": (content[:220] + "...") if len(content) > 220 else content
            })

    full_context = "\n\n---\n\n".join(context_blocks)

    system_prompt = f"""You are Mimir AI, a private, on-device AI assistant for the user's local documents.
Answer the user's question clearly, accurately, and concisely based ONLY on the provided context from their files.
If the answer cannot be found in the context, explicitly state: "I couldn't find that information in your indexed documents."
Do not make up facts or hallucinate beyond the provided text.

Context from user's files:
{full_context}
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    if history:
        for msg in history[-4:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
    messages.append({"role": "user", "content": query})

    model_name = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")

    # 1. Primary: Direct high-performance on-device Ollama call
    direct_content = query_ollama_direct(model_name, messages)
    if direct_content:
        return {
            "answer": direct_content,
            "sources": sources,
            "context": full_context
        }

    # 2. Fallback: LangChain Ollama wrapper
    llm = get_llm()
    if llm is not None:
        try:
            response = llm.invoke(messages)
            content = response.content if hasattr(response, "content") else str(response)
            if content and content.strip():
                return {
                    "answer": content.strip(),
                    "sources": sources,
                    "context": full_context
                }
        except Exception as e:
            logger.error(f"LangChain LLM invocation error: {e}")

    # 3. Fallback: Grounded local extractive context if Ollama is offline or uninstalled
    best_passage = retrieved_docs[0].page_content.strip()
    return {
        "answer": (
            "*(Local Ollama offline – displaying grounded extractive context)*\n\n"
            f"**From {', '.join(seen_sources)}:**\n\n"
            f"{best_passage[:450]}..."
        ),
        "sources": sources,
        "context": full_context
    }
