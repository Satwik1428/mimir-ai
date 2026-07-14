import { useState } from "react"

import { AppShell } from "@/components/layout/AppShell"

import { SearchPage } from "@/pages/Search"
import { DashboardPage } from "@/pages/Dashboard"
function App() {

  const [active, setActive] = useState("Dashboard")

  return (

    <AppShell
      active={active}
      onNavigate={setActive}
    >

      {active === "Dashboard" && (
        <DashboardPage />
      )}

      {active === "Ask Mimir" && (
        <div className="text-zinc-400">
          Ask Mimir UI incoming
        </div>
      )}

      {active === "Search" && (
        <SearchPage />
      )}

      {active === "Documents" && (
        <div className="text-zinc-400">
          Documents UI Coming...
        </div>
      )}

      {active === "AI Insights" && (
        <div className="text-zinc-400">
          AI Insights UI Coming...
        </div>
      )}

      {active === "Collections" && (
        <div className="text-zinc-400">
          Collections UI Coming...
        </div>
      )}

      {active === "Settings" && (
        <div className="text-zinc-400">
          Settings UI Coming...
        </div>
      )}

    </AppShell>

  )
}

export default App