import { redirect } from "next/navigation";

export default async function LegacyTestSlugPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  redirect(`/tests/${slug}`);
}
