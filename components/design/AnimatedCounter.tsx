"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type AnimatedCounterProps = {
  value: number;
  durationMs?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
};

function easeOutCubic(input: number): number {
  return 1 - Math.pow(1 - input, 3);
}

export function AnimatedCounter({
  value,
  durationMs = 800,
  className,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  const target = Number.isFinite(value) ? value : 0;
  const safeDuration = Math.max(100, durationMs);
  const [displayValue, setDisplayValue] = useState(0);
  const integerTarget = useMemo(() => Math.round(target), [target]);
  const prefersReducedMotion = useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", callback);
      return () => {
        query.removeEventListener("change", callback);
      };
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );
  const formattedDisplay = useMemo(() => new Intl.NumberFormat("en-US").format(displayValue), [displayValue]);
  const formattedTarget = useMemo(() => new Intl.NumberFormat("en-US").format(integerTarget), [integerTarget]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let raf = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const progress = Math.min(1, elapsed / safeDuration);
      const eased = easeOutCubic(progress);
      setDisplayValue(Math.round(integerTarget * eased));
      if (progress < 1) {
        raf = window.requestAnimationFrame(tick);
      }
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
    };
  }, [integerTarget, prefersReducedMotion, safeDuration]);

  return (
    <span className={className} aria-live="polite">
      {prefix}
      {prefersReducedMotion ? formattedTarget : formattedDisplay}
      {suffix}
    </span>
  );
}
