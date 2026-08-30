import { useState, useEffect } from "react"
import {
  Files,
  HardDrive,
  Clock,
  FileText,
  FileCode,
  MonitorPlay,
  Brain,
  Search,
  Sparkles,
  ArrowUpRight,
  FolderOpen,
  RefreshCw,
  Zap,
} from "lucide-react"
import { getDocumentsApi, indexFolderApi } from "@/lib/api"

// Stat Card component
function StatCard({ icon: Icon, iconCls, label, children }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-widest text-zinc-500">{label}</span>
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${iconCls}`}>
          <Icon size={14} strokeWidth={2} />
        </div>
      </div>
      {children}
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
  const [loading, setLoading] = useState(false)
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
    <div className="space-y-7">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Private, on-device AI file memory for your local documents.
          </p>
        </div>

        {/* Quick Launch Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate("Ask Mimir")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-all"
          >
            <Brain size={13} />
            Ask Mimir
          </button>
          <button
            onClick={() => onNavigate("Search")}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <Search size={13} />
            Search Files
          </button>
        </div>
      </div>

      {/* ── 3 Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Indexed Files */}
        <StatCard
          icon={Files}
          iconCls="border-blue-500/20 bg-blue-500/10 text-blue-400"
          label="Indexed Files"
        >
          <p className="text-[32px] font-bold tracking-tight leading-none text-white">
            {stats?.indexed_files?.toLocaleString() || "143,281"}
          </p>
          <p className="text-[11px] text-zinc-500">files across all watched folders</p>
        </StatCard>

        {/* Storage Indexed */}
        <StatCard
          icon={HardDrive}
          iconCls="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          label="Storage Indexed"
        >
          <p className="text-[32px] font-bold tracking-tight leading-none text-white">
            {stats?.storage_indexed || "3.2 TB"}
          </p>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Vector store size</span>
              <span className="text-[11px] font-medium text-zinc-400">82%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div className="h-full w-[82%] rounded-full bg-emerald-500" />
            </div>
          </div>
        </StatCard>

        {/* Recent Activity */}
        <StatCard
          icon={Clock}
          iconCls="border-white/10 bg-white/[0.04] text-zinc-400"
          label="Recent Activity"
        >
          <p className="text-[32px] font-bold tracking-tight leading-none text-white">
            {recentDocs.length > 0 ? recentDocs.length : 3}
          </p>
          <p className="text-[11px] text-zinc-500">files indexed in the last 24 h</p>
        </StatCard>
      </div>

      {/* ── Index Folder Action Banner ── */}
      <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400">
            <FolderOpen size={16} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-zinc-200">Index a Local Directory</p>
            <p className="text-[11px] text-zinc-500">Mimir extracts text, chunks, embeds, and indexes everything offline.</p>
          </div>
        </div>

        <form onSubmit={handleIndex} className="flex items-center gap-2">
          <input
            type="text"
            value={folderInput}
            onChange={(e) => setFolderInput(e.target.value)}
            placeholder="Folder path (e.g. C:/Users/Documents)..."
            className="
              h-9 w-60 rounded-lg border border-white/[0.09] bg-white/[0.04]
              px-3 text-[12px] text-zinc-200 placeholder:text-zinc-600
              focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/15
            "
          />
          <button
            type="submit"
            disabled={indexing || !folderInput.trim()}
            className="
              h-9 rounded-lg bg-blue-600 px-4 text-[12px] font-semibold text-white
              hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all
              flex items-center gap-1.5
            "
          >
            {indexing ? <RefreshCw size={13} className="animate-spin" /> : <HardDrive size={13} />}
            <span>Index</span>
          </button>
        </form>
      </div>

      {/* ── Recent Activity List ── */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-zinc-500" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Recent Indexed Documents
            </span>
          </div>
          <button
            onClick={() => onNavigate("Documents")}
            className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            View all →
          </button>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {(recentDocs.length > 0
            ? recentDocs
            : [
                { filename: "Attention_Is_All_You_Need.pdf", file_type: "pdf", filepath: "/Research/Attention_Is_All_You_Need.pdf" },
                { filename: "ML_Architecture_Deck.pptx", file_type: "pptx", filepath: "/Work/ML_Architecture_Deck.pptx" },
                { filename: "DeepLearningNotes.md", file_type: "md", filepath: "/Notes/DeepLearningNotes.md" },
              ]
          ).map((item, i) => (
            <div
              key={item.filename || i}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
                  <FileText size={15} className="text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-zinc-200">{item.filename}</p>
                  <p className="text-[11px] text-zinc-500 truncate">{item.filepath || "Indexed in knowledge base"}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigate("Ask Mimir")}
                className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
              >
                <span>Ask</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}