import type { ReportResponse } from "@/lib/api/v0_3";

export type MbtiPreviewCardViewModel = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
  tips: string[];
  tags: string[];
  accessLevel: "free" | "preview";
  moduleCode: string;
};

export type MbtiPreviewViewModel = {
  isPreviewMode: boolean;
  previewModules: string[];
  visibleSections: string[];
  visibleCardsBySection: Record<string, MbtiPreviewCardViewModel[]>;
  hasVisiblePreviewCards: boolean;
};

const SECTION_DEFAULT_MODULE_CODES: Record<string, string> = {
  traits: "core_full",
  growth: "core_full",
  career: "career",
  relationships: "relationships",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function resolveReportPayload(reportData: ReportResponse | null | undefined): Record<string, unknown> | null {
  return asRecord(reportData?.report);
}

function resolveDefaultModuleCode(sectionKey: string): string {
  return SECTION_DEFAULT_MODULE_CODES[sectionKey] ?? sectionKey;
}

function normalizeModules(value: unknown): string[] {
  return Array.from(
    new Set(
      normalizeStringArray(value)
        .map((item) => item.toLowerCase())
        .filter(Boolean)
    )
  );
}

function normalizePreviewCard(
  raw: Record<string, unknown>,
  sectionKey: string,
  sectionModuleCode: string
): MbtiPreviewCardViewModel | null {
  const accessLevel = normalizeText(raw.access_level).toLowerCase();
  if (accessLevel !== "free" && accessLevel !== "preview") {
    return null;
  }

  const title = normalizeText(raw.title, raw.label);
  const body = normalizeText(raw.desc, raw.body, raw.content, raw.text);
  const bullets = normalizeStringArray(raw.bullets);
  if (!title && !body && bullets.length === 0) {
    return null;
  }

  const moduleCode = normalizeText(raw.module_code).toLowerCase() || sectionModuleCode || resolveDefaultModuleCode(sectionKey);

  return {
    id: normalizeText(raw.id),
    title,
    body,
    bullets,
    tips: normalizeStringArray(raw.tips),
    tags: normalizeStringArray(raw.tags),
    accessLevel,
    moduleCode,
  };
}

function isVisiblePreviewCard(
  card: MbtiPreviewCardViewModel,
  isPreviewMode: boolean,
  previewModules: Set<string>
): boolean {
  if (!isPreviewMode) {
    return false;
  }

  if (card.accessLevel === "free") {
    return card.moduleCode === "" || card.moduleCode === "core_free" || previewModules.has(card.moduleCode);
  }

  if (previewModules.size === 0) {
    return false;
  }

  return previewModules.has(card.moduleCode);
}

export function buildMbtiPreviewViewModel(reportData: ReportResponse): MbtiPreviewViewModel {
  const variant = normalizeText(reportData.variant).toLowerCase();
  const previewModules = normalizeModules(reportData.modules_preview);
  const previewModuleSet = new Set(previewModules);
  const isPreviewMode = reportData.locked === true || variant === "free";
  const payload = resolveReportPayload(reportData);
  const sectionsNode = payload?.sections;
  const visibleCardsBySection: Record<string, MbtiPreviewCardViewModel[]> = {};

  if (Array.isArray(sectionsNode)) {
    for (const rawSection of sectionsNode) {
      const section = asRecord(rawSection);
      if (!section) {
        continue;
      }

      const sectionKey = normalizeText(section.key).toLowerCase();
      if (!sectionKey) {
        continue;
      }

      const sectionModuleCode = normalizeText(section.module_code).toLowerCase() || resolveDefaultModuleCode(sectionKey);
      const visibleCards = asArray<Record<string, unknown>>(section.blocks)
        .map((rawCard) => normalizePreviewCard(rawCard, sectionKey, sectionModuleCode))
        .filter((card): card is MbtiPreviewCardViewModel => Boolean(card))
        .filter((card) => isVisiblePreviewCard(card, isPreviewMode, previewModuleSet));

      if (visibleCards.length > 0) {
        visibleCardsBySection[sectionKey] = visibleCards;
      }
    }
  } else {
    const sections = asRecord(sectionsNode);
    if (sections) {
      for (const [key, rawValue] of Object.entries(sections)) {
        const section = asRecord(rawValue);
        if (!section) {
          continue;
        }

        const sectionKey = normalizeText(key).toLowerCase();
        if (!sectionKey) {
          continue;
        }

        const sectionModuleCode = normalizeText(section.module_code).toLowerCase() || resolveDefaultModuleCode(sectionKey);
        const visibleCards = asArray<Record<string, unknown>>(section.cards)
          .map((rawCard) => normalizePreviewCard(rawCard, sectionKey, sectionModuleCode))
          .filter((card): card is MbtiPreviewCardViewModel => Boolean(card))
          .filter((card) => isVisiblePreviewCard(card, isPreviewMode, previewModuleSet));

        if (visibleCards.length > 0) {
          visibleCardsBySection[sectionKey] = visibleCards;
        }
      }
    }
  }

  const visibleSections = Object.entries(visibleCardsBySection)
    .filter(([, cards]) => cards.some((card) => card.accessLevel === "preview"))
    .map(([sectionKey]) => sectionKey);

  return {
    isPreviewMode,
    previewModules,
    visibleSections,
    visibleCardsBySection,
    hasVisiblePreviewCards: visibleSections.length > 0,
  };
}
