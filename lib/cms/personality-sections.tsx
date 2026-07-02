import Link from "next/link";
import type { ReactNode } from "react";
import { Leaf, Quote, Search, ShieldCheck } from "lucide-react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import {
  type CmsPersonalitySection,
  type PersonalityProjectionDimension,
  type PersonalityProjectionSection,
  buildPersonalityFrontendUrl,
} from "@/lib/cms/personality";
import { type Locale } from "@/lib/i18n/locales";
import type { FAQItem } from "@/lib/seo/generateSchema";
import { normalizeInternalHref } from "@/lib/url/safeContentUrls";

const KNOWN_SECTION_KEYS = [
  "hero",
  "core_snapshot",
  "strengths",
  "growth_edges",
  "work_style",
  "relationships",
  "communication",
  "stress_and_recovery",
  "career_fit",
  "faq",
  "related_content",
  "quick_answer",
  "meaning",
  "a_t_difference",
  "core_traits",
  "strengths_blind_spots",
  "careers_work_style",
  "relationships_communication",
  "common_misreads",
  "similar_types",
  "side_by_side_summary",
  "core_traits_comparison",
  "stress_confidence",
  "career_work_style",
  "relationships_love",
  "which_one_fits",
  "mbti64_comparison_a_vs_t",
  "mbti64_promotion_metadata",
] as const;

const SUPPORTED_PROJECTION_RENDERS = [
  "rich_text",
  "bullets",
  "faq",
  "letters_intro",
  "trait_dimension_grid",
  "preferred_role_list",
  "premium_teaser",
] as const;

type KnownSectionKey = (typeof KNOWN_SECTION_KEYS)[number];
type SupportedProjectionRender = (typeof SUPPORTED_PROJECTION_RENDERS)[number];

type BulletItem = {
  title?: string;
  body?: string | null;
  description?: string | null;
  summary?: string | null;
};

type FaqItem = {
  question?: string;
  answer?: string | null;
};

type LinkItem = {
  href?: string;
  path?: string;
  slug?: string;
  title?: string;
  label?: string;
  anchor_text?: string;
  role?: string;
  reason?: string | null;
  safe_public_route?: boolean;
  body?: string | null;
  summary?: string | null;
};

type CareerFitPayload = {
  work_env?: string;
  recommended_jobs?: LinkItem[];
  avoid_jobs?: LinkItem[];
};

type LettersIntroLetter = {
  letter: string;
  title: string;
  description: string;
};

type LettersIntroPayload = {
  headline: string | null;
  letters: LettersIntroLetter[];
};

type PreferredRoleGroup = {
  groupTitle: string;
  description: string;
  examples: string[];
};

type PreferredRolePayload = {
  title: string | null;
  intro: string | null;
  groups: PreferredRoleGroup[];
};

type TitledDetailItem = {
  title?: string;
  detail?: string | null;
  body?: string | null;
  summary?: string | null;
};

type ReaderExperiencePayload = {
  thirty_second_overview?: unknown[];
  ai_search_answer?: Record<string, unknown> | null;
  strengths?: TitledDetailItem[];
  watch_outs?: TitledDetailItem[];
  at_difference_scenarios?: Record<string, unknown> | null;
  work_decision_card?: Record<string, unknown> | null;
  relationship_communication_card?: Record<string, unknown> | null;
  pressure_growth_card?: Record<string, unknown> | null;
};

type ModulePayload = {
  id?: string;
  title?: string;
  insight?: string | null;
  paragraphs?: unknown[];
};

const MBTI64_PROMOTED_DETAIL_SECTION_KEYS = new Set([
  "meaning",
  "a_t_difference",
  "core_traits",
  "strengths_blind_spots",
  "careers_work_style",
  "relationships_communication",
  "common_misreads",
  "similar_types",
]);

const MBTI64_V85_FIRST_CLASS_SECTION_PREFIX = "v8_5_";

const MBTI64_V85_FIRST_CLASS_SECTION_KEYS = new Set([
  "v8_5_thirty_second_overview",
  "v8_5_ai_search_answer",
  "v8_5_strengths_watchouts",
  "v8_5_at_difference_scenarios",
  "v8_5_module_01_core_reading",
  "v8_5_module_02_judgment_style",
  "v8_5_module_03_agency_boundary",
  "v8_5_module_04_standards_drive",
  "v8_5_module_05_learning_revision",
  "v8_5_module_06_stress_blindspot",
  "v8_5_module_07_social_feedback",
  "v8_5_module_08_career_workflow",
  "v8_5_module_09_relationships",
  "v8_5_module_10_faq_boundary",
  "v8_5_work_decision",
  "v8_5_relationship_communication",
  "v8_5_pressure_growth",
  "v8_5_search_user_paths",
]);

const MBTI64_V85_READER_VISIBLE_SECTION_KEYS = new Set([
  "v8_5_thirty_second_overview",
  "v8_5_ai_search_answer",
  "v8_5_strengths_watchouts",
  "v8_5_at_difference_scenarios",
  "v8_5_module_01_core_reading",
  "v8_5_module_02_judgment_style",
  "v8_5_module_03_agency_boundary",
  "v8_5_module_04_standards_drive",
  "v8_5_module_05_learning_revision",
  "v8_5_module_06_stress_blindspot",
  "v8_5_module_07_social_feedback",
  "v8_5_module_08_career_workflow",
  "v8_5_module_09_relationships",
  "v8_5_module_10_faq_boundary",
]);

const MBTI64_V85_READER_MODULE_SECTION_KEYS = new Set([
  "v8_5_module_01_core_reading",
  "v8_5_module_02_judgment_style",
  "v8_5_module_03_agency_boundary",
  "v8_5_module_04_standards_drive",
  "v8_5_module_05_learning_revision",
  "v8_5_module_06_stress_blindspot",
  "v8_5_module_07_social_feedback",
  "v8_5_module_08_career_workflow",
  "v8_5_module_09_relationships",
  "v8_5_module_10_faq_boundary",
]);

const MBTI64_V85_READER_ACTION_HEADING_COPY: Record<string, { zh: string; en: string }> = {
  v8_5_module_01_core_reading: { zh: "运行模式观察", en: "Operating pattern signals" },
  v8_5_module_02_judgment_style: { zh: "判断校准重点", en: "Judgment calibration points" },
  v8_5_module_04_standards_drive: { zh: "高标准使用方式", en: "How to use high standards" },
  v8_5_module_05_learning_revision: { zh: "学习修正线索", en: "Learning and revision signals" },
  v8_5_module_06_stress_blindspot: { zh: "压力信号识别", en: "Stress signal recognition" },
  v8_5_module_07_social_feedback: { zh: "反馈沟通练习", en: "Feedback communication practice" },
  v8_5_module_08_career_workflow: { zh: "职业匹配观察", en: "Career fit observations" },
  v8_5_module_09_relationships: { zh: "关系修复线索", en: "Relationship repair signals" },
  v8_5_module_10_faq_boundary: { zh: "安全使用清单", en: "Safe-use checklist" },
};

export type RenderableProjectionSection = {
  key: string;
  title: string;
  render: SupportedProjectionRender;
  bodyMd: string;
  payload: Record<string, unknown> | null;
  source: string | null;
};

function isKnownSectionKey(value: string): value is KnownSectionKey {
  return KNOWN_SECTION_KEYS.includes(value as KnownSectionKey);
}

export function isMbti64V85FirstClassSectionKey(value: string): boolean {
  return value.startsWith(MBTI64_V85_FIRST_CLASS_SECTION_PREFIX) && MBTI64_V85_FIRST_CLASS_SECTION_KEYS.has(value);
}

function isMbti64V85ReaderModuleSectionKey(value: string): boolean {
  return MBTI64_V85_READER_MODULE_SECTION_KEYS.has(value);
}

function mbti64V85ReaderActionHeading(sectionKey: string, locale: Locale): string {
  const copy = MBTI64_V85_READER_ACTION_HEADING_COPY[sectionKey];
  return copy ? copy[locale] : locale === "zh" ? "阅读要点" : "Reading notes";
}

export function partitionPersonalitySectionsForV85(sections: CmsPersonalitySection[]): {
  v85Sections: CmsPersonalitySection[];
  legacySections: CmsPersonalitySection[];
} {
  return sections.reduce(
    (partitioned, section) => {
      if (isMbti64V85FirstClassSectionKey(section.sectionKey) && MBTI64_V85_READER_VISIBLE_SECTION_KEYS.has(section.sectionKey)) {
        partitioned.v85Sections.push(section);
      } else if (!isMbti64V85FirstClassSectionKey(section.sectionKey)) {
        partitioned.legacySections.push(section);
      }

      return partitioned;
    },
    { v85Sections: [] as CmsPersonalitySection[], legacySections: [] as CmsPersonalitySection[] }
  );
}

