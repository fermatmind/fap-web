import type { MetadataRoute } from "next";
import { listTests } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.fermatmind.com";

  const tests = await listTests();

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/test` },
    ...tests.map((t) => ({
      url: `${siteUrl}/test/${t.slug}`,
    })),
  ];
}
