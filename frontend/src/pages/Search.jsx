import { useState, useEffect } from "react"
import { Search as SearchIcon, Clock, FileSearch, Sparkles, Brain, CornerDownLeft } from "lucide-react"
import { ResultCard } from "@/components/search/ResultCard"
import { searchFilesApi } from "@/lib/api"

const SAMPLE_QUERIES = [
  "transformer self-attention architecture",
  "internship offer notice period",
  "optimization and gradient descent",
]

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[#1d212b] bg-[#12141a] p-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg bg-[#1a1d26]" />
        <div className="flex-1 space-y-2 pt-0.5">
          <div className="h-3 w-2/5 rounded bg-[#1a1d26]" />
          <div className="h-2 w-1/5 rounded bg-[#161922]" />
        </div>
        <div className="h-6 w-12 shrink-0 rounded bg-[#1a1d26]" />
      </div>
      <div className="mt-3 pl-11 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-[#181b24]" />
        <div className="h-2.5 w-4/5 rounded bg-[#181b24]" />
      </div>
    </div>
  )
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[#232733] bg-[#141720] text-[#636b74]">
        <FileSearch size={18} />
      </div>
      <p className="text-[13px] font-medium text-[#ededef]">No matching documents found</p>
      <p className="mt-1 max-w-[280px] text-[11.5px] text-[#636b74]">
        No indexed files matched <span className="font-mono text-[#8a919e]">"{query}"</span>. Try adjusting your search or index additional directories.
      </p>
    </div>
  )
}

export function SearchPage({ onNavigateToAsk }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    searchFilesApi("transformer attention").then((res) => {
      if (res?.results) setResults(res.results)
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
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-1 border-b border-[#181b22]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight">
            Semantic Search
          </h1>
          <p className="text-[12px] text-[#636b74] mt-0.5">
            Vector similarity retrieval across your local document knowledge base
          </p>
        </div>

        {query && (
          <button
            onClick={() => onNavigateToAsk && onNavigateToAsk(query)}
            className="flex items-center gap-1.5 rounded-lg border border-[#262b38] bg-[#151820] px-3 py-1.5 text-[12px] font-medium text-blue-400 hover:bg-[#1a1e28] hover:text-blue-300 transition-colors"
          >
            <Brain size={12} />
            <span>Ask Mimir this query</span>
          </button>
        )}
      </div>

      {/* ── Search Input ── */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
        className="relative"
      >
        <SearchIcon
          size={15}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636b74]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what you're looking for in plain language..."
          className="
            h-11 w-full rounded-xl border border-[#232733] bg-[#12141a]
            pl-10 pr-24 text-[13px] text-[#ededef] placeholder:text-[#4b515d]
            focus:border-blue-500/50 focus:bg-[#14171f] focus:ring-1 focus:ring-blue-500/20
            transition-colors
          "
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="
              flex items-center gap-1 rounded-lg bg-[#2563eb] px-3 py-1.5
              text-[11.5px] font-medium text-white transition-colors
              hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <span>{loading ? "Searching..." : "Search"}</span>
            <CornerDownLeft size={11} />
          </button>
        </div>
      </form>

      {/* ── Main Layout: Results & Aside ── */}
      <div className="grid grid-cols-[1fr_240px] gap-5">
        {/* Results Stream */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#717885]">
              Ranked Matches
            </span>
            {!loading && results.length > 0 && (
              <span className="text-[11px] font-mono text-[#636b74]">
                {results.length} files found
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
            <div className="rounded-xl border border-[#1d212b] bg-[#12141a]">
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

        {/* Aside Sidebar */}
        <div className="space-y-3">
          {/* Quick Prompts */}
          <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-3.5">
            <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#717885]">
              <Sparkles size={11} className="text-blue-400" />
              <span>Suggested Queries</span>
            </div>
            <div className="flex flex-col gap-1">
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q)
                    handleSearch(q)
                  }}
                  className="
                    flex w-full items-center justify-between rounded-lg px-2 py-1.5
                    text-left text-[11.5px] text-[#8a919e] transition-colors
                    hover:bg-[#181b24] hover:text-[#ededef]
                  "
                >
                  <span className="truncate">{q}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Technology Note */}
          <div className="rounded-xl border border-[#1d212b] bg-[#12141a] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#717885] mb-1">
              Embedding Search
            </p>
            <p className="text-[11.5px] leading-relaxed text-[#636b74]">
              Files are indexed using <span className="font-mono text-[#8a919e]">all-MiniLM-L6-v2</span>. Semantic matches are scored based on vector cosine proximity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}