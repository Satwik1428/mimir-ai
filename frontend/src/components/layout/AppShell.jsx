import { Sidebar } from "./Sidebar"

export function AppShell({ children, active, onNavigate }) {
  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-hidden">
      {/* background glow — pushed to bottom-right so top-left stays black */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.12),transparent_50%),radial-gradient(circle_at_75%_85%,rgba(139,92,246,0.18),transparent_55%)]" />

      <div className="relative flex w-full">
        <Sidebar active={active} onNavigate={onNavigate} />
        <main className="flex-1 p-8 overflow-y-auto h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}