import type { ReactNode } from "react";
import type { EvidenceBlockType } from "@/lib/geo/evidenceContainer";

type EvidenceDrawerProps = {
  title: string;
  children: ReactNode;
  testId?: string;
  evidenceBlock?: EvidenceBlockType;
};

export function EvidenceDrawer({ title, children, testId, evidenceBlock }: EvidenceDrawerProps) {
  return (
    <details
      className="group rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm"
      data-testid={testId ?? "career-v1-evidence-drawer"}
      data-evidence-block={evidenceBlock}
    >
      <summary className="cursor-pointer list-none text-sm font-medium text-slate-900 marker:hidden">
        <span className="inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-600" aria-hidden="true" />
          {title}
        </span>
      </summary>
      <div className="mt-4 border-t border-slate-100 pt-4">{children}</div>
    </details>
  );
}
