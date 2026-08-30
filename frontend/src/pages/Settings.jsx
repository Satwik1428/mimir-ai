import { useState } from "react"
import { FolderOpen, Shield, Bell, Cpu, Layers } from "lucide-react"

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full
        border transition-colors duration-150
        ${checked
          ? "bg-[#2563eb] border-[#3b82f6]"
          : "bg-[#181b22] border-[#262b36]"
        }
      `}
    >
      <span
        className={`
          absolute h-3 w-3 rounded-full bg-white transition-all duration-150
          ${checked ? "left-[16px]" : "left-[2px]"}
        `}
      />
    </button>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-[12.5px] font-medium text-[#ededef]">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-[#636b74] leading-normal">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-[#1d212b] bg-[#12141a] overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#181b23] px-4 py-2.5 bg-[#111319]">
        <Icon size={13} className="text-[#636b74]" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#717885]">
          {title}
        </span>
      </div>
      <div className="px-4 divide-y divide-[#181b23]">
        {children}
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [indexHidden, setIndexHidden] = useState(false)
  const [autoReindex, setAutoReindex] = useState(true)
  const [privateMode, setPrivateMode] = useState(true)
  const [ocrEnabled, setOcrEnabled]   = useState(false)
  const [watchPath, setWatchPath]     = useState("~/Documents")

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="pb-1 border-b border-[#181b22]">
        <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight">
          System Preferences
        </h1>
        <p className="text-[12px] text-[#636b74] mt-0.5">
          Local engine parameters and document watching policies
        </p>
      </div>

      {/* Indexing Section */}
      <Section icon={FolderOpen} title="Indexing & Watched Directories">
        <SettingRow
          label="Root Directory"
          description="Default directory monitored for automatic vector embedding."
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={watchPath}
              onChange={(e) => setWatchPath(e.target.value)}
              className="
                w-44 rounded-lg border border-[#232733] bg-[#0e1014]
                px-2.5 py-1 text-[11.5px] font-mono text-[#ededef]
                focus:border-blue-500/50
              "
            />
            <button className="
              rounded-lg border border-[#262b38] bg-[#151820] px-2.5 py-1
              text-[11.5px] font-medium text-[#8a919e] hover:bg-[#1a1e28] hover:text-[#ededef] transition-colors
            ">
              Browse
            </button>
          </div>
        </SettingRow>

        <SettingRow
          label="Automatic Re-indexing"
          description="Watch file system modifications and re-chunk modified documents."
        >
          <Toggle checked={autoReindex} onChange={setAutoReindex} />
        </SettingRow>

        <SettingRow
          label="Skip Hidden Files"
          description="Ignore dotfiles and system directories (e.g. .git, .env)."
        >
          <Toggle checked={indexHidden} onChange={setIndexHidden} />
        </SettingRow>
      </Section>

      {/* Model & Privacy Section */}
      <Section icon={Shield} title="Privacy & Local Execution">
        <SettingRow
          label="Strict On-Device Privacy Mode"
          description="All embeddings and LLM prompts stay strictly on your local machine."
        >
          <Toggle checked={privateMode} onChange={setPrivateMode} />
        </SettingRow>

        <SettingRow
          label="Image & Scanned PDF OCR"
          description="Run local EasyOCR on images and screenshots (downloads OCR weights on first run)."
        >
          <Toggle checked={ocrEnabled} onChange={setOcrEnabled} />
        </SettingRow>
      </Section>

      {/* Engine Diagnostics */}
      <Section icon={Cpu} title="Engine Diagnostics">
        <SettingRow
          label="Embedding Architecture"
          description="sentence-transformers/all-MiniLM-L6-v2 (384-dimensional vector space)"
        >
          <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            FAISS CPU
          </span>
        </SettingRow>

        <SettingRow
          label="Inference Engine"
          description="Qwen 2.5 3B (Local quantized) / Groq acceleration fallback"
        >
          <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
            Active
          </span>
        </SettingRow>
      </Section>
    </div>
  )
}
