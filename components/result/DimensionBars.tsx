"use client";

import { usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname } from "@/lib/i18n/locales";

type Dimension = {
  key?: string;
  code?: string;
  label?: string;
  score?: number;
  percent?: number;
  value?: number;
  leftLabel?: string;
  rightLabel?: string;
  winnerLabel?: string;
  [key: string]: unknown;
};

type DimensionBarsVariant = "default" | "desktop-traits-narrative";

type DimensionBarsProps = {
  dimensions: Dimension[];
  variant?: DimensionBarsVariant;
  summaryTitle?: string;
  summaryLabel?: string;
  summaryValue?: string;
  summaryDescription?: string;
  className?: string;
};

const BAR_STYLES = [
  "from-sky-500 via-cyan-500 to-teal-500",
  "from-violet-500 via-fuchsia-500 to-pink-500",
  "from-amber-500 via-orange-500 to-red-500",
  "from-emerald-500 via-green-500 to-lime-500",
  "from-indigo-500 via-blue-500 to-cyan-500",
];

function normalizePercent(value: Dimension): number {
  const candidates = [value.percent, value.score, value.value].filter(
    (item): item is number => typeof item === "number" && Number.isFinite(item)
  );

  if (candidates.length === 0) return 0;

  const raw = candidates[0];
  if (raw > 1 && raw <= 100) return raw;
  if (raw >= 0 && raw <= 1) return raw * 100;
  return Math.max(0, Math.min(100, raw));
}

function renderEmptyState(dict: Record<string, unknown>) {
  const dictRecord = dict as Record<string, Record<string, unknown>> | null;
  const breakdown = normalizeDictText(dictRecord?.result?.breakdown);
  const noDimensions = normalizeDictText(dictRecord?.result?.noDimensions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{breakdown || "Breakdown"}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="m-0 text-sm text-slate-600">{noDimensions || "No dimensions available."}</p>
      </CardContent>
    </Card>
  );
}

function normalizeDictText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

export function DimensionBars({
  dimensions,
  variant = "default",
  summaryTitle,
  summaryLabel,
  summaryValue,
  summaryDescription,
  className = "",
}: DimensionBarsProps) {
  const pathname = usePathname() ?? "/";
  const dict = getDictSync(getLocaleFromPathname(pathname));

  if (!dimensions.length) {
    return renderEmptyState(dict);
  }

  if (variant === "desktop-traits-narrative") {
    const anchorDimension = dimensions.reduce((left, right) => {
      return normalizePercent(left) >= normalizePercent(right) ? left : right;
    }, dimensions[0]);

    return (
      <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
        <div className="grid gap-5 xl:grid-cols-[64%_36%] xl:items-start">
          <div className="space-y-4">
            {dimensions.map((item, index) => {
              const label = item.label ?? item.code ?? item.key ?? `Dimension ${index + 1}`;
              const percent = normalizePercent(item);
              const leftLabel = typeof item.leftLabel === "string" ? item.leftLabel : null;
              const rightLabel = typeof item.rightLabel === "string" ? item.rightLabel : null;
              const winnerLabel =
                typeof item.winnerLabel === "string" && item.winnerLabel.trim().length > 0
                  ? item.winnerLabel
                  : null;
              const accentClass = BAR_STYLES[index % BAR_STYLES.length];

              return (
                <article key={`${label}-${index}`} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="m-0 text-sm font-semibold text-slate-900">{label}</p>
                      {winnerLabel ? <p className="m-0 text-xs text-slate-500">{winnerLabel}</p> : null}
                    </div>
                    <span className="inline-flex h-6 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${accentClass}`}
                      style={{ width: `${Math.round(percent)}%` }}
                    />
                    <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-slate-900" />
                  </div>
                  {leftLabel || rightLabel ? (
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{leftLabel ?? ""}</span>
                      <span>{rightLabel ?? ""}</span>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {summaryTitle || "Trait summary"}
            </p>
            <p className="m-0 mt-3 text-4xl font-semibold text-slate-900">{Math.round(normalizePercent(anchorDimension))}%</p>
            <p className="m-0 mt-2 text-sm text-slate-700">{summaryLabel || normalizePercent(anchorDimension)}%</p>
            <p className="m-0 mt-2 text-sm leading-7 text-slate-600">{summaryDescription || ""}</p>
            {summaryValue ? <p className="m-0 mt-2 text-sm text-slate-900">{summaryValue}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100/80">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-slate-900">{dict.result.breakdown}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dimensions.map((item, index) => {
          const label = item.label ?? item.code ?? item.key ?? `Dimension ${index + 1}`;
          const percent = normalizePercent(item);
          const leftLabel = typeof item.leftLabel === "string" ? item.leftLabel : null;
          const rightLabel = typeof item.rightLabel === "string" ? item.rightLabel : null;
          const winnerLabel =
            typeof item.winnerLabel === "string" && item.winnerLabel.trim().length > 0
              ? item.winnerLabel
              : null;
          const accentClass = BAR_STYLES[index % BAR_STYLES.length];

          return (
            <div
              key={`${label}-${index}`}
              className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="m-0 text-sm font-semibold text-slate-900">{label}</p>
                  {winnerLabel ? <p className="m-0 text-xs text-slate-500">{winnerLabel}</p> : null}
                </div>
                <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                  {Math.round(percent)}%
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${accentClass} transition-[width] duration-200 ease-out`}
                    style={{ width: `${Math.round(percent)}%` }}
                  />
                </div>

                {leftLabel || rightLabel ? (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{leftLabel ?? ""}</span>
                    <span>{rightLabel ?? ""}</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
