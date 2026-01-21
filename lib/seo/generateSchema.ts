import type { Test } from "@/lib/content";

const SITE_URL = "https://www.fermatmind.com";

export function buildFAQPageJsonLd(test: Test) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: test.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function buildBreadcrumbJsonLd({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Test",
        item: `${SITE_URL}/test`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: `${SITE_URL}/test/${slug}`,
      },
    ],
  };
}