function isSupportedProjectionRender(value: string): value is SupportedProjectionRender {
  return SUPPORTED_PROJECTION_RENDERS.includes(value as SupportedProjectionRender);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

const FORBIDDEN_PUBLIC_CONTENT_ROUTE_RE =
  /(?:^|\/)(?:result|results|orders|share|pay|payment|history|private|account)(?:\/|$)|(?:[?&](?:token|session|user|result_id|report_id|order_no)=)/i;

const ALLOWED_PUBLIC_CONTENT_ROUTE_RE =
  /^\/(?:en|zh)\/(?:personality(?:\/[a-z0-9-]+)?|tests\/(?:mbti-personality-test-16-personality-types|big-five-personality-test-ocean-model|holland-career-interest-test-riasec))(?:#[A-Za-z0-9][\w:.-]{0,127})?$/;

function isSafePublicPersonalityHref(href: string | null): href is string {
  if (!href || FORBIDDEN_PUBLIC_CONTENT_ROUTE_RE.test(href)) {
    return false;
  }

  return ALLOWED_PUBLIC_CONTENT_ROUTE_RE.test(href);
}

function isSafeExternalReferenceHref(href: string | null): href is string {
  if (!href) {
    return false;
  }

  try {
    const parsed = new URL(href);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

const SOURCE_LEDGER_REFERENCE_HREFS: Record<string, string> = {
  mccrae_costa_1989: "https://doi.org/10.1111/j.1467-6494.1989.tb00759.x",
  pittenger_2005: "https://doi.org/10.1037/1065-9293.57.3.210",
  holland_1997:
    "https://search.worldcat.org/title/Making-vocational-choices-%3A-a-theory-of-vocational-personalities-and-work-environments/oclc/36648506",
};

type SourceLedgerDisplayCopy = {
  displayTitle: string;
  href: string | null;
  linkLabel: string;
  note: string;
  sourceTypeLabel: string;
};

function getSourceLedgerReferenceKind(id: string, label: string, sourceTitle: string) {
  const haystack = `${id} ${label} ${sourceTitle}`.toLowerCase();

  if (haystack.includes("mccrae") || haystack.includes("costa") || haystack.includes("five-factor")) {
    return "mccrae_costa_1989";
  }

  if (haystack.includes("pittenger") || haystack.includes("cautionary comments")) {
    return "pittenger_2005";
  }

  if (haystack.includes("holland") || haystack.includes("vocational choices")) {
    return "holland_1997";
  }

  if (haystack.includes("fermatmind") || haystack.includes("content contract")) {
    return "fermatmind_content_contract_2026";
  }

  return id;
}

function isSafeSourceLedgerHref(href: string | null): href is string {
  if (!href) {
    return false;
  }

  if (href.startsWith("/zh/") || href.startsWith("/en/")) {
    return !FORBIDDEN_PUBLIC_CONTENT_ROUTE_RE.test(href);
  }

  return isSafeExternalReferenceHref(href);
}

function getSourceLedgerReferenceHref(kind: string, explicitHref: string, locale: Locale): string | null {
  const candidate =
    kind === "fermatmind_content_contract_2026"
      ? `/${locale}/method-boundaries`
      : explicitHref || SOURCE_LEDGER_REFERENCE_HREFS[kind] || "";
  return isSafeSourceLedgerHref(candidate) ? candidate : null;
}

function getSourceLedgerDisplayCopy(reference: {
  kind: string;
  href: string | null;
  sourceTitle: string;
  summary: string;
}, locale: Locale): SourceLedgerDisplayCopy {
  const fallbackTitle = reference.sourceTitle || (locale === "zh" ? "来源说明" : "Source note");
  const fallbackNote = reference.summary || (locale === "zh" ? "用于说明本页解释边界。" : "Used to explain this page's interpretation boundary.");

  if (locale !== "zh") {
    switch (reference.kind) {
      case "mccrae_costa_1989":
        return {
          displayTitle: "McCrae & Costa (1989)",
          href: reference.href,
          linkLabel: reference.sourceTitle || "Reinterpreting the Myers-Briggs Type Indicator From the Perspective of the Five-Factor Model of Personality",
          note: "Used as a validity boundary: this page treats type language as a self-reflection aid, not as a replacement for broader trait evidence.",
          sourceTypeLabel: "Method source",
        };
      case "pittenger_2005":
        return {
          displayTitle: "Pittenger (2005)",
          href: reference.href,
          linkLabel: reference.sourceTitle || "Cautionary Comments Regarding the Myers-Briggs Type Indicator",
          note: "Used to keep interpretation cautious: profile language can organize observations, but should not become diagnosis, hiring screening, or ability ranking.",
          sourceTypeLabel: "Method source",
        };
      case "holland_1997":
        return {
          displayTitle: "Holland (1997)",
          href: reference.href,
          linkLabel: reference.sourceTitle || "Making Vocational Choices",
          note: "Used as a career-interest boundary: RIASEC can complement personality reading, but personality type should not decide a career path by itself.",
          sourceTypeLabel: "Method source",
        };
      case "fermatmind_content_contract_2026":
        return {
          displayTitle: "FermatMind content contract (2026)",
          href: reference.href,
          linkLabel: "FermatMind 2026 assessment model and scientific boundary notes",
          note: "Explains the site-level rules for public profile pages, source use, safety boundaries, and non-diagnostic interpretation.",
          sourceTypeLabel: "Site boundary",
        };
      default:
        return {
          displayTitle: fallbackTitle,
          href: reference.href,
          linkLabel: fallbackTitle,
          note: fallbackNote,
          sourceTypeLabel: "Source note",
        };
    }
  }

  switch (reference.kind) {
    case "mccrae_costa_1989":
      return {
        displayTitle: "McCrae & Costa（1989）｜五因素模型视角下重新理解 MBTI",
        href: reference.href,
        linkLabel: "查看 DOI / 期刊记录",
        note: "这条引用用来说明交叉验证思路：MBTI 可以整理偏好语言，但涉及稳定人格特质时，应同时参考 Big Five 等维度模型，避免把四字母类型当成完整心理测量结论。",
        sourceTypeLabel: "学术引用",
      };
    case "pittenger_2005":
      return {
        displayTitle: "Pittenger（2005）｜MBTI 使用的审慎提醒",
        href: reference.href,
        linkLabel: "查看 DOI / 论文记录",
        note: "这条引用提醒页面使用边界：类型结果适合帮助用户复盘沟通、压力和选择习惯，不适合承担诊断、招聘筛选、智商判断或职业命运预测。",
        sourceTypeLabel: "学术引用",
      };
    case "holland_1997":
      return {
        displayTitle: "Holland（1997）｜职业兴趣与工作环境匹配",
        href: reference.href,
        linkLabel: "查看书目记录",
        note: "这条引用支撑职业部分的方法边界：RIASEC 解释职业兴趣和环境匹配，MBTI 解释决策与沟通偏好；职业选择需要把两类线索与现实能力、经验和机会一起看。",
        sourceTypeLabel: "学术引用",
      };
    case "fermatmind_content_contract_2026":
      return {
        displayTitle: "费马测试内容边界（2026）",
        href: reference.href,
        linkLabel: "查看费马测试方法边界说明",
        note: "费马测试 2026 年网站测试模型学术与科学边界说明：本站把人格结果定位为自我理解、沟通和交叉验证入口，不把任何类型标签作为诊断、筛选、录用或人生定论。",
        sourceTypeLabel: "站内说明",
      };
    default:
      return {
        displayTitle: fallbackTitle,
        href: reference.href,
        linkLabel: fallbackTitle,
        note: fallbackNote,
        sourceTypeLabel: "来源说明",
      };
  }
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href);
}

const PROJECTION_SECTION_TITLE_COPY: Record<string, { zh: string; en: string }> = {
  quick_answer: { zh: "快速答案", en: "Quick answer" },
  faq: { zh: "常见问题", en: "Frequently asked questions" },
  meaning: { zh: "这个类型是什么意思", en: "What this type means" },
  a_t_difference: { zh: "A/T 差异", en: "A/T difference" },
  core_traits: { zh: "核心特征", en: "Core traits" },
  strengths_blind_spots: { zh: "优势与盲区", en: "Strengths and blind spots" },
  careers_work_style: { zh: "职业与工作风格", en: "Careers and work style" },
  relationships_communication: { zh: "关系与沟通", en: "Relationships and communication" },
  common_misreads: { zh: "常见误读", en: "Common misreads" },
  similar_types: { zh: "相近类型", en: "Similar types" },
  side_by_side_summary: { zh: "并排对比", en: "Side-by-side summary" },
  core_traits_comparison: { zh: "核心特征对比", en: "Core traits comparison" },
  stress_confidence: { zh: "压力与自信", en: "Stress and confidence" },
  career_work_style: { zh: "职业与工作风格", en: "Career and work style" },
  relationships_love: { zh: "关系与亲密关系", en: "Relationships and love" },
  which_one_fits: { zh: "哪个更像你", en: "Which one fits" },
  mbti64_comparison_a_vs_t: { zh: "A/T 对比", en: "A/T comparison" },
  mbti64_promotion_metadata: { zh: "学术与科学性", en: "Research and method boundaries" },
  v8_5_thirty_second_overview: { zh: "类型导读", en: "Introduction" },
  v8_5_ai_search_answer: { zh: "快速理解这个类型", en: "At a glance" },
  v8_5_strengths_watchouts: { zh: "优势与容易忽略的代价", en: "Strengths & Watch-outs" },
  v8_5_at_difference_scenarios: { zh: "A 型与 T 型的差别", en: "Assertive vs. Turbulent" },
  v8_5_module_01_core_reading: { zh: "这种类型如何运作", en: "How this type works" },
  v8_5_module_02_judgment_style: { zh: "他们如何判断与做决定", en: "How they judge and decide" },
  v8_5_module_03_agency_boundary: { zh: "独立、边界与掌控感", en: "Independence and boundaries" },
  v8_5_module_04_standards_drive: { zh: "高标准从哪里来", en: "Where the high standards come from" },
  v8_5_module_05_learning_revision: { zh: "好奇心、学习和修正", en: "Curiosity, learning, and revision" },
  v8_5_module_06_stress_blindspot: { zh: "压力下会发生什么", en: "What happens under stress" },
  v8_5_module_07_social_feedback: { zh: "社交、反馈与被误读", en: "Social feedback and misreads" },
  v8_5_module_08_career_workflow: { zh: "工作、职业和协作方式", en: "Career paths and workplace habits" },
  v8_5_module_09_relationships: { zh: "关系、亲密和沟通", en: "Relationships and communication" },
  v8_5_module_10_faq_boundary: { zh: "如何安全使用这个结果", en: "How to use this result safely" },
  v8_5_work_decision: { zh: "工作决策场景", en: "Work decision scenario" },
  v8_5_relationship_communication: { zh: "关系与沟通场景", en: "Relationship and communication" },
  v8_5_pressure_growth: { zh: "压力与成长", en: "Pressure and growth" },
  v8_5_search_user_paths: { zh: "下一步阅读", en: "Continue reading" },
  related_content: { zh: "相关内容", en: "Related content" },
  overview: { zh: "这个类型是什么", en: "What this type means" },
  letters_intro: { zh: "类型字母拆解", en: "Type letter breakdown" },
  trait_overview: { zh: "常见特征", en: "Common traits" },
  "career.summary": { zh: "职业倾向", en: "Career direction" },
  "career.advantages": { zh: "职业优势", en: "Career advantages" },
  "career.weaknesses": { zh: "职业风险", en: "Career weaknesses" },
  "career.preferred_roles": { zh: "适合工作", en: "Best-fit work" },
  "career.upgrade_suggestions": { zh: "职业升级建议", en: "Career upgrade suggestions" },
  "growth.summary": { zh: "成长总览", en: "Growth summary" },
  "growth.strengths": { zh: "优势", en: "Strengths" },
  "growth.weaknesses": { zh: "弱点", en: "Weak spots" },
  "growth.motivators": { zh: "成长动力", en: "Growth motivators" },
  "growth.drainers": { zh: "能量消耗", en: "Growth drainers" },
  "relationships.summary": { zh: "爱情 / 关系", en: "Relationships" },
  "relationships.strengths": { zh: "关系优势", en: "Relationships strengths" },
  "relationships.weaknesses": { zh: "关系风险", en: "Relationships weaknesses" },
  "relationships.rel_advantages": { zh: "关系优势场景", en: "Relationship advantages" },
  "relationships.rel_risks": { zh: "关系风险场景", en: "Relationship risks" },
};

function projectionSectionTitle(sectionKey: string, fallbackTitle: string, locale: Locale): string {
  const copy = PROJECTION_SECTION_TITLE_COPY[sectionKey];
  if (!copy) {
    return fallbackTitle;
  }

  return locale === "zh" ? copy.zh : copy.en;
}

function stripZhTraitSuffix(title: string, locale: Locale): string {
  if (locale !== "zh") {
    return title;
  }

  return title.replace(/（-?[A-Z]）$/, "").trim();
}

const ZH_MARKDOWN_LABEL_PREFIX_COPY: Record<string, string> = {
  at_difference: "A/T 差异",
  best_fit: "适合任务",
  boundary: "使用边界",
  care_language: "表达在意",
  career: "职业",
  communication: "沟通",
  compensation: "补偿行为",
  conflict_pattern: "冲突处理",
  growth: "成长",
  likely_stuck: "容易卡住",
  misread: "容易被误读",
  not_for: "不能用于",
  pressure: "压力",
  relationship: "关系",
  relationships: "关系",
  signals: "压力信号",
  strength: "优势",
  strengths: "优势",
  watch_out: "注意风险",
  watch_outs: "注意风险",
  watchouts: "注意风险",
  weekly_experiment: "本周练习",
  what_is: "这个类型是什么",
  work: "工作",
  work_pattern: "工作表现",
  relationship_pattern: "关系沟通",
};

const ZH_MARKDOWN_VISIBLE_PHRASE_COPY: Array<[RegExp, string]> = [
  [/\bFrequently asked questions\b/g, "常见问题"],
  [/\bStrengths\s*\/\s*Watch-outs\b/g, "优势 / 注意风险"],
  [/\bStrengths\b/g, "优势"],
  [/\bWatch-outs\b/g, "注意风险"],
  [/\brelated_content\b/g, "相关内容"],
];

function localizeMarkdownLabelPrefixes(body: string, locale: Locale): string {
  if (locale !== "zh" || !body.trim()) {
    return body;
  }

  const localizedLabels = body.replace(
    /^(\s*(?:[-*+]\s+|\d+\.\s+)?)([a-z][a-z_ -]*):(?=\s)/gim,
    (match, prefix: string, rawKey: string) => {
      const normalizedKey = rawKey.trim().toLowerCase().replace(/[\s-]+/g, "_");
      const label = ZH_MARKDOWN_LABEL_PREFIX_COPY[normalizedKey];
      return label ? `${prefix}${label}：` : match;
    }
  );

  return ZH_MARKDOWN_VISIBLE_PHRASE_COPY.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    localizedLabels
  );
}

function renderLocalizedMarkdown(body: string, locale: Locale, minimumHeadingLevel: 1 | 2 | 3 | 4 | 5 | 6) {
  return renderSimpleMarkdown(localizeMarkdownLabelPrefixes(body, locale), {
    locale,
    minimumHeadingLevel,
  });
}

function renderSectionCard(
  sectionKey: string,
  title: string,
  content: ReactNode,
  locale?: Locale,
  options: { preserveBackendTitle?: boolean; editorialPriority?: boolean } = {}
) {
  const displayTitle =
    options.preserveBackendTitle && normalizeText(title)
      ? title
      : locale
        ? projectionSectionTitle(sectionKey, title, locale)
        : title;

  if (isMbti64V85ReaderModuleSectionKey(sectionKey)) {
    return (
      <section
        key={sectionKey}
        id={sectionKey}
        data-section-key={sectionKey}
        data-testid="personality-v85-editorial-section-card"
        className="py-8 first:pt-0"
      >
        <article className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white px-6 py-7 shadow-[0_14px_34px_rgba(15,23,42,0.045)] sm:px-8 sm:py-8">
          <header className="mb-6 flex items-start gap-4 border-b border-[rgba(16,24,40,0.10)] pb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7d5aa6]/12 text-[#76598d]">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 space-y-3">
              <h2 className="m-0 text-3xl font-semibold leading-tight text-[#263241] sm:text-4xl">
                {displayTitle}
              </h2>
            </div>
          </header>
          {content}
        </article>
      </section>
    );
  }

  if (options.editorialPriority) {
    return (
      <section
        key={sectionKey}
        id={sectionKey}
        data-section-key={sectionKey}
        data-testid="personality-v85-editorial-section-card"
        className="border-b border-[rgba(16,24,40,0.10)] py-12 first:pt-0 last:border-b-0"
      >
        <header className="mb-6">
          <h2 className="m-0 text-4xl font-semibold leading-tight text-[#2f3744]">
            {displayTitle}
          </h2>
        </header>
        <div className="space-y-8 text-[17px] leading-8 text-[#3d4652]">
          {content}
        </div>
      </section>
    );
  }

  if (sectionKey === "letters_intro" || sectionKey === "trait_overview") {
    return (
      <section
        key={sectionKey}
        id={sectionKey}
        data-section-key={sectionKey}
        className="border-b border-[rgba(16,24,40,0.10)] py-10 first:pt-0"
      >
        <header className="mb-5">
          <h2 className="m-0 text-2xl font-semibold leading-tight tracking-tight text-[#263241] sm:text-3xl">
            {displayTitle}
          </h2>
        </header>
        <div className="text-[15px] leading-7 text-[#59675f]">
          {content}
        </div>
      </section>
    );
  }

  return (
    <Card key={sectionKey} id={sectionKey} data-section-key={sectionKey}>
      <CardHeader>
        <h2 className="m-0 text-xl font-semibold leading-tight tracking-tight text-[var(--fm-text)]">{displayTitle}</h2>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">{content}</CardContent>
    </Card>
  );
}

function renderPlainMarkdown(body: string, className: string, locale: Locale) {
  if (!body.trim()) {
    return null;
  }

  return <div className={className}>{renderLocalizedMarkdown(body, locale, 3)}</div>;
}

function renderRichTextBlock(bodyHtml: string, bodyMd: string, locale: Locale) {
  if (bodyHtml.trim()) {
    return (
      <SanitizedCmsHtml
        className="space-y-5 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline [&_p]:leading-8 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
        html={bodyHtml}
        locale={locale}
      />
    );
  }

  return renderPlainMarkdown(bodyMd, "space-y-5 leading-8 text-[var(--fm-text)]", locale);
}

function renderBulletItems(items: BulletItem[]) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 space-y-2 pl-5 text-[var(--fm-text-muted)]">
      {items.map((item, index) => {
        const title = normalizeText(item.title);
        const body = normalizeText(item.body ?? item.description ?? item.summary);
        const label = title || body;

        if (!label) {
          return null;
        }

        return (
          <li key={`${label}-${index}`}>
            <span className="font-medium text-[var(--fm-text)]">{title || label}</span>
            {body && body !== title ? <span className="text-[var(--fm-text-muted)]"> - {body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderLegacyBulletsSection(section: CmsPersonalitySection) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<BulletItem>(payload?.items);
  const renderedItems = renderBulletItems(items);

  if (renderedItems) {
    return renderedItems;
  }

  if (section.bodyMd.trim()) {
    const fallbackItems = section.bodyMd
      .split("\n")
      .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
      .filter(Boolean)
      .map((item) => ({ title: item }));

    return renderBulletItems(fallbackItems);
  }

  return null;
}

function renderLegacyFaqSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const items = asArray<FaqItem>(payload?.items);

  if (items.length === 0) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  return (
    <dl className="m-0 space-y-4">
      {items.map((item, index) => {
        const question = normalizeText(item.question);
        const answer = normalizeText(item.answer);

        if (!question && !answer) {
          return null;
        }

        return (
          <div key={`${question}-${index}`} className="space-y-1">
            <dt className="font-medium text-[var(--fm-text)]">{question || `Q${index + 1}`}</dt>
            {answer ? <dd className="m-0 text-[var(--fm-text-muted)]">{answer}</dd> : null}
          </div>
        );
      })}
    </dl>
  );
}

function normalizeLinkItems(
  items: LinkItem[],
  locale: Locale
): Array<Required<Pick<LinkItem, "title">> & { href: string | null; summary: string }> {
  return items
    .map((item) => {
      const title = normalizeText(item.title || item.label || item.anchor_text);
      const summary = normalizeText(item.summary ?? item.body ?? item.reason);
      const href = normalizeInternalHref(item.href ?? item.path);
      const slug = normalizeText(item.slug);
      const safePublicRoute = item.safe_public_route;

      if (!title) {
        return null;
      }

      if (safePublicRoute === false) {
        return null;
      }

      if (href && isSafePublicPersonalityHref(href)) {
        return { title, href, summary };
      }

      if (normalizeText(item.href)) {
        return null;
      }

      if (slug) {
        const personalityHref = buildPersonalityFrontendUrl(locale, slug);
        return isSafePublicPersonalityHref(personalityHref)
          ? { title, href: personalityHref, summary }
          : null;
      }

      return { title, href: null, summary };
    })
    .filter((item): item is Required<Pick<LinkItem, "title">> & { href: string | null; summary: string } => item !== null);
}

function renderGenericCards(items: Array<{ title: string; href: string | null; summary: string }>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.href ?? "plain"}`}
          className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 transition-colors hover:border-[var(--fm-accent)]/40"
        >
          {item.href ? (
            <Link href={item.href} className="font-semibold text-[var(--fm-text)] hover:text-[var(--fm-accent)]">
              {item.title}
            </Link>
          ) : (
            <p className="m-0 font-semibold text-[var(--fm-text)]">{item.title}</p>
          )}
          {item.summary ? <p className="mb-0 mt-2 text-sm text-[var(--fm-text-muted)]">{item.summary}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderLegacyCareerFitSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson) as CareerFitPayload | null;
  const recommended = normalizeLinkItems(asArray<LinkItem>(payload?.recommended_jobs), locale);
  const avoid = normalizeLinkItems(asArray<LinkItem>(payload?.avoid_jobs), locale);
  const workEnv = normalizeText(payload?.work_env);

  return (
    <div className="space-y-4">
      {section.bodyMd.trim() ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{section.bodyMd}</p> : null}
      {workEnv ? (
        <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text-muted)]">
          <p className="m-0 font-medium text-[var(--fm-text)]">
            {locale === "zh" ? "最适合的环境" : "Best-fit environment"}
          </p>
          <p className="mb-0 mt-2">{workEnv}</p>
        </div>
      ) : null}
      {recommended.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "推荐角色" : "Recommended roles"}
          </h3>
          {renderGenericCards(recommended)}
        </div>
      ) : null}
      {avoid.length > 0 ? (
        <div className="space-y-3">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "需要谨慎的方向" : "Use caution with"}
          </h3>
          {renderGenericCards(avoid)}
        </div>
      ) : null}
    </div>
  );
}

function renderLegacyCardsSection(section: CmsPersonalitySection, locale: Locale) {
  if (section.sectionKey === "career_fit") {
    return renderLegacyCareerFitSection(section, locale);
  }

  const payload = asRecord(section.payloadJson);
  const items = normalizeLinkItems(
    [...asArray<LinkItem>(payload?.items), ...asArray<LinkItem>(payload?.links)],
    locale
  );
  const renderedCards = renderGenericCards(items);

  if (renderedCards) {
    return renderedCards;
  }

  return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
}

function renderSafeInternalLinks(items: LinkItem[], locale: Locale) {
  const links = normalizeLinkItems(items, locale).filter((item) => item.href);

  if (links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3" data-testid="mbti64-safe-internal-links">
      {renderGenericCards(links)}
    </div>
  );
}

function renderBoundaryCallouts(payload: Record<string, unknown> | null, locale: Locale) {
  const rawRow = asRecord(payload?.raw_row);
  const structuredMetadata = asRecord(payload?.structured_metadata);
  const methodBoundary = normalizeText(rawRow?.method_boundary ?? structuredMetadata?.method_boundary);
  const trademarkBoundary = normalizeText(rawRow?.trademark_boundary ?? structuredMetadata?.trademark_boundary);
  const items = [
    methodBoundary
      ? {
          key: "method-boundary",
          title: locale === "zh" ? "学术与科学性" : "Research and method boundaries",
          body: methodBoundary,
        }
      : null,
    trademarkBoundary
      ? {
          key: "trademark-boundary",
          title: locale === "zh" ? "商标与体系边界" : "Trademark and framework boundary",
          body: trademarkBoundary,
        }
      : null,
  ].filter((item): item is { key: string; title: string; body: string } => item !== null);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <aside
          key={item.key}
          id={item.key}
          className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          data-testid={`mbti64-${item.key}`}
        >
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.title}</h3>
          <p className="mb-0 mt-2 leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
        </aside>
      ))}
    </div>
  );
}

function firstTextValue(...values: unknown[]): string {
  for (const value of values) {
    const text = normalizeText(value);
    if (text) {
      return text;
    }
  }

  return "";
}

function contentBodyFromValue(value: unknown): string {
  if (typeof value === "string") {
    return normalizeText(value);
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  return normalizeText(record.body ?? record.summary ?? record.text ?? record.answer);
}

function renderNamedTextList(title: string, items: unknown[], key: string) {
  const normalizedItems = items.map((item) => normalizeText(item)).filter(Boolean);
  if (normalizedItems.length === 0) {
    return null;
  }

  return (
    <section key={key} className="space-y-4" data-testid={`mbti64-detail-list-${key}`}>
      <h3 className="m-0 text-lg font-semibold text-[#2f3744]">{title}</h3>
      <ul className="m-0 space-y-3 border-l-4 border-[var(--fm-accent)] pl-5 text-[#3d4652]">
        {normalizedItems.map((item, index) => (
          <li
            key={item}
            className="list-none leading-8"
          >
            <span className="mr-2 font-semibold text-[var(--fm-accent)]">{index + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function renderTitledDetailCards(title: string, items: TitledDetailItem[] | undefined, key: string) {
  const cards = asArray<TitledDetailItem>(items)
    .map((item) => ({
      title: normalizeText(item.title),
      detail: normalizeText(item.detail ?? item.body ?? item.summary),
    }))
    .filter((item) => item.title || item.detail);

  if (cards.length === 0) {
    return null;
  }

  return (
    <section key={key} className="space-y-4" data-testid={`mbti64-v85-${key}`}>
      <h3 className="m-0 text-lg font-semibold text-[#2f3744]">{title}</h3>
      <div className="space-y-4">
        {cards.map((item, index) => (
          <article
            key={`${item.title || item.detail}-${index}`}
            className="border-l-4 border-[rgba(23,98,135,0.35)] bg-[rgba(23,98,135,0.05)] px-5 py-4"
          >
            {item.title ? <p className="m-0 font-semibold text-[#2f3744]">{item.title}</p> : null}
            {item.detail ? <p className="mb-0 mt-2 leading-8 text-[#3d4652]">{item.detail}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function renderRecordCard(title: string, value: Record<string, unknown> | null | undefined, key: string, locale: Locale) {
  const rows = Object.entries(value ?? {})
    .map(([rowKey, rowValue]) => ({
      key: rowKey,
      body: contentBodyFromValue(rowValue),
    }))
    .filter((row) => row.body);

  if (rows.length === 0) {
    return null;
  }

  const rowLabels: Record<string, { zh: string; en: string }> = {
    what_is: { zh: "是什么", en: "What it means" },
    at_difference: { zh: "A/T 最大区别", en: "A/T difference" },
    work_pattern: { zh: "工作表现", en: "Work pattern" },
    relationship_pattern: { zh: "关系沟通", en: "Relationship pattern" },
    not_for: { zh: "不能怎么用", en: "What not to use it for" },
    work: { zh: "工作场景", en: "Work scenario" },
    relationship: { zh: "关系沟通", en: "Relationship scenario" },
    pressure: { zh: "压力反馈", en: "Pressure response" },
    best_fit: { zh: "适合的任务结构", en: "Best-fit task structure" },
    likely_stuck: { zh: "容易卡住的协作场景", en: "Likely stuck points" },
    boundary: { zh: "使用边界", en: "Boundary" },
    care_language: { zh: "表达在意的方式", en: "Care language" },
    conflict_pattern: { zh: "冲突处理", en: "Conflict pattern" },
    misread: { zh: "容易被误读", en: "Common misread" },
    signals: { zh: "压力信号", en: "Pressure signals" },
    compensation: { zh: "补偿行为", en: "Compensation pattern" },
    weekly_experiment: { zh: "本周成长实验", en: "Weekly experiment" },
  };

  return (
    <section key={key} className="space-y-4" data-testid={`mbti64-v85-${key}`}>
      <h3 className="m-0 text-lg font-semibold text-[#2f3744]">{title}</h3>
      <div className="space-y-4">
        {rows.map((row) => {
          const label = rowLabels[row.key]?.[locale] ?? row.key.replace(/_/g, " ");

          return (
            <article key={row.key} className="border-b border-[rgba(16,24,40,0.10)] pb-4 last:border-b-0 last:pb-0">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{label}</p>
              <p className="mb-0 mt-2 leading-8 text-[#3d4652]">{row.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderThirtySecondOverview(items: unknown[] | undefined, locale: Locale) {
  const points = asArray<unknown>(items)
    .map((item) => normalizeText(item))
    .filter(Boolean);

  if (points.length === 0) {
    return null;
  }

  return renderNamedTextList(locale === "zh" ? "30 秒速览" : "30-second overview", points, "thirty-second-overview");
}

function renderStructuredModules(modules: unknown, locale: Locale) {
  const moduleRows = asArray<ModulePayload>(modules)
    .map((item) => ({
      id: normalizeText(item.id),
      title: normalizeText(item.title),
      insight: normalizeText(item.insight),
      paragraphs: asArray<unknown>(item.paragraphs)
        .map((paragraph) => normalizeText(paragraph))
        .filter(Boolean),
    }))
    .filter((item) => item.title || item.insight || item.paragraphs.length > 0);

  if (moduleRows.length === 0) {
    return null;
  }

  return (
    <section key="modules" className="space-y-6" data-testid="mbti64-v85-modules">
      <h3 className="m-0 text-xl font-semibold text-[#2f3744]">
        {locale === "zh" ? "深度解读模块" : "Deep-dive modules"}
      </h3>
      <div className="space-y-8">
        {moduleRows.map((item, index) => (
          <article
            key={`${item.id || item.title}-${index}`}
            className="space-y-5 border-t border-[rgba(16,24,40,0.10)] pt-8 first:border-t-0 first:pt-0"
          >
            {item.title ? <h4 className="m-0 text-3xl font-semibold leading-tight text-[#2f3744]">{item.title}</h4> : null}
            {item.insight ? (
              <p className="m-0 border-l-4 border-[var(--fm-accent)] bg-[rgba(23,98,135,0.05)] px-5 py-4 text-base font-semibold leading-8 text-[#2f3744]">
                {item.insight}
              </p>
            ) : null}
            {item.paragraphs.length > 0 ? (
              <div className="space-y-5 text-[#3d4652]">
                {item.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="m-0 leading-8">
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function resolveStructuredRecommendationPayload(payload: Record<string, unknown> | null): Record<string, unknown> | null {
  const raw = asRecord(payload?.raw);
  const rawRow = asRecord(payload?.raw_row);
  const recommendation = asRecord(payload?.recommendation);
  const rawRowRecommendations = asRecord(rawRow?.recommendations);

  return recommendation ?? rawRowRecommendations ?? rawRow ?? raw ?? payload;
}

function renderMbti64ReaderExperiencePayload(payload: Record<string, unknown> | null, locale: Locale) {
  const recommendation = resolveStructuredRecommendationPayload(payload);
  const readerExperience = asRecord(recommendation?.reader_experience) as ReaderExperiencePayload | null;
  const geoSummary = asRecord(recommendation?.geo_summary);
  const aiSearchAnswer =
    asRecord(readerExperience?.ai_search_answer) ?? asRecord(geoSummary?.ai_search_answer_block);
  const modules = recommendation?.modules;
  const faq = asArray<FaqItem>(recommendation?.faq);
  const internalLinks = asArray<LinkItem>(recommendation?.internal_links);
  const contentBlocks: ReactNode[] = [];

  const overview = renderThirtySecondOverview(readerExperience?.thirty_second_overview, locale);
  if (overview) {
    contentBlocks.push(overview);
  }

  const answer = renderRecordCard(locale === "zh" ? "AI / Search 摘要答案" : "AI / Search answer", aiSearchAnswer, "ai-search-answer", locale);
  if (answer) {
    contentBlocks.push(answer);
  }

  const strengths = renderTitledDetailCards(locale === "zh" ? "优势" : "Strengths", readerExperience?.strengths, "strengths");
  if (strengths) {
    contentBlocks.push(strengths);
  }

  const watchOuts = renderTitledDetailCards(
    locale === "zh" ? "注意风险" : "Watch-outs",
    readerExperience?.watch_outs,
    "watch-outs"
  );
  if (watchOuts) {
    contentBlocks.push(watchOuts);
  }

  const atScenarios = renderRecordCard(locale === "zh" ? "A/T 场景差异" : "A/T scenarios", readerExperience?.at_difference_scenarios, "at-scenarios", locale);
  if (atScenarios) {
    contentBlocks.push(atScenarios);
  }

  const workCard = renderRecordCard(locale === "zh" ? "工作决策场景" : "Work decision scenario", readerExperience?.work_decision_card, "work-decision", locale);
  if (workCard) {
    contentBlocks.push(workCard);
  }

  const relationshipCard = renderRecordCard(
    locale === "zh" ? "关系与沟通场景" : "Relationship and communication",
    readerExperience?.relationship_communication_card,
    "relationship-communication",
    locale
  );
  if (relationshipCard) {
    contentBlocks.push(relationshipCard);
  }

  const pressureCard = renderRecordCard(locale === "zh" ? "压力与成长" : "Pressure and growth", readerExperience?.pressure_growth_card, "pressure-growth", locale);
  if (pressureCard) {
    contentBlocks.push(pressureCard);
  }

  const renderedModules = renderStructuredModules(modules, locale);
  if (renderedModules) {
    contentBlocks.push(renderedModules);
  }

  if (faq.length > 0) {
    contentBlocks.push(
      <section key="faq" className="space-y-3" data-testid="mbti64-v85-faq">
        <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{locale === "zh" ? "常见问题" : "FAQ"}</h3>
        {renderLegacyFaqSection(
          {
            sectionKey: "faq",
            title: "FAQ",
            renderVariant: "faq",
            bodyMd: "",
            bodyHtml: "",
            payloadJson: { items: faq },
            sortOrder: 0,
            isEnabled: true,
          },
          locale
        )}
      </section>
    );
  }

  const renderedLinks = renderSafeInternalLinks(internalLinks, locale);
  if (renderedLinks) {
    contentBlocks.push(<section key="internal-links">{renderedLinks}</section>);
  }

  return contentBlocks.length > 0 ? (
    <div key="reader-experience" className="space-y-10" data-testid="mbti64-v85-reader-experience">
      {contentBlocks}
    </div>
  ) : null;
}

function renderMbti64DetailSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const raw = asRecord(payload?.raw);
  const body = firstTextValue(section.bodyMd, payload?.body, raw?.body);
  const contentBlocks: ReactNode[] = [];
  const readerExperienceContent = renderMbti64ReaderExperiencePayload(payload, locale);

  if (body) {
    contentBlocks.push(
      <div key="body" className="space-y-4 leading-7 text-[var(--fm-text-muted)]">
        {renderLocalizedMarkdown(body, locale, 3)}
      </div>
    );
  }

  const itemList = renderNamedTextList(locale === "zh" ? "要点" : "Key points", asArray(raw?.items), "items");
  if (itemList) {
    contentBlocks.push(itemList);
  }

  const groupedLists = [
    {
      key: "strengths",
      title: locale === "zh" ? "优势" : "Strengths",
      items: asArray(raw?.strengths),
    },
    {
      key: "blind_spots",
      title: locale === "zh" ? "盲点" : "Blind spots",
      items: asArray(raw?.blind_spots),
    },
    {
      key: "watchouts",
      title: locale === "zh" ? "注意事项" : "Watchouts",
      items: asArray(raw?.watchouts),
    },
    {
      key: "best_fit_environments",
      title: locale === "zh" ? "适合环境" : "Best-fit environments",
      items: asArray(raw?.best_fit_environments),
    },
    {
      key: "communication_tips",
      title: locale === "zh" ? "沟通建议" : "Communication tips",
      items: asArray(raw?.communication_tips),
    },
  ];

  for (const group of groupedLists) {
    const rendered = renderNamedTextList(group.title, group.items, group.key);
    if (rendered) {
      contentBlocks.push(rendered);
    }
  }

  if (readerExperienceContent) {
    contentBlocks.push(readerExperienceContent);
  }

  if (contentBlocks.length === 0) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  return <div className="space-y-6">{contentBlocks}</div>;
}

function contentTitleFromValue(key: string, value: unknown, locale: Locale): string {
  const record = asRecord(value);
  return normalizeText(record?.h2 ?? record?.title) || projectionSectionTitle(key, key, locale);
}

function renderSideBySideRows(value: unknown) {
  const record = asRecord(value);
  const rows = asArray<Record<string, unknown>>(record?.rows)
    .map((row) => ({
      dimension: normalizeText(row.dimension),
      assertive: normalizeText(row.a_variant ?? row.assertive ?? row.a),
      turbulent: normalizeText(row.t_variant ?? row.turbulent ?? row.t),
    }))
    .filter((row) => row.dimension || row.assertive || row.turbulent);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <article
          key={`${row.dimension || "row"}-${index}`}
          className="grid gap-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 md:grid-cols-[0.8fr_1fr_1fr]"
        >
          <p className="m-0 font-semibold text-[var(--fm-text)]">{row.dimension}</p>
          {row.assertive ? <p className="m-0 text-[var(--fm-text-muted)]">{row.assertive}</p> : null}
          {row.turbulent ? <p className="m-0 text-[var(--fm-text-muted)]">{row.turbulent}</p> : null}
        </article>
      ))}
    </div>
  );
}

function renderMbti64ContentEntries(content: Record<string, unknown>, locale: Locale) {
  return Object.entries(content)
    .map(([key, value]) => {
      const sideBySide = renderSideBySideRows(value);
      const body = contentBodyFromValue(value);

      if (!sideBySide && !body) {
        return null;
      }

      return (
        <section key={key} id={key} className="space-y-3" data-testid={`mbti64-content-section-${key}`}>
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {contentTitleFromValue(key, value, locale)}
          </h3>
          {sideBySide ?? <div className="space-y-4 leading-7 text-[var(--fm-text-muted)]">{renderLocalizedMarkdown(body, locale, 4)}</div>}
        </section>
      );
    })
    .filter((item) => item !== null);
}

function renderMbti64ComparisonSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const content = asRecord(payload?.content);
  const faq = asArray<FaqItem>(payload?.faq);
  const internalLinks = asArray<LinkItem>(payload?.internal_links);
  const contentEntries = content ? renderMbti64ContentEntries(content, locale) : [];
  const renderedFaq = faq.length
    ? renderLegacyFaqSection(
        {
          ...section,
          sectionKey: "faq",
          renderVariant: "faq",
          bodyMd: "",
          bodyHtml: "",
          payloadJson: { items: faq },
        },
        locale
      )
    : null;
  const renderedLinks = renderSafeInternalLinks(internalLinks, locale);
  const renderedBoundaries = renderBoundaryCallouts(payload, locale);

  if (contentEntries.length === 0 && !renderedFaq && !renderedLinks && !renderedBoundaries) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  return (
    <div className="space-y-5">
      {contentEntries}
      {renderedFaq ? (
        <section id="faq" className="space-y-3" data-testid="mbti64-visible-faq">
          <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "常见问题" : "FAQ"}
          </h3>
          {renderedFaq}
        </section>
      ) : null}
      {renderedLinks}
      {renderedBoundaries}
    </div>
  );
}

function renderSourceLedgerReferences(payload: Record<string, unknown> | null, locale: Locale) {
  const rawRow = asRecord(payload?.raw_row);
  const structuredMetadata = asRecord(payload?.structured_metadata);
  const ledgerItems = [
    ...asArray<Record<string, unknown>>(rawRow?.source_ledger),
    ...asArray<Record<string, unknown>>(structuredMetadata?.source_ledger),
  ];
  const seenReferences = new Set<string>();
  const references = ledgerItems
    .map((item) => {
      const source = normalizeText(item.source);
      const id = normalizeText(item.id);
      const rawYear = item.year;
      const year = typeof rawYear === "string" || typeof rawYear === "number" ? String(rawYear).trim() : "";
      const title = normalizeText(item.title);
      const limitation = normalizeText(item.limitation);
      const claim = normalizeText(item.claim);
      const explicitHref = normalizeText(item.href ?? item.url ?? item.source_url ?? item.doi_url);
      const label = source && year ? `${source} (${year})` : source || title;
      const summary = limitation || claim;
      const referenceKey = `${label}|${title}|${summary}`;
      const kind = getSourceLedgerReferenceKind(id, label, title);

      if (!label || seenReferences.has(referenceKey)) {
        return null;
      }

      seenReferences.add(referenceKey);

      return {
        id,
        kind,
        title: label,
        href: getSourceLedgerReferenceHref(kind, explicitHref, locale),
        sourceTitle: title,
        summary: locale === "zh" ? summary.replace(/方法边界/g, "学术边界") : summary,
      };
    })
    .filter(
      (
        item,
      ): item is {
        id: string;
        kind: string;
        title: string;
        href: string | null;
        sourceTitle: string;
        summary: string;
      } => item !== null,
    );

  if (references.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3" data-testid="mbti64-source-ledger-references">
      <div className="space-y-3">
        {references.map((reference, index) => {
          const displayCopy = getSourceLedgerDisplayCopy(reference, locale);
          const isExternalReference = displayCopy.href ? isExternalHref(displayCopy.href) : false;

          return (
            <article
              key={`${reference.id || reference.title}-${index}`}
              className="rounded-xl border border-[#dfe7df] bg-white px-5 py-4 shadow-[0_1px_0_rgba(16,24,40,0.03)]"
              data-testid="mbti64-source-ledger-reference"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="m-0 font-semibold leading-6 text-[#1f2d3d]">{displayCopy.displayTitle}</p>
                <p className="m-0 shrink-0 rounded-full bg-[#f3f6f1] px-2.5 py-1 text-xs font-semibold text-[#637064]">
                  {displayCopy.sourceTypeLabel}
                </p>
              </div>
              <p className="mb-0 mt-3 text-sm leading-6 text-[#53625a]">{displayCopy.note}</p>
              {displayCopy.href ? (
                <p className="mb-0 mt-3 text-sm">
                  <a
                    href={displayCopy.href}
                    target={isExternalReference ? "_blank" : undefined}
                    rel={isExternalReference ? "noopener noreferrer" : undefined}
                    className="font-medium text-[#315f9f] underline underline-offset-4 hover:text-[var(--fm-accent)]"
                  >
                    {displayCopy.linkLabel}
                  </a>
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function renderMbti64PromotionMetadataSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const renderedBoundaries = renderBoundaryCallouts(payload, locale);
  const renderedReferences = renderSourceLedgerReferences(payload, locale);

  if (!renderedBoundaries && !renderedReferences) {
    return null;
  }

  return (
    <div className="space-y-4">
      {renderedBoundaries}
      {renderedReferences}
    </div>
  );
}

function normalizeLettersIntroPayload(payload: Record<string, unknown> | null): LettersIntroPayload {
  const letters = asArray<Record<string, unknown>>(payload?.letters)
    .map((item) => ({
      letter: normalizeText(item.letter),
      title: normalizeText(item.title),
      description: normalizeText(item.description),
    }))
    .filter((item) => item.letter || item.title || item.description)
    .map((item) => ({
      letter: item.letter || "?",
      title: item.title || item.letter || "",
      description: item.description,
    }));

  return {
    headline: normalizeText(payload?.headline) || null,
    letters,
  };
}

function normalizeTraitDimensions(payload: Record<string, unknown> | null): PersonalityProjectionDimension[] {
  return asArray<Record<string, unknown>>(payload?.dimensions)
    .map((item) => {
      const id = normalizeText(item.id || item.code).toUpperCase();
      if (!id) {
        return null;
      }

      return {
        id,
        code: normalizeText(item.code) || null,
        name: normalizeText(item.name) || null,
        label: normalizeText(item.label) || null,
        axisLeft: normalizeText(item.axisLeft ?? item.axis_left) || null,
        axisRight: normalizeText(item.axisRight ?? item.axis_right) || null,
        summary: normalizeText(item.summary) || null,
        description: normalizeText(item.description) || null,
        scorePct: typeof item.scorePct === "number" ? item.scorePct : typeof item.score_pct === "number" ? item.score_pct : null,
        source: normalizeText(item.source) || null,
        side: normalizeText(item.side) || null,
        sideLabel: normalizeText(item.sideLabel ?? item.side_label) || null,
        pct: typeof item.pct === "number" ? item.pct : null,
        state: normalizeText(item.state) || null,
      } satisfies PersonalityProjectionDimension;
    })
    .filter((item): item is PersonalityProjectionDimension => item !== null);
}

function normalizePreferredRolePayload(payload: Record<string, unknown> | null): PreferredRolePayload {
  const groups = asArray<Record<string, unknown>>(payload?.groups).map((group) => ({
    groupTitle: normalizeText(group.groupTitle ?? group.group_title ?? group.title),
    description: normalizeText(group.description),
    examples: asArray<unknown>(group.examples)
      .map((example) => normalizeText(example))
      .filter(Boolean),
  }));

  if (groups.length > 0) {
    return {
      title: normalizeText(payload?.title) || null,
      intro: normalizeText(payload?.intro) || null,
      groups: groups.filter((group) => group.groupTitle || group.description || group.examples.length > 0),
    };
  }

  const items = asArray<Record<string, unknown>>(payload?.items)
    .map((item) => normalizeText(item.title ?? item.name))
    .filter(Boolean);

  return {
    title: normalizeText(payload?.title) || null,
    intro: normalizeText(payload?.intro) || null,
    groups: items.length > 0 ? [{ groupTitle: "", description: "", examples: items }] : [],
  };
}

function renderProjectionRichTextSection(section: RenderableProjectionSection, locale: Locale) {
  return renderPlainMarkdown(section.bodyMd, "space-y-4 leading-7 text-[var(--fm-text-muted)]", locale);
}

function renderProjectionBulletsSection(section: RenderableProjectionSection) {
  const items = asArray<BulletItem>(section.payload?.items);
  const renderedItems = renderBulletItems(items);
  if (renderedItems) {
    return renderedItems;
  }

  if (!section.bodyMd.trim()) {
    return null;
  }

  const fallbackItems = section.bodyMd
    .split("\n")
    .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
    .filter(Boolean)
    .map((item) => ({ title: item }));

  return renderBulletItems(fallbackItems);
}

function renderProjectionFaqSection(section: RenderableProjectionSection, locale: Locale) {
  const items = asArray<FaqItem>(section.payload?.items)
    .map((item) => ({
      question: normalizeText(item.question),
      answer: normalizeText(item.answer),
    }))
    .filter((item) => item.question && item.answer);

  if (items.length === 0) {
    return renderProjectionRichTextSection(section, locale);
  }

  return (
    <dl className="m-0 space-y-4">
      {items.map((item, index) => (
        <div key={`${item.question}-${index}`} className="space-y-1">
          <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
          <dd className="m-0 text-[var(--fm-text-muted)]">{item.answer}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderLettersIntroSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = normalizeLettersIntroPayload(section.payload);

  return (
    <div className="space-y-4">
      {payload.letters.length > 0 ? (
        <div className="space-y-2.5">
          {payload.letters.map((item, index) => (
            <article
              key={`${item.letter}-${index}`}
              className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-white/70 px-4 py-3.5"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--fm-accent)]/10 text-sm font-semibold text-[var(--fm-accent)]">
                  {item.letter}
                </div>
                <div className="min-w-0 space-y-1">
                  {item.title ? (
                    <p className="m-0 text-sm font-semibold text-[#263241]">{stripZhTraitSuffix(item.title, locale)}</p>
                  ) : null}
                  {item.description ? <p className="m-0 text-sm leading-6 text-[#66756d]">{item.description}</p> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        renderProjectionRichTextSection(section, locale)
      )}
    </div>
  );
}

function renderTraitDimensionGridSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = section.payload;
  const summary = normalizeText(payload?.summary);
  const dimensions = normalizeTraitDimensions(payload);

  if (dimensions.length === 0) {
    return renderProjectionRichTextSection(section, locale);
  }

  return (
    <div className="space-y-4">
      {summary && locale !== "zh" ? <p className="m-0 text-[15px] leading-7 text-[#75827a]">{summary}</p> : null}
      <div className="space-y-2.5">
        {dimensions.map((dimension) => {
          const dimensionName = dimension.name || dimension.label || dimension.id;
          const titleText = locale === "zh"
            ? dimension.summary || dimensionName
            : [dimensionName, dimension.summary].filter(Boolean).join(": ");

          return (
            <article
              key={dimension.id}
              className="rounded-xl border border-[rgba(16,24,40,0.08)] bg-white/70 px-4 py-3.5"
            >
              <div className="space-y-2">
                <p
                  className="m-0 text-sm font-semibold text-[#263241]"
                  aria-label={locale === "zh" && dimension.summary ? `${dimensionName}：${dimension.summary}` : undefined}
                >
                  {titleText}
                </p>
                {(dimension.axisLeft || dimension.axisRight) && locale !== "zh" && (
                  <p className="m-0 text-xs uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                    {[dimension.axisLeft, dimension.axisRight].filter(Boolean).join(" / ")}
                  </p>
                )}
                {dimension.description ? <p className="m-0 text-sm leading-6 text-[#66756d]">{dimension.description}</p> : null}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function renderPreferredRoleListSection(section: RenderableProjectionSection, locale: Locale) {
  const payload = normalizePreferredRolePayload(section.payload);

  if (payload.groups.length === 0) {
    return renderProjectionRichTextSection(section, locale);
  }

  return (
    <div className="space-y-4">
      {payload.title ? <p className="m-0 font-medium text-[var(--fm-text)]">{payload.title}</p> : null}
      {payload.intro ? <p className="m-0 leading-7 text-[var(--fm-text-muted)]">{payload.intro}</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {payload.groups.map((group, index) => (
          <article
            key={`${group.groupTitle || "roles"}-${index}`}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <div className="space-y-3">
              {group.groupTitle ? <p className="m-0 font-semibold text-[var(--fm-text)]">{group.groupTitle}</p> : null}
              {group.description ? <p className="m-0 text-[var(--fm-text-muted)]">{group.description}</p> : null}
              {group.examples.length > 0 ? (
                <ul className="m-0 space-y-2 pl-5 text-[var(--fm-text-muted)]">
                  {group.examples.map((example) => (
                    <li key={example}>
                      <span className="font-medium text-[var(--fm-text)]">{example}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPremiumTeaserSection(section: RenderableProjectionSection) {
  const teaser = normalizeText(section.payload?.teaser ?? section.payload?.summary) || section.bodyMd;

  if (!teaser.trim()) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
      <p className="m-0 text-[var(--fm-text-muted)]">{teaser}</p>
    </div>
  );
}

function mbti64V85TestId(sectionKey: string): string {
  return `mbti64-v85-${sectionKey.replace(/^v8_5_/, "").replace(/_/g, "-")}`;
}

function normalizeV85ReaderBodyMd(sectionKey: string, bodyMd: string, locale: Locale): string {
  if (sectionKey !== "v8_5_module_10_faq_boundary" || locale !== "zh") {
    return bodyMd;
  }

  const blocks = bodyMd
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return bodyMd;
  }

  return /FAQ|常见问题/.test(blocks[0]) ? blocks.slice(1).join("\n\n") : bodyMd;
}

function splitV85ReadableBlocks(bodyMd: string): string[] {
  return bodyMd
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function splitLeadSentence(block: string): { lead: string; rest: string } {
  const normalized = normalizeText(block);
  const match = normalized.match(/^(.+?[。！？.!?])\s*(.*)$/);

  if (!match) {
    return { lead: normalized, rest: "" };
  }

  return {
    lead: match[1],
    rest: match[2],
  };
}

function renderReadableParagraphCard(block: string, locale: Locale) {
  const { lead, rest } = splitLeadSentence(block);

  return (
    <div className="space-y-2">
      <p className="m-0 text-[15px] font-semibold leading-7 text-[#263241]">{lead}</p>
      {rest ? <div className="text-sm leading-7 text-[#66756d]">{renderLocalizedMarkdown(rest, locale, 3)}</div> : null}
    </div>
  );
}

function renderV85GenericReadableBody(section: CmsPersonalitySection, locale: Locale) {
  if (!section.bodyMd.trim() && section.bodyHtml.trim()) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  const blocks = splitV85ReadableBlocks(normalizeV85ReaderBodyMd(section.sectionKey, section.bodyMd, locale));

  if (blocks.length < 4) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  const summaryBlock = blocks[0];
  const bodyBlocks = blocks.slice(1, 4);
  const signalBlocks = blocks.slice(4, 6);
  const actionBlocks = blocks.slice(6);

  return (
    <div className="space-y-8">
      <div className="border-l-4 border-[#76598d] pl-5 text-[16px] leading-8 text-[#3d4652]">
        {renderLocalizedMarkdown(summaryBlock, locale, 3)}
      </div>
      <div className="space-y-5 border-t border-[rgba(16,24,40,0.12)] pt-6 text-[16px] leading-8 text-[#3d4652]">
        {bodyBlocks.map((block, index) => (
          <div key={`${section.sectionKey}-body-${index}`}>{renderLocalizedMarkdown(block, locale, 3)}</div>
        ))}
      </div>
      {signalBlocks.length > 0 ? (
        <section className="space-y-4 pt-1">
          {signalBlocks.map((block, index) => {
            const { lead, rest } = splitLeadSentence(block);
            const isFirstSignal = index === 0;

            return (
              <article key={`${section.sectionKey}-signal-${index}`} className="flex gap-3">
                <div
                  className={isFirstSignal
                    ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff7e5] text-[#a66f00]"
                    : "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4effa] text-[#76598d]"}
                >
                  {isFirstSignal ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[15px] font-semibold leading-7 text-[#263241]">{lead}</p>
                  {rest ? <div className="text-sm leading-7 text-[#66756d]">{renderLocalizedMarkdown(rest, locale, 3)}</div> : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {actionBlocks.length > 0 ? (
        <section className="space-y-4 border-t border-[rgba(16,24,40,0.10)] pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#23705b]">
            <Leaf className="h-5 w-5" aria-hidden="true" />
            <span>{mbti64V85ReaderActionHeading(section.sectionKey, locale)}</span>
          </div>
          <div className="divide-y divide-[rgba(16,24,40,0.08)] border-y border-[rgba(16,24,40,0.08)]">
            {actionBlocks.map((block, index) => (
              <div
                key={`${section.sectionKey}-action-${index}`}
                className="grid gap-4 py-4 sm:grid-cols-[2rem_minmax(0,1fr)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#23705b]/10 text-sm font-semibold text-[#23705b]">
                  {index + 1}
                </div>
                <div>{renderReadableParagraphCard(block, locale)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderV85AgencyBoundaryReadableBody(section: CmsPersonalitySection, locale: Locale) {
  if (!section.bodyMd.trim() && section.bodyHtml.trim()) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  const blocks = splitV85ReadableBlocks(normalizeV85ReaderBodyMd(section.sectionKey, section.bodyMd, locale));

  if (blocks.length < 3) {
    return renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
  }

  const summaryBlock = blocks[0];
  const bodyBlocks = blocks.slice(1, 3);
  const boundaryBlocks = blocks.slice(3, 5);
  const actionBlocks = blocks.slice(5, -1);
  const quoteBlock = blocks[blocks.length - 1];

  return (
    <div className="space-y-8">
      <div className="border-l-4 border-[#76598d] pl-5 text-[16px] leading-8 text-[#3d4652]">
        {renderLocalizedMarkdown(summaryBlock, locale, 3)}
      </div>
      <div className="space-y-5 border-t border-[rgba(16,24,40,0.12)] pt-6 text-[16px] leading-8 text-[#3d4652]">
        {bodyBlocks.map((block, index) => (
          <div key={`agency-body-${index}`}>{renderLocalizedMarkdown(block, locale, 3)}</div>
        ))}
      </div>
      <figure className="m-0 mb-2 rounded-xl border border-[#d8c7ea] bg-[#fbf8ff] px-5 py-4 text-[#4b3f57]">
        <div className="flex gap-4">
          <Quote className="mt-1 h-6 w-6 shrink-0 text-[#7d5aa6]" aria-hidden="true" />
          <figcaption className="text-[15px] leading-7">{renderLocalizedMarkdown(quoteBlock, locale, 3)}</figcaption>
        </div>
      </figure>
      {boundaryBlocks.length > 0 ? (
        <section className="space-y-4 pt-3">
          {boundaryBlocks.map((block, index) => {
            const { lead, rest } = splitLeadSentence(block);
            const isReminder = index === 0;

            return (
              <article key={`agency-boundary-${index}`} className="flex gap-3">
                <div
                  className={isReminder
                    ? "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff7e5] text-[#a66f00]"
                    : "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4effa] text-[#76598d]"}
                >
                  {isReminder ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <p className="m-0 text-[15px] font-semibold leading-7 text-[#263241]">
                    {isReminder ? (locale === "zh" ? "边界提醒：" : "Boundary reminder: ") : (locale === "zh" ? "观察自己：" : "Observe yourself: ")}
                    {lead}
                  </p>
                  {rest ? <div className="text-sm leading-7 text-[#66756d]">{renderLocalizedMarkdown(rest, locale, 3)}</div> : null}
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
      {actionBlocks.length > 0 ? (
        <section className="space-y-4 border-t border-[rgba(16,24,40,0.10)] pt-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#23705b]">
            <Leaf className="h-5 w-5" aria-hidden="true" />
            <span>{locale === "zh" ? "协作中的具体做法" : "Practical collaboration moves"}</span>
          </div>
          <div className="divide-y divide-[rgba(16,24,40,0.08)] border-y border-[rgba(16,24,40,0.08)]">
            {actionBlocks.map((block, index) => (
              <div
                key={`agency-action-${index}`}
                className="grid gap-4 py-4 sm:grid-cols-[2rem_minmax(0,1fr)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#23705b]/10 text-sm font-semibold text-[#23705b]">
                  {index + 1}
                </div>
                <div>{renderReadableParagraphCard(block, locale)}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function renderMbti64V85FirstClassSection(section: CmsPersonalitySection, locale: Locale) {
  const payload = asRecord(section.payloadJson);
  const linkItems = [
    ...asArray<LinkItem>(payload?.items),
    ...asArray<LinkItem>(payload?.links),
    ...asArray<LinkItem>(payload?.internal_links),
  ];
  const safeLinks = section.sectionKey === "v8_5_search_user_paths" ? renderSafeInternalLinks(linkItems, locale) : null;
  const body = section.sectionKey === "v8_5_module_03_agency_boundary"
    ? renderV85AgencyBoundaryReadableBody(section, locale)
    : isMbti64V85ReaderModuleSectionKey(section.sectionKey)
      ? renderV85GenericReadableBody(section, locale)
      : renderRichTextBlock(section.bodyHtml, normalizeV85ReaderBodyMd(section.sectionKey, section.bodyMd, locale), locale);

  if (!body && !safeLinks) {
    return null;
  }

  return (
    <div className="space-y-4" data-testid={mbti64V85TestId(section.sectionKey)}>
      {body}
      {safeLinks}
    </div>
  );
}

export function getRenderablePersonalitySections(sections: CmsPersonalitySection[]): CmsPersonalitySection[] {
  return sections.filter((section) => isKnownSectionKey(section.sectionKey) || isMbti64V85FirstClassSectionKey(section.sectionKey));
}

export function renderPersonalitySections(sections: CmsPersonalitySection[], locale: Locale): ReactNode[] {
  return getRenderablePersonalitySections(sections)
    .map((section) => {
      let content: ReactNode = null;

      switch (section.sectionKey) {
        case "mbti64_comparison_a_vs_t":
          content = renderMbti64ComparisonSection(section, locale);
          break;
        case "mbti64_promotion_metadata":
          content = renderMbti64PromotionMetadataSection(section, locale);
          break;
        default:
          if (isMbti64V85FirstClassSectionKey(section.sectionKey)) {
            content = renderMbti64V85FirstClassSection(section, locale);
          } else if (MBTI64_PROMOTED_DETAIL_SECTION_KEYS.has(section.sectionKey)) {
            content = renderMbti64DetailSection(section, locale);
          } else {
            switch (section.renderVariant) {
              case "bullets":
                content = renderLegacyBulletsSection(section);
                break;
              case "faq":
                content = renderLegacyFaqSection(section, locale);
                break;
              case "cards":
              case "links":
                content = renderLegacyCardsSection(section, locale);
                break;
              case "callout":
              case "rich_text":
              default:
                content = renderRichTextBlock(section.bodyHtml, section.bodyMd, locale);
                break;
            }
          }
      }

      if (!content) {
        return null;
      }

      return renderSectionCard(section.sectionKey, section.title, content, locale, {
        preserveBackendTitle: MBTI64_PROMOTED_DETAIL_SECTION_KEYS.has(section.sectionKey),
        editorialPriority: isMbti64V85FirstClassSectionKey(section.sectionKey),
      });
    })
    .filter((section) => section !== null);
}

export function normalizeProjectionSections(
  sections: PersonalityProjectionSection[]
): RenderableProjectionSection[] {
  return sections
    .map((section) => {
      const render = normalizeText(section.render);
      if (!section.key || !isSupportedProjectionRender(render)) {
        return null;
      }

      return {
        key: section.key,
        title: normalizeText(section.title) || section.key,
        render,
        bodyMd: section.bodyMd,
        payload: section.payload,
        source: section.source,
      } satisfies RenderableProjectionSection;
    })
    .filter((section): section is RenderableProjectionSection => section !== null);
}

export function renderProjectionSections(
  sections: PersonalityProjectionSection[],
  locale: Locale
): ReactNode[] {
  return normalizeProjectionSections(sections)
    .map((section) => {
      let content: ReactNode = null;

      switch (section.render) {
        case "letters_intro":
          content = renderLettersIntroSection(section, locale);
          break;
        case "trait_dimension_grid":
          content = renderTraitDimensionGridSection(section, locale);
          break;
        case "preferred_role_list":
          content = renderPreferredRoleListSection(section, locale);
          break;
        case "premium_teaser":
          content = renderPremiumTeaserSection(section);
          break;
        case "bullets":
          content = renderProjectionBulletsSection(section);
          break;
        case "faq":
          content = renderProjectionFaqSection(section, locale);
          break;
        case "rich_text":
        default:
          content = renderProjectionRichTextSection(section, locale);
          break;
      }

      if (!content) {
        return null;
      }

      return renderSectionCard(section.key, section.title, content, locale);
    })
    .filter((section) => section !== null);
}

export function buildPersonalitySectionLinks(
  section: CmsPersonalitySection,
  locale: Locale
): Array<{ title: string; href: string | null; summary: string }> {
  const payload = asRecord(section.payloadJson);
  return normalizeLinkItems(
    [...asArray<LinkItem>(payload?.items), ...asArray<LinkItem>(payload?.links), ...asArray<LinkItem>(payload?.internal_links)],
    locale
  );
}

export function extractPersonalityFaqItems(sections: CmsPersonalitySection[]): FAQItem[] {
  return getRenderablePersonalitySections(sections)
    .flatMap((section) => {
      const payload = asRecord(section.payloadJson);
      const recommendation = resolveStructuredRecommendationPayload(payload);
      const structuredFaq = asArray<FaqItem>(recommendation?.faq);
      const items =
        section.sectionKey === "mbti64_comparison_a_vs_t"
          ? asArray<FaqItem>(payload?.faq)
          : section.sectionKey === "faq"
            ? asArray<FaqItem>(payload?.items)
            : structuredFaq;

      return items
        .map((item) => ({
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
        .filter((item) => item.question && item.answer);
    });
}

export function extractProjectionFaqItems(sections: PersonalityProjectionSection[]): FAQItem[] {
  return normalizeProjectionSections(sections)
    .filter((section) => section.key === "faq" && section.render === "faq")
    .flatMap((section) => {
      const items = asArray<FaqItem>(section.payload?.items);

      return items
        .map((item) => ({
          question: normalizeText(item.question),
          answer: normalizeText(item.answer),
        }))
        .filter((item) => item.question && item.answer);
    });
}

export { KNOWN_SECTION_KEYS };
