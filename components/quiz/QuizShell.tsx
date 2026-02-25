import type { ReactNode } from "react";

export function QuizShell({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-h-[560px] flex-col gap-[var(--fm-space-5)] rounded-2xl border border-[var(--fm-border)] bg-white p-[var(--fm-space-6)] shadow-[var(--fm-shadow-md)]">
      {children}
    </section>
  );
}
