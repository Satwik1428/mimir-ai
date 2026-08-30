import {
  LayoutDashboard,
  Brain,
  Search,
  FileText,
  Settings,
  HardDrive,
  Cpu,
  FolderLock,
  ChevronRight,
} from "lucide-react"

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", badge: null },
  { icon: Brain,           label: "Ask Mimir",  badge: "AI" },
  { icon: Search,          label: "Search",     badge: null },
  { icon: FileText,        label: "Documents",  badge: null },
  { icon: Settings,        label: "Settings",   badge: null },
]

export function Sidebar({ active, onNavigate, stats }) {
  const storageLabel = stats?.storage_indexed || "3.2 TB"
  const fileCount = stats?.indexed_files || 143281

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-[#1a1d24] bg-[#0b0c0e] px-3.5 py-4 select-none">
      {/* ── App Header ── */}
      <div className="mb-6 flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#161920] border border-[#232732] text-blue-400 font-semibold text-xs tracking-tight">
            M
          </div>
          <div>
            <span className="text-[13px] font-semibold text-[#ededef] tracking-tight block leading-none">
              Mimir
            </span>
            <span className="text-[10px] text-[#636b74] font-medium tracking-wide">
              Desktop AI
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded bg-[#13161c] px-1.5 py-0.5 text-[10px] font-mono text-[#636b74] border border-[#1f232b]">
          v1.0
        </span>
      </div>

      {/* ── Navigation ── */}
      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-[#636b74]">
        Workspace
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV.map(({ icon: Icon, label, badge }) => {
          const isActive = active === label
          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={`
                group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors
                ${isActive
                  ? "bg-[#161922] text-[#f4f4f5] font-semibold border border-[#262b38]"
                  : "text-[#8a919e] hover:bg-[#12151b] hover:text-[#d1d5db] border border-transparent"
                }
              `}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={15}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  className={isActive ? "text-blue-400" : "text-[#636b74] group-hover:text-[#9ba1a6] transition-colors"}
                />
                <span>{label}</span>
              </div>

              {badge && (
                <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                  isActive ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-[#16181f] text-[#636b74] border-[#222631]"
                }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* ── Bottom Section ── */}
      <div className="mt-auto flex flex-col gap-2 pt-4 border-t border-[#1a1d24]">
        {/* Index Storage Monitor */}
        <div className="rounded-lg border border-[#1b1e26] bg-[#101217] p-2.5">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <div className="flex items-center gap-1.5 text-[#8a919e]">
              <HardDrive size={12} className="text-[#636b74]" />
              <span>Storage</span>
            </div>
            <span className="font-mono text-[10px] text-[#636b74]">{storageLabel}</span>
          </div>

          <div className="h-1 w-full overflow-hidden rounded-full bg-[#181b22]">
            <div className="h-full w-[65%] rounded-full bg-blue-500/80" />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#636b74]">
            <span>{fileCount.toLocaleString()} indexed</span>
            <span className="font-mono">Local</span>
          </div>
        </div>

        {/* Engine status */}
        <div className="flex items-center justify-between rounded-lg border border-[#1b1e26] bg-[#101217] px-2.5 py-2">
          <div className="flex items-center gap-2">
            <Cpu size={13} className="text-blue-400" />
            <div>
              <p className="text-[11px] font-medium text-[#ededef] leading-tight">Qwen 2.5 3B</p>
              <p className="text-[9px] text-[#636b74] font-mono">On-device inference</p>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Local Security pill */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] text-[#636b74]">
          <FolderLock size={11} className="text-emerald-500/80" />
          <span>Zero cloud egress • Private</span>
        </div>
      </div>
    </aside>
  )
}