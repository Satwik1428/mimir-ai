import heroAI from "../../assets/herosection.png"
export default function HeroSection() {
  const formats = [
    "PDF",
    "DOCX",
    "TXT",
    "MD",
    "Images",
    "OCR",
    "+ More",
  ]

  return (
    <section className="w-full rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-8 overflow-hidden">

      <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">

        {/* LEFT */}

        <div className="space-y-6">

          {/* Heading */}

          <div className="space-y-1">

            <h1 className="text-5xl xl:text-6xl font-bold leading-none tracking-tight text-white">
              Your Private
            </h1>

            <h1 className="text-5xl xl:text-6xl font-bold leading-none tracking-tight bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500 bg-clip-text text-transparent">
              AI Memory
            </h1>

          </div>

          {/* Description */}

          <p className="max-w-lg text-base leading-7 text-zinc-400">
            Search, understand and interact with all your files using
            <span className="text-violet-400 font-medium">
              {" "}on-device AI.
            </span>
            <span className="text-white">
              {" "}Everything stays on your device.
            </span>
          </p>

          {/* Supported */}

          <div className="space-y-3">

            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              Supports
            </p>

            <div className="flex flex-wrap gap-2">

              {formats.map((item) => (
                <div
                  key={item}
                  className="
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    py-1.5
                    text-xs
                    text-zinc-300
                    transition-all
                    duration-300
                    hover:bg-violet-500/10
                    hover:border-violet-500/30
                  "
                >
                  {item}
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* RIGHT */}

        <div className="relative flex justify-center">

          {/* Glow */}

          <div className="absolute h-[300px] w-[300px] rounded-full bg-violet-600/20 blur-[110px]" />

          <img
            src={heroAI}
            alt="Mimir AI"
            draggable="false"
            className="
              relative
              w-full
              max-w-[390px]
              object-contain
              select-none
              drop-shadow-[0_0_40px_rgba(124,58,237,0.25)]
            "
          />

        </div>

      </div>

    </section>
  )
}