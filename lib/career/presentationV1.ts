export const CAREER_PRESENTATION_V1_VERSION = "career.detail.presentation.v1" as const;
export const CAREER_PRESENTATION_V1_DESIGN_AUTHORITY_ID = "career-dossier-page-v1.2" as const;
export const CAREER_V12_DESIGN_AUTHORITY_SHA256 =
  "85c71abac0180a6807222b297e66b0dd611ca79a5cc4bd17db5da416459eafe7" as const;

export const CAREER_PRESENTATION_V1_BADGE_KEYS = ["interest", "scene", "risk"] as const;
export const CAREER_PRESENTATION_V1_STAT_KEYS = [
  "us_median_pay",
  "us_growth",
  "employment",
  "annual_openings",
  "ai_exposure",
] as const;

export type CareerPresentationHeroBadgeKey = (typeof CAREER_PRESENTATION_V1_BADGE_KEYS)[number];
export type CareerPresentationHeroStatKey = (typeof CAREER_PRESENTATION_V1_STAT_KEYS)[number];

export type CareerPresentationHeroBadge = {
  key: CareerPresentationHeroBadgeKey;
  sourceIndex: number;
  text: string;
};

export type CareerPresentationHeroStat = {
  key: CareerPresentationHeroStatKey;
  sourceIndex: number;
  label: string;
  value: string;
  sourceLabel: string | null;
  sourceKeys: string[];
};

export type CareerPresentationAiExposure = {
  availability: "published";
  value: number;
  scale: 10;
  displayValue: string;
  label: "AI 曝光评分" | "AI任务暴露";
  note: string | null;
  metricKind: "fermatmind_internal_rubric";
  sourceLabel: "FermatMind 内部 rubric" | "FermatMind 任务级 rubric";
};

export type CareerPresentationCta = {
  availability: "published";
  label: string;
  href: string;
};

export type CareerPresentationV1 = {
  contractVersion: typeof CAREER_PRESENTATION_V1_VERSION;
  designAuthority: {
    id: typeof CAREER_PRESENTATION_V1_DESIGN_AUTHORITY_ID;
    sha256: typeof CAREER_V12_DESIGN_AUTHORITY_SHA256;
  };
  hero: {
    titleZh: string | null;
    titleEn: string | null;
    socCode: string | null;
    onetCode: string | null;
    badges: CareerPresentationHeroBadge[];
    lead: string | null;
    aiExposure: CareerPresentationAiExposure | null;
    stats: CareerPresentationHeroStat[];
    cta: CareerPresentationCta | null;
  };
  notices: {
    snapshotCallout: string | null;
    salaryBoundary: string | null;
    usageBoundary: string[];
  };
};

type Normalized<T> = { valid: true; value: T } | { valid: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function nullableString(value: unknown): Normalized<string | null> {
  if (value === null) return { valid: true, value: null };
  const normalized = nonEmptyString(value);
  return normalized ? { valid: true, value: normalized } : { valid: false };
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  return actual.length === sortedExpected.length && actual.every((key, index) => key === sortedExpected[index]);
}

function normalizeBadges(value: unknown): Normalized<CareerPresentationHeroBadge[]> {
  if (!Array.isArray(value) || value.length !== CAREER_PRESENTATION_V1_BADGE_KEYS.length) return { valid: false };

  const badges: CareerPresentationHeroBadge[] = [];
  for (const [sourceIndex, item] of value.entries()) {
    const expectedKey = CAREER_PRESENTATION_V1_BADGE_KEYS[sourceIndex];
    if (!isRecord(item) || !hasExactKeys(item, ["key", "text", "availability"]) || item.key !== expectedKey) {
      return { valid: false };
    }
    if (item.availability === "missing" && item.text === null) continue;
    const text = nonEmptyString(item.text);
    if (item.availability !== "published" || !text) return { valid: false };
    badges.push({ key: expectedKey, sourceIndex, text });
  }
  return { valid: true, value: badges };
}

function normalizeStats(value: unknown): Normalized<CareerPresentationHeroStat[]> {
  if (!Array.isArray(value) || value.length > CAREER_PRESENTATION_V1_STAT_KEYS.length) return { valid: false };

  const stats: CareerPresentationHeroStat[] = [];
  let previousPosition = -1;
  for (const [sourceIndex, item] of value.entries()) {
    if (!isRecord(item) || !hasExactKeys(item, ["key", "value", "label", "source_label", "source_keys", "availability"])) {
      return { valid: false };
    }
    const position = CAREER_PRESENTATION_V1_STAT_KEYS.indexOf(item.key as CareerPresentationHeroStatKey);
    const valueText = nonEmptyString(item.value);
    const label = nonEmptyString(item.label);
    const sourceLabel = nullableString(item.source_label);
    const sourceKeys = Array.isArray(item.source_keys) ? item.source_keys.map(nonEmptyString) : [];
    if (
      position < 0 ||
      position <= previousPosition ||
      item.availability !== "published" ||
      !valueText ||
      !label ||
      !sourceLabel.valid ||
      sourceKeys.length === 0 ||
      sourceKeys.some((sourceKey) => sourceKey === null)
    ) {
      return { valid: false };
    }
    previousPosition = position;
    stats.push({
      key: item.key as CareerPresentationHeroStatKey,
      sourceIndex,
      label,
      value: valueText,
      sourceLabel: sourceLabel.value,
      sourceKeys: sourceKeys as string[],
    });
  }
  return { valid: true, value: stats };
}

function normalizeAiExposure(value: unknown): Normalized<CareerPresentationAiExposure | null> {
  if (!isRecord(value) || !hasExactKeys(value, [
    "value", "scale", "display_value", "label", "note", "metric_kind", "source_label", "availability",
  ])) {
    return { valid: false };
  }
  const labelAndSourceAreValid =
    (value.label === "AI 曝光评分" && value.source_label === "FermatMind 内部 rubric") ||
    (value.label === "AI任务暴露" && value.source_label === "FermatMind 任务级 rubric");
  if (
    value.scale !== 10 ||
    !labelAndSourceAreValid ||
    value.metric_kind !== "fermatmind_internal_rubric" ||
    typeof value.label !== "string" ||
    typeof value.source_label !== "string"
  ) {
    return { valid: false };
  }
  const note = nullableString(value.note);
  if (!note.valid) return { valid: false };
  if (value.availability === "missing" && value.value === null && value.display_value === null) {
    return { valid: true, value: null };
  }
  if (
    value.availability !== "published" ||
    !Number.isInteger(value.value) ||
    (value.value as number) < 0 ||
    (value.value as number) > 10 ||
    value.display_value !== `${value.value}/10`
  ) {
    return { valid: false };
  }
  return {
    valid: true,
    value: {
      availability: "published",
      value: value.value as number,
      scale: 10,
      displayValue: value.display_value as string,
      label: value.label as CareerPresentationAiExposure["label"],
      note: note.value,
      metricKind: "fermatmind_internal_rubric",
      sourceLabel: value.source_label as CareerPresentationAiExposure["sourceLabel"],
    },
  };
}

function normalizeCta(value: unknown): Normalized<CareerPresentationCta | null> {
  if (!isRecord(value) || !hasExactKeys(value, ["label", "href", "availability"])) return { valid: false };
  if (value.availability === "missing" && value.label === null && value.href === null) {
    return { valid: true, value: null };
  }
  const label = nonEmptyString(value.label);
  const href = nonEmptyString(value.href);
  if (value.availability !== "published" || !label || !href) return { valid: false };
  return { valid: true, value: { availability: "published", label, href } };
}

export function normalizeCareerPresentationV1(value: unknown): CareerPresentationV1 | null {
  if (!isRecord(value) || !hasExactKeys(value, ["contract_version", "design_authority", "hero", "notices"])) {
    return null;
  }
  if (value.contract_version !== CAREER_PRESENTATION_V1_VERSION || !isRecord(value.design_authority)) return null;
  if (
    !hasExactKeys(value.design_authority, ["id", "sha256"]) ||
    value.design_authority.id !== CAREER_PRESENTATION_V1_DESIGN_AUTHORITY_ID ||
    value.design_authority.sha256 !== CAREER_V12_DESIGN_AUTHORITY_SHA256 ||
    !isRecord(value.hero) ||
    !hasExactKeys(value.hero, [
      "title_zh", "title_en", "soc_code", "onet_code", "badges", "lead", "ai_exposure", "stats", "cta",
    ]) ||
    !isRecord(value.notices) ||
    !hasExactKeys(value.notices, ["snapshot_callout", "salary_boundary", "usage_boundary"])
  ) {
    return null;
  }

  const titleZh = nullableString(value.hero.title_zh);
  const titleEn = nullableString(value.hero.title_en);
  const socCode = nullableString(value.hero.soc_code);
  const onetCode = nullableString(value.hero.onet_code);
  const lead = nullableString(value.hero.lead);
  const badges = normalizeBadges(value.hero.badges);
  const stats = normalizeStats(value.hero.stats);
  const aiExposure = normalizeAiExposure(value.hero.ai_exposure);
  const cta = normalizeCta(value.hero.cta);
  const snapshotCallout = nullableString(value.notices.snapshot_callout);
  const salaryBoundary = nullableString(value.notices.salary_boundary);
  const usageBoundary = Array.isArray(value.notices.usage_boundary)
    ? value.notices.usage_boundary.map(nonEmptyString)
    : [];

  if (
    !titleZh.valid ||
    !titleEn.valid ||
    !socCode.valid ||
    (socCode.value !== null && !/^\d{2}-\d{4}$/u.test(socCode.value)) ||
    !onetCode.valid ||
    (onetCode.value !== null && !/^\d{2}-\d{4}\.\d{2}$/u.test(onetCode.value)) ||
    !lead.valid ||
    !badges.valid ||
    !stats.valid ||
    !cta.valid ||
    !snapshotCallout.valid ||
    !salaryBoundary.valid ||
    !Array.isArray(value.notices.usage_boundary) ||
    usageBoundary.some((notice) => notice === null)
  ) {
    return null;
  }

  return {
    contractVersion: CAREER_PRESENTATION_V1_VERSION,
    designAuthority: {
      id: CAREER_PRESENTATION_V1_DESIGN_AUTHORITY_ID,
      sha256: CAREER_V12_DESIGN_AUTHORITY_SHA256,
    },
    hero: {
      titleZh: titleZh.value,
      titleEn: titleEn.value,
      socCode: socCode.value,
      onetCode: onetCode.value,
      badges: badges.value,
      lead: lead.value,
      aiExposure: aiExposure.valid ? aiExposure.value : null,
      stats: stats.value,
      cta: cta.value,
    },
    notices: {
      snapshotCallout: snapshotCallout.value,
      salaryBoundary: salaryBoundary.value,
      usageBoundary: usageBoundary as string[],
    },
  };
}
