import { useState, useEffect } from "react"
import {
  FileText,
  FileCode,
  FileImage,
  FileSpreadsheet,
  MonitorPlay,
  File,
  FolderOpen,
  Sparkles,
  Search,
  ExternalLink,
  Brain,
  RefreshCw,
  HardDrive,
  CheckCircle2,
} from "lucide-react"
import { getDocumentsApi, askMimirApi, indexFolderApi } from "@/lib/api"

const EXT_META = {
  pdf: { icon: FileText, label: "PDF", cls: "text-red-400 bg-red-500/10 border-red-500/20" },
  docx: { icon: FileText, label: "DOCX", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  doc: { icon: FileText, label: "DOC", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  md: { icon: FileCode, label: "MD", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  txt: { icon: FileCode, label: "TXT", cls: "text-zinc-400 bg-white/5 border-white/10" },
  pptx: { icon: MonitorPlay, label: "PPTX", cls: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  xlsx: { icon: FileSpreadsheet, label: "XLSX", cls: "text-green-400 bg-green-500/10 border-green-500/20" },
  png: { icon: FileImage, label: "PNG", cls: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
  jpg: { icon: FileImage, label: "JPG", cls: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
}

function getFileMeta(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? ""
  return EXT_META[ext] ?? { icon: File, label: ext.toUpperCase() || "FILE", cls: "text-zinc-400 bg-white/5 border-white/10" }
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
  const [stats, setStats] = useState(null)
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
      if (res?.stats) setStats(res.stats)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs()
  }, [])

  const handleSummarize = async (doc) => {
    setSummaryModal({ filename: doc.filename, content: "Analyzing document chunks & generating AI summary..." })
    setSummarizing(true)
    try {
      const res = await askMimirApi(`Please provide a concise, structured summary of ${doc.filename}, highlighting key points and actionable findings.`, doc.filename)
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
    <div className="space-y-7">
      {/* ── Header & Index Folder Tool ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-2.5">
            <FolderOpen className="text-blue-400" size={26} />
            Documents
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            All files indexed, vector-embedded, and queryable locally by Mimir.
          </p>
        </div>

        {/* Quick Index Form */}
        <form onSubmit={handleIndexSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={indexInput}
            onChange={(e) => setIndexInput(e.target.value)}
            placeholder="Folder path (e.g. C:/Documents)..."
            className="
              h-9 w-64 rounded-lg border border-white/[0.09] bg-white/[0.04]
              px-3 text-[12px] text-zinc-200 placeholder:text-zinc-600
              focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/15
            "
          />
          <button
            type="submit"
            disabled={indexing || !indexInput.trim()}
            className="
              flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5
              text-[12px] font-semibold text-white transition-all
              hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {indexing ? <RefreshCw size={13} className="animate-spin" /> : <HardDrive size={13} />}
            <span>Index Folder</span>
          </button>
        </form>
      </div>

      {/* ── Search / Filter Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter indexed files by name or type..."
            className="
              h-9 w-full rounded-lg border border-white/[0.08] bg-white/[0.03]
              pl-9 pr-4 text-[12px] text-white placeholder:text-zinc-600
              focus:border-blue-500/40 focus:outline-none
            "
          />
        </div>

        <div className="flex items-center gap-4 text-[12px] text-zinc-500">
          <span>{filtered.length} files found</span>
          <button
            onClick={fetchDocs}
            className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Documents Grid ── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-white/[0.06] bg-white/[0.025] animate-pulse p-4" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-12 text-center">
          <FileText size={32} className="mx-auto text-zinc-600 mb-3" />
          <p className="text-sm font-semibold text-zinc-300">No documents match filter</p>
          <p className="mt-1 text-xs text-zinc-500">Index a local folder to add documents to Mimir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5">
          {filtered.map((doc) => {
            const meta = getFileMeta(doc.filename)
            const Icon = meta.icon

            return (
              <div
                key={doc.id || doc.filename}
                className="
                  group relative rounded-xl border border-white/[0.08] bg-white/[0.03]
                  p-4 transition-all duration-200
                  hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-px
                "
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border ${meta.cls}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-zinc-100 truncate">{doc.filename}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                        <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[10px] font-semibold uppercase ${meta.cls}`}>
                          {meta.label}
                        </span>
                        <span>{formatBytes(doc.file_size)}</span>
                        {doc.chunk_count && <span>• {doc.chunk_count} chunks</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Path indicator */}
                {doc.filepath && (
                  <p className="mt-2.5 truncate text-[11px] text-zinc-600 font-mono">
                    {doc.filepath}
                  </p>
                )}

                {/* Card Actions */}
                <div className="mt-3.5 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                  <button
                    onClick={() => handleSummarize(doc)}
                    className="
                      flex items-center gap-1 text-[11px] font-medium text-blue-400
                      hover:text-blue-300 transition-colors
                    "
                  >
                    <Sparkles size={12} />
                    AI Summary
                  </button>

                  <button
                    onClick={() => onNavigateToAsk && onNavigateToAsk(doc.filename)}
                    className="
                      flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03]
                      px-2 py-1 text-[11px] font-medium text-zinc-300
                      hover:bg-white/[0.08] hover:text-white transition-all
                    "
                  >
                    <Brain size={11} className="text-blue-400" />
                    Ask Mimir
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Summary Modal ── */}
      {summaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-xl border border-white/[0.12] bg-[#0c0e12] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-white">
                  Summary: {summaryModal.filename}
                </h3>
              </div>
              <button
                onClick={() => setSummaryModal(null)}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            <div className="text-[13px] leading-[1.65] text-zinc-300 whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
              {summaryModal.content}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSummaryModal(null)}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-all"
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
