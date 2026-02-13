import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Accordion({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("w-full space-y-3", className)} {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: HTMLAttributes<HTMLDetailsElement>) {
  return (
    <details
      className={cn(
        "group rounded-xl border border-slate-200 bg-white p-0 open:border-slate-300",
        className
      )}
      {...props}
    />
  );
}

export function AccordionTrigger({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={cn(
        "cursor-pointer list-none px-4 py-3 text-sm font-semibold text-slate-900 marker:hidden",
        className
      )}
      {...props}
    />
  );
}

export function AccordionContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 pb-4 text-sm text-slate-600", className)} {...props} />;
}
