import { Sidebar } from "./Sidebar"

export function AppShell({ children, active, onNavigate, stats }) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#0b0c0e] text-[#ededef]">
      {/* Sidebar with subtle right border */}
      <Sidebar active={active} onNavigate={onNavigate} stats={stats} />

      {/* Main content view */}
      <main className="flex-1 overflow-y-auto bg-[#0e1013]">
        <div className="mx-auto max-w-5xl px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}