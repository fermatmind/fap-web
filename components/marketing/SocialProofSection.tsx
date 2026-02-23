import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { SOCIAL_LOGOS, TESTIMONIALS } from "@/lib/marketing/socialProof";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function SocialProofSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="fm-section-muted py-20">
      <Container className="space-y-8">
        <div className="space-y-2 text-center">
          <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.title}</h2>
          <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.socialProof.subtitle}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SOCIAL_LOGOS.map((logo) => (
            <div
              key={logo.id}
              className="flex h-14 items-center justify-center rounded-xl border border-[var(--fm-border)] bg-white text-sm font-semibold text-slate-500 grayscale transition hover:grayscale-0"
            >
              {logo.label}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{dict.home.socialProof.testimonialsTitle}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {TESTIMONIALS.map((item) => (
              <Card key={item.id} className="h-full border-[var(--fm-border)] bg-white">
                <CardContent className="space-y-3 pt-6">
                  <p className="m-0 text-sm leading-7 text-[var(--fm-text)]">“{item.quote}”</p>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                    {item.author} · {item.role}
                  </p>
                  <Link
                    href={withLocale(`/tests/${item.testSlug}`)}
                    className="text-sm font-semibold text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {item.testLabel}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
