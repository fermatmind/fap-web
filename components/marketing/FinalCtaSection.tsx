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
  const kicker = locale === "zh" ? "一键开始" : "Start with confidence";

  return (
    <section className="fm-home-section-shell" data-testid="home-final-cta-section">
      <Container className="max-w-[1200px]">
        <div className="fm-home-final-cta">
          <p className="fm-home-section-kicker">{kicker}</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-8 text-[#cce0ff]">{content.supporting}</p>

          <div className="mt-3 flex flex-wrap gap-3">
            <Link
              href={withLocale(`${routes.mbtiDetail}/take`)}
              className={buttonVariants({ size: "lg", className: "h-auto min-h-[44px] bg-white text-[var(--fm-trust-blue-strong)]" })}
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
            className="inline-flex min-h-[44px] text-sm font-semibold text-white underline decoration-white/60 underline-offset-4"
          >
            {content.enterpriseText}
          </Link>
        </div>
      </Container>
    </section>
  );
}
