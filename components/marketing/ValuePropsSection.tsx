import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

type IconProps = {
  className?: string;
};

function ReliableIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="10" y="20" width="44" height="30" rx="6" stroke="currentColor" strokeWidth="2.8" />
      <path d="M22 20V15C22 11.7 24.7 9 28 9H36C39.3 9 42 11.7 42 15V20" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="32" cy="35" r="4.2" stroke="currentColor" strokeWidth="2.6" />
      <path d="M32 39V44" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M17 50H47" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function PrivacyIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M32 9L48 16V28C48 39.6 41.2 49.8 32 54C22.8 49.8 16 39.6 16 28V16L32 9Z" stroke="currentColor" strokeWidth="2.8" />
      <path d="M24.2 31.8C24.2 27.5 27.7 24 32 24C36.3 24 39.8 27.5 39.8 31.8V38.8H24.2V31.8Z" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="32" cy="33.8" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CommunityIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="20" cy="22" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <circle cx="32" cy="19.5" r="7" stroke="currentColor" strokeWidth="2.8" />
      <circle cx="44" cy="22" r="5.8" stroke="currentColor" strokeWidth="2.6" />
      <path d="M12.5 43.5C12.5 38.3 16.8 34 22 34H25.5C30.7 34 35 38.3 35 43.5V48.5H12.5V43.5Z" stroke="currentColor" strokeWidth="2.6" />
      <path d="M24 46C24 39.5 29.2 34.3 35.7 34.3H40.3C46.8 34.3 52 39.5 52 46V51H24V46Z" stroke="currentColor" strokeWidth="2.6" />
    </svg>
  );
}

const ICONS = [ReliableIcon, PrivacyIcon, CommunityIcon] as const;

const VALUE_PROP_COPY = {
  en: [
    {
      eyebrow: "Methodology",
      title: "Built on stable assessment structure",
      description:
        "Each flow is organized around consistent dimensions, interpretable sub-facets, and report-ready language instead of one-off labels.",
    },
    {
      eyebrow: "Precision",
      title: "Results stay tied to evidence",
      description:
        "Scoring, interpretation, and action prompts remain anchored to observable signals so the output can be discussed and reviewed.",
    },
    {
      eyebrow: "Sovereignty",
      title: "Privacy boundaries are explicit",
      description:
        "Minimal collection, consent-aware tracking, and restrained data flow reduce unnecessary exposure without weakening the product flow.",
    },
  ],
  zh: [
    {
      eyebrow: "Methodology",
      title: "建立在稳定测评结构之上",
      description: "每套流程都围绕一致维度、可解释分面与可落地的报告语言组织，而不是停留在一次性标签。",
    },
    {
      eyebrow: "Precision",
      title: "结果解释始终回到证据",
      description: "评分、解读与行动建议都锚定在可观察信号上，便于讨论、复盘与后续判断。",
    },
    {
      eyebrow: "Sovereignty",
      title: "隐私边界保持明确",
      description: "用最小化采集、明确同意与克制的数据流设计，降低不必要的信息暴露风险。",
    },
  ],
} as const;

export function ValuePropsSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const items = VALUE_PROP_COPY[locale];

  return (
    <section
      data-testid="home-value-props-section"
      className="fm-home-value-props relative z-10 bg-white pb-[var(--fm-space-12)] pt-[var(--fm-space-8)] md:pb-[var(--fm-space-16)] md:pt-[var(--fm-space-12)]"
    >
      <Container className="space-y-[var(--fm-space-6)]">
        <div className="mx-auto max-w-[42rem] space-y-[var(--fm-gap-sm)] text-center">
          <p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#6a7e99]">
            {locale === "zh" ? "信任依据" : "Trust foundations"}
          </p>
          <h2 className="m-0 text-[clamp(1.9rem,4vw,2.55rem)] font-semibold tracking-[-0.04em] text-[var(--fm-trust-blue-strong)]">
            {dict.home.valueProps.title}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = ICONS[index] ?? ReliableIcon;
            const iconOpticalShiftClass =
              index === 1
                ? "translate-y-px"
                : index === 2
                  ? "translate-x-px translate-y-px"
                  : "";
            return (
              <article
                key={item.title}
                className="fm-home-proof-card group h-full rounded-[1.55rem] border border-[#d6deea] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-6 shadow-[0_16px_38px_rgba(19,41,71,0.08)] transition duration-200 md:px-6 md:py-7"
              >
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start gap-4">
                    <span className="relative grid h-[4.1rem] w-[4.1rem] shrink-0 place-items-center rounded-[1.3rem]">
                      <span
                        aria-hidden
                        className="absolute inset-0 rounded-[1.3rem] border border-[#cfe0ef] bg-[linear-gradient(180deg,#fafdff_0%,#edf5fb_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                      />
                      <span
                        aria-hidden
                        className="absolute inset-[0.34rem] rounded-[1rem] bg-[linear-gradient(180deg,#f2f8fd_0%,#dceafd_100%)]"
                      />
                      <Icon className={`relative block h-8 w-8 text-[#0f5b9b] ${iconOpticalShiftClass}`} />
                    </span>

                    <div className="space-y-2">
                      <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#7387a1]">
                        {item.eyebrow}
                      </p>
                      <h3 className="m-0 text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] text-[var(--fm-trust-blue-strong)]">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <div className="h-px bg-[linear-gradient(90deg,rgba(171,190,214,0.55)_0%,rgba(171,190,214,0)_100%)]" />

                  <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.description}</p>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-2">
                    <span
                      className="inline-flex items-center rounded-full border border-[#d6e0eb] bg-white px-3 py-1 text-[0.72rem] font-semibold tracking-[0.12em] text-[#56718e]"
                    >
                      {locale === "zh" ? `0${index + 1}` : `0${index + 1}`}
                    </span>
                    <span className="text-[0.78rem] font-medium text-[#6a7e99]">
                      {locale === "zh" ? "首页证据卡" : "Homepage proof card"}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
