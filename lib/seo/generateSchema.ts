import { canonicalUrl } from "@/lib/site";

type FAQItem = {
  question: string;
  answer: string;
};

export function buildFAQPageJsonLd(faq: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
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
        item: canonicalUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Tests",
        item: canonicalUrl("/tests"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: canonicalUrl(`/tests/${slug}`),
      },
    ],
  };
}
