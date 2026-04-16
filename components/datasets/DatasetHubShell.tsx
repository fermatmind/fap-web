import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetHubShellProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function DatasetHubShell({ eyebrow, title, summary, children }: DatasetHubShellProps) {
  return (
    <Card data-testid="dataset-hub-shell">
      <CardHeader className="space-y-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{eyebrow}</p>
        <CardTitle className="font-serif text-3xl">{title}</CardTitle>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">{summary}</p>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}

