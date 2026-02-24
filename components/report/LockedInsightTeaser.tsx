import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type LockedInsightIntent = "personality" | "clinical";

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

export function LockedInsightTeaser({
  title,
  locale,
  intent,
  description,
  ctaLabel,
  className,
}: {
  title: string;
  locale: "en" | "zh";
  intent: LockedInsightIntent;
  description?: string;
  ctaLabel?: string;
  className?: string;
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
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-[var(--fm-accent)]" fill="currentColor" aria-hidden>
            <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
          </svg>
          {resolveLockedLabel(locale)}
        </div>

        <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{title}</p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">{description ?? resolveDefaultDescription(locale)}</p>
        <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{resolveHookCopy(intent, locale)}</p>

        <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-white/80 p-3">
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-8 rounded-lg bg-slate-200/70" />
            <Skeleton className="h-8 rounded-lg bg-slate-200/70" />
            <Skeleton className="h-8 rounded-lg bg-slate-200/70" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-2.5 w-full rounded-full bg-slate-200/70" />
            <Skeleton className="h-2.5 w-5/6 rounded-full bg-slate-200/70" />
            <Skeleton className="h-2.5 w-2/3 rounded-full bg-slate-200/70" />
          </div>
        </div>

        <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[var(--fm-accent)]">
          {ctaLabel ?? (locale === "zh" ? "解锁完整报告" : "Unlock full report")}
        </p>
      </div>
    </div>
  );
}
