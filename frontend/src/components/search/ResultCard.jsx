import {
  FileText,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

import { Card } from "@/components/ui/card"

export function ResultCard({
  title,
  snippet,
  confidence,
}) {
  return (
    <Card
      className="
        group
        cursor-pointer
        rounded-3xl
        border
        border-white/10
        bg-white/[0.04]
        backdrop-blur-xl
        transition-all
        duration-300
        hover:border-violet-500/30
        hover:bg-white/[0.06]
        hover:shadow-[0_0_35px_rgba(124,58,237,0.12)]
      "
    >
      <div className="p-6">

        {/* Top */}

        <div className="flex items-start justify-between">

          <div className="flex items-start gap-4">

            {/* Icon */}

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-violet-500/20
                to-blue-500/20
                border
                border-white/10
              "
            >
              <FileText
                size={22}
                className="text-violet-300"
              />
            </div>

            {/* Title */}

            <div>

              <h3
                className="
                  text-lg
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                {title}
              </h3>

              <div className="mt-2 flex items-center gap-2">

                <span
                  className="
                    rounded-full
                    border
                    border-violet-500/20
                    bg-violet-500/10
                    px-3
                    py-1
                    text-xs
                    text-violet-300
                  "
                >
                  PDF
                </span>

                <span
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    py-1
                    text-xs
                    text-zinc-400
                  "
                >
                  NLP
                </span>

              </div>

            </div>

          </div>

          {/* Confidence */}

          <div
            className="
              rounded-xl
              border
              border-emerald-500/20
              bg-emerald-500/10
              px-3
              py-2
            "
          >

            <p className="text-xs text-zinc-500">
              Confidence
            </p>

            <h4 className="text-lg font-semibold text-emerald-400">
              {confidence}%
            </h4>

          </div>

        </div>

        {/* Snippet */}

        <p
          className="
            mt-6
            leading-7
            text-zinc-400
          "
        >
          {snippet}
        </p>

        {/* Divider */}

        <div className="my-6 border-t border-white/10" />

        {/* Footer */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-2">

            <Sparkles
              size={16}
              className="text-violet-400"
            />

            <span className="text-sm text-zinc-500">
              AI Match
            </span>

          </div>

          <button
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-white/5
              px-4
              py-2
              text-sm
              text-white
              transition
              hover:bg-white/10
            "
          >

            Open

            <ArrowUpRight
              size={16}
            />

          </button>

        </div>

      </div>
    </Card>
  )
}