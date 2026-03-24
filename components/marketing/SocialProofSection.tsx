import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { RouteKey, SocialProofContent, TestimonialCard } from "./homepageContent";

type SocialProofSectionProps = {
  locale: Locale;
  content: SocialProofContent;
  routes: Pick<Record<RouteKey, string>, "articles">;
};

export function SocialProofSection({ locale, content, routes }: SocialProofSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const testimonialCards = content.testimonials ?? [];

  return (
    <div className="space-y-7">
      <section aria-labelledby="home-use-cases" className="space-y-4">
        <p className="m-0 text-base font-semibold text-[var(--fm-text)]">
          {content.useCasesTitle}
        </p>
        <p className="m-0 max-w-3xl text-sm text-[var(--fm-text-muted)]">{content.useCasesSupporting}</p>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {content.useCaseCards.map((item) => (
            <article key={item.title} className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <h4 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.title}</h4>
              <p className="mt-1.5 text-sm leading-6 text-[var(--fm-text-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="home-rating-testimonials" className="grid gap-4 lg:grid-cols-[4fr_8fr]">
        <article className="rounded-xl border border-[var(--fm-border)] bg-white p-4 min-h-full">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
            {content.ratingTitle}
          </p>
          <p className="mt-1 text-4xl font-bold text-[var(--fm-trust-blue-strong)]">{content.ratingValue}</p>
          <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{content.ratingBody}</p>
          <Link
            href={withLocale(routes.articles)}
            className="mt-4 inline-flex min-h-[40px] text-xs font-semibold text-[var(--fm-text-muted)] underline underline-offset-4 hover:text-[var(--fm-trust-blue)]"
          >
            {content.articlesCta}
          </Link>
        </article>

        <div className="grid gap-3 sm:grid-cols-2">
          {testimonialCards.map((item: TestimonialCard) => (
            <article key={item.id} className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">{item.quote}</p>
              <div className="mt-3 space-y-1">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                  {item.author} · {item.role}
                </p>
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">{item.testLabel}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
