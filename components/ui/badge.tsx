import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-[var(--fm-pad-badge-x)] py-[var(--fm-pad-badge-y)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]",
        className
      )}
      {...props}
    />
  );
}
