import { useState, useEffect } from "react"
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  MonitorPlay,
  File,
  FolderOpen,
  Sparkles,
  Search,
  Brain,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  X,
} from "lucide-react"
import { getDocumentsApi, askMimirApi, indexFolderApi } from "@/lib/api"

const EXT_META = {
  pdf:  { icon: FileText,        label: "PDF",  badge: "text-red-400 bg-red-500/10 border-red-500/20" },
  docx: { icon: FileText,        label: "DOCX", badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  doc:  { icon: FileText,        label: "DOC",  badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  md:   { icon: FileCode,        label: "MD",   badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  txt:  { icon: FileCode,        label: "TXT",  badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  pptx: { icon: MonitorPlay,     label: "PPTX", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  xlsx: { icon: FileSpreadsheet, label: "XLSX", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
}

function getFileMeta(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? ""
  return EXT_META[ext] ?? { icon: File, label: ext.toUpperCase() || "FILE", badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
}

export function DocumentsPage({ onNavigateToAsk }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [summaryModal, setSummaryModal] = useState(null)
  const [summarizing, setSummarizing] = useState(false)
  const [indexInput, setIndexInput] = useState("")
  const [indexing, setIndexing] = useState(false)

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const res = await getDocumentsApi()
      if (res?.documents) setDocuments(res.documents)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleSummarize = async (doc) => {
    setSummaryModal({ filename: doc.filename, content: "Analyzing document chunks & generating grounded summary..." })
    setSummarizing(true)
    try {
      const res = await askMimirApi(`Please provide a concise, structured executive summary of ${doc.filename}, highlighting the key takeaways and core subject matter.`, doc.filename)
      setSummaryModal({ filename: doc.filename, content: res.answer })
    } catch (e) {
      setSummaryModal({ filename: doc.filename, content: "Could not generate summary." })
    } finally {
      setSummarizing(false)
    }
  }

  const handleIndexSubmit = async (e) => {
    e.preventDefault()
    if (!indexInput.trim()) return
    setIndexing(true)
    try {
      await indexFolderApi(indexInput.trim())
      setIndexInput("")
      await fetchDocs()
    } finally {
      setIndexing(false)
    }
  }

  const filtered = documents.filter((d) =>
    d.filename.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (d.file_type && d.file_type.toLowerCase().includes(searchFilter.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* ── Header Toolbar ── */}
      <div className="flex items-center justify-between pb-1 border-b border-[#181b22]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight">
            Document Repository
          </h1>
          <p className="text-[12px] text-[#636b74] mt-0.5">
            Indexed local files available for semantic search and Q&A
          </p>
        </div>

        <form onSubmit={handleIndexSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={indexInput}
            onChange={(e) => setIndexInput(e.target.value)}
            placeholder="Folder path..."
            className="
              h-8.5 w-52 rounded-lg border border-[#232733] bg-[#12141a]
              px-2.5 text-[12px] font-mono text-[#ededef] placeholder:text-[#4b515d]
              focus:border-blue-500/50
            "
          />
          <button
            type="submit"
            disabled={indexing || !indexInput.trim()}
            className="
              h-8.5 rounded-lg bg-[#1a1d26] border border-[#272c3a] px-3 text-[12px] font-medium text-[#ededef]
              hover:bg-[#202430] hover:border-[#32384a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors
              flex items-center gap-1.5
            "
          >
            {indexing ? <RefreshCw size={12} className="animate-spin text-blue-400" /> : <HardDrive size={12} className="text-blue-400" />}
            <span>Index</span>
          </button>
        </form>
      </div>

      {/* ── Search / Filter Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#636b74]" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files by name or extension..."
            className="
              h-8.5 w-full rounded-lg border border-[#232733] bg-[#12141a]
              pl-8 pr-3 text-[12px] text-[#ededef] placeholder:text-[#4b515d]
              focus:border-blue-500/50
            "
          />
        </div>

        <div className="flex items-center gap-3 text-[11.5px] text-[#636b74]">
          <span className="font-mono">{filtered.length} files</span>
          <button
            onClick={fetchDocs}
            className="flex items-center gap-1 text-[#8a919e] hover:text-[#ededef] transition-colors"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Documents Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-[#1d212b] bg-[#12141a] animate-pulse p-4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-10 text-center">
          <FileText size={24} className="mx-auto text-[#4b515d] mb-2" />
          <p className="text-[13px] font-medium text-[#ededef]">No documents match filter</p>
          <p className="mt-0.5 text-[11.5px] text-[#636b74]">Index a folder path to populate the repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((doc) => {
            const meta = getFileMeta(doc.filename)
            const Icon = meta.icon

            return (
              <div
                key={doc.id || doc.filename}
                className="group relative rounded-xl border border-[#1d212b] bg-[#12141a] p-3.5 transition-all hover:border-[#2b3140] hover:bg-[#14171f]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#232733] bg-[#161922] text-[#8a919e]">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[#ededef] truncate leading-tight">
                      {doc.filename}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-[#636b74]">
                      <span className={`rounded px-1.5 py-0.2 font-medium border ${meta.badge}`}>
                        {meta.label}
                      </span>
                      <span>{formatBytes(doc.file_size)}</span>
                      {doc.chunk_count && <span>• {doc.chunk_count} chunks</span>}
                    </div>
                  </div>
                </div>

                {doc.filepath && (
                  <p className="mt-2 text-[10.5px] font-mono text-[#4b515d] truncate">
                    {doc.filepath}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-3 pt-2.5 border-t border-[#181b23] flex items-center justify-between">
                  <button
                    onClick={() => handleSummarize(doc)}
                    className="flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Sparkles size={11} />
                    <span>Summary</span>
                  </button>

                  <button
                    onClick={() => onNavigateToAsk && onNavigateToAsk(doc.filename)}
                    className="flex items-center gap-1 rounded border border-[#232733] bg-[#161922] px-2 py-0.5 text-[11px] font-medium text-[#8a919e] hover:bg-[#1e2330] hover:text-[#ededef] transition-colors"
                  >
                    <Brain size={11} className="text-blue-400" />
                    <span>Query</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Summary Modal ── */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#282d3b] bg-[#101217] p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#1c202a] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-blue-400" />
                <h3 className="text-[13px] font-semibold text-[#ededef]">
                  Summary: {summaryModal.filename}
                </h3>
              </div>
              <button
                onClick={() => setSummaryModal(null)}
                className="text-[#636b74] hover:text-[#ededef] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-[12.5px] leading-relaxed text-[#c0c5cf] whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
              {summaryModal.content}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setSummaryModal(null)}
                className="rounded-lg bg-[#2563eb] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#1d4ed8] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
