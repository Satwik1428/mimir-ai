import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { SearchPage } from "@/pages/Search"
function App() {
  const [active, setActive] = useState("Search")

  return (
    <AppShell active={active} onNavigate={setActive}>
      {active === "Search" && <SearchPage />}
      {active === "Dashboard" && <div className="text-gray-400">Dashboard coming next</div>}
      {active === "Docs" && <div className="text-gray-400">Docs coming next</div>}
      {active === "Settings" && <div className="text-gray-400">Settings coming next</div>}
    </AppShell>
  )
}

export default App