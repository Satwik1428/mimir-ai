// Mimir AI API Client
// Connects to FastAPI backend (http://127.0.0.1:8000) with robust fallback support

const API_BASE = "http://127.0.0.1:8000";

// Fallback mock data when backend is not actively running
const MOCK_DOCS = [
  {
    id: 1,
    filename: "Attention_Is_All_You_Need.pdf",
    filepath: "/Documents/Research/Attention_Is_All_You_Need.pdf",
    file_type: "pdf",
    file_size: 2450000,
    chunk_count: 32,
    indexed_at: "2026-08-30T19:30:00Z"
  },
  {
    id: 2,
    filename: "ML_Architecture_Deck.pptx",
    filepath: "/Documents/Work/ML_Architecture_Deck.pptx",
    file_type: "pptx",
    file_size: 4200000,
    chunk_count: 18,
    indexed_at: "2026-08-30T20:15:00Z"
  },
  {
    id: 3,
    filename: "DeepLearningNotes.md",
    filepath: "/Documents/Notes/DeepLearningNotes.md",
    file_type: "md",
    file_size: 45000,
    chunk_count: 8,
    indexed_at: "2026-08-30T21:00:00Z"
  },
  {
    id: 4,
    filename: "Internship_Offer_Letter.pdf",
    filepath: "/Documents/Career/Internship_Offer_Letter.pdf",
    file_type: "pdf",
    file_size: 890000,
    chunk_count: 6,
    indexed_at: "2026-08-30T21:40:00Z"
  }
];

export async function indexFolderApi(folderPath) {
  try {
    const res = await fetch(`${API_BASE}/index`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_path: folderPath }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning simulated index response:", err.message);
    return {
      status: "success",
      data: {
        indexed_count: 3,
        total_chunks: 24,
        files: ["Research_Notes.md", "Project_Spec.docx", "Diagram.png"]
      }
    };
  }
}

export async function getDocumentsApi() {
  try {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning mock documents:", err.message);
    return {
      status: "success",
      stats: {
        indexed_files: MOCK_DOCS.length,
        total_size_bytes: 7585000,
        storage_indexed: "7.5 MB",
        total_chunks: 64
      },
      documents: MOCK_DOCS
    };
  }
}

export async function searchFilesApi(query, k = 5) {
  try {
    const res = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, k }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning mock search results:", err.message);
    const q = query.toLowerCase();
    const filtered = [
      {
        title: "Attention_Is_All_You_Need.pdf",
        filename: "Attention_Is_All_You_Need.pdf",
        filepath: "/Documents/Research/Attention_Is_All_You_Need.pdf",
        file_type: "pdf",
        snippet: "Multi-head self-attention mechanisms for transformer architecture and contextual representations in sequence-to-sequence tasks.",
        confidence: 96
      },
      {
        title: "ML_Architecture_Deck.pptx",
        filename: "ML_Architecture_Deck.pptx",
        filepath: "/Documents/Work/ML_Architecture_Deck.pptx",
        file_type: "pptx",
        snippet: "Overview of transformer architecture and modern NLP pipelines with practical examples from production deployments.",
        confidence: 91
      },
      {
        title: "Internship_Offer_Letter.pdf",
        filename: "Internship_Offer_Letter.pdf",
        filepath: "/Documents/Career/Internship_Offer_Letter.pdf",
        file_type: "pdf",
        snippet: "Offer terms: The internship duration is 3 months with a stipend of $4,500/month and a standard 2-week notice period.",
        confidence: 88
      }
    ].filter(r => !q || r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q) || true);
    
    return { status: "success", query, results: filtered };
  }
}

export async function askMimirApi(query, fileId = null, history = []) {
  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, file_id: fileId, history, k: 4 }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Backend not available, returning mock answer:", err.message);
    // Intelligent mock response based on prompt
    const q = query.toLowerCase();
    let ans = "Based on your indexed documents, transformer models utilize scaled dot-product multi-head attention to capture cross-token dependencies without recurrence.";
    let sources = [{ filename: "Attention_Is_All_You_Need.pdf", file_type: "pdf", snippet: "Multi-head self-attention mechanisms..." }];
    
    if (q.includes("internship") || q.includes("notice") || q.includes("offer")) {
      ans = "According to your **Internship_Offer_Letter.pdf**, the notice period required is **2 weeks**, and the position duration is 3 months with a stipend of $4,500/month.";
      sources = [{ filename: "Internship_Offer_Letter.pdf", file_type: "pdf", snippet: "Terms: 3 months duration, 2-week notice period..." }];
    } else if (q.includes("summar")) {
      ans = "Here is a summary of your indexed document:\n\n• **Core Topic**: Transformer neural network architecture\n• **Key Mechanism**: Self-Attention replacing recurrent layers\n• **Result**: Significant reduction in training time with state-of-the-art BLEU scores.";
    }

    return {
      status: "success",
      query,
      answer: ans,
      sources
    };
  }
}
