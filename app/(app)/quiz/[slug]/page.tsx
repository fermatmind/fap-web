import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  robots: NOINDEX_ROBOTS,
};

export default async function DeprecatedQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Deprecated: use /tests/[slug]/take as the single quiz engine.
  permanentRedirect(`/tests/${slug}/take`);
}
