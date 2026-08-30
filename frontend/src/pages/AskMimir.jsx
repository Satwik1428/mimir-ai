import { useState, useRef, useEffect } from "react"
import {
  Send,
  Brain,
  FileText,
  Sparkles,
  Bot,
  User,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react"
import { askMimirApi, getDocumentsApi } from "@/lib/api"

const SUGGESTED_PROMPTS = [
  "What did the research paper say about transformer attention?",
  "What is the notice period in my internship offer letter?",
  "Summarize key findings across my indexed documents",
  "What projects are mentioned in my recent work notes?",
]

export function AskMimirPage({ onNavigateToSearch }) {
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content:
        "Hello! I am **Mimir**, your on-device AI assistant. I can search, summarize, and answer questions directly from your local documents without sending files to the cloud.",
      sources: [],
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState([])
  const [selectedFile, setSelectedFile] = useState("")
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    getDocumentsApi().then((res) => {
      if (res?.documents) setDocuments(res.documents)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleSend = async (queryText = input) => {
    const q = queryText.trim()
    if (!q || loading) return

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: q,
      fileFilter: selectedFile || null,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // Build chat history for context
    const history = messages
      .filter((m) => m.id !== "init")
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await askMimirApi(q, selectedFile || null, history)
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.answer || "I could not retrieve an answer from your files.",
        sources: res.sources || [],
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, an error occurred while processing your question.",
          sources: [],
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleReset = () => {
    setMessages([
      {
        id: "init",
        role: "assistant",
        content:
          "Conversation reset. Ask any question grounded in your indexed local files!",
        sources: [],
      },
    ])
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col space-y-4">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-white flex items-center gap-2.5">
            <Brain className="text-blue-400" size={24} />
            Ask Mimir
          </h1>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            Local grounded Q&A and document understanding across your computer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* File Scope Filter */}
          <select
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
            className="h-9 rounded-lg border border-white/[0.09] bg-white/[0.03] px-3 text-[12px] text-zinc-300 focus:border-blue-500/50 focus:outline-none"
          >
            <option value="" className="bg-zinc-900 text-zinc-300">
              All Indexed Documents
            </option>
            {documents.map((doc) => (
              <option
                key={doc.id || doc.filename}
                value={doc.filename}
                className="bg-zinc-900 text-zinc-300"
              >
                {doc.filename}
              </option>
            ))}
          </select>

          <button
            onClick={handleReset}
            title="Reset Chat"
            className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-[12px] text-zinc-400 transition-all hover:bg-white/[0.07] hover:text-white"
          >
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* ── Messages Feed ── */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user"

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-600/15 text-blue-400">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`group relative max-w-[80%] rounded-xl p-4 transition-all duration-200 ${
                  isUser
                    ? "border border-blue-500/25 bg-blue-600/15 text-white"
                    : "border border-white/[0.08] bg-white/[0.03] text-zinc-200"
                }`}
              >
                {/* Header tag */}
                <div className="mb-1.5 flex items-center justify-between gap-4">
                  <span className="text-[11px] font-medium text-zinc-500">
                    {isUser ? "You" : "Mimir (Grounded AI)"}
                    {msg.fileFilter && ` • filter: ${msg.fileFilter}`}
                  </span>
                  {!isUser && msg.id !== "init" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-zinc-300"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check size={13} className="text-emerald-400" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="text-[13px] leading-[1.65] whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Grounded Sources Cited */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-white/[0.06] space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                      <CheckCircle2 size={12} />
                      Sources Cited
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.sources.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-300"
                        >
                          <FileText size={12} className="text-blue-400" />
                          <span className="truncate max-w-[180px]">
                            {s.filename}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-800 text-zinc-400">
                  <User size={15} />
                </div>
              )}
            </div>
          )
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-500/25 bg-blue-600/15 text-blue-400">
              <Bot size={16} />
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 flex items-center gap-2.5">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[12px] text-zinc-500">
                Retrieving chunks & generating grounded answer...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts (when few messages) ── */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-[11px] text-zinc-400 transition-all duration-150 hover:border-blue-500/30 hover:bg-white/[0.05] hover:text-zinc-200 text-left"
            >
              <Sparkles size={11} className="text-blue-400 shrink-0" />
              <span className="truncate max-w-[340px]">{p}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Input Box ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
        className="relative pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedFile
              ? `Ask anything about ${selectedFile}...`
              : "Ask Mimir about anything in your local files..."
          }
          className="
            h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.04]
            pl-4 pr-24 text-[13px] text-white placeholder:text-zinc-600
            transition-all duration-200
            focus:border-blue-500/40 focus:bg-white/[0.06] focus:outline-none
            focus:ring-2 focus:ring-blue-500/15
          "
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pt-1">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="
              flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5
              text-[12px] font-semibold text-white transition-all duration-200
              hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <span>Ask</span>
            <Send size={13} />
          </button>
        </div>
      </form>
    </div>
  )
}
