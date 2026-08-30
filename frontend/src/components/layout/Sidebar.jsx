import {
  LayoutDashboard,
  Brain,
  Search,
  FileText,
  Settings,
  HardDrive,
  Database,
  User,
} from "lucide-react"

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Brain,           label: "Ask Mimir"  },
  { icon: Search,          label: "Search"     },
  { icon: FileText,        label: "Documents"  },
  { icon: Settings,        label: "Settings"   },
]

export function Sidebar({ active, onNavigate, stats }) {
  const storageLabel = stats?.storage_indexed || "3.2 TB"
  const fileCount = stats?.indexed_files || 143281

  return (
    <aside
      className="flex h-screen w-64 shrink-0 flex-col border-r border-white/[0.07] px-4 py-5"
      style={{ background: "#08090b" }}
    >
      {/* ── Logo ── */}
      <div className="mb-6 flex items-center gap-3 px-1">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_14px_rgba(59,130,246,0.45)]">
          <span className="text-sm font-bold text-white">M</span>
        </div>
        <div>
          <p className="text-sm font-semibold leading-none tracking-tight text-white">Mimir AI</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Private on-device files</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex flex-col gap-1">
        {NAV.map(({ icon: Icon, label }) => {
          const isActive = active === label
          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={`
                group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5
                text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-blue-600/12 border border-blue-500/25 text-white"
                  : "border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                }
              `}
            >
              <Icon
                size={17}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? "text-blue-400" : "text-zinc-500 group-hover:text-zinc-300 transition-colors duration-200"}
              />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      {/* ── Bottom widgets ── */}
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="h-px bg-white/[0.06]" />

        {/* Storage Widget */}
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <HardDrive size={13} className="text-zinc-500" />
              <span className="text-[11px] font-medium text-zinc-500">Storage indexed</span>
            </div>
            <span className="text-[11px] text-zinc-500">{storageLabel}</span>
          </div>
          <p className="mb-1.5 text-xs font-semibold text-zinc-300">{fileCount.toLocaleString()} items</p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-[78%] rounded-full bg-blue-500" />
          </div>
        </div>

        {/* Active Model */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-zinc-600">Active Engine</p>
            <p className="text-xs font-medium text-zinc-300">Qwen 2.5 / Groq</p>
          </div>
          <Database size={14} className="text-blue-400" />
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-white/10">
            <User size={13} className="text-zinc-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium leading-none text-zinc-200 truncate">Local Workspace</p>
            <p className="mt-0.5 text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
              On-device active
            </p>
          </div>
        </div>

      </div>
    </aside>
  )
}