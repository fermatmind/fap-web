import { canonicalUrl } from "@/lib/site";

type FAQItem = {
  question: string;
  answer: string;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type LocaleCode = "en" | "zh";

type WebPageSchemaInput = {
  path: string;
  title: string;
  description: string;
  locale: LocaleCode;
};

type ArticleSchemaInput = {
  path: string;
  title: string;
  description: string;
  locale: LocaleCode;
  datePublished: string;
  dateModified: string;
  authorName: string;
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

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function buildWebPageJsonLd(input: WebPageSchemaInput) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
  };
}

export function buildArticleJsonLd(input: ArticleSchemaInput) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    url,
    headline: input.title,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
    author: {
      "@type": "Person",
      name: input.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "FermatMind",
    },
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    mainEntityOfPage: url,
  };
}
