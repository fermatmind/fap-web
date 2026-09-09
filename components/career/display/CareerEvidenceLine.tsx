import type { CareerContentV3 } from "@/lib/career/contentV3";

type EvidenceLineProps = {
  content: CareerContentV3 | null;
  factRefs?: readonly string[];
  sourceRefs?: readonly string[];
  className?: string;
  inverse?: boolean;
};

function compact(parts: Array<string | null | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join("｜");
}

export function CareerEvidenceLine({ content, factRefs = [], sourceRefs = [], className, inverse = false }: EvidenceLineProps) {
  if (!content) return null;

  const facts = new Map(content.facts.map((fact) => [fact.factId, fact]));
  const sources = new Map(content.sources.map((source) => [source.id, source]));
  const seenSources = new Set<string>();
  const entries: Array<{ key: string; label: string; href: string | null; derivation: string | null }> = [];

  for (const factRef of factRefs) {
    const fact = facts.get(factRef);
    if (!fact) continue;
    const source = fact.sourceRefs.map((ref) => sources.get(ref)).find(Boolean);
    if (source) seenSources.add(source.id);
    entries.push({
      key: `fact:${fact.factId}`,
      label: compact([
        source?.publisher ?? source?.name ?? "来源",
        fact.market,
        fact.period,
        fact.measure,
      ]),
      href: source?.url ?? null,
      derivation: fact.derivation,
    });
  }

  for (const sourceRef of sourceRefs) {
    if (seenSources.has(sourceRef)) continue;
    const source = sources.get(sourceRef);
    if (!source) continue;
    seenSources.add(sourceRef);
    entries.push({
      key: `source:${source.id}`,
      label: compact([
        source.publisher ?? source.name,
        source.market,
        source.period,
        source.evidenceType ?? source.scope,
      ]),
      href: source.url,
      derivation: null,
    });
  }

  if (entries.length === 0) return null;

  return (
    <div className={className ?? "mt-3 text-xs leading-5 text-[#657087]"} data-testid="career-near-source">
      {entries.map((entry, index) => (
        <span key={entry.key}>
          {index > 0 ? " · " : null}
          <span>来源：</span>
          {entry.href ? (
            <a className={`font-semibold underline underline-offset-2 ${inverse ? "text-white/80" : "text-[#2C3E8C]"}`} href={entry.href} target="_blank" rel="noopener noreferrer">
              {entry.label}
            </a>
          ) : entry.label}
          {entry.derivation ? <span>；编辑换算：{entry.derivation}</span> : null}
        </span>
      ))}
    </div>
  );
}
