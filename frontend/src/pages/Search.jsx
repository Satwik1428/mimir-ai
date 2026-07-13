import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Search as SearchIcon,
  Mic,
  Sparkles,
  Clock3,
} from "lucide-react"

import { ResultCard } from "@/components/search/ResultCard"

const mockResults = [
  {
    title: "Attention_Is_All_You_Need.pdf",
    snippet:
      "Multi-head self-attention mechanisms for transformer architecture and contextual representations.",
    confidence: 96,
  },
  {
    title: "ML_Architecture_Deck.pptx",
    snippet:
      "Overview of transformer architecture and modern NLP pipelines with practical examples.",
    confidence: 92,
  },
  {
    title: "DeepLearningNotes.md",
    snippet:
      "Personal notes covering optimization, gradient descent, embeddings and attention.",
    confidence: 89,
  },
]

const recentResults = [
  "Research_Paper.pdf",
  "Resume.pdf",
  "Hackathon_Plan.docx",
]

export function SearchPage() {
  const [query, setQuery] = useState("")

  return (
    <div className="space-y-10">

      {/* Header */}

      <div>

        <h1 className="text-5xl font-bold tracking-tight">
          Search by Thought
        </h1>

        <p className="mt-3 text-lg text-zinc-400 max-w-2xl">
          Instantly search, understand and chat with everything stored on your
          computer using private on-device AI.
        </p>

      </div>

      {/* Search */}

      <div className="relative">

        <SearchIcon
          size={20}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400"
        />

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What presentation discusses transformer architectures?"
          className="
            h-16
            rounded-full
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            pl-14
            pr-28
            text-base
            text-white
            placeholder:text-zinc-500
            shadow-2xl
            focus-visible:ring-1
            focus-visible:ring-violet-500
          "
        />

        <div className="absolute right-5 top-1/2 flex -translate-y-1/2 items-center gap-3">

          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
            ⌘ K
          </div>

          <Mic
            size={18}
            className="cursor-pointer text-zinc-400 transition hover:text-white"
          />

        </div>

      </div>

      {/* Main Layout */}

      <div className="grid grid-cols-12 gap-8">

        {/* Left */}

        <div className="col-span-8 space-y-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-semibold">
                Semantic Search Results
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                {query ||
                  "What presentation discusses transformer architectures?"}
              </p>

            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-400">
              3 Results
            </div>

          </div>

          <div className="space-y-4">

            {mockResults.map((result) => (
              <ResultCard
                key={result.title}
                {...result}
              />
            ))}

          </div>

        </div>

        {/* Right */}

        <div className="col-span-4 space-y-6">

          {/* AI Insight */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-4 flex items-center gap-2">

              <Sparkles
                size={18}
                className="text-violet-400"
              />

              <span className="font-medium">
                AI Insight
              </span>

            </div>

            <p className="text-sm leading-7 text-zinc-400">
              Your research folder hasn't been opened in{" "}
              <span className="text-white">41 days</span>.
              You may want to revisit your Transformer notes.
            </p>

          </div>

          {/* Recent */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center gap-2">

              <Clock3
                size={18}
                className="text-blue-400"
              />

              <span className="font-medium">
                Recent Documents
              </span>

            </div>

            <div className="space-y-3">

              {recentResults.map((doc) => (

                <button
                  key={doc}
                  className="
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-white/5
                    bg-white/[0.03]
                    px-4
                    py-3
                    text-left
                    transition
                    hover:bg-white/[0.06]
                  "
                >

                  <span className="text-sm text-zinc-300">
                    {doc}
                  </span>

                  <span className="text-xs text-zinc-500">
                    Open
                  </span>

                </button>

              ))}

            </div>

          </div>

        </div>

      </div>

      {/* Dashboard Overview */}

      <div>

        <h2 className="mb-5 text-2xl font-semibold">
          Dashboard Overview
        </h2>

        <div className="grid grid-cols-4 gap-6">

          {[
            ["Indexed Files", "143,281"],
            ["Storage", "3.2 TB"],
            ["AI Insights", "18"],
            ["Collections", "42"],
          ].map(([title, value]) => (

            <div
              key={title}
              className="
                rounded-3xl
                border
                border-white/10
                bg-white/[0.04]
                p-6
                backdrop-blur-xl
              "
            >

              <p className="text-sm text-zinc-500">
                {title}
              </p>

              <h3 className="mt-3 text-3xl font-semibold">
                {value}
              </h3>

            </div>

          ))}

        </div>

      </div>

    </div>
  )
}