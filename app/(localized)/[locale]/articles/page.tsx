import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTestBySlug, listBlogPostsGroupedByTest, resolveTestTitleByLocale } from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);

  return {
    title: dict.articles.title,
    description: dict.articles.subtitle,
    alternates: {
      canonical: localizedPath("/articles", locale),
    },
  };
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const groups = listBlogPostsGroupedByTest();

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{dict.articles.kicker}</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{dict.articles.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{dict.articles.subtitle}</p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">{dict.articles.groupedByTestTitle}</p>
      </section>

      {groups.map((group) => {
        const test = getTestBySlug(group.relatedTestSlug);
        const groupTitle = test ? resolveTestTitleByLocale(test, locale) : group.relatedTestSlug;

        return (
          <section key={group.relatedTestSlug} data-testid={`articles-group-${group.relatedTestSlug}`} className="space-y-3">
            <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{groupTitle}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {group.posts.map((post) => (
                <Card
                  key={post.slug}
                  data-testid={`articles-card-${post.slug}`}
                  className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)] transition hover:shadow-[var(--fm-shadow-md)]"
                >
                  <CardHeader className="space-y-3">
                    <CardTitle className="font-serif text-[var(--fm-text)]">{post.title}</CardTitle>
                    <p className="m-0 text-sm text-[var(--fm-text-muted)]">{post.summary}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{dict.articles.voiceLabels[post.voice]}</Badge>
                      {(post.tags ?? []).map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    <p className="m-0 text-xs text-[var(--fm-text-muted)]">
                      {dict.articles.updatedLabel}: {post.updatedAt}
                    </p>
                    <Link
                      href={withLocale(`/articles/${post.slug}`)}
                      className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                    >
                      {dict.articles.readArticle}
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </Container>
  );
}
