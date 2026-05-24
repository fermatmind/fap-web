import type { MetadataRoute } from "next";
import { getSiteUrlOrThrow, isConfiguredStagingSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrlOrThrow();

  if (isConfiguredStagingSiteUrl()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
