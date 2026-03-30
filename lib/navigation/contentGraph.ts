import type { Locale } from "@/lib/i18n/locales";
import {
  formatPublicContentKind,
  inferPublicContentKind,
  normalizePublicHref,
  type PublicContentKind,
} from "@/lib/navigation/publicLinking";

export type ContentGraphPageType = "hub" | "entity" | "guide" | "method" | "data" | "test" | "career";

export type ContentGraphLink = {
  href: string;
  label: string;
  kind?: PublicContentKind | null;
};

function labels(locale: Locale) {
  return locale === "zh"
    ? {
        topics: "主题 Hub",
        personality: "人格实体",
        guides: "公共指南",
        methods: "方法页",
        data: "数据页",
        tests: "测试入口",
        mbtiTest: "MBTI 测试",
        career: "职业图谱",
        jobs: "职业库",
        careerGuides: "职业指南",
        recommendations: "职业推荐",
      }
    : {
        topics: "Topic hub",
        personality: "Personality entities",
        guides: "Public guides",
        methods: "Methods",
        data: "Data pages",
        tests: "Test entrypoints",
        mbtiTest: "MBTI test",
        career: "Career graph",
        jobs: "Job library",
        careerGuides: "Career guides",
        recommendations: "Career recommendations",
      };
}

export function requiredGraphLinks(pageType: ContentGraphPageType, locale: Locale): ContentGraphLink[] {
  const t = labels(locale);

  switch (pageType) {
    case "hub":
      return [
        { href: "/topics", label: t.topics, kind: "hub" },
        { href: "/personality", label: t.personality, kind: "entity" },
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/data", label: t.data, kind: "data" },
        { href: "/tests", label: t.tests, kind: "test" },
        { href: "/career/recommendations", label: t.recommendations, kind: "career" },
      ];
    case "entity":
      return [
        { href: "/personality", label: t.personality, kind: "entity" },
        { href: "/topics", label: t.topics, kind: "hub" },
        {
          href: "/tests/mbti-personality-test-16-personality-types/take",
          label: t.mbtiTest,
          kind: "test",
        },
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/career/recommendations", label: t.recommendations, kind: "career" },
      ];
    case "method":
      return [
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/topics", label: t.topics, kind: "hub" },
        { href: "/data", label: t.data, kind: "data" },
        { href: "/tests", label: t.tests, kind: "test" },
      ];
    case "data":
      return [
        { href: "/data", label: t.data, kind: "data" },
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/topics", label: t.topics, kind: "hub" },
        { href: "/tests", label: t.tests, kind: "test" },
      ];
    case "test":
      return [
        { href: "/tests", label: t.tests, kind: "test" },
        { href: "/articles", label: t.guides, kind: "guide" },
        { href: "/personality", label: t.personality, kind: "entity" },
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/data", label: t.data, kind: "data" },
        { href: "/career/recommendations", label: t.recommendations, kind: "career" },
      ];
    case "career":
      return [
        { href: "/career", label: t.career, kind: "career" },
        { href: "/career/jobs", label: t.jobs, kind: "career" },
        { href: "/career/guides", label: t.careerGuides, kind: "guide" },
        { href: "/personality", label: t.personality, kind: "entity" },
        { href: "/tests", label: t.tests, kind: "test" },
        { href: "/methods", label: t.methods, kind: "method" },
      ];
    case "guide":
    default:
      return [
        { href: "/articles", label: t.guides, kind: "guide" },
        { href: "/topics", label: t.topics, kind: "hub" },
        { href: "/personality", label: t.personality, kind: "entity" },
        { href: "/methods", label: t.methods, kind: "method" },
        { href: "/tests", label: t.tests, kind: "test" },
      ];
  }
}

export function mergeGraphLinks(locale: Locale, ...groups: Array<Array<ContentGraphLink | null | undefined>>): ContentGraphLink[] {
  const seen = new Set<string>();
  const merged: ContentGraphLink[] = [];

  for (const group of groups) {
    for (const item of group) {
      if (!item?.href || !item.label) {
        continue;
      }

      const href = normalizePublicHref(item.href, locale);
      if (!href || seen.has(href)) {
        continue;
      }

      seen.add(href);
      merged.push({
        href,
        label: item.label,
        kind: item.kind ?? inferPublicContentKind(href),
      });
    }
  }

  return merged;
}

export function formatGraphLinkLabel(item: ContentGraphLink, locale: Locale): string {
  const kindLabel = formatPublicContentKind(item.kind ?? inferPublicContentKind(item.href), locale);
  return kindLabel ? `${kindLabel} · ${item.label}` : item.label;
}
