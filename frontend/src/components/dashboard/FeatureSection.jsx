import {
  Brain,
  Search,
  ScanSearch,
} from "lucide-react"

import FeatureCard from "./FeatureCrd"

export default function FeatureSection() {
  return (
    <section className="space-y-10">

      <div>

        <h2 className="text-3xl font-semibold tracking-tight">
          Core Capabilities
        </h2>

        <p className="mt-2 text-zinc-400">
          Everything Mimir can do, powered entirely by on-device AI.
        </p>

      </div>

      <div className="grid grid-cols-3 gap-6">

        <FeatureCard
          icon={Brain}
          title="Ask Mimir"
          description="Ask natural language questions about your documents and instantly receive grounded answers."
          preview={
            <div className="space-y-3">

              <div className="rounded-xl bg-violet-500/10 px-3 py-2 text-sm text-zinc-300">
                Find my internship offer
              </div>

              <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white">
                ✓ Internship_Offer.pdf
              </div>

            </div>
          }
        />

        <FeatureCard
          icon={Search}
          title="Semantic Search"
          description="Search documents by meaning instead of remembering exact filenames."
          preview={
            <div className="space-y-3">

              <div className="rounded-xl bg-white/5 px-3 py-2 text-sm text-zinc-300">
                Transformer Architecture
              </div>

              <div className="flex items-center justify-between rounded-xl bg-violet-500/10 px-3 py-2">

                <span className="text-sm text-white">
                  Attention.pdf
                </span>

                <span className="text-xs text-violet-300">
                  97%
                </span>

              </div>

            </div>
          }
        />

        <FeatureCard
          icon={ScanSearch}
          title="OCR Ready"
          description="Extract and search text from scanned PDFs, handwritten notes and screenshots."
          preview={
            <div className="space-y-3">

              <div className="h-2 rounded-full bg-white/10 overflow-hidden">

                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />

              </div>

              <p className="text-sm text-zinc-300">
                OCR Processing Complete ✓
              </p>

            </div>
          }
        />

      </div>

    </section>
  )
}