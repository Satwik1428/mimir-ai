import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon, Mic } from "lucide-react"
import { ResultCard } from "@/components/search/ResultCard"

const mockResults = [
  { title: "Attention_Is_All_You_Need.pdf", snippet: "Multi-head self-attention mechanisms for rotation-invariant transformer architecture...", confidence: 96 },
  { title: "ML_Architecture_Deck.pptx", snippet: "Overview of transformer architecture and its practical applications in NLP...", confidence: 92 },
  { title: "DeepLearningNotes.md", snippet: "Personal notes on learning mechanisms and gradient descent fundamentals...", confidence: 89 },
]

export function SearchPage() {
  const [query, setQuery] = useState("")

  return (
    <div className="max-w-4xl">
      <div className="relative mb-8">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What presentation discusses transformer architectures?"
          className="pl-12 pr-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl"
        />
        <Mic className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      <h1 className="text-2xl font-semibold mb-1">Semantic Search Results</h1>
      <p className="text-gray-400 text-sm mb-6">{query || "What presentation discusses transformer architectures?"}</p>

      <div className="flex flex-col gap-3">
        {mockResults.map((r) => (
          <ResultCard key={r.title} {...r} />
        ))}
      </div>
    </div>
  )
}