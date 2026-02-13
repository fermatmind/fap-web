import type { MetadataRoute } from "next";
import { tests } from "../.velite";
import { canonicalUrl } from "@/lib/site";

function toLastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: canonicalUrl("/") },
    { url: canonicalUrl("/tests") },
    ...tests.map((test) => {
      const lastModified = toLastModified(test.last_updated ?? test.updated_at);
      return {
        url: canonicalUrl(`/tests/${test.slug}`),
        ...(lastModified ? { lastModified } : {}),
      };
    }),
  ];
}
