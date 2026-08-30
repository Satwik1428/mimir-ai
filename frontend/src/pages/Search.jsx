import { useState, useEffect } from "react"
import { Search as SearchIcon, Clock, FileSearch, Sparkles, Brain } from "lucide-react"
import { ResultCard } from "@/components/search/ResultCard"
import { searchFilesApi } from "@/lib/api"

const RECENT_QUERIES = [
  "transformer attention architecture",
  "internship offer notice period",
  "deep learning gradient descent notes",
]

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-white/[0.07]" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3 w-3/5 rounded bg-white/[0.08]" />
          <div className="h-2.5 w-14 rounded bg-white/[0.06]" />
        </div>
        <div className="h-8 w-10 shrink-0 rounded bg-white/[0.07]" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-2.5 w-full rounded bg-white/[0.06]" />
        <div className="h-2.5 w-4/5 rounded bg-white/[0.06]" />
      </div>
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03]">
        <FileSearch size={22} className="text-zinc-600" />
      </div>
      <p className="text-sm font-semibold text-zinc-300">No results found</p>
      <p className="mt-1.5 max-w-[280px] text-[13px] leading-5 text-zinc-500">
        No files matched{" "}
        <span className="font-medium text-zinc-400">"{query}"</span>. Try
        rephrasing or index additional folders.
      </p>
    </div>
  )
}

export function SearchPage({ onNavigateToAsk }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Initial load with default semantic search
  useEffect(() => {
    searchFilesApi("transformer attention").then((res) => {
      if (res?.results) {
        setResults(res.results)
      }
    })
  }, [])

  const handleSearch = async (queryText = query) => {
    const q = queryText.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await searchFilesApi(q)
      setResults(res.results || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center gap-2.5">
            <SearchIcon className="text-blue-400" size={26} />
            Semantic File Search
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            Search files by concept and meaning — no need to remember exact filenames.
          </p>
        </div>

        {query && (
          <button
            onClick={() => onNavigateToAsk && onNavigateToAsk(query)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-600/10 px-3.5 py-2 text-xs font-semibold text-blue-400 hover:bg-blue-600/20 transition-all"
          >
            <Brain size={13} />
            <span>Ask Mimir this query</span>
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative"
      >
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Find the paper discussing multi-head attention mechanisms..."
          className="
            h-12 w-full rounded-xl border border-white/[0.09] bg-white/[0.04]
            pl-11 pr-28 text-[13px] text-white placeholder:text-zinc-500
            transition-all duration-200
            focus:border-blue-500/40 focus:bg-white/[0.06] focus:outline-none
            focus:ring-2 focus:ring-blue-500/15
          "
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="
              rounded-lg bg-blue-600 px-4 py-1.5
              text-[12px] font-semibold text-white
              transition-all duration-200
              hover:bg-blue-500
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Main Grid: Results & Side Panel */}
      <div className="grid grid-cols-[1fr_240px] gap-6">
        {/* Results Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Matching Documents
            </span>
            {!loading && results.length > 0 && (
              <span className="text-[11px] text-zinc-500">
                {results.length} {results.length === 1 ? "match" : "matches"} found
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : searched && results.length === 0 ? (
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025]">
              <EmptyState query={query} />
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map((r, i) => (
                <ResultCard
                  key={r.title || r.filename || i}
                  {...r}
                  title={r.title || r.filename}
                />
              ))}
            </div>
          )}
        </div>

        {/* Side Panel: Suggestions & Guidance */}
        <div className="space-y-3">
          {/* Quick Concept Queries */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={13} className="text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
                Sample Queries
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {RECENT_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q)
                    handleSearch(q)
                  }}
                  className="
                    flex w-full items-center justify-between rounded-lg px-2.5 py-2
                    text-left text-[11px] text-zinc-300 transition-all duration-150
                    hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]
                  "
                >
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* On-Device Search Tip */}
          <div className="rounded-xl border border-blue-500/[0.15] bg-blue-500/[0.05] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1.5">
              Natural Language
            </p>
            <p className="text-[12px] leading-[1.6] text-zinc-400">
              Mimir embeds document text into vectors. You can search concepts like{" "}
              <span className="text-zinc-200">"internship salary and terms"</span>{" "}
              even if the file is named <span className="text-zinc-300">Offer.pdf</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}