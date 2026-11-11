import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type { PublicReview } from "@/lib/public-content/publicReview";

type TrustStripProps = {
  locale: DisplayLocale;
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

const TAIWAN_TRUST_LABELS: Record<string, string> = {
  content_version: "內容版本",
  data_version: "資料版本",
  logic_version: "邏輯版本",
  compiler_version: "編譯器版本",
  compiled_at: "編譯時間",
  compile_run_id: "編譯批次識別碼",
  truth_metric_id: "指標來源識別碼",
  trust_manifest_id: "信任資料識別碼",
  index_state_id: "索引狀態識別碼",
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
          {locale === "zh-TW" ? "索引狀態" : "index_state"}: {normalizedIndexState}
        </span>
      </div>

      {normalizedReasonCodes.length > 0 ? (
        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh-TW" ? "原因代碼" : "reason_codes"}: {normalizedReasonCodes.join(", ")}
        </p>
      ) : null}

      {!compact && trustItems.length > 0 ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {trustItems.map((item) => (
            <p key={item.label} className="m-0 font-mono text-xs text-[var(--fm-text-muted)]">
              {locale === "zh-TW" ? TAIWAN_TRUST_LABELS[item.label] ?? item.label : item.label}: {item.value}
            </p>
          ))}
        </div>
      ) : null}

      {!compact && trustItems.length === 0 ? (
        <p className="m-0 mt-3 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh-TW" ? "目前沒有其他來源資訊。" : locale === "zh" ? "暂无更多来源字段。" : "No additional provenance fields."}
        </p>
      ) : null}
    </div>
  );
}
