import type { MetadataRoute } from "next";
import { getSiteUrlOrThrow } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrlOrThrow();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
