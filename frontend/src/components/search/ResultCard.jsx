import {
  FileText,
  FileCode,
  FileImage,
  FileSpreadsheet,
  File,
  ArrowUpRight,
  Zap,
} from "lucide-react"

// Presentation icon doesn't exist in lucide — use a substitute
import { MonitorPlay } from "lucide-react"

// ── File-type metadata ────────────────────────────────────────────────────────
const EXT_META = {
  pdf:  { icon: FileText,       label: "PDF",  cls: "text-red-400   bg-red-500/10   border-red-500/20"   },
  docx: { icon: FileText,       label: "DOCX", cls: "text-blue-400  bg-blue-500/10  border-blue-500/20"  },
  doc:  { icon: FileText,       label: "DOC",  cls: "text-blue-400  bg-blue-500/10  border-blue-500/20"  },
  md:   { icon: FileCode,       label: "MD",   cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  txt:  { icon: FileCode,       label: "TXT",  cls: "text-zinc-400  bg-white/5      border-white/10"     },
  pptx: { icon: MonitorPlay,    label: "PPTX", cls: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  ppt:  { icon: MonitorPlay,    label: "PPT",  cls: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  xlsx: { icon: FileSpreadsheet,label: "XLSX", cls: "text-green-400 bg-green-500/10  border-green-500/20" },
  xls:  { icon: FileSpreadsheet,label: "XLS",  cls: "text-green-400 bg-green-500/10  border-green-500/20" },
  png:  { icon: FileImage,      label: "PNG",  cls: "text-sky-400   bg-sky-500/10   border-sky-500/20"   },
  jpg:  { icon: FileImage,      label: "JPG",  cls: "text-sky-400   bg-sky-500/10   border-sky-500/20"   },
  jpeg: { icon: FileImage,      label: "JPEG", cls: "text-sky-400   bg-sky-500/10   border-sky-500/20"   },
}

const FALLBACK = { icon: File, label: "FILE", cls: "text-zinc-400 bg-white/5 border-white/10" }

function getFileMeta(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? ""
  return EXT_META[ext] ?? { ...FALLBACK, label: ext.toUpperCase() || "FILE" }
}

function confidenceCls(n) {
  if (n >= 90) return "text-emerald-400"
  if (n >= 75) return "text-blue-400"
  return "text-zinc-400"
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ResultCard({ title, snippet, confidence }) {
  const meta = getFileMeta(title)
  const Icon = meta.icon

  return (
    <div
      className="
        group relative rounded-xl border border-white/[0.08] bg-white/[0.03]
        p-5 transition-all duration-200
        hover:border-white/[0.14] hover:bg-white/[0.055]
        hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]
        hover:-translate-y-px
        cursor-pointer
      "
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">

        {/* Icon + title */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-lg border ${meta.cls}`}>
            <Icon size={17} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white leading-snug">{title}</p>
            <span className={`mt-1 inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.cls}`}>
              {meta.label}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-zinc-600 uppercase tracking-wide">Match</p>
          <p className={`text-xl font-bold leading-none mt-0.5 tabular-nums ${confidenceCls(confidence)}`}>
            {confidence}%
          </p>
        </div>

      </div>

      {/* Snippet */}
      <p className="mt-4 text-[13px] leading-[1.65] text-zinc-400 line-clamp-2">
        {snippet}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-blue-500" strokeWidth={2} />
          <span className="text-[11px] text-zinc-600">Semantic match</span>
        </div>
        <button
          className="
            flex items-center gap-1 rounded-md px-2.5 py-1
            text-[12px] font-medium text-zinc-400
            border border-white/[0.06] bg-white/[0.03]
            transition-all duration-200
            hover:text-white hover:border-white/[0.12] hover:bg-white/[0.07]
          "
        >
          Open <ArrowUpRight size={12} />
        </button>
      </div>

    </div>
  )
}