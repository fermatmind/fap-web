import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      scaleCode?: string;
      tagline: string;
      excerpt: string;
      rating: number;
      isClinical: boolean;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

function renderStars(rating: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1 text-[var(--fm-gold)]" aria-label={`rating-${rounded}`}>
      {Array.from({ length: 5 }, (_, idx) => (
        <span key={idx} aria-hidden className={idx < rounded ? "opacity-100" : "opacity-35"}>
          ★
        </span>
      ))}
    </div>
  );
}

export function HighlightedTestsSection({
  dict,
  locale,
  cards,
}: {
  dict: SiteDictionary;
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="fm-section-teal py-20 text-white">
      <Container className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="m-0 font-serif text-3xl font-semibold">{dict.home.highlighted.title}</h2>
          <p className="m-0 text-teal-50/85">{dict.home.highlighted.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) =>
            card.kind === "live" ? (
              <article
                key={`live-${card.slug}`}
                className="flex h-full flex-col rounded-2xl border border-white/20 bg-white p-6 text-[var(--fm-text)] shadow-[var(--fm-shadow-lg)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={withLocale(`/tests/${card.slug}`)}
                    className="font-serif text-xl font-semibold leading-tight text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {card.title}
                  </Link>
                  {renderStars(card.rating)}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {card.scaleCode ? <Badge>{card.scaleCode}</Badge> : null}
                  {card.isClinical ? (
                    <Badge className="border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.clinicalBadge}</Badge>
                  ) : null}
                </div>

                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                  {card.tagline}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{card.excerpt}</p>

                <div className="mt-auto pt-5">
                  <Link
                    href={withLocale(`/tests/${card.slug}/take`)}
                    className="text-sm font-semibold text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {dict.home.highlighted.cta} →
                  </Link>
                </div>
              </article>
            ) : (
              <article
                key={`coming-${card.id}`}
                className="relative flex h-full flex-col rounded-2xl border border-white/30 bg-white/90 p-6 text-[var(--fm-text)] shadow-[var(--fm-shadow-md)]"
                data-disabled="1"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="m-0 font-serif text-xl font-semibold leading-tight text-[var(--fm-trust-blue-strong)]">
                    {card.title}
                  </h3>
                  <Badge className="border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.comingSoonBadge}</Badge>
                </div>

                <p className="mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">{card.description}</p>

                <p className="mt-auto pt-5 text-sm font-semibold text-[var(--fm-text-muted)]">{dict.home.highlighted.comingSoonCta}</p>
              </article>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
