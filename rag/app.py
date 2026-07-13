import os
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq

load_dotenv()

GROQ_API = os.getenv("GROQ_API")

if not GROQ_API:
    raise ValueError("GROQ_API not found in .env file.")

file_name = input("Enter PDF file path: ")

loader = PyPDFLoader(file_name)
docs = loader.load()

print("\nPDF Loaded Successfully!\n")

full_text = ""

for doc in docs:
    full_text += doc.page_content + "\n"

print(" PDF CONTENT \n")
print(full_text[:3000])   
print("\n==\n")
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200
)

all_splits = text_splitter.split_documents(docs)

print(f"Created {len(all_splits)} chunks.\n")

embedding_model = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2"
)


vector_store = FAISS.from_documents(
    documents=all_splits,
    embedding=embedding_model
)

print("Vector Store Created Successfully!\n")


llm = ChatGroq(
    api_key=GROQ_API,
    model="llama-3.3-70b-versatile"
)


chat_history = []

def retrieve_context(query, k=2):

    retrieved_docs = vector_store.similarity_search(query, k=k)

    docs_content = ""

    for doc in retrieved_docs:
        docs_content += f"Source: {doc.metadata}\n"
        docs_content += f"Content: {doc.page_content}\n\n"

    return docs_content, retrieved_docs

def docu_chat(user_query):

    global chat_history

    context, source_docs = retrieve_context(user_query)

    system_message = f"""
You are a helpful AI assistant.
Answer ONLY using the provided context.
If the answer is not present in the context, simply say:
"I couldn't find that information in the uploaded PDF."
Context:
{context}
"""

    messages = [
        {
            "role": "system",
            "content": system_message
        }
    ]

    messages.extend(chat_history)

    messages.append(
        {
            "role": "user",
            "content": user_query
        }
    )

    response = llm.invoke(messages)

    chat_history.append(
        {
            "role": "user",
            "content": user_query
        }
    )

    chat_history.append(
        {
            "role": "assistant",
            "content": response.content
        }
    )

    return {
        "answer": response.content,
        "source_documents": source_docs,
        "context_used": context
    }

print(" PDF Chatbot Started ")
print("Type 'exit' to stop.")

while True:

    query = input("\nYou: ")

    if query.lower() == "exit":
        print("Goodbye!")
        break

    result = docu_chat(query)

    print("\nJarvis:", result["answer"])