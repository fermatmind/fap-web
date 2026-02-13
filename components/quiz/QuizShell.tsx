import type { ReactNode } from "react";

export function QuizShell({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-h-[520px] flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {children}
    </section>
  );
}
