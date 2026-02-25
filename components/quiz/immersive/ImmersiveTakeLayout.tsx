import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TransitionDirection = "forward" | "backward" | "none";

export function ImmersiveTakeLayout({
  backHref,
  backLabel,
  current,
  total,
  answered,
  previousLabel,
  previousDisabled,
  onPrevious,
  transitionKey,
  transitionDirection,
  isTransitioning,
  children,
  footerSlot,
}: {
  backHref: string;
  backLabel: string;
  current: number;
  total: number;
  answered: number;
  previousLabel: string;
  previousDisabled?: boolean;
  onPrevious: () => void;
  transitionKey: string | number;
  transitionDirection: TransitionDirection;
  isTransitioning?: boolean;
  children: ReactNode;
  footerSlot?: ReactNode;
}) {
  const safeTotal = Math.max(1, total);
  const safeCurrent = Math.min(Math.max(1, current), safeTotal);
  const percent = Math.round((Math.max(0, answered) / safeTotal) * 100);

  const cardTransitionClass = isTransitioning
    ? transitionDirection === "forward"
      ? "fm-immersive-exit-forward"
      : transitionDirection === "backward"
        ? "fm-immersive-exit-backward"
        : ""
    : transitionDirection === "forward"
      ? "fm-immersive-enter-forward"
      : transitionDirection === "backward"
        ? "fm-immersive-enter-backward"
        : "";

  return (
    <div className="space-y-[var(--fm-space-5)]">
      <header className="space-y-[var(--fm-gap-xs)]">
        <div className="flex items-center justify-between gap-[var(--fm-gap-sm)]">
          <Link href={backHref} className="text-sm font-medium text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]">
            {backLabel}
          </Link>
          <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">
            {safeCurrent}/{safeTotal}
          </p>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[var(--fm-surface-muted)]" aria-hidden>
          <div className="h-full bg-gradient-to-r from-[var(--fm-trust-blue)] to-[var(--fm-teal)] transition-all duration-300" style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} />
        </div>
      </header>

      <section className="flex min-h-[62vh] items-center justify-center">
        <div key={transitionKey} className={cn("w-full max-w-3xl", cardTransitionClass)}>
          {children}
        </div>
      </section>

      <footer className="flex min-h-[48px] items-center justify-between gap-[var(--fm-gap-sm)]">
        <Button type="button" variant="ghost" disabled={previousDisabled} onClick={onPrevious}>
          {previousLabel}
        </Button>
        {footerSlot}
      </footer>
    </div>
  );
}
