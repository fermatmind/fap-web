import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { FinalCtaContent, RouteKey } from "./homepageContent";

type FinalCtaSectionProps = {
  locale: Locale;
  content: FinalCtaContent;
  routes: Pick<Record<RouteKey, string>, "tests" | "business" | "mbtiDetail">;
};

export function FinalCtaSection({ locale, content, routes }: FinalCtaSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="py-[clamp(56px,8vw,112px)]" data-testid="home-final-cta-section">
      <Container>
        <div className="mx-auto grid max-w-3xl gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-[var(--fm-shadow-sm)] md:p-8">
          <h2 className="m-0 font-serif text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-8 text-[var(--fm-text-muted)]">{content.supporting}</p>

          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Link
              href={withLocale(`${routes.mbtiDetail}/take`)}
              className={buttonVariants({ size: "lg", className: "h-auto min-h-[44px]" })}
            >
              {content.primaryCta}
            </Link>
            <Link
              href={withLocale(routes.tests)}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              {content.secondaryCta}
            </Link>
          </div>

          <Link
            href={withLocale(routes.business)}
            className="inline-flex min-h-[44px] text-sm font-semibold text-[var(--fm-trust-blue)]"
          >
            {content.enterpriseText}
          </Link>
        </div>
      </Container>
    </section>
  );
}
