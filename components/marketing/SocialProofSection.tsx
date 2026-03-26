import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SOCIAL_TRUST_SIGNALS, TESTIMONIALS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function SocialProofSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section data-testid="home-social-proof-section" className="fm-section-muted fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="space-y-[var(--fm-space-8)] md:space-y-[var(--fm-space-10)]">
        <div className="mx-auto max-w-[44rem] space-y-[var(--fm-gap-sm)] text-center">
          <p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#6a7e99]">
            {locale === "zh" ? "用户与推荐场景" : "Users and referral contexts"}
          </p>
          <h2 className="m-0 text-[clamp(2rem,4vw,2.85rem)] font-semibold tracking-[-0.04em] text-[var(--fm-text)]">
            {dict.home.socialProof.title}
          </h2>
          <p className="m-0 text-[var(--fm-text-muted)] md:text-[1.02rem]">{dict.home.socialProof.subtitle}</p>
        </div>

        <div className="space-y-[var(--fm-gap-sm)]">
          <div className="space-y-2">
            <h3 className="m-0 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--fm-text)]">
              {dict.home.socialProof.trustPillarsTitle}
            </h3>
            <p className="m-0 max-w-[42rem] text-sm leading-7 text-[var(--fm-text-muted)]">
              {dict.home.socialProof.trustPillarsSubtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SOCIAL_TRUST_SIGNALS.map((item) => (
              <div
                key={item.id}
                className="fm-home-signal-chip rounded-[1.2rem] border border-[#d7e0eb] bg-white/88 px-4 py-4 shadow-[0_10px_24px_rgba(19,41,71,0.06)] transition duration-200"
              >
                <p className="m-0 text-sm font-semibold tracking-[-0.01em] text-[var(--fm-trust-blue-strong)]">
                  {locale === "zh" ? item.label.zh : item.label.en}
                </p>
                <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                  {locale === "zh" ? item.detail.zh : item.detail.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-[var(--fm-gap-md)]">
          <h3 className="m-0 text-[1.35rem] font-semibold tracking-[-0.03em] text-[var(--fm-text)]">
            {dict.home.socialProof.testimonialsTitle}
          </h3>
          <div className="grid gap-[var(--fm-gap-md)] md:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.id}
                className="fm-home-testimonial-card flex h-full flex-col rounded-[1.55rem] border border-[#d7e0eb] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] px-5 py-5 shadow-[0_14px_34px_rgba(19,41,71,0.08)] transition duration-200 md:px-6 md:py-6"
              >
                <div className="flex h-full flex-col gap-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe4ee] bg-white text-[1.25rem] text-[var(--fm-trust-blue-strong)]">
                    “
                  </span>
                  <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">
                    {locale === "zh" ? item.quote.zh : item.quote.en}
                  </p>
                  <div className="mt-auto space-y-3 pt-2">
                    <div>
                      <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">{item.author}</p>
                      <p className="m-0 mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                        {locale === "zh" ? item.role.zh : item.role.en}
                      </p>
                    </div>
                    <div className="h-px bg-[linear-gradient(90deg,rgba(171,190,214,0.55)_0%,rgba(171,190,214,0)_100%)]" />
                    <p className="m-0 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#6c809a]">
                      {locale === "zh" ? "来源测试" : "Source assessment"}
                    </p>
                    <Link
                      href={withLocale(`/tests/${item.testSlug}`)}
                      className="inline-flex text-sm font-semibold text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                    >
                      {locale === "zh" ? item.testLabel.zh : item.testLabel.en}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
