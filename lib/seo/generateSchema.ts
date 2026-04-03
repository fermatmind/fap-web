import { canonicalUrl } from "@/lib/site";

export type FAQItem = {
  question: string;
  answer: string;
};

export type BreadcrumbItem = {
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

type PersonSchemaInput = {
  path: string;
  name: string;
  description: string;
  locale: LocaleCode;
};

type OccupationSchemaInput = {
  path: string;
  title: string;
  description: string;
  locale: LocaleCode;
  skills?: string[];
  salaryRange?: string;
};

type OrganizationSchemaInput = {
  path: string;
  name: string;
  description: string;
  locale: LocaleCode;
};

type ItemListSchemaInput = {
  path: string;
  title: string;
  description: string;
  locale: LocaleCode;
  idSuffix?: string;
  items: Array<{
    name: string;
    path?: string;
    description?: string;
  }>;
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

export function buildPersonJsonLd(input: PersonSchemaInput) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
    mainEntityOfPage: url,
  };
}

export function buildOccupationJsonLd(input: OccupationSchemaInput) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Occupation",
    "@id": `${url}#occupation`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
    skills: input.skills,
    estimatedSalary: input.salaryRange,
    mainEntityOfPage: url,
  };
}

export function buildOrganizationJsonLd(input: OrganizationSchemaInput) {
  const url = canonicalUrl(input.path);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}#organization`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
  };
}

export function buildItemListJsonLd(input: ItemListSchemaInput) {
  const url = canonicalUrl(input.path);
  const idSuffix = input.idSuffix ? `#${input.idSuffix}` : "#itemlist";
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}${idSuffix}`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: input.locale === "zh" ? "zh-CN" : "en",
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      description: item.description,
      ...(item.path ? { url: canonicalUrl(item.path) } : {}),
    })),
    mainEntityOfPage: url,
  };
}
