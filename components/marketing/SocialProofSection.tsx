import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { RouteKey, SocialProofContent } from "./homepageContent";

type SocialProofSectionProps = {
  locale: Locale;
  content: SocialProofContent;
  routes: Pick<Record<RouteKey, string>, "articles">;
};

export function SocialProofSection({ locale, content, routes }: SocialProofSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);

  const cards = TESTIMONIALS.slice(0, 4);

  return (
    <section data-testid="home-social-proof-section" className="fm-home-social-proof py-[var(--fm-section-y-lg)]">
      <Container className="space-y-[var(--fm-space-8)]">
        <div className="space-y-2 text-center md:text-left">
          <p className="fm-home-section-kicker">{content.useCasesTitle}</p>
          <h2 className="m-0 text-3xl font-semibold text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-[var(--fm-text-muted)]">{content.supporting}</p>
        </div>

        <section aria-labelledby="home-use-cases" className="space-y-4">
          <h3 id="home-use-cases" className="m-0 text-xl font-semibold text-[var(--fm-text)]">
            {content.useCasesTitle}
          </h3>
          <p className="m-0 max-w-3xl text-sm text-[var(--fm-text-muted)]">{content.useCasesSupporting}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {content.useCaseCards.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h4 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{item.title}</h4>
                <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="home-rating-testimonials" className="grid gap-4 lg:grid-cols-[0.45fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">{content.ratingTitle}</p>
            <p className="mt-2 text-4xl font-bold text-[var(--fm-trust-blue-strong)]">{content.ratingValue}</p>
            <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{content.ratingBody}</p>
            <Link
              href={withLocale(routes.articles)}
              className={buttonVariants({ size: "sm", className: "mt-4 h-auto min-h-[44px]" })}
            >
              {content.articlesCta}
            </Link>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((item) => (
              <article key={item.id} className="fm-home-testimonial">
                <p className="fm-home-testimonial-quote">“{item.quote}”</p>
                <div className="space-y-2">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                    {item.author} · {item.role}
                  </p>
                  <p className="m-0 text-sm text-[var(--fm-text-muted)]">{item.testLabel}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </section>
  );
}
