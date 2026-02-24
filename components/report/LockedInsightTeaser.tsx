import { cn } from "@/lib/utils";

export type LockedInsightIntent = "personality" | "clinical";

type LockedInsightVisualConfig = {
  previewFilterClassName?: string;
  previewMaskClassName?: string;
  lockOverlayClassName?: string;
};

function resolveLockedLabel(locale: "en" | "zh"): string {
  return locale === "zh" ? "已锁定" : "Locked";
}

function resolveHookCopy(intent: LockedInsightIntent, locale: "en" | "zh"): string {
  if (intent === "clinical") {
    return locale === "zh"
      ? "解锁后可查看当前压力的关键诱因与优先行动建议。"
      : "Unlock to reveal your key pressure drivers and the highest-priority support actions.";
  }

  return locale === "zh"
    ? "解锁后可查看你的 3 个核心潜在天赋与行动建议。"
    : "Unlock to reveal your 3 core strengths and practical growth actions.";
}

function resolveDefaultDescription(locale: "en" | "zh"): string {
  return locale === "zh"
    ? "解锁后可查看该章节。"
    : "Unlock to view this section.";
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
    </svg>
  );
}

function PersonalityChartPreview() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 240 160" className="h-28 w-full text-sky-700">
          <polygon points="120,16 192,52 192,108 120,144 48,108 48,52" fill="none" stroke="currentColor" opacity="0.2" />
          <polygon points="120,30 177,58 177,102 120,130 63,102 63,58" fill="none" stroke="currentColor" opacity="0.3" />
          <polygon points="120,44 162,64 162,96 120,116 78,96 78,64" fill="none" stroke="currentColor" opacity="0.35" />
          <polygon points="120,30 170,66 157,100 120,124 78,101 89,61" fill="currentColor" opacity="0.25" />
          <line x1="120" y1="16" x2="120" y2="144" stroke="currentColor" opacity="0.18" />
          <line x1="48" y1="52" x2="192" y2="108" stroke="currentColor" opacity="0.18" />
          <line x1="48" y1="108" x2="192" y2="52" stroke="currentColor" opacity="0.18" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
          <div className="h-1.5 rounded-full bg-slate-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
          <div className="h-1.5 w-3/4 rounded-full bg-slate-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
          <div className="h-1.5 w-2/3 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

function ClinicalChartPreview() {
  return (
    <div className="space-y-2.5" aria-hidden>
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-full w-[78%] rounded-full bg-amber-500" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-full w-[62%] rounded-full bg-sky-700" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-full w-[49%] rounded-full bg-sky-700" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-slate-200">
              <div className="h-full w-[84%] rounded-full bg-amber-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-slate-200 bg-white px-2 py-2">
          <div className="h-1.5 w-4/5 rounded-full bg-slate-300" />
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-2 py-2">
          <div className="h-1.5 w-3/5 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
}

export function LockedInsightTeaser({
  title,
  locale,
  intent,
  description,
  ctaLabel,
  className,
  visualConfig,
}: {
  title: string;
  locale: "en" | "zh";
  intent: LockedInsightIntent;
  description?: string;
  ctaLabel?: string;
  className?: string;
  visualConfig?: LockedInsightVisualConfig;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--fm-border)] bg-white p-4 shadow-[var(--fm-shadow-sm)]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          intent === "clinical" ? "from-amber-50/70 via-white to-sky-50/70" : "from-white via-slate-50 to-sky-50/70"
        )}
        aria-hidden
      />

      <div className="relative z-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border-strong)] bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
          <LockGlyph className="h-3.5 w-3.5 text-[var(--fm-accent)]" />
          {resolveLockedLabel(locale)}
        </div>

        <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{title}</p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">{description ?? resolveDefaultDescription(locale)}</p>
        <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{resolveHookCopy(intent, locale)}</p>

        <div className="relative overflow-hidden rounded-xl border border-[var(--fm-border)] bg-white/80 p-3" data-testid="locked-insight-preview">
          <div
            className={cn(
              "relative z-10 [filter:grayscale(80%)_blur(3px)_opacity(0.7)]",
              visualConfig?.previewFilterClassName
            )}
            data-testid="locked-insight-chart"
            data-preview-filter="grayscale(80%) blur(3px) opacity(0.7)"
          >
            {intent === "clinical" ? <ClinicalChartPreview /> : <PersonalityChartPreview />}
          </div>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-white/10 via-white/40 to-white/85",
              visualConfig?.previewMaskClassName
            )}
            data-testid="locked-insight-mask"
            aria-hidden
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-0 z-30 flex items-center justify-center",
              visualConfig?.lockOverlayClassName
            )}
            data-testid="locked-insight-lock"
            aria-hidden
          >
            <span className="inline-flex rounded-full border border-white/80 bg-white/90 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.28)]">
              <LockGlyph className="h-5 w-5 text-[var(--fm-accent)] drop-shadow-[0_2px_6px_rgba(15,23,42,0.25)]" />
            </span>
          </div>
        </div>

        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--fm-accent)]">
          {ctaLabel ?? (locale === "zh" ? "解锁完整报告" : "Unlock full report")}
        </p>
      </div>
    </div>
  );
}
