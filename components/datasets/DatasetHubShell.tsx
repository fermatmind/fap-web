import type { ReactNode } from "react";

type DatasetHubShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function DatasetHubShell({ eyebrow, title, summary, children }: DatasetHubShellProps) {
  return (
    <section className="space-y-8" data-testid="dataset-hub-shell">
      <header className="mx-auto max-w-4xl space-y-4 text-center">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">{eyebrow}</p>
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">{summary}</p>
      </header>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
