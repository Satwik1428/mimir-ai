import { useState } from "react"
import { FolderOpen, Shield, Bell } from "lucide-react"

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
        border transition-all duration-200
        ${checked
          ? "bg-blue-600 border-blue-500"
          : "bg-white/[0.06] border-white/[0.10]"
        }
      `}
    >
      <span
        className={`
          absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-all duration-200
          ${checked ? "left-[19px]" : "left-[3px]"}
        `}
      />
    </button>
  )
}

// ── Setting row ───────────────────────────────────────────────────────────────
function SettingRow({ label, description, children }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-zinc-200">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-zinc-600 leading-[1.5]">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
      <div className="flex items-center gap-2.5 border-b border-white/[0.06] px-5 py-3.5">
        <Icon size={14} className="text-zinc-600" strokeWidth={2} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          {title}
        </span>
      </div>
      <div className="px-5 divide-y divide-white/[0.05]">
        {children}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [indexHidden, setIndexHidden]   = useState(false)
  const [autoReindex, setAutoReindex]   = useState(true)
  const [privateMode, setPrivateMode]   = useState(true)
  const [telemetry, setTelemetry]       = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [watchPath, setWatchPath]       = useState("~/Documents")

  return (
    <div className="space-y-7">

      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Configure how Mimir indexes and processes your files.
        </p>
      </div>

      {/* Indexing */}
      <Section icon={FolderOpen} title="Indexing">
        <SettingRow
          label="Watch path"
          description="Root folder Mimir monitors for changes."
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={watchPath}
              onChange={(e) => setWatchPath(e.target.value)}
              className="
                w-44 rounded-lg border border-white/[0.09] bg-white/[0.04]
                px-3 py-1.5 text-[12px] text-zinc-200
                focus:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/15
                transition-all duration-200
              "
            />
            <button className="
              rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-1.5
              text-[12px] text-zinc-400 transition-all duration-200
              hover:bg-white/[0.08] hover:border-white/[0.14] hover:text-white
            ">
              Browse
            </button>
          </div>
        </SettingRow>

        <SettingRow
          label="Auto re-index on change"
          description="Automatically re-index files when modifications are detected."
        >
          <Toggle checked={autoReindex} onChange={setAutoReindex} />
        </SettingRow>

        <SettingRow
          label="Skip hidden files"
          description="Exclude files and folders starting with a dot."
        >
          <Toggle checked={indexHidden} onChange={setIndexHidden} />
        </SettingRow>
      </Section>

      {/* Privacy */}
      <Section icon={Shield} title="Privacy">
        <SettingRow
          label="Private mode"
          description="All AI inference runs fully on-device. Nothing leaves your machine."
        >
          <Toggle checked={privateMode} onChange={setPrivateMode} />
        </SettingRow>

        <SettingRow
          label="Usage telemetry"
          description="Send anonymous crash reports to help improve Mimir."
        >
          <Toggle checked={telemetry} onChange={setTelemetry} />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications">
        <SettingRow
          label="Indexing complete alerts"
          description="Notify when a full re-index finishes."
        >
          <Toggle checked={notifications} onChange={setNotifications} />
        </SettingRow>
      </Section>

    </div>
  )
}
