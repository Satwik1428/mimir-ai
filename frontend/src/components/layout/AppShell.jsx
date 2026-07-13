import { Sidebar } from "./Sidebar"

export function AppShell({ children, active, onNavigate }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090B] text-white">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Blue Glow */}
        <div className="absolute -top-40 right-[-180px] h-[700px] w-[700px] rounded-full bg-blue-500/15 blur-[170px]" />

        {/* Purple Glow */}
        <div className="absolute bottom-[-220px] right-[18%] h-[700px] w-[700px] rounded-full bg-violet-500/15 blur-[170px]" />

        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.03),transparent_45%)]" />

      </div>

      {/* Layout */}
      <div className="relative flex h-screen">

        {/* Sidebar */}
        <Sidebar
          active={active}
          onNavigate={onNavigate}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">

          <div className="mx-auto max-w-[1600px] px-12 py-10">

            {children}

          </div>

        </main>

      </div>

    </div>
  )
}