import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { value?: number }) {
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-200",
        className
      )}
      {...props}
    >
      <div
        className="h-full rounded-full bg-slate-900 transition-[width] duration-200 ease-out"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
