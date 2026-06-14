import type { Locale } from "@/lib/i18n/locales";

export type InternalLinkLabelMap = Record<string, string>;

export type InternalLinkTextPart =
  | { type: "text"; text: string }
  | { type: "link"; href: string; label: string };

const INTERNAL_PATH_RE =
  /\/(?:(?:zh|en)\/)?(?:articles|tests|science|career|personality|topics|method-boundaries|reliability-validity|item-design-notes|common-misconceptions|data-privacy|help|support|business)(?:\/[A-Za-z0-9._~:/?#@!$&'*+,;=%-]+)?/g;

const TRAILING_PUNCTUATION_RE = /[。．，,、；;：:！？!?）)\]】》>]+$/;

const ZH_TEST_LABELS: Record<string, string> = {
  "big-five-personality-test-ocean-model": "大五人格免费测试",
  "enneagram-personality-test-nine-types": "九型人格免费测试",
  "eq-test-emotional-intelligence-assessment": "情商免费测试",
  "holland-career-interest-test-riasec": "霍兰德职业兴趣免费测试",
  "iq-test-intelligence-quotient-assessment": "智商免费测试",
  "mbti-personality-test-16-personality-types": "MBTI免费测试",
};

const EN_TEST_LABELS: Record<string, string> = {
  "big-five-personality-test-ocean-model": "Big Five personality test",
  "enneagram-personality-test-nine-types": "Enneagram personality test",
  "eq-test-emotional-intelligence-assessment": "EQ test",
  "holland-career-interest-test-riasec": "Holland career interest test",
  "iq-test-intelligence-quotient-assessment": "IQ test",
  "mbti-personality-test-16-personality-types": "MBTI personality test",
};

const ZH_ROUTE_LABELS: Record<string, string> = {
  "articles": "文章",
  "business": "企业版",
  "career": "职业中心",
  "common-misconceptions": "测评常见误区",
  "data-privacy": "数据与隐私",
  "help": "帮助",
  "item-design-notes": "题目设计说明",
  "method-boundaries": "方法边界",
  "personality": "人格",
  "reliability-validity": "信度与效度",
  "science": "测评科学",
  "support": "帮助",
  "tests": "测评",
  "topics": "主题聚合",
};

const EN_ROUTE_LABELS: Record<string, string> = {
  "articles": "Articles",
  "business": "Business",
  "career": "Career center",
  "common-misconceptions": "Common misconceptions",
  "data-privacy": "Data and privacy",
  "help": "Help",
  "item-design-notes": "Item design notes",
  "method-boundaries": "Method boundaries",
  "personality": "Personality",
  "reliability-validity": "Reliability and validity",
  "science": "Assessment science",
  "support": "Help",
  "tests": "Assessments",
  "topics": "Topics",
};

function cleanPathCandidate(value: string): { href: string; trailing: string } {
  const trailing = value.match(TRAILING_PUNCTUATION_RE)?.[0] ?? "";
  const href = trailing ? value.slice(0, -trailing.length) : value;
  return { href, trailing };
}

function normalizePathKey(value: string): string {
  const withoutFragment = value.split("#")[0] ?? value;
  const withoutQuery = withoutFragment.split("?")[0] ?? withoutFragment;
  return withoutQuery.replace(/\/+$/, "") || "/";
}

function routeParts(href: string, fallbackLocale: Locale): { locale: Locale; family: string; slug: string | null } | null {
  const normalized = normalizePathKey(href);
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const locale = parts[0] === "en" || parts[0] === "zh" ? parts.shift() as Locale : fallbackLocale;
  const family = parts.shift();
  if (!family) {
    return null;
  }

  return {
    locale,
    family,
    slug: parts.join("/") || null,
  };
}

function humanizeSlug(slug: string, locale: Locale): string {
  const words = slug
    .split(/[-_/]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return slug;
  }

  if (locale === "zh") {
    return words
      .map((word) => {
        const upper = word.toUpperCase();
        return ["EQ", "IQ", "MBTI", "RIASEC"].includes(upper) ? upper : word;
      })
      .join(" ");
  }

  return words
    .map((word) => {
      const upper = word.toUpperCase();
      if (["EQ", "IQ", "MBTI", "RIASEC"].includes(upper)) {
        return upper;
      }
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

export function labelInternalHref(href: string, labelMap: InternalLinkLabelMap = {}, fallbackLocale: Locale = "zh"): string | null {
  const key = normalizePathKey(href);
  const mapped = labelMap[href] ?? labelMap[key];
  if (mapped?.trim()) {
    return mapped.trim();
  }

  const parts = routeParts(href, fallbackLocale);
  if (!parts) {
    return null;
  }

  if (parts.family === "tests" && parts.slug) {
    const labels = parts.locale === "zh" ? ZH_TEST_LABELS : EN_TEST_LABELS;
    return labels[parts.slug] ?? humanizeSlug(parts.slug, parts.locale);
  }

  if (parts.family === "articles" && parts.slug) {
    return humanizeSlug(parts.slug, parts.locale);
  }

  const routeLabels = parts.locale === "zh" ? ZH_ROUTE_LABELS : EN_ROUTE_LABELS;
  if (!parts.slug) {
    return routeLabels[parts.family] ?? humanizeSlug(parts.family, parts.locale);
  }

  return routeLabels[parts.slug] ?? humanizeSlug(parts.slug, parts.locale);
}

export function extractInternalPaths(value: string): string[] {
  const paths = new Set<string>();
  let match: RegExpExecArray | null;

  INTERNAL_PATH_RE.lastIndex = 0;
  while ((match = INTERNAL_PATH_RE.exec(value)) !== null) {
    const raw = match[0] ?? "";
    const { href } = cleanPathCandidate(raw);
    if (href && !href.includes("<") && !href.includes(">")) {
      paths.add(href);
    }
  }

  return Array.from(paths);
}

export function splitInternalLinkText(
  text: string,
  labelMap: InternalLinkLabelMap = {},
  fallbackLocale: Locale = "zh"
): InternalLinkTextPart[] {
  const parts: InternalLinkTextPart[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  INTERNAL_PATH_RE.lastIndex = 0;
  while ((match = INTERNAL_PATH_RE.exec(text)) !== null) {
    const raw = match[0] ?? "";
    const start = match.index;
    const end = start + raw.length;
    const { href, trailing } = cleanPathCandidate(raw);
    const label = labelInternalHref(href, labelMap, fallbackLocale);

    if (!label) {
      continue;
    }

    if (start > cursor) {
      parts.push({ type: "text", text: text.slice(cursor, start) });
    }

    parts.push({ type: "link", href, label });
    if (trailing) {
      parts.push({ type: "text", text: trailing });
    }
    cursor = end;
  }

  if (cursor < text.length) {
    parts.push({ type: "text", text: text.slice(cursor) });
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}
