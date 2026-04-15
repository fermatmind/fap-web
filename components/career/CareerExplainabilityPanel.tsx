import type { CareerExplainabilityAdapter, CareerExplainabilityScoreDimensionAdapter } from "@/lib/career/adapters/types";
import { CareerStrainRadar } from "@/components/career/CareerStrainRadar";
import type { Locale } from "@/lib/i18n/locales";

type CareerExplainabilityPanelProps = {
  locale: Locale;
  explainability: CareerExplainabilityAdapter;
  title?: string;
  subtitle?: string;
  testId?: string;
  showStrainRadar?: boolean;
};

type DimensionDefinition = {
  key: keyof CareerExplainabilityAdapter["scoreBundle"];
  label: string;
};

const DIMENSIONS: DimensionDefinition[] = [
  { key: "fitScore", label: "Fit" },
  { key: "strainScore", label: "Strain" },
  { key: "aiSurvivalScore", label: "AI" },
  { key: "mobilityScore", label: "Mobility" },
  { key: "confidenceScore", label: "Confidence" },
];

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function formatNullableNumber(value: number | null): string {
  return value === null ? "—" : String(value);
}

function renderInlineList(items: string[]): string {
  return items.join(", ");
}

function ExplainabilityDimensionCard({
  label,
  dimension,
}: {
  label: string;
  dimension: CareerExplainabilityScoreDimensionAdapter;
}) {
  const componentEntries = Object.entries(dimension.components).filter(([, value]) => value !== null);

  return (
    <article className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{label}</p>
          <p className="m-0 mt-2 text-2xl font-semibold text-[var(--fm-text)]">{renderScoreValue(dimension.value)}</p>
        </div>
        <div className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-1 font-mono text-xs text-[var(--fm-text)]">
          {dimension.integrityState}
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-[var(--fm-text-muted)] md:grid-cols-3">
        <p className="m-0 font-mono">degradation_factor: {formatNullableNumber(dimension.degradationFactor)}</p>
        <p className="m-0 font-mono">confidence_cap: {formatNullableNumber(dimension.confidenceCap)}</p>
        <p className="m-0 font-mono">formula_version: {dimension.formulaVersion ?? "—"}</p>
      </div>

      {dimension.criticalMissingFields.length > 0 ? (
        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">
          critical_missing_fields: {renderInlineList(dimension.criticalMissingFields)}
        </p>
      ) : null}

      {dimension.penalties.length > 0 ? (
        <div className="mt-3 space-y-1 text-xs text-[var(--fm-text-muted)]">
          <p className="m-0 font-medium text-[var(--fm-text)]">penalties</p>
          <ul className="m-0 space-y-1 pl-5">
            {dimension.penalties.map((penalty) => (
              <li key={`${penalty.code}:${penalty.reason ?? "none"}`}>
                <span className="font-mono">{penalty.code}</span>
                {penalty.value !== null ? ` (${penalty.value})` : ""}
                {penalty.reason ? `: ${penalty.reason}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {componentEntries.length > 0 ? (
        <div className="mt-3 space-y-1 text-xs text-[var(--fm-text-muted)]">
          <p className="m-0 font-medium text-[var(--fm-text)]">components</p>
          <div className="grid gap-1 md:grid-cols-2">
            {componentEntries.map(([key, value]) => (
              <p key={key} className="m-0 font-mono">
                {key}: {formatNullableNumber(value)}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function CareerExplainabilityPanel({
  locale,
  explainability,
  title,
  subtitle,
  testId,
  showStrainRadar = true,
}: CareerExplainabilityPanelProps) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
      data-subject-kind={explainability.subjectKind}
    >
      <div className="space-y-1">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {title ?? (locale === "zh" ? "结构化解释详情" : "Structured explainability")}
        </h2>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {subtitle ??
            (locale === "zh"
              ? "只展示 backend explainability authority payload 的结构化字段，不在前端扩写为建议或策略。"
              : "This section shows structured fields from the backend explainability authority payload only, without frontend advice or strategy expansion.")}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "Subject kind" : "Subject kind"}
          </p>
          <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">{explainability.subjectKind}</p>
        </div>
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "Overall integrity" : "Overall integrity"}
          </p>
          <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">
            {explainability.integritySummary.integrityState ?? "unknown"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
            {locale === "zh" ? "Claim boundary" : "Claim boundary"}
          </p>
          <p className="m-0 mt-2 text-sm text-[var(--fm-text-muted)]">
            strong_claim: {String(explainability.claimPermissions.allow_strong_claim)}
          </p>
        </div>
      </div>

      {explainability.integritySummary.criticalMissingFields.length > 0 ? (
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          critical_missing_fields: {renderInlineList(explainability.integritySummary.criticalMissingFields)}
        </p>
      ) : null}

      {explainability.claimPermissions.reason_codes.length > 0 || explainability.warnings.blockedClaims.length > 0 ? (
        <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-xs text-[var(--fm-text-muted)]">
          {explainability.claimPermissions.reason_codes.length > 0 ? (
            <p className="m-0">reason_codes: {renderInlineList(explainability.claimPermissions.reason_codes)}</p>
          ) : null}
          {explainability.warnings.blockedClaims.length > 0 ? (
            <p className="m-0">blocked_claims: {renderInlineList(explainability.warnings.blockedClaims)}</p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {DIMENSIONS.map(({ key, label }) => (
          <ExplainabilityDimensionCard key={key} label={label} dimension={explainability.scoreBundle[key]} />
        ))}
      </div>

      {showStrainRadar && explainability.strainRadar ? (
        <CareerStrainRadar
          locale={locale}
          radar={explainability.strainRadar}
          testId="career-explainability-strain-radar"
        />
      ) : null}
    </section>
  );
}
