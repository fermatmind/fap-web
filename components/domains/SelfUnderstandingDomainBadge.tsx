import type { Locale } from "@/lib/i18n/locales";

const BADGE_COPY: Record<Locale, string> = {
  en: "Self-understanding",
  zh: "自我认知",
};

type SelfUnderstandingDomainBadgeProps = {
  locale: Locale;
};

export function SelfUnderstandingDomainBadge({ locale }: SelfUnderstandingDomainBadgeProps) {
  return (
    <span
      data-domain-id="self_understanding"
      data-domain-badge="self_understanding"
      data-domain-badge-type="non_interactive_domain_label"
      data-domain-visible-copy-scope="self_understanding_badge_only"
      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] text-sky-700"
    >
      {BADGE_COPY[locale] ?? BADGE_COPY.en}
    </span>
  );
}
