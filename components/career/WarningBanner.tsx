import type { CareerWarningsAdapter } from "@/lib/career/adapters/types";

type WarningBannerProps = {
  locale: "en" | "zh";
  warnings: CareerWarningsAdapter;
  title?: string;
  testId?: string;
};

export function WarningBanner({ locale, warnings, title, testId }: WarningBannerProps) {
  const hasWarnings =
    warnings.redFlags.length > 0 || warnings.amberFlags.length > 0 || warnings.blockedClaims.length > 0;

  if (!hasWarnings) {
    return null;
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
        {title ?? (locale === "zh" ? "显式警告与限制" : "Explicit warnings and limits")}
      </h2>
      <div className="grid gap-4 text-sm text-[var(--fm-text-muted)] md:grid-cols-3">
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">Red flags</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.redFlags.length > 0 ? warnings.redFlags.map((flag) => <li key={flag}>{flag}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">Amber flags</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.amberFlags.length > 0 ? warnings.amberFlags.map((flag) => <li key={flag}>{flag}</li>) : <li>—</li>}
          </ul>
        </div>
        <div>
          <p className="m-0 font-medium text-[var(--fm-text)]">Blocked claims</p>
          <ul className="mt-2 space-y-1 pl-5">
            {warnings.blockedClaims.length > 0 ? warnings.blockedClaims.map((flag) => <li key={flag}>{flag}</li>) : <li>—</li>}
          </ul>
        </div>
      </div>
    </section>
  );
}
