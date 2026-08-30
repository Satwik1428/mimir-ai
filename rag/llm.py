import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

from indexer import get_vector_store

def get_llm():
    use_local = os.getenv("USE_LOCAL_LLM", "true").lower() in ("true", "1", "yes")
    
    if use_local:
        try:
            from langchain_community.llms import Ollama
            model = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")
            return Ollama(model=model)
        except Exception as e:
            print(f"Failed to load local Ollama, falling back to Groq: {e}")

    groq_api = os.getenv("GROQ_API") or os.getenv("GROQ_API_KEY")
    if not groq_api:
        # Check parent folder or root .env too
        parent_env = os.path.join(os.path.dirname(__file__), "..", ".env")
        if os.path.exists(parent_env):
            load_dotenv(parent_env)
            groq_api = os.getenv("GROQ_API") or os.getenv("GROQ_API_KEY")

    if groq_api:
        from langchain_groq import ChatGroq
        model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        return ChatGroq(api_key=groq_api, model=model, temperature=0.2)
    
    return None

def ask_question(query: str, file_filter: Optional[str] = None, history: Optional[List[Dict[str, str]]] = None, k: int = 4) -> Dict[str, Any]:
    vs = get_vector_store()
    if vs is None:
        return {
            "answer": "No documents have been indexed yet. Please index a folder or file first in Mimir!",
            "sources": [],
            "context": ""
        }

    # Retrieve relevant chunks
    retrieved_docs = vs.similarity_search(query, k=k)
    
    if file_filter:
        retrieved_docs = [d for d in retrieved_docs if d.metadata.get("filename") == file_filter or d.metadata.get("filepath") == file_filter]

    if not retrieved_docs:
        return {
            "answer": "I couldn't find any relevant information in your indexed files for this query.",
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
                "snippet": content[:180] + "..."
            })

    full_context = "\n\n---\n\n".join(context_blocks)

    system_prompt = f"""You are Mimir AI, a private, on-device AI assistant for the user's local documents.
Answer the user's question clearly, accurately, and concisely based ONLY on the provided context from their files.
If the answer cannot be found in the context, explicitly state: "I couldn't find that information in your indexed documents."
Do not make up facts or hallucinate beyond the provided text.

Context from user's files:
{full_context}
"""

    llm = get_llm()
    if llm is None:
        # Fallback if no API key is provided
        return {
            "answer": f"**Relevant Content Retrieved (LLM API key not configured):**\n\nBased on your documents ({', '.join(seen_sources)}):\n\n" + retrieved_docs[0].page_content[:400] + "...",
            "sources": sources,
            "context": full_context
        }

    messages = [{"role": "system", "content": system_prompt}]
    
    if history:
        for msg in history[-4:]:
            messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
            
    messages.append({"role": "user", "content": query})

    try:
        response = llm.invoke(messages)
        content = response.content if hasattr(response, "content") else str(response)
        return {
            "answer": content,
            "sources": sources,
            "context": full_context
        }
    except Exception as e:
        return {
            "answer": f"Error communicating with AI model: {str(e)}",
            "sources": sources,
            "context": full_context
        }
