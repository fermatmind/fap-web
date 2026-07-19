import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import type { PublicReview } from "@/lib/public-content/publicReview";

type TrustStripProps = {
  locale: "en" | "zh";
  reviewerStatus?: string | null;
  publicReview?: PublicReview | null;
  indexState?: string | null;
  reasonCodes?: string[];
  contentVersion?: string | null;
  dataVersion?: string | null;
  logicVersion?: string | null;
  compilerVersion?: string | null;
  compiledAt?: string | null;
  compileRunId?: string | null;
  truthMetricId?: string | null;
  trustManifestId?: string | null;
  indexStateId?: string | null;
  compact?: boolean;
  testId?: string;
};

type TrustItem = {
  label: string;
  value: string;
};

function normalizeValue(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function buildTrustItems(props: TrustStripProps): TrustItem[] {
  const items: TrustItem[] = [];

  const definitions: Array<[string, string | null]> = [
    ["content_version", normalizeValue(props.contentVersion)],
    ["data_version", normalizeValue(props.dataVersion)],
    ["logic_version", normalizeValue(props.logicVersion)],
    ["compiler_version", normalizeValue(props.compilerVersion)],
    ["compiled_at", normalizeValue(props.compiledAt)],
    ["compile_run_id", normalizeValue(props.compileRunId)],
    ["truth_metric_id", normalizeValue(props.truthMetricId)],
    ["trust_manifest_id", normalizeValue(props.trustManifestId)],
    ["index_state_id", normalizeValue(props.indexStateId)],
  ];

  for (const [label, value] of definitions) {
    if (value) {
      items.push({ label, value });
    }
  }

  return items;
}

export function TrustStrip({
  locale,
  publicReview,
  indexState,
  reasonCodes = [],
  compact = false,
  testId,
  ...meta
}: TrustStripProps) {
  const normalizedIndexState = normalizeValue(indexState) ?? "unknown";
  const normalizedReasonCodes = [...new Set(reasonCodes.map((code) => String(code ?? "").trim()).filter(Boolean))];
  const trustItems = buildTrustItems({ locale, publicReview, indexState, reasonCodes, compact, testId, ...meta });

  return (
    <div
      className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]"
      data-testid={testId}
    >
      <div className="flex flex-wrap gap-2">
        <PublicReviewStatus review={publicReview} locale={locale} testId={testId ? `${testId}-public-review` : undefined} />
        <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-1 font-mono text-xs text-[var(--fm-text)]">
          index_state: {normalizedIndexState}
        </span>
      </div>

      {normalizedReasonCodes.length > 0 ? (
        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">
          reason_codes: {normalizedReasonCodes.join(", ")}
        </p>
      ) : null}

      {!compact && trustItems.length > 0 ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {trustItems.map((item) => (
            <p key={item.label} className="m-0 font-mono text-xs text-[var(--fm-text-muted)]">
              {item.label}: {item.value}
            </p>
          ))}
        </div>
      ) : null}

      {!compact && trustItems.length === 0 ? (
        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh" ? "暂无更多来源字段。" : "No additional provenance fields."}
        </p>
      ) : null}
    </div>
  );
}
