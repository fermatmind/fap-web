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
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Blog</h1>
        <p className="text-slate-600">Read short explainers and practical guides.</p>
      </div>

      <div className="mt-8 grid gap-4">
        {posts.map((post) => (
          <Card key={post.slug}>
            <CardHeader className="space-y-3">
              <CardTitle>{post.title}</CardTitle>
              <p className="text-sm text-slate-600">{post.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {(post.tags ?? []).map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <p className="text-xs text-slate-500">Updated: {post.updatedAt}</p>
              <Link
                href={withLocale(`/blog/${post.slug}`)}
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
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
