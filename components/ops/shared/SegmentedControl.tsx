"use client";

import { cn } from "@/lib/utils";

type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<SegmentedControlOption<T>>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
      <div className="inline-flex max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-slate-100 p-1">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "h-8 shrink-0 rounded-md px-3 text-xs font-semibold transition",
                active ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              )}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
