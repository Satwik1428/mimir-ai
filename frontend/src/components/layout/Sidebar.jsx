import {
  LayoutDashboard,
  Brain,
  Search,
  FileText,
  Sparkles,
  FolderTree,
  Settings,
  HardDrive,
  Database,
  CircleUserRound,
} from "lucide-react"

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    icon: Brain,
    label: "Ask Mimir",
  },
  {
    icon: Search,
    label: "Search",
  },
  {
    icon: FileText,
    label: "Documents",
  },
  {
    icon: Sparkles,
    label: "AI insights",
  },
  {
    icon: FolderTree,
    label: "Collection",
  },
  {
    icon: Settings,
    label: "Settings",
  },
]

export function Sidebar({ active, onNavigate }) {
  return (
    <aside className="w-72 h-screen flex flex-col border-r border-white/10 bg-zinc-950/80 backdrop-blur-2xl px-6 py-7">

      {/* Logo */}
      <div className="flex items-center gap-4 mb-10">

        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">

          <span className="text-white font-bold text-lg">
            M
          </span>

        </div>

        <div>

          <h2 className="text-lg font-semibold tracking-tight">
            Mimir AI
          </h2>

          <p className="text-xs text-zinc-500">
            Private AI Workspace
          </p>

        </div>

      </div>

      {/* Navigation */}

      <nav className="space-y-2">

        {navItems.map(({ icon: Icon, label }) => {

          const isActive = active === label

          return (
            <button
              key={label}
              onClick={() => onNavigate(label)}
              className={`w-full flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 group

              ${
                isActive
                  ? "bg-white/10 border border-white/10 shadow-lg"
                  : "hover:bg-white/5"
              }
              
              `}
            >

              <Icon
                size={20}
                className={`

                ${
                  isActive
                    ? "text-white"
                    : "text-zinc-500 group-hover:text-white"
                }

                `}
              />

              <span
                className={`text-[15px] font-medium

                ${
                  isActive
                    ? "text-white"
                    : "text-zinc-400 group-hover:text-white"
                }

                `}
              >
                {label}
              </span>

            </button>
          )
        })}

      </nav>

      {/* Bottom */}

      <div className="mt-auto space-y-5">

        <div className="border-t border-white/10" />

        {/* Storage */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <div className="flex items-center gap-2 mb-3">

            <HardDrive
              size={16}
              className="text-violet-400"
            />

            <span className="text-sm text-zinc-300">
              Storage Indexed
            </span>

          </div>

          <div className="flex items-end justify-between">

            <h3 className="text-xl font-semibold">
              3.2 TB
            </h3>

            <span className="text-xs text-zinc-500">
              82%
            </span>

          </div>

          <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">

            <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />

          </div>

        </div>

        {/* Model */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between">

          <div>

            <p className="text-xs text-zinc-500 mb-1">
              Active Model
            </p>

            <h3 className="font-medium">
              Qwen 2.5 3B
            </h3>

          </div>

          <Database
            size={20}
            className="text-blue-400"
          />

        </div>

        {/* Profile */}

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">

          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">

            <CircleUserRound
              size={22}
            />

          </div>

          <div>

            <h3 className="text-sm font-medium">
              Alex R.
            </h3>

            <p className="text-xs text-zinc-500">
              Frontend Developer
            </p>

          </div>

        </div>

      </div>

    </aside>
  )
}