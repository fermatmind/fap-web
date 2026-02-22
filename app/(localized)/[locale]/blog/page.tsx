import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listBlogPosts } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export const metadata = {
  title: "Blog",
  description: "Articles and explainers about assessments and personality models.",
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const posts = listBlogPosts();

  return (
    <Container as="main" className="space-y-6 py-10">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Insights
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">Blog</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          Read short explainers and practical guides.
        </p>
      </section>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card
            key={post.slug}
            className="border-[var(--fm-border)] bg-[var(--fm-surface)] shadow-[var(--fm-shadow-sm)] transition hover:shadow-[var(--fm-shadow-md)]"
          >
            <CardHeader className="space-y-3">
              <CardTitle className="font-serif text-[var(--fm-text)]">{post.title}</CardTitle>
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">{post.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <p className="m-0 text-xs text-[var(--fm-text-muted)]">Updated: {post.updatedAt}</p>
              <Link
                href={withLocale(`/blog/${post.slug}`)}
                className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                Read article
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}
