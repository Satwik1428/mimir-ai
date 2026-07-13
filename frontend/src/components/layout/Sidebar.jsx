import { LayoutDashboard, Search, FileText, Settings } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Search, label: "Search" },
  { icon: FileText, label: "Docs" },
  { icon: Settings, label: "Settings" },
]

export function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-60 h-screen bg-black border-r border-white/10 flex flex-col p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white">
          M
        </div>
        <span className="font-semibold text-white">Mimir AI</span>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => onNavigate(label)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              active === label
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-3 px-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Running locally · Qwen2.5 3B
        </div>
        <div className="text-xs text-gray-500 pt-2 border-t border-white/10">
          Alex R.
        </div>
      </div>
    </aside>
  )
}