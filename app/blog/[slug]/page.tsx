import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPostBySlug, listBlogPosts } from "@/lib/content";

export function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) return notFound();

  return (
    <Container as="main" className="py-10">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>{post.title}</CardTitle>
          <p className="text-sm text-slate-600">{post.summary}</p>
          <p className="text-xs text-slate-500">Updated: {post.updatedAt}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(post.tags ?? []).map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Full markdown rendering is intentionally out of scope for this iteration.
          </p>
          <Link href="/blog" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Back to blog
          </Link>
        </CardContent>
      </Card>
    </Container>
  );
}
