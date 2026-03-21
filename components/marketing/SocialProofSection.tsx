import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { SOCIAL_TRUST_SIGNALS, TESTIMONIALS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function SocialProofSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section data-testid="home-social-proof-section" className="fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="space-y-[var(--fm-space-8)]">
        <div className="mx-auto max-w-3xl space-y-[var(--fm-gap-xs)] text-center">
          <p className="fm-home-section-kicker">{dict.home.hero.kicker}</p>
          <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.title}</h2>
          <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.socialProof.subtitle}</p>
        </div>

        <div className="fm-home-trust-strip">
          <div className="space-y-[var(--fm-gap-xs)]">
            <h3 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.trustPillarsTitle}</h3>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">{dict.home.socialProof.trustPillarsSubtitle}</p>
          </div>

          <div className="fm-home-trust-grid">
            {SOCIAL_TRUST_SIGNALS.map((item) => (
              <div key={item.id} className="fm-home-trust-pill">
                <p className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">
                  {locale === "zh" ? item.label.zh : item.label.en}
                </p>
                <p className="m-0 mt-[var(--fm-space-1)] text-xs text-[var(--fm-text-muted)]">
                  {locale === "zh" ? item.detail.zh : item.detail.en}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-[var(--fm-gap-md)]">
          <h3 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.testimonialsTitle}</h3>
          <div className="grid gap-[var(--fm-gap-md)] md:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <article key={item.id} className="fm-home-testimonial">
                <p className="fm-home-testimonial-quote">“{item.quote}”</p>
                <div className="space-y-[var(--fm-gap-xs)]">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                    {item.author} · {item.role}
                  </p>
                  <Link
                    href={withLocale(`/tests/${item.testSlug}`)}
                    className="text-sm font-semibold text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {item.testLabel}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
