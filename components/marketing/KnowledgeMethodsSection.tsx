import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { KnowledgeMethodsContent, RouteKey } from "./homepageContent";

type KnowledgeMethodsSectionProps = {
  locale: Locale;
  content: KnowledgeMethodsContent;
  routes: Pick<Record<RouteKey, string>, "help" | "articles" | "mbtiBasics">;
};

export function KnowledgeMethodsSection({ locale, content, routes }: KnowledgeMethodsSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      data-testid="home-knowledge-methods-section"
      className="fm-home-knowledge-methods py-[clamp(56px,8vw,112px)]"
    >
      <Container className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-[var(--fm-text-muted)]">{content.supporting}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {content.cards.map((item) => {
            const route = routes[item.routeKey];

            return (
              <article key={item.title} className="fm-home-compact-card">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                  {item.cta}
                </p>
                <h3 className="mt-1 m-0 text-lg font-semibold text-[var(--fm-text)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
                <Link
                  href={withLocale(route)}
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-4 h-auto min-h-[40px] px-3",
                  })}
                >
                  {item.cta}
                </Link>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
