import type { DisplayLocale } from "@/lib/i18n/locales";
import type { CareerWarningsAdapter } from "@/lib/career/adapters/types";
import type { CareerWarningCopyVariant } from "@/lib/career/adapters/types";

type WarningBannerProps = {
  locale: DisplayLocale;
  warnings: CareerWarningsAdapter;
  title?: string;
  testId?: string;
  copyVariant?: CareerWarningCopyVariant;
};

const TAIWAN_WARNING_LABELS: Readonly<Record<string, string>> = {
  "fit_score.provisional": "職涯適配度仍待確認",
  "strain_score.restricted": "工作負荷評分的適用範圍有限",
  "ai_survival_score.provisional": "AI 影響評分仍待確認",
};

export function WarningBanner({ locale, warnings, title, testId, copyVariant = "control" }: WarningBannerProps) {
  const hasWarnings =
    warnings.redFlags.length > 0 || warnings.amberFlags.length > 0 || warnings.blockedClaims.length > 0;

  if (!hasWarnings) {
    return null;
  }

  const defaultTitle =
    copyVariant === "softer"
      ? locale === "zh-TW" ? "風險提醒與適用範圍" : locale === "zh"
        ? "风险提示与边界说明"
        : "Risk notes and boundaries"
      : copyVariant === "strict"
        ? locale === "zh-TW" ? "優先注意的警示與限制" : locale === "zh"
          ? "高优先级警告与限制"
          : "High-priority warnings and limits"
        : locale === "zh-TW" ? "警示與限制" : locale === "zh"
          ? "显式警告与限制"
          : "Explicit warnings and limits";

  const redLabel = locale === "zh-TW" ? "高風險訊號" : copyVariant === "strict" ? "Critical signals" : "Red flags";
  const amberLabel = locale === "zh-TW" ? "需留意的訊號" : copyVariant === "softer" ? "Watchlist" : "Amber flags";
  const claimLabel = locale === "zh-TW" ? "受限制的結論" : copyVariant === "strict" ? "Restricted claims" : "Blocked claims";

  const warningLabel = (code: string) => locale === "zh-TW" ? TAIWAN_WARNING_LABELS[code] ?? code : code;

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
        {title ?? defaultTitle}
      </h2>
      <div className="grid gap-4 text-sm text-[var(--fm-text-muted)] md:grid-cols-3">
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">{redLabel}</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.redFlags.length > 0 ? warnings.redFlags.map((flag) => <li key={flag} data-warning-code={locale === "zh-TW" ? flag : undefined}>{warningLabel(flag)}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">{amberLabel}</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.amberFlags.length > 0 ? warnings.amberFlags.map((flag) => <li key={flag} data-warning-code={locale === "zh-TW" ? flag : undefined}>{warningLabel(flag)}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">{claimLabel}</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.blockedClaims.length > 0 ? warnings.blockedClaims.map((flag) => <li key={flag} data-warning-code={locale === "zh-TW" ? flag : undefined}>{warningLabel(flag)}</li>) : <li>—</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
