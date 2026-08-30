import { useState, useEffect } from "react"
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
} from "lucide-react"
import { getDocumentsApi, indexFolderApi } from "@/lib/api"

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
    indexed_files: 143281,
    storage_indexed: "3.2 TB",
    total_chunks: 4200
  })
  const [recentDocs, setRecentDocs] = useState([])
  const [folderInput, setFolderInput] = useState("")
  const [indexing, setIndexing] = useState(false)

  const loadData = async () => {
    try {
      const res = await getDocumentsApi()
      if (res?.stats) setStats(res.stats)
      if (res?.documents) setRecentDocs(res.documents.slice(0, 4))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleIndex = async (e) => {
    e.preventDefault()
    if (!folderInput.trim() || indexing) return
    setIndexing(true)
    try {
      await indexFolderApi(folderInput.trim())
      setFolderInput("")
      await loadData()
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
          value={stats?.indexed_files?.toLocaleString() || "143,281"}
          subtext="Active in local vector index"
          icon={Files}
        />
        <MetricCard
          label="Storage Footprint"
          value={stats?.storage_indexed || "3.2 TB"}
          subtext="FAISS vector store + text cache"
          icon={HardDrive}
        />
        <MetricCard
          label="Recent Activity"
          value={recentDocs.length > 0 ? recentDocs.length : 4}
          subtext="Files touched in last session"
          icon={Clock}
        />
      </div>

      {/* ── Directory Indexer Console ── */}
      <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#232733] bg-[#161922] text-[#8a919e]">
              <FolderOpen size={15} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#ededef]">Index Directory</p>
              <p className="text-[11px] text-[#636b74]">Parse PDFs, DOCX, Markdown & extract vector embeddings locally</p>
            </div>
          </div>

          <form onSubmit={handleIndex} className="flex items-center gap-2">
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="e.g. C:/Users/Documents/Research"
              className="
                h-8.5 w-64 rounded-lg border border-[#232733] bg-[#0e1014]
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
              <span>Index Path</span>
            </button>
          </form>
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
              {recentDocs.length || 4}
            </span>
          </div>

          <button
            onClick={() => onNavigate("Documents")}
            className="text-[11px] text-[#8a919e] hover:text-[#ededef] transition-colors"
          >
            View all documents →
          </button>
        </div>

        <div className="divide-y divide-[#181b23]">
          {(recentDocs.length > 0
            ? recentDocs
            : [
                { filename: "Attention_Is_All_You_Need.pdf", file_type: "pdf", filepath: "/Documents/Research/Attention_Is_All_You_Need.pdf" },
                { filename: "ML_Architecture_Deck.pptx", file_type: "pptx", filepath: "/Documents/Work/ML_Architecture_Deck.pptx" },
                { filename: "DeepLearningNotes.md", file_type: "md", filepath: "/Documents/Notes/DeepLearningNotes.md" },
                { filename: "Internship_Offer_Letter.pdf", file_type: "pdf", filepath: "/Documents/Career/Internship_Offer_Letter.pdf" },
              ]
          ).map((item, i) => (
            <div
              key={item.filename || i}
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
      </div>
    </div>
  )
}