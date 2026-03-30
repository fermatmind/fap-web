import { CiteableSection } from "@/components/seo/CiteableSection";

type CitationBlockProps = {
  title: string;
  body: string;
  className?: string;
};

type SampleInfoBlockProps = {
  title?: string;
  items: Array<{
    label: string;
    value: string;
  }>;
  className?: string;
};

export function ConclusionSummaryBlock({ title, body, className }: CitationBlockProps) {
  if (!body.trim()) {
    return null;
  }

  return (
    <CiteableSection id="what-it-is" title={title} className={className}>
      <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{body}</p>
    </CiteableSection>
  );
}

export function MethodologyBlock({ title, body, className }: CitationBlockProps) {
  if (!body.trim()) {
    return null;
  }

  return (
    <CiteableSection id="how-it-works" title={title} className={className}>
      <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{body}</p>
    </CiteableSection>
  );
}

export function BoundaryNoteBlock({ title, body, className }: CitationBlockProps) {
  if (!body.trim()) {
    return null;
  }

  return (
    <CiteableSection id="limitations" title={title} className={className}>
      <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{body}</p>
    </CiteableSection>
  );
}

export function SampleInfoBlock({ title = "Scope and sample", items, className }: SampleInfoBlockProps) {
  const normalizedItems = items.filter((item) => item.label.trim() && item.value.trim());
  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <CiteableSection id="references" title={title} className={className}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {normalizedItems.map((item) => (
          <div key={`${item.label}:${item.value}`} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">{item.label}</dt>
            <dd className="mt-1 text-sm text-[var(--fm-text)]">{item.value}</dd>
          </div>
        ))}
      </dl>
    </CiteableSection>
  );
}
