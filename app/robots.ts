import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tests", "/tests/*", "/blog/*"],
        disallow: [
          "/api/",
          "/tests/*/take",
          "/result/",
          "/share/",
          "/orders/",
          "/og/",
        ],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
