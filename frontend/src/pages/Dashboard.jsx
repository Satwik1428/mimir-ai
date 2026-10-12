import { useState, useEffect, useRef } from "react"
import {
  Files,
  HardDrive,
  Clock,
  FileText,
  Brain,
  Search,
  FolderOpen,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Upload,
} from "lucide-react"
import { getDocumentsApi, indexFolderApi, uploadFilesApi } from "@/lib/api"

function MetricCard({ label, value, subtext, icon: Icon }) {
  return (
    <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-4.5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#717885] tracking-wide uppercase">
          {label}
        </span>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#232733] bg-[#161922] text-[#8a919e]">
          <Icon size={14} />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-[26px] font-bold tracking-tight text-[#ededef] font-mono">
          {value}
        </div>
        <p className="mt-0.5 text-[11px] text-[#636b74]">
          {subtext}
        </p>
      </div>
    </div>
  )
}

export function DashboardPage({ onNavigate }) {
  const [stats, setStats] = useState({
    indexed_files: 0,
    storage_indexed: "0 KB",
    total_chunks: 0
  })
  const [recentDocs, setRecentDocs] = useState([])
  const [folderInput, setFolderInput] = useState("")
  const [indexing, setIndexing] = useState(false)
  const [indexError, setIndexError] = useState(null)
  const [indexSuccess, setIndexSuccess] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getDocumentsApi()
      if (res?.stats) setStats(res.stats)
      if (res?.documents) setRecentDocs(res.documents.slice(0, 5))
    } catch (e) {
      console.error("Failed to load dashboard data:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const fileInputRef = useRef(null)

  const handleFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIndexing(true)
    setIndexError(null)
    setIndexSuccess(null)
    try {
      const res = await uploadFilesApi(files)
      setIndexSuccess(`Indexed ${res.data?.indexed_count || 0} files from file manager (${res.data?.total_chunks || 0} chunks).`)
      await loadData()
    } catch (err) {
      setIndexError(err.message || "Failed to index selected files.")
    } finally {
      setIndexing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleIndex = async (e) => {
    e.preventDefault()
    if (!folderInput.trim() || indexing) return
    setIndexing(true)
    setIndexError(null)
    setIndexSuccess(null)
    try {
      const res = await indexFolderApi(folderInput.trim())
      setFolderInput("")
      setIndexSuccess(`Indexed ${res.data?.indexed_count || 0} files (${res.data?.total_chunks || 0} chunks).`)
      await loadData()
    } catch (err) {
      setIndexError(err.message || "Failed to index path.")
    } finally {
      setIndexing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between pb-1 border-b border-[#181b22]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-[12px] text-[#636b74] mt-0.5">
            Local vector embeddings & document memory status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("Ask Mimir")}
            className="flex items-center gap-1.5 rounded-lg bg-[#2563eb] px-3 py-1.5 text-[12px] font-medium text-white hover:bg-[#1d4ed8] transition-colors shadow-sm"
          >
            <Brain size={13} />
            <span>Ask Mimir</span>
          </button>
          <button
            onClick={() => onNavigate("Search")}
            className="flex items-center gap-1.5 rounded-lg border border-[#262b38] bg-[#151820] px-3 py-1.5 text-[12px] font-medium text-[#c0c5cf] hover:bg-[#1a1e28] hover:text-white transition-colors"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-3 gap-3.5">
        <MetricCard
          label="Indexed Documents"
          value={loading ? "..." : (stats?.indexed_files || 0).toLocaleString()}
          subtext="Active in local vector index"
          icon={Files}
        />
        <MetricCard
          label="Storage Footprint"
          value={loading ? "..." : (stats?.storage_indexed || "0 KB")}
          subtext="FAISS vector store + text cache"
          icon={HardDrive}
        />
        <MetricCard
          label="Total Chunks"
          value={loading ? "..." : (stats?.total_chunks || 0).toLocaleString()}
          subtext="Embedded text chunks in memory"
          icon={Clock}
        />
      </div>

      {/* ── Directory & File Indexer Console ── */}
      <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#232733] bg-[#161922] text-[#8a919e]">
                <FolderOpen size={15} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[#ededef]">Add Files to Knowledge Base</p>
                <p className="text-[11px] text-[#636b74]">Select files via File Explorer or specify a folder path to index</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Hidden file input for file manager */}
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.docx,.doc,.txt,.md,.py,.js,.json,.csv,.html,.png,.jpg,.jpeg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={indexing}
                className="
                  h-8.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] px-3 text-[12px] font-medium text-white
                  disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                  flex items-center gap-1.5 shadow-sm
                "
              >
                <Upload size={12} />
                <span>Browse Files...</span>
              </button>

              <form onSubmit={handleIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  placeholder="Or enter folder path (e.g. C:/Documents)..."
                  className="
                    h-8.5 w-60 rounded-lg border border-[#232733] bg-[#0e1014]
                    px-3 text-[12px] font-mono text-[#ededef] placeholder:text-[#4b515d]
                    focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20
                  "
                />
                <button
                  type="submit"
                  disabled={indexing || !folderInput.trim()}
                  className="
                    h-8.5 rounded-lg bg-[#1a1d26] border border-[#272c3a] px-3 text-[12px] font-medium text-[#ededef]
                    hover:bg-[#202430] hover:border-[#32384a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors
                    flex items-center gap-1.5
                  "
                >
                  {indexing ? <RefreshCw size={12} className="animate-spin text-blue-400" /> : <Zap size={12} className="text-blue-400" />}
                  <span>{indexing ? "Indexing..." : "Index Folder"}</span>
                </button>
              </form>
            </div>
          </div>

          {indexError && (
            <div className="text-[11.5px] text-red-400 bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-1.5">
              {indexError}
            </div>
          )}
          {indexSuccess && (
            <div className="text-[11.5px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3 py-1.5">
              {indexSuccess}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Documents Table ── */}
      <div className="rounded-xl border border-[#1d212b] bg-[#12141a] overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#1a1d26] px-4 py-3 bg-[#111319]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717885]">
              Indexed Files
            </span>
            <span className="rounded bg-[#171a22] border border-[#222734] px-1.5 py-0.2 text-[10px] font-mono text-[#636b74]">
              {recentDocs.length}
            </span>
          </div>

          <button
            onClick={() => onNavigate("Documents")}
            className="text-[11px] text-[#8a919e] hover:text-[#ededef] transition-colors"
          >
            View all documents →
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="p-8 text-center text-[#636b74] text-[12px]">
            No documents indexed yet. Enter a local folder path above to start indexing.
          </div>
        ) : (
          <div className="divide-y divide-[#181b23]">
            {recentDocs.map((item, i) => (
              <div
                key={item.filepath || item.filename || i}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-[#151720] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText size={14} className="text-[#636b74] group-hover:text-[#8a919e] shrink-0" />
                  <span className="text-[12.5px] font-medium text-[#ededef] truncate">
                    {item.filename}
                  </span>
                  <span className="text-[11px] font-mono text-[#4b515d] truncate hidden md:inline">
                    {item.filepath}
                  </span>
                </div>

                <button
                  onClick={() => onNavigate("Ask Mimir")}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#8a919e] hover:text-[#3b82f6] transition-colors shrink-0"
                >
                  <span>Query file</span>
                  <ArrowUpRight size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}