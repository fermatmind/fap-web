import Link from "next/link";
import type { CareerAliasResolutionAmbiguousCandidateAdapter } from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

type CareerAliasResolutionCandidatesProps = {
  locale: Locale;
  candidates: CareerAliasResolutionAmbiguousCandidateAdapter[];
};

export function CareerAliasResolutionCandidates({
  locale,
  candidates,
}: CareerAliasResolutionCandidatesProps) {
  if (candidates.length === 0) {
    return null;
  }

  const occupationCandidates = candidates.filter((candidate) => candidate.candidateKind === "occupation");
  const familyCandidates = candidates.filter((candidate) => candidate.candidateKind === "family");

  const sections = [
    {
      kind: "occupation" as const,
      title: locale === "zh" ? "职业候选" : "Occupation candidates",
      items: occupationCandidates,
    },
    {
      kind: "family" as const,
      title: locale === "zh" ? "职业家族候选" : "Family candidates",
      items: familyCandidates,
    },
  ].filter((section) => section.items.length > 0) satisfies Array<{
    kind: "occupation" | "family";
    title: string;
    items: CareerAliasResolutionAmbiguousCandidateAdapter[];
  }>;

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="career-alias-resolution-candidates"
    >
      <div className="space-y-1">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
          {locale === "zh" ? "Resolution candidates" : "Resolution candidates"}
        </p>
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "候选目标" : "Candidate targets"}
        </h2>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.kind}
            className="space-y-3"
            data-testid={`career-alias-resolution-group-${section.kind}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {section.title}
              </h3>
              <p className="m-0 text-xs text-[var(--fm-text-muted)]">{section.items.length}</p>
            </div>

            <div className="space-y-3">
              {section.items.map((candidate) => (
                <article
                  key={`${candidate.candidateKind}:${candidate.canonicalSlug}`}
                  className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
                  data-testid="career-alias-resolution-candidate"
                  data-candidate-kind={candidate.candidateKind}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                        {candidate.candidateKind === "family"
                          ? locale === "zh"
                            ? "职业家族"
                            : "Career family"
                          : locale === "zh"
                            ? "职业岗位"
                            : "Career job"}
                      </p>
                      <Link
                        href={candidate.href}
                        className="text-lg font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                      >
                        {candidate.title}
                      </Link>
                      <p className="m-0 font-mono text-[11px] text-[var(--fm-text-muted)]">{candidate.canonicalSlug}</p>
                    </div>
                    <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
                      {candidate.candidateKind}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
