import { Sidebar } from "./Sidebar"

export function AppShell({ children, active, onNavigate, stats }) {
  return (
    <div
      className="relative flex h-screen w-screen overflow-hidden text-white"
      style={{ background: "#08090b" }}
    >
      <Sidebar active={active} onNavigate={onNavigate} stats={stats} />

      {/* Main scrollable area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-10 py-9">
          {children}
        </div>
      </main>
    </div>
  )
}