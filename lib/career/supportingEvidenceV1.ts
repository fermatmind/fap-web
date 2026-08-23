export const CAREER_SUPPORTING_EVIDENCE_V1_VERSION = "career.detail.supporting_evidence.v1" as const;

export type CareerEvidenceRow = Record<string, string>;

export type CareerEvidenceTable = {
  title: string;
  rows: CareerEvidenceRow[];
  sourceKeys: string[];
};

export type CareerEvidenceChart = {
  title: string;
  ariaLabel: string;
  caption: string;
  sourceKeys: string[];
  legend: Array<{ label: string; color: string }>;
  points: Array<{ key: string; label: string; x: number; y: number; category: string }>;
};

export type CareerSupportingEvidenceV1 = {
  contractVersion: typeof CAREER_SUPPORTING_EVIDENCE_V1_VERSION;
  quickAnswers: Array<CareerEvidenceTable & { key: "does" | "difference" | "salary"; answer: string }>;
  onet: {
    tables: Array<CareerEvidenceTable & { key: "tasks" | "skills" | "abilities" | "knowledge" | "work_context" | "job_zone" }>;
    reviewedAt: string | null;
  };
  aiCases: Array<{
    organization: string;
    summary: string;
    sourceLabel: string;
    sourceUrl: string;
    reviewedAt: string;
  }>;
  careerPath: CareerEvidenceTable | null;
  chinaReference: {
    market: string;
    sample: string;
    capturedAt: string;
    boundary: string;
    sourceKeys: string[];
    tables: CareerEvidenceTable[];
  } | null;
  marketFacts: Array<{ key: "annual_openings" | "hot_skills" | "china_openings"; label: string; value: string; sourceKeys: string[] }>;
  charts: {
    taskAutomation: CareerEvidenceChart | null;
    riasec: CareerEvidenceChart | null;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function strings(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const normalized = value.map(text);
  return normalized.some((item) => item === null) ? null : normalized as string[];
}

function rows(value: unknown): CareerEvidenceRow[] | null {
  if (!Array.isArray(value)) return null;
  const normalized: CareerEvidenceRow[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const row: CareerEvidenceRow = {};
    for (const [key, raw] of Object.entries(item)) {
      const normalizedKey = text(key);
      const normalizedValue = text(raw);
      if (!normalizedKey || !normalizedValue) return null;
      row[normalizedKey] = normalizedValue;
    }
    if (Object.keys(row).length === 0) return null;
    normalized.push(row);
  }
  return normalized;
}

function table(value: unknown): CareerEvidenceTable | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  const normalizedRows = rows(value.rows);
  const sourceKeys = strings(value.source_keys);
  return title && normalizedRows && normalizedRows.length > 0 && sourceKeys && sourceKeys.length > 0
    ? { title, rows: normalizedRows, sourceKeys }
    : null;
}

function safeSourceUrl(value: unknown): string | null {
  const source = text(value);
  if (!source) return null;
  try {
    const parsed = new URL(source);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function chart(value: unknown): CareerEvidenceChart | null {
  if (!isRecord(value)) return null;
  const title = text(value.title);
  const ariaLabel = text(value.aria_label);
  const caption = text(value.caption);
  const sourceKeys = strings(value.source_keys);
  if (!title || !ariaLabel || !caption || !sourceKeys?.length || !Array.isArray(value.legend) || !Array.isArray(value.points)) {
    return null;
  }
  const legend: CareerEvidenceChart["legend"] = [];
  for (const item of value.legend) {
    if (!isRecord(item)) return null;
    const label = text(item.label);
    const color = text(item.color);
    if (!label || !color || !/^#[0-9a-f]{6}$/iu.test(color)) return null;
    legend.push({ label, color });
  }
  const points: CareerEvidenceChart["points"] = [];
  for (const item of value.points) {
    if (!isRecord(item)) return null;
    const key = text(item.key);
    const label = text(item.label);
    const category = text(item.category);
    const x = item.x;
    const y = item.y;
    if (!key || !label || !category || typeof x !== "number" || typeof y !== "number" || x < 0 || x > 100 || y < 0 || y > 100) {
      return null;
    }
    points.push({ key, label, category, x, y });
  }
  return legend.length > 0 && points.length > 0 ? { title, ariaLabel, caption, sourceKeys, legend, points } : null;
}

export function normalizeCareerSupportingEvidenceV1(value: unknown): CareerSupportingEvidenceV1 | null {
  if (!isRecord(value) || value.contract_version !== CAREER_SUPPORTING_EVIDENCE_V1_VERSION) return null;

  const quickAnswers: CareerSupportingEvidenceV1["quickAnswers"] = [];
  if (!Array.isArray(value.quick_answers)) return null;
  for (const item of value.quick_answers) {
    if (!isRecord(item)) return null;
    const key = text(item.key);
    const answer = text(item.answer);
    const normalizedTable = table(item);
    if ((key !== "does" && key !== "difference" && key !== "salary") || !answer || !normalizedTable) return null;
    quickAnswers.push({ key, answer, ...normalizedTable });
  }

  if (!isRecord(value.onet) || !Array.isArray(value.onet.tables)) return null;
  const allowedOnetKeys = new Set(["tasks", "skills", "abilities", "knowledge", "work_context", "job_zone"]);
  const onetTables: CareerSupportingEvidenceV1["onet"]["tables"] = [];
  for (const item of value.onet.tables) {
    if (!isRecord(item)) return null;
    const key = text(item.key);
    const normalizedTable = table(item);
    if (!key || !allowedOnetKeys.has(key) || !normalizedTable) return null;
    onetTables.push({ key: key as CareerSupportingEvidenceV1["onet"]["tables"][number]["key"], ...normalizedTable });
  }

  const aiCases: CareerSupportingEvidenceV1["aiCases"] = [];
  if (!Array.isArray(value.ai_cases)) return null;
  for (const item of value.ai_cases) {
    if (!isRecord(item)) return null;
    const organization = text(item.organization);
    const summary = text(item.summary);
    const sourceLabel = text(item.source_label);
    const sourceUrl = safeSourceUrl(item.source_url);
    const reviewedAt = text(item.reviewed_at);
    if (!organization || !summary || !sourceLabel || !sourceUrl || !reviewedAt) return null;
    aiCases.push({ organization, summary, sourceLabel, sourceUrl, reviewedAt });
  }

  let careerPath: CareerEvidenceTable | null = null;
  if (value.career_path !== null && value.career_path !== undefined) {
    careerPath = table(value.career_path);
    if (!careerPath) return null;
  }

  let chinaReference: CareerSupportingEvidenceV1["chinaReference"] = null;
  if (value.china_reference !== null && value.china_reference !== undefined) {
    if (!isRecord(value.china_reference) || !Array.isArray(value.china_reference.tables)) return null;
    const market = text(value.china_reference.market);
    const sample = text(value.china_reference.sample);
    const capturedAt = text(value.china_reference.captured_at);
    const boundary = text(value.china_reference.boundary);
    const sourceKeys = strings(value.china_reference.source_keys);
    const tables = value.china_reference.tables.map(table);
    if (!market || !sample || !capturedAt || !boundary || !sourceKeys?.length || tables.some((item) => item === null)) return null;
    chinaReference = { market, sample, capturedAt, boundary, sourceKeys, tables: tables as CareerEvidenceTable[] };
  }

  const marketFacts: CareerSupportingEvidenceV1["marketFacts"] = [];
  if (!Array.isArray(value.market_facts)) return null;
  for (const item of value.market_facts) {
    if (!isRecord(item)) return null;
    const key = text(item.key);
    const label = text(item.label);
    const factValue = text(item.value);
    const sourceKeys = strings(item.source_keys);
    if ((key !== "annual_openings" && key !== "hot_skills" && key !== "china_openings") || !label || !factValue || !sourceKeys?.length) return null;
    marketFacts.push({ key, label, value: factValue, sourceKeys });
  }

  if (!isRecord(value.charts)) return null;
  const taskAutomation = value.charts.task_automation == null ? null : chart(value.charts.task_automation);
  const riasec = value.charts.riasec == null ? null : chart(value.charts.riasec);
  if ((value.charts.task_automation != null && !taskAutomation) || (value.charts.riasec != null && !riasec)) return null;

  return {
    contractVersion: CAREER_SUPPORTING_EVIDENCE_V1_VERSION,
    quickAnswers,
    onet: { tables: onetTables, reviewedAt: text(value.onet.reviewed_at) },
    aiCases,
    careerPath,
    chinaReference,
    marketFacts,
    charts: { taskAutomation, riasec },
  };
}
