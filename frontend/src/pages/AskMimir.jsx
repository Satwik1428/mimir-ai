import { useState, useRef, useEffect } from "react"
import {
  Send,
  Brain,
  FileText,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  CornerDownLeft,
  ChevronDown,
} from "lucide-react"
import { askMimirApi, getDocumentsApi } from "@/lib/api"

const SUGGESTED_PROMPTS = [
  "What did the research paper say about transformer attention?",
  "What is the notice period in my internship offer letter?",
  "Summarize key takeaways across my indexed documents",
  "Find references to neural network optimization notes",
]

export function AskMimirPage({ onNavigateToSearch }) {
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content:
        "Hello. I'm **Mimir**, your on-device AI assistant. Ask any question, request summaries, or extract specifics from your local files.",
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
          content: "An error occurred while querying your local models.",
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
          "Conversation reset. Ask questions grounded in your local documents.",
        sources: [],
      },
    ])
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col space-y-4">
      {/* ── Toolbar Header ── */}
      <div className="flex items-center justify-between pb-3 border-b border-[#181b22]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight flex items-center gap-2">
            <span>Ask Mimir</span>
            <span className="text-[10px] font-mono font-medium rounded bg-[#161922] border border-[#232733] px-1.5 py-0.5 text-blue-400">
              Grounded AI
            </span>
          </h1>
          <p className="text-[12px] text-[#636b74] mt-0.5">
            Private on-device Q&A grounded exclusively in your indexed files
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Scope Dropdown */}
          <div className="relative">
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="h-8 appearance-none rounded-lg border border-[#232733] bg-[#12141a] pl-2.5 pr-7 text-[12px] font-medium text-[#c0c5cf] focus:border-blue-500/50"
            >
              <option value="" className="bg-[#12141a] text-[#ededef]">
                All Indexed Documents
              </option>
              {documents.map((doc) => (
                <option
                  key={doc.id || doc.filename}
                  value={doc.filename}
                  className="bg-[#12141a] text-[#ededef]"
                >
                  {doc.filename}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#636b74]" />
          </div>

          <button
            onClick={handleReset}
            title="Reset Conversation"
            className="flex h-8 items-center gap-1 rounded-lg border border-[#232733] bg-[#12141a] px-2.5 text-[12px] font-medium text-[#8a919e] hover:bg-[#181b22] hover:text-[#ededef] transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ── Chat Messages Stream ── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user"

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#232733] bg-[#141720] text-blue-400 mt-0.5">
                  <Bot size={14} />
                </div>
              )}

              <div
                className={`group relative max-w-[82%] rounded-xl p-3.5 text-[13px] leading-relaxed ${
                  isUser
                    ? "bg-[#182032] border border-[#2b3956] text-[#f4f4f5]"
                    : "bg-[#12141a] border border-[#1d212b] text-[#d1d5db]"
                }`}
              >
                {/* Header tag */}
                <div className="mb-1 flex items-center justify-between gap-4">
                  <span className="text-[10px] font-mono text-[#636b74]">
                    {isUser ? "You" : "Mimir (Qwen 2.5 Grounded)"}
                    {msg.fileFilter && ` • filter: ${msg.fileFilter}`}
                  </span>
                  {!isUser && msg.id !== "init" && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[#636b74] hover:text-[#ededef]"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Grounded Citation Chips */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#1a1d26] space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#636b74]">
                      Sources Cited
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {msg.sources.map((s, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 rounded-md border border-[#232733] bg-[#161922] px-2 py-0.5 text-[11px] font-mono text-[#8a919e]"
                        >
                          <FileText size={11} className="text-blue-400" />
                          <span className="truncate max-w-[200px]">
                            {s.filename}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#232733] bg-[#161922] text-[#8a919e] mt-0.5">
                  <User size={13} />
                </div>
              )}
            </div>
          )
        })}

        {/* Loading state */}
        {loading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#232733] bg-[#141720] text-blue-400 mt-0.5">
              <Bot size={14} />
            </div>
            <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse" />
                <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:0.2s]" />
                <span className="h-1 w-1 rounded-full bg-blue-400 animate-pulse [animation-delay:0.4s]" />
              </div>
              <span className="text-[12px] text-[#636b74]">
                Retrieving relevant document chunks...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested Prompts ── */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="flex items-center gap-1.5 rounded-lg border border-[#1e222c] bg-[#12141a] px-2.5 py-1.5 text-[11.5px] text-[#8a919e] hover:border-[#2d3444] hover:bg-[#161922] hover:text-[#ededef] transition-colors"
            >
              <Sparkles size={11} className="text-blue-400/80 shrink-0" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ── */}
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
              : "Ask Mimir about your local files..."
          }
          className="
            h-11 w-full rounded-xl border border-[#232733] bg-[#12141a]
            pl-3.5 pr-20 text-[13px] text-[#ededef] placeholder:text-[#4b515d]
            focus:border-blue-500/50 focus:bg-[#14171f] focus:ring-1 focus:ring-blue-500/20
            transition-colors
          "
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pt-1">
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="
              flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-1.5
              text-[11.5px] font-medium text-white transition-colors
              hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <span>Ask</span>
            <CornerDownLeft size={11} />
          </button>
        </div>
      </form>
    </div>
  )
}
