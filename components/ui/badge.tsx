import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]",
        className
      )}
      {...props}
    />
  );
}
