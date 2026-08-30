import {
  FileText,
  FileCode,
  FileSpreadsheet,
  MonitorPlay,
  File,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"

const EXT_META = {
  pdf:  { icon: FileText,        label: "PDF",  badge: "text-red-400 bg-red-500/10 border-red-500/20" },
  docx: { icon: FileText,        label: "DOCX", badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  doc:  { icon: FileText,        label: "DOC",  badge: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  md:   { icon: FileCode,        label: "MD",   badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  txt:  { icon: FileCode,        label: "TXT",  badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
  pptx: { icon: MonitorPlay,     label: "PPTX", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  xlsx: { icon: FileSpreadsheet, label: "XLSX", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
}

function getFileMeta(filename) {
  const ext = filename?.split(".").pop()?.toLowerCase() ?? ""
  return EXT_META[ext] ?? { icon: File, label: ext.toUpperCase() || "FILE", badge: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" }
}

export function ResultCard({ title, filename, snippet, confidence, filepath }) {
  const name = title || filename || "Untitled Document"
  const meta = getFileMeta(name)
  const Icon = meta.icon

  return (
    <div className="group relative rounded-xl border border-[#1d212b] bg-[#12141a] p-4 transition-all duration-150 hover:border-[#2b3140] hover:bg-[#14171f]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#232733] bg-[#161922] text-[#8a919e] group-hover:text-[#ededef] group-hover:border-[#2e3444] transition-colors">
            <Icon size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-[#ededef] truncate leading-tight">
                {name}
              </span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-mono font-medium border ${meta.badge}`}>
                {meta.label}
              </span>
            </div>

            {filepath && (
              <p className="mt-0.5 text-[11px] font-mono text-[#555d68] truncate">
                {filepath}
              </p>
            )}
          </div>
        </div>

        {/* Confidence pill */}
        <div className="flex items-center gap-1.5 rounded-md border border-[#1f2430] bg-[#151820] px-2 py-1 shrink-0">
          <span className="text-[10px] text-[#636b74]">Match</span>
          <span className="text-[11px] font-mono font-semibold text-[#3b82f6]">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Snippet preview */}
      <p className="mt-3 text-[12.5px] leading-relaxed text-[#8a919e] line-clamp-2 pl-11">
        {snippet}
      </p>

      {/* Footer bar */}
      <div className="mt-3 flex items-center justify-between border-t border-[#181b23] pt-2.5 pl-11">
        <span className="text-[10px] text-[#555d68] flex items-center gap-1">
          <Sparkles size={11} className="text-blue-400/80" />
          Vector relevance ranking
        </span>

        <button className="flex items-center gap-1 text-[11px] font-medium text-[#8a919e] hover:text-[#ededef] transition-colors">
          <span>Open excerpt</span>
          <ArrowUpRight size={11} />
        </button>
      </div>
    </div>
  )
}