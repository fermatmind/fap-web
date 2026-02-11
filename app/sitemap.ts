import type { MetadataRoute } from "next";
import { getAllTests } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.fermatmind.com";

  const tests = await getAllTests();

  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/tests` },
    ...tests.map((test) => ({
      url: `${siteUrl}/tests/${test.slug}`,
    })),
  ];
}
