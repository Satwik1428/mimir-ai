import { useState, useEffect, useCallback, useRef } from "react"
import { FolderOpen, Shield, Cpu, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { getSettingsApi, saveSettingsApi } from "@/lib/api"

// ── Sub-components ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer items-center rounded-full
        border transition-colors duration-150
        ${checked
          ? "bg-[#2563eb] border-[#3b82f6]"
          : "bg-[#181b22] border-[#262b36]"
        }
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  const [settings, setSettings] = useState(null)   // null = loading
  const [saveStatus, setSaveStatus] = useState("idle") // idle | saving | saved | error
  const saveTimer = useRef(null)

  // Load settings from backend on mount
  useEffect(() => {
    getSettingsApi()
      .then((res) => setSettings(res.settings))
      .catch(() => {
        // Fall back to safe defaults if API is unavailable
        setSettings({
          watchPath: "~/Documents",
          autoReindex: true,
          indexHidden: false,
          privateMode: true,
          ocrEnabled: false,
        })
      })
  }, [])

  // Debounced auto-save — fires 600 ms after the last change
  const persistSettings = useCallback((updated) => {
    clearTimeout(saveTimer.current)
    setSaveStatus("saving")
    saveTimer.current = setTimeout(async () => {
      try {
        await saveSettingsApi(updated)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 2000)
      } catch {
        setSaveStatus("error")
        setTimeout(() => setSaveStatus("idle"), 3000)
      }
    }, 600)
  }, [])

  const update = (key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      persistSettings(updated)
      return updated
    })
  }

  const loading = settings === null

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between pb-1 border-b border-[#181b22]">
        <div>
          <h1 className="text-[20px] font-semibold text-[#ededef] tracking-tight">
            System Preferences
          </h1>
          <p className="text-[12px] text-[#636b74] mt-0.5">
            Local engine parameters and document watching policies
          </p>
        </div>

        {/* Persist status badge */}
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium min-w-[80px] justify-end">
          {saveStatus === "saving" && (
            <><Loader2 size={11} className="animate-spin text-[#636b74]" /><span className="text-[#636b74]">Saving…</span></>
          )}
          {saveStatus === "saved" && (
            <><CheckCircle2 size={11} className="text-emerald-400" /><span className="text-emerald-400">Saved</span></>
          )}
          {saveStatus === "error" && (
            <><AlertCircle size={11} className="text-red-400" /><span className="text-red-400">Save failed</span></>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[12px] text-[#636b74] py-8 justify-center">
          <Loader2 size={14} className="animate-spin" />
          Loading preferences…
        </div>
      ) : (
        <>
          {/* Indexing Section */}
          <Section icon={FolderOpen} title="Indexing & Watched Directories">
            <SettingRow
              label="Root Directory"
              description="Default directory monitored for automatic vector embedding."
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={settings.watchPath}
                  onChange={(e) => update("watchPath", e.target.value)}
                  onBlur={(e) => update("watchPath", e.target.value)}
                  className="
                    w-44 rounded-lg border border-[#232733] bg-[#0e1014]
                    px-2.5 py-1 text-[11.5px] font-mono text-[#ededef]
                    focus:border-blue-500/50 outline-none
                  "
                />
              </div>
            </SettingRow>

            <SettingRow
              label="Automatic Re-indexing"
              description="Watch file system modifications and re-chunk modified documents."
            >
              <Toggle checked={settings.autoReindex} onChange={(v) => update("autoReindex", v)} />
            </SettingRow>

            <SettingRow
              label="Skip Hidden Files"
              description="Ignore dotfiles and system directories (e.g. .git, .env)."
            >
              <Toggle checked={settings.indexHidden} onChange={(v) => update("indexHidden", v)} />
            </SettingRow>
          </Section>

          {/* Model & Privacy Section */}
          <Section icon={Shield} title="Privacy & Local Execution">
            <SettingRow
              label="Strict On-Device Privacy Mode"
              description="All embeddings and LLM prompts stay strictly on your local machine."
            >
              <Toggle checked={settings.privateMode} onChange={(v) => update("privateMode", v)} />
            </SettingRow>

            <SettingRow
              label="Image & Scanned PDF OCR"
              description="Run local EasyOCR on images and screenshots (downloads OCR weights on first run)."
            >
              <Toggle checked={settings.ocrEnabled} onChange={(v) => update("ocrEnabled", v)} />
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
              description="Ollama Qwen 2.5 3B (Local quantized) / Grounded Extractive Fallback"
            >
              <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                Local Ollama
              </span>
            </SettingRow>

            <SettingRow
              label="Upload Limit"
              description="Maximum file size accepted by the upload endpoint."
            >
              <span className="font-mono text-[11px] text-[#8a919e] bg-[#181b22] border border-[#232733] px-2 py-0.5 rounded">
                50 MB / file
              </span>
            </SettingRow>
          </Section>
        </>
      )}
    </div>
  )
}
