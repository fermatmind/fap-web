import type { MetadataRoute } from "next";
import { tests } from "../.velite";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function toLastModified(value?: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/` },
    { url: `${siteUrl}/tests` },
    ...tests.map((test) => {
      const lastModified = toLastModified(test.last_updated ?? test.updated_at);
      return {
        url: `${siteUrl}/tests/${test.slug}`,
        ...(lastModified ? { lastModified } : {}),
      };
    }),
  ];
}
