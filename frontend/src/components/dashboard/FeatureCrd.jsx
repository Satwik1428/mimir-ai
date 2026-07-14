import { ArrowUpRight } from "lucide-react"

export default function FeatureCrd({
  icon: Icon,
  title,
  description,
  preview,
}) {
  return (
    <div
      className="
      group
      h-full
      rounded-3xl
      border
      border-white/10
      bg-white/[0.03]
      backdrop-blur-xl
      p-6
      transition-all
      duration-300
      hover:border-violet-500/30
      hover:bg-white/[0.05]
      hover:shadow-[0_0_40px_rgba(124,58,237,0.12)]
    "
    >
      <div className="flex h-full flex-col justify-between">

        <div>

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20">

            <Icon
              size={22}
              className="text-violet-300"
            />

          </div>

          <h3 className="text-xl font-semibold text-white">
            {title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            {description}
          </p>

        </div>

        {/* Preview */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4">

          {preview}

        </div>

        <button className="mt-6 flex items-center gap-2 text-sm text-violet-300 transition group-hover:gap-3">

          Learn More

          <ArrowUpRight
            size={16}
          />

        </button>

      </div>
    </div>
  )
}