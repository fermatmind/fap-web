import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SOCIAL_TRUST_SIGNALS, TESTIMONIALS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

const CHINESE_TEST_LABEL_BY_KEY: Record<string, string> = {
  "big-five-personality-test-ocean-model": "大五人格测试",
  "mbti-personality-test-16-personality-types": "MBTI 性格测试",
  "clinical-depression-anxiety-assessment-professional-edition": "抑郁焦虑综合检测",
  "depression-screening-test-standard-edition": "抑郁测评（标准版）",
  "iq-test-intelligence-quotient-assessment": "智商 IQ 测试",
  "eq-test-emotional-intelligence-assessment": "情商 EQ 测试",
};

export function SocialProofSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section data-testid="home-social-proof-section" className="fm-section-muted fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="space-y-[var(--fm-space-8)]">
        <div className="space-y-[var(--fm-gap-xs)] text-center">
          <p className="fm-home-section-kicker">{dict.home.socialProof.title}</p>
          <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.title}</h2>
          <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.socialProof.subtitle}</p>
        </div>

        <div className="space-y-[var(--fm-gap-sm)]">
          <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.trustPillarsTitle}</h3>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{dict.home.socialProof.trustPillarsSubtitle}</p>

          <div className="fm-home-trust-pills">
            {SOCIAL_TRUST_SIGNALS.map((item) => {
              const label = locale === "zh" ? item.label.zh : item.label.en;
              const detail = locale === "zh" ? item.detail.zh : item.detail.en;
              return (
                <article key={item.id} className="fm-home-trust-chip group">
                  <p className="fm-home-trust-chip-title">{label}</p>
                  <p className="fm-home-trust-chip-copy">{detail}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-[var(--fm-gap-md)]">
          <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.testimonialsTitle}</h3>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh" ? "来自真实用户与场景的评价" : "Insights from real users and real usage scenes"}
          </p>
          <div className="grid gap-[var(--fm-gap-md)] md:grid-cols-2">
            {TESTIMONIALS.map((item) => {
              const role = locale === "zh" ? item.role.zh : item.role.en;
              const quote = locale === "zh" ? item.quote.zh : item.quote.en;
              const label = locale === "zh" ? item.testLabel.zh : item.testLabel.en;

              return (
                <article key={item.id} className="fm-home-quote-card group">
                  <blockquote className="fm-home-quote">“{quote}”</blockquote>
                  <p className="fm-home-quote-byline">
                    {item.author} · {role}
                  </p>
                  <p className="fm-home-quote-source">
                    {label ||
                      CHINESE_TEST_LABEL_BY_KEY[item.testSlug] ||
                      (locale === "zh" ? "评估产品" : "Assessment")}
                    <span> · </span>
                    <Link href={withLocale(`/tests/${item.testSlug}`)} className="fm-home-quote-source-link">
                      {locale === "zh" ? "查看测试" : "View test"}
                    </Link>
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
