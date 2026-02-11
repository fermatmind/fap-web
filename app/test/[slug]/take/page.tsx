import { permanentRedirect } from "next/navigation";

export default async function LegacyTestTakePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  permanentRedirect(`/tests/${slug}/take`);
}
