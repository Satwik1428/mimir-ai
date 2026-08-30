import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { DashboardPage } from "@/pages/Dashboard"
import { AskMimirPage } from "@/pages/AskMimir"
import { SearchPage } from "@/pages/Search"
import { DocumentsPage } from "@/pages/Documents"
import { SettingsPage } from "@/pages/Settings"
import { getDocumentsApi } from "@/lib/api"

const PAGES = ["Dashboard", "Ask Mimir", "Search", "Documents", "Settings"]

function App() {
  const [active, setActive] = useState("Dashboard")
  const [stats, setStats] = useState(null)
  const [askContext, setAskContext] = useState(null)

  useEffect(() => {
    getDocumentsApi().then((res) => {
      if (res?.stats) setStats(res.stats)
    })
  }, [active])

  const navigateToAsk = (fileOrQuery) => {
    setAskContext(fileOrQuery)
    setActive("Ask Mimir")
  }

  return (
    <AppShell
      active={active}
      onNavigate={(p) => PAGES.includes(p) && setActive(p)}
      stats={stats}
    >
      {active === "Dashboard" && <DashboardPage onNavigate={setActive} />}
      {active === "Ask Mimir" && <AskMimirPage initialContext={askContext} onNavigateToSearch={() => setActive("Search")} />}
      {active === "Search" && <SearchPage onNavigateToAsk={navigateToAsk} />}
      {active === "Documents" && <DocumentsPage onNavigateToAsk={navigateToAsk} />}
      {active === "Settings" && <SettingsPage />}
    </AppShell>
  )
}

export default App