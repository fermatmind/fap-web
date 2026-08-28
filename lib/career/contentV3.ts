import type { Locale } from "@/lib/i18n/locales";

export const CAREER_CONTENT_V3_VERSION = "career.detail.content.v3" as const;

export const CAREER_CONTENT_V3_PRIMITIVES = [
  "prose", "list", "metrics", "cards", "table", "matrix", "timeline", "faq", "links", "notice", "sources",
] as const;

export type CareerContentV3Primitive = (typeof CAREER_CONTENT_V3_PRIMITIVES)[number];
export type CareerContentV3Availability = "available" | "missing";

export type CareerContentV3Item = {
  id: string;
  copyKey: string;
  type: CareerContentV3Primitive;
  availability: CareerContentV3Availability;
  data: Record<string, unknown>;
};

export type CareerContentV3Block = {
  id: string;
  copyKey: string;
  contentState: "enhanced" | "legacy";
  availability: CareerContentV3Availability;
  items: CareerContentV3Item[];
  renderable: boolean;
};

export type CareerContentV3 = {
  contractVersion: typeof CAREER_CONTENT_V3_VERSION;
  locale: Locale;
  subject: { canonicalSlug: string; name: string; summary: string | null };
  contentState: "enhanced" | "legacy";
  sourceContentSha256: string;
  blocks: CareerContentV3Block[];
};

export type CareerContentV3UiCopy = {
  dossier: string;
  contents: string;
  pageContents: string;
  startTest: string;
  enhanced: string;
  legacy: string;
  unavailableTitle: string;
  unavailableBody: string;
  missingItem: string;
  additionalSection: string;
  additionalContent: string;
  fieldLabel: (index: number) => string;
  externalLink: string;
};

const UI_COPY: Record<Locale, CareerContentV3UiCopy> = {
  zh: {
    dossier: "职业档案",
    contents: "目录",
    pageContents: "页面目录",
    startTest: "开始职业兴趣测试",
    enhanced: "增强内容",
    legacy: "基础内容",
    unavailableTitle: "本板块暂不可用",
    unavailableBody: "该内容暂时无法安全显示，页面其余部分仍可使用。",
    missingItem: "该子内容尚未发布或暂时无法安全显示。",
    additionalSection: "职业补充信息",
    additionalContent: "补充内容",
    fieldLabel: (index) => `字段 ${index + 1}`,
    externalLink: "在新窗口打开",
  },
  en: {
    dossier: "Career dossier",
    contents: "Contents",
    pageContents: "Page contents",
    startTest: "Start the career interest test",
    enhanced: "Enhanced",
    legacy: "Core content",
    unavailableTitle: "This section is unavailable",
    unavailableBody: "This content cannot be displayed safely right now. The rest of the page remains available.",
    missingItem: "This sub-section has not been published or cannot be displayed safely right now.",
    additionalSection: "Additional career information",
    additionalContent: "Additional content",
    fieldLabel: (index) => `Field ${index + 1}`,
    externalLink: "Open in a new window",
  },
};

export function careerContentV3UiCopy(locale: Locale): CareerContentV3UiCopy {
  return UI_COPY[locale];
}

type CatalogEntry = { title: string; description?: string };

const COMMON_BLOCK_COPY: Record<string, { zh: CatalogEntry; en: CatalogEntry }> = {
  "career.block.overview": { zh: { title: "职业概览" }, en: { title: "Career overview" } },
  "career.block.quick-decision": { zh: { title: "快速判断" }, en: { title: "Quick decision" } },
  "career.block.profile": { zh: { title: "职业画像" }, en: { title: "Career profile" } },
  "career.block.direction-comparison": { zh: { title: "职业方向比较" }, en: { title: "Career direction comparison" } },
  "career.block.ai-impact": { zh: { title: "AI 影响" }, en: { title: "AI impact" } },
  "career.block.china-salary": { zh: { title: "中国大陆薪资参考" }, en: { title: "Chinese mainland salary reference" } },
  "career.block.us-salary": { zh: { title: "美国薪资参考" }, en: { title: "United States salary reference" } },
  "career.block.fit": { zh: { title: "职业适配指南" }, en: { title: "Career fit guide" } },
  "career.block.risk": { zh: { title: "工作压力、风险与职业边界" }, en: { title: "Work pressure, risks and boundaries" } },
  "career.block.path": { zh: { title: "入行、证书与职业发展" }, en: { title: "Entry, credentials and career development" } },
  "career.block.market-signals": { zh: { title: "职业前景与相关职业转向" }, en: { title: "Career outlook and related transitions" } },
  "career.block.sources": { zh: { title: "常见问题与资料来源" }, en: { title: "Questions and sources" } },
  "career.block.source-register": { zh: { title: "资料来源" }, en: { title: "Sources" } },
  "career.block.additional": { zh: { title: "职业补充信息" }, en: { title: "Additional career information" } },
  "career.block.unavailable": { zh: { title: "本板块暂不可用" }, en: { title: "This section is unavailable" } },
};

const COMPONENT_BLOCK_TITLES: Record<string, [string, string]> = {
  "definition-block": ["职业定义", "Career definition"],
  "career-ai-description-block": ["职业说明", "Career description"],
  "responsibilities-block": ["主要职责", "Responsibilities"],
  "work-context-block": ["工作环境", "Work context"],
  "career-quick-answers-block": ["快速答案", "Quick answers"],
  "onet-structured-fields-block": ["职业事实", "Occupation facts"],
  "adjacent-career-comparison-table": ["相邻职业比较", "Adjacent career comparison"],
  "ai-impact-table": ["AI 影响", "AI impact"],
  "career-snapshot-primary-locale": ["本地薪资参考", "Local salary reference"],
  "career-snapshot-secondary-locale": ["国际薪资参考", "International salary reference"],
  "riasec-fit-block": ["职业兴趣基线", "Interest profile baseline"],
  "personality-fit-block": ["职业适配", "Career fit"],
  "career-risk-cards": ["职业风险", "Career risks"],
  "career-path-block": ["发展路径", "Career path"],
  "contract-project-risk-block": ["项目与合同边界", "Project and contract boundaries"],
  "next-steps-block": ["下一步", "Next steps"],
  "market-signal-card": ["市场信号", "Market signals"],
  "faq-block": ["常见问题", "Frequently asked questions"],
  "related-next-pages": ["相关职业", "Related careers"],
  "source-card": ["资料来源", "Sources"],
  "review-validity-card": ["内容有效期", "Review validity"],
  "boundary-notice": ["使用边界", "Usage boundaries"],
  "final-cta": ["继续探索", "Continue exploring"],
  "fermat-decision-card": ["快速判断", "Quick decision"],
  "fit-decision-checklist": ["适配检查", "Fit checklist"],
};

for (const [id, [zh, en]] of Object.entries(COMPONENT_BLOCK_TITLES)) {
  COMMON_BLOCK_COPY[`career.block.${id}`] = { zh: { title: zh }, en: { title: en } };
}

const COMMON_ITEM_COPY: Record<string, { zh: string; en: string }> = {
  "career.item.published-sources": { zh: "来源清单", en: "Source register" },
};

for (const [id, [zh, en]] of Object.entries(COMPONENT_BLOCK_TITLES)) {
  COMMON_ITEM_COPY[`career.item.${id}`] = { zh, en };
}

export const CAREER_CONTENT_V3_COPY_CATALOG_VERSION = "career.content-copy.v1" as const;

export function careerContentV3BlockCopy(copyKey: string, locale: Locale): CatalogEntry | null {
  return COMMON_BLOCK_COPY[copyKey]?.[locale] ?? null;
}

export function careerContentV3ItemCopy(copyKey: string, locale: Locale): string | null {
  return COMMON_ITEM_COPY[copyKey]?.[locale] ?? null;
}

const ACCOUNTING_RISK_COPY: Record<string, { zh: string; en: string }> = {
  "misstatement-compliance": { zh: "错报、漏报与合规风险", en: "Misstatement, omission, and compliance risk" },
  "deadline-workload": { zh: "结账、税期和审计忙季压力", en: "Close, filing, and busy-season pressure" },
  "independence-conflict": { zh: "独立性与利益冲突", en: "Independence and conflicts of interest" },
  "evidence-scope": { zh: "资料、证据质量与项目范围失控", en: "Evidence quality and scope control" },
  "confidentiality-access": { zh: "保密、数据与系统权限风险", en: "Confidentiality, data, and access risk" },
  "competence-change": { zh: "准则、技术与持续胜任能力风险", en: "Standards, technology, and continuing competence" },
};

export function careerContentV3CardCopy(copyKey: string, entryId: string, index: number, locale: Locale): string {
  if (copyKey === "career.item.career-risk-cards" && ACCOUNTING_RISK_COPY[entryId]) {
    return ACCOUNTING_RISK_COPY[entryId][locale];
  }
  return locale === "zh" ? `信息 ${index + 1}` : `Detail ${index + 1}`;
}

const COLUMN_COPY: Record<string, { zh: string; en: string }> = {
  direction: { zh: "职业方向", en: "Career direction" },
  work: { zh: "核心工作", en: "Core work" },
  fit: { zh: "更适合的选择", en: "Better fit" },
};

export function careerContentV3ColumnCopy(columnKey: string, locale: Locale): string | null {
  return COLUMN_COPY[columnKey]?.[locale] ?? null;
}

export function careerContentV3QuestionCopy(questionKey: string, locale: Locale, careerName: string): string | null {
  const standard: Record<string, { zh: string; en: string }> = {
    "career.faq.salary": { zh: `${careerName}工资一般多少？`, en: `What is the typical pay for ${careerName}?` },
    "career.faq.outlook": { zh: `${careerName}的职业前景怎么样？`, en: `What is the outlook for ${careerName}?` },
    "career.faq.daily-work": { zh: `${careerName}具体做什么？`, en: `What does ${careerName} do day to day?` },
    "career.faq.comparison": { zh: `${careerName}与相邻职业有什么区别？`, en: `How does ${careerName} differ from adjacent careers?` },
    "career.faq.ai-replacement": { zh: `AI 会取代${careerName}吗？`, en: `Will AI replace ${careerName}?` },
    "career.faq.human-skills": { zh: `AI 难以替代${careerName}的哪些能力？`, en: `Which ${careerName} capabilities are hardest for AI to replace?` },
    "career.faq.personality-fit": { zh: `什么样的人格与兴趣更适合${careerName}？`, en: `What personality and interests fit ${careerName}?` },
    "career.faq.work-setting": { zh: `${careerName}通常在哪里工作？`, en: `Where do ${careerName} usually work?` },
    "career.faq.career-worth": { zh: `现在从事${careerName}还值得吗？`, en: `Is ${careerName} still worth pursuing?` },
  };
  const accounting: Record<string, { zh: string; en: string }> = {
    "career.faq.accounting.daily-work": { zh: "会计师和审计师每天具体做什么？", en: "What do accountants and auditors do day to day?" },
    "career.faq.accounting.comparison": { zh: "会计和审计有什么区别？", en: "What is the difference between accounting and auditing?" },
    "career.faq.accounting.ai-replacement": { zh: "AI 会取代会计师或审计师吗？", en: "Will AI replace accountants or auditors?" },
    "career.faq.accounting.automatable-tasks": { zh: "哪些会计与审计工作最容易被 AI 自动化？", en: "Which accounting and audit tasks are most likely to be automated by AI?" },
    "career.faq.accounting.human-skills": { zh: "AI 难以替代会计师和审计师的哪些能力？", en: "Which accounting and audit capabilities are hardest for AI to replace?" },
    "career.faq.accounting.salary": { zh: "会计师和审计师工资一般多少？", en: "How much do accountants and auditors earn?" },
    "career.faq.accounting.education": { zh: "学会计或做审计需要什么学历和专业背景？", en: "What degree or background do you need for accounting or auditing?" },
    "career.faq.accounting.credentials": { zh: "做会计或审计必须考注册会计师（CPA）吗？", en: "Do you need a CPA to work in accounting or auditing?" },
    "career.faq.accounting.career-change": { zh: "零基础转行会计，应该先学什么？", en: "What should a career changer learn first for accounting?" },
    "career.faq.accounting.career-worth": { zh: "学会计还值得吗？未来哪些能力更重要？", en: "Is accounting still a good career, and which skills will matter most?" },
  };
  return (standard[questionKey] ?? accounting[questionKey])?.[locale] ?? null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}

