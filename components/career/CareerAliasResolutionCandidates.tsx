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

      <div className="space-y-3">
        {candidates.map((candidate) => (
          <article
            key={`${candidate.candidateKind}:${candidate.canonicalSlug}`}
            className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
            data-testid="career-alias-resolution-candidate"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="m-0 font-mono text-[11px] text-[var(--fm-text-muted)]">{candidate.canonicalSlug}</p>
                <Link
                  href={candidate.href}
                  className="text-lg font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {candidate.title}
                </Link>
              </div>
              <p className="m-0 text-xs text-[var(--fm-text-muted)]">{candidate.candidateKind}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
