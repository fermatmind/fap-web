"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AnticipationSkeletonProps = {
  phases: string[];
  className?: string;
};

export function AnticipationSkeleton({ phases, className }: AnticipationSkeletonProps) {
  const validPhases = useMemo(() => phases.filter((item) => item.trim().length > 0), [phases]);
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (validPhases.length <= 1) return;
    const timer = window.setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % validPhases.length);
    }, 1300);

    return () => {
      window.clearInterval(timer);
    };
  }, [validPhases.length]);

  return (
    <div className={cn("space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4", className)}>
      <div className="space-y-2">
        <div className="fm-data-stripe h-3 w-7/12 rounded-full bg-[var(--fm-surface-muted)]" />
        <div className="fm-data-stripe h-3 w-10/12 rounded-full bg-[var(--fm-surface-muted)]" />
      </div>

      <div className="grid gap-2">
        {Array.from({ length: 6 }, (_, idx) => (
          <div
            key={`skeleton-bar-${idx}`}
            className="fm-data-stripe h-8 rounded-lg bg-[var(--fm-surface-muted)]"
            style={{ opacity: 0.95 - idx * 0.1 }}
          />
        ))}
      </div>

      {validPhases.length > 0 ? (
        <p className="m-0 text-sm text-[var(--fm-text-muted)]" aria-live="polite">
          {validPhases[phaseIndex]}
        </p>
      ) : null}
    </div>
  );
}