function string(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function key(value: unknown): string | null {
  const normalized = string(value);
  return normalized && /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(normalized) ? normalized : null;
}

function normalizeItem(value: unknown): CareerContentV3Item | null {
  if (!isRecord(value) || !exactKeys(value, ["id", "copy_key", "type", "availability", "data"])) return null;
  const id = key(value.id);
  const copyKey = key(value.copy_key);
  const type = string(value.type);
  const availability = value.availability;
  if (!id || !copyKey || !type || !CAREER_CONTENT_V3_PRIMITIVES.includes(type as CareerContentV3Primitive) ||
      (availability !== "available" && availability !== "missing") || !isRecord(value.data)) return null;
  if (availability === "missing" && Object.keys(value.data).length > 0) return null;
  return { id, copyKey, type: type as CareerContentV3Primitive, availability, data: value.data };
}

function records(value: unknown): Record<string, unknown>[] | null {
  return Array.isArray(value) && value.length > 0 && value.every(isRecord) ? value : null;
}

function strings(value: unknown): string[] | null {
  return Array.isArray(value) && value.length > 0 && value.every((entry) => string(entry) !== null)
    ? value as string[] : null;
}

function safeUrl(value: unknown): boolean {
  return typeof value === "string" && (/^https:\/\//.test(value) || /^\/(?:en|zh)\//.test(value) || /^#[a-z0-9][a-z0-9_-]*$/.test(value));
}

export function canRenderCareerContentV3Item(
  item: CareerContentV3Item,
  locale: Locale,
  careerName: string,
): boolean {
  if (item.availability === "missing") return Object.keys(item.data).length === 0;
  if (item.type === "prose" || item.type === "notice") {
    return exactKeys(item.data, ["paragraphs"]) && strings(item.data.paragraphs) !== null;
  }
  if (item.type === "list") return exactKeys(item.data, ["entries"]) && strings(item.data.entries) !== null;
  if (item.type === "cards" || item.type === "timeline") {
    const values = exactKeys(item.data, ["entries"]) ? records(item.data.entries) : null;
    const seen = new Set<string>();
    return values !== null && values.every((entry) => {
      const id = key(entry.id);
      if (!exactKeys(entry, ["id", "values"]) || !id || seen.has(id) || strings(entry.values) === null) return false;
      seen.add(id);
      return true;
    });
  }
  if (item.type === "faq") {
    const values = exactKeys(item.data, ["entries"]) ? records(item.data.entries) : null;
    const seen = new Set<string>();
    return values !== null && values.every((entry) => {
      const id = key(entry.id);
      const questionKey = key(entry.question_key);
      if (!exactKeys(entry, ["id", "question_key", "answer"]) || !id || seen.has(id) || !questionKey ||
          string(entry.answer) === null || careerContentV3QuestionCopy(questionKey, locale, careerName) === null) return false;
      seen.add(id);
      return true;
    });
  }
  if (item.type === "links") {
    const values = exactKeys(item.data, ["entries"]) ? records(item.data.entries) : null;
    return values !== null && values.every((entry) => exactKeys(entry, ["id", "entity", "relation", "url"]) &&
      key(entry.id) !== null && string(entry.entity) !== null && key(entry.relation) !== null && safeUrl(entry.url));
  }
  if (item.type === "sources") {
    const values = exactKeys(item.data, ["entries"]) ? records(item.data.entries) : null;
    return values !== null && values.every((entry) => exactKeys(entry, ["id", "name", "url"]) &&
      key(entry.id) !== null && string(entry.name) !== null && (entry.url === null || safeUrl(entry.url)));
  }
  if (item.type === "metrics") {
    const values = exactKeys(item.data, ["entries"]) ? records(item.data.entries) : null;
    return values !== null && values.every((entry) => exactKeys(entry, ["key", "value"]) && key(entry.key) !== null && string(entry.value) !== null);
  }
  const columns = exactKeys(item.data, ["column_keys", "rows"]) ? strings(item.data.column_keys) : null;
  return columns !== null && columns.every((column) => key(column) !== null) &&
    Array.isArray(item.data.rows) && item.data.rows.length > 0 &&
    item.data.rows.every((row) => strings(row) !== null && (row as string[]).length === columns.length);
}

function invalidBlock(value: unknown, index: number): CareerContentV3Block {
  const candidate = isRecord(value) ? value : {};
  return {
    id: `${key(candidate.id) ?? "invalid-block"}-${index + 1}`,
    copyKey: key(candidate.copy_key) ?? "career.block.unavailable",
    contentState: candidate.content_state === "enhanced" ? "enhanced" : "legacy",
    availability: "missing",
    items: [],
    renderable: false,
  };
}

function normalizeBlock(value: unknown, index: number): CareerContentV3Block {
  if (!isRecord(value) || !exactKeys(value, ["id", "copy_key", "content_state", "availability", "items"])) {
    return invalidBlock(value, index);
  }
  const id = key(value.id);
  const copyKey = key(value.copy_key);
  const contentState = value.content_state;
  const availability = value.availability;
  if (!id || !copyKey || (contentState !== "enhanced" && contentState !== "legacy") ||
      (availability !== "available" && availability !== "missing") || !Array.isArray(value.items)) {
    return invalidBlock(value, index);
  }
  const items = value.items.map(normalizeItem);
  const renderable = items.every((item) => item !== null) &&
    ((availability === "missing" && value.items.length === 0) || (availability === "available" && value.items.length > 0));
  return {
    id,
    copyKey,
    contentState,
    availability: renderable ? availability : "missing",
    items: renderable ? items.filter((item): item is CareerContentV3Item => item !== null) : [],
    renderable,
  };
}

export function normalizeCareerContentV3(value: unknown, locale: Locale): CareerContentV3 | null {
  if (!isRecord(value) || !exactKeys(value, ["contract_version", "locale", "subject", "content_state", "source_content_sha256", "blocks"]) ||
      value.contract_version !== CAREER_CONTENT_V3_VERSION ||
      value.locale !== (locale === "zh" ? "zh-CN" : "en") ||
      (value.content_state !== "enhanced" && value.content_state !== "legacy") ||
      typeof value.source_content_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(value.source_content_sha256) ||
      !isRecord(value.subject) || !exactKeys(value.subject, ["canonical_slug", "name", "summary"]) ||
      !Array.isArray(value.blocks) || value.blocks.length === 0) {
    return null;
  }
  const canonicalSlug = key(value.subject.canonical_slug);
  const name = string(value.subject.name);
  const summary = value.subject.summary === null ? null : string(value.subject.summary);
  if (!canonicalSlug || !name || (value.subject.summary !== null && !summary)) return null;
  const blocks = value.blocks.map(normalizeBlock);
  const seen = new Set<string>();
  const seenItems = new Set<string>();
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const localItems = new Set<string>();
    const duplicateItem = block.items.some((item) => {
      const duplicate = seenItems.has(item.id) || localItems.has(item.id);
      localItems.add(item.id);
      return duplicate;
    });
    const invalidItem = block.items.some((item) => !canRenderCareerContentV3Item(item, locale, name));
    if (seen.has(block.id) || duplicateItem || invalidItem) {
      blocks[index] = invalidBlock(value.blocks[index], index);
    } else {
      for (const item of block.items) seenItems.add(item.id);
    }
    seen.add(blocks[index].id);
  }
  return {
    contractVersion: CAREER_CONTENT_V3_VERSION,
    locale,
    subject: { canonicalSlug, name, summary },
    contentState: value.content_state,
    sourceContentSha256: value.source_content_sha256,
    blocks,
  };
}

export function careerContentV3FaqItems(
  content: CareerContentV3,
  includeBlock: (block: CareerContentV3Block) => boolean = () => true,
): Array<{ question: string; answer: string }> {
  const result: Array<{ question: string; answer: string }> = [];
  for (const block of content.blocks) {
    if (!block.renderable || block.availability !== "available" || !includeBlock(block)) continue;
    for (const item of block.items) {
      if (item.type !== "faq" || item.availability !== "available" || !Array.isArray(item.data.entries)) continue;
      for (const entry of item.data.entries) {
        if (!isRecord(entry)) continue;
        const questionKey = key(entry.question_key);
        const answer = string(entry.answer);
        const question = questionKey ? careerContentV3QuestionCopy(questionKey, content.locale, content.subject.name) : null;
        if (question && answer) result.push({ question, answer });
      }
    }
  }
  return result;
}
