import type { ReactNode } from "react";

export type ConfidenceBoundaryTone = "complete" | "limited" | "review" | "blocked";

export type ConfidenceBoundaryProps = {
  tone: ConfidenceBoundaryTone;
  title: string;
  description?: string;
  actionLabel?: string;
  children?: ReactNode;
};

const toneClasses: Record<ConfidenceBoundaryTone, { wrap: string; dot: string }> = {
  complete: {
    wrap: "border-slate-200 bg-white",
    dot: "bg-slate-900",
  },
  limited: {
    wrap: "border-orange-100 bg-orange-50/40",
    dot: "bg-orange-600",
  },
  review: {
    wrap: "border-slate-200 bg-slate-50",
    dot: "bg-slate-400",
  },
  blocked: {
    wrap: "border-slate-200 bg-slate-100",
    dot: "bg-slate-500",
  },
};

export function ConfidenceBadge({ tone, children }: { tone: ConfidenceBoundaryTone; children: ReactNode }) {
  const toneClass = toneClasses[tone];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-slate-700 ${toneClass.wrap}`}
      data-testid="career-v1-confidence-badge"
      data-tone={tone}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${toneClass.dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function ConfidenceBoundary({ tone, title, description, actionLabel, children }: ConfidenceBoundaryProps) {
  const toneClass = toneClasses[tone];

  return (
    <div
      className={`rounded-2xl border px-4 py-3 shadow-sm md:px-5 md:py-4 ${toneClass.wrap}`}
      data-testid="career-v1-confidence-boundary"
      data-tone={tone}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2 w-2 rounded-full ${toneClass.dot}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="m-0 text-sm font-medium text-slate-900">{title}</p>
          {description ? <p className="m-0 mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          {children ? <div className="mt-3 text-sm text-slate-600">{children}</div> : null}
          {actionLabel ? (
            <p className="m-0 mt-2 text-xs font-medium text-slate-600 underline underline-offset-4">{actionLabel}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
