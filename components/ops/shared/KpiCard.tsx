import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusTone } from "@/components/ops/shared/StatusBadge";

const trendToneClasses: Record<StatusTone, string> = {
  neutral: "text-slate-500",
  success: "text-emerald-700",
  warning: "text-amber-700",
  danger: "text-rose-700",
  info: "text-sky-700",
};

function TrendIcon({ direction }: { direction?: "up" | "down" | "flat" }) {
  if (direction === "up") return <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />;
  if (direction === "down") return <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Minus className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function KpiCard({
  label,
  value,
  detail,
  tone = "neutral",
  trend,
  direction = "flat",
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
  trend?: string;
  direction?: "up" | "down" | "flat";
  icon?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-500">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
            {trend ? (
              <span className={cn("inline-flex items-center gap-0.5 text-xs font-semibold", trendToneClasses[tone])}>
                <TrendIcon direction={direction} />
                {trend}
              </span>
            ) : null}
          </div>
        </div>
        {icon ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
            {icon}
          </div>
        ) : (
          <StatusBadge tone={tone}>{tone}</StatusBadge>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">{detail}</p>
    </section>
  );
}
