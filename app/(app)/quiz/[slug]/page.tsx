import { permanentRedirect } from "next/navigation";

export default async function DeprecatedQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Deprecated: use /tests/[slug]/take as the single quiz engine.
  permanentRedirect(`/tests/${slug}/take`);
}
