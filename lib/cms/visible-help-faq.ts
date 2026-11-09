import type { ContentPage } from "@/lib/cms/content-pages";
import type { FAQItem } from "@/lib/seo/generateSchema";

function normalizeVisibleText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeForFaqParity(value: string): string {
  return normalizeVisibleText(
    value
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_`>[\]()+.!?,:;'"-]+/g, " ")
  ).toLowerCase();
}

export function buildCmsHelpFaqItems(page: ContentPage): FAQItem[] {
  if (page.kind !== "help" || !page.schemaEnabled || page.faqItems.length === 0) {
    return [];
  }

  const visibleText = normalizeForFaqParity(`${page.contentMd}\n${page.contentHtml}`);

  return page.faqItems.filter((item) => {
    const question = normalizeForFaqParity(item.question);
    const answer = normalizeForFaqParity(item.answer);

    return Boolean(question && answer && visibleText.includes(question) && visibleText.includes(answer));
  });
}

export function buildVisibleHelpFaqJsonLd(faq: FAQItem[]) {
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
