import type {
  MbtiPreviewCardRaw,
  MbtiPreviewContractV1Raw,
  MbtiPreviewSectionRaw,
  ReportResponse,
} from "@/lib/api/v0_3";

export type MbtiPreviewCardViewModel = {
  id: string;
  title: string;
  body: string;
  bullets: string[];
  tips: string[];
  tags: string[];
  accessLevel: "preview";
  moduleCode: string;
};

export type MbtiPreviewSectionViewModel = {
  key: string;
  moduleCode: string;
  hasPreviewContent: boolean;
  previewCards: MbtiPreviewCardViewModel[];
  hasLockedRemainder: boolean;
};

export type MbtiPreviewViewModel = {
  isPreviewMode: boolean;
  previewModules: string[];
  sections: MbtiPreviewSectionViewModel[];
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
  if (accessLevel !== "preview") {
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
    accessLevel: "preview",
    moduleCode,
  };
}

function normalizePreviewContractCard(raw: MbtiPreviewCardRaw): MbtiPreviewCardViewModel | null {
  const title = normalizeText(raw.title);
  const body = normalizeText(raw.body);
  const bullets = normalizeStringArray(raw.bullets);
  if (!title && !body && bullets.length === 0) {
    return null;
  }

  return {
    id: normalizeText(raw.id),
    title,
    body,
    bullets,
    tips: normalizeStringArray(raw.tips),
    tags: normalizeStringArray(raw.tags),
    accessLevel: "preview",
    moduleCode: normalizeText(raw.module_code).toLowerCase(),
  };
}

function isVisiblePreviewCard(card: MbtiPreviewCardViewModel, previewModules: Set<string>): boolean {
  if (previewModules.size === 0) {
    return false;
  }

  return card.moduleCode === "" || card.moduleCode === "core_free" || previewModules.has(card.moduleCode);
}

function buildSectionViewModel(
  key: string,
  moduleCode: string,
  previewCards: MbtiPreviewCardViewModel[],
  hasLockedRemainder: boolean
): MbtiPreviewSectionViewModel {
  return {
    key,
    moduleCode,
    hasPreviewContent: previewCards.length > 0,
    previewCards,
    hasLockedRemainder,
  };
}

function finalizeViewModel(
  sections: MbtiPreviewSectionViewModel[],
  previewModules: string[],
  isPreviewMode: boolean
): MbtiPreviewViewModel {
  const visibleSections = sections.filter((section) => section.hasPreviewContent).map((section) => section.key);
  const visibleCardsBySection = Object.fromEntries(
    sections
      .filter((section) => section.previewCards.length > 0)
      .map((section) => [section.key, section.previewCards])
  ) as Record<string, MbtiPreviewCardViewModel[]>;

  return {
    isPreviewMode,
    previewModules,
    sections,
    visibleSections,
    visibleCardsBySection,
    hasVisiblePreviewCards: visibleSections.length > 0,
  };
}

function buildPreviewViewModelFromContract(raw: MbtiPreviewContractV1Raw): MbtiPreviewViewModel {
  const previewModules = normalizeModules(raw.modules);
  const sections = asArray<MbtiPreviewSectionRaw>(raw.sections)
    .map((rawSection) => {
      const key = normalizeText(rawSection.key).toLowerCase();
      if (!key) {
        return null;
      }

      const moduleCode = normalizeText(rawSection.module_code).toLowerCase() || resolveDefaultModuleCode(key);
      const previewCards = asArray<MbtiPreviewCardRaw>(rawSection.visible_preview_cards)
        .map((rawCard) => normalizePreviewContractCard(rawCard))
        .filter((card): card is MbtiPreviewCardViewModel => Boolean(card));

      return buildSectionViewModel(
        key,
        moduleCode,
        previewCards,
        rawSection.has_locked_remainder === true
      );
    })
    .filter((section): section is MbtiPreviewSectionViewModel => Boolean(section));

  return finalizeViewModel(sections, previewModules, raw.mode === "module_preview");
}

function buildPreviewViewModelFromLegacyReport(reportData: ReportResponse): MbtiPreviewViewModel {
  const variant = normalizeText(reportData.variant).toLowerCase();
  const previewModules = normalizeModules(reportData.modules_preview);
  const previewModuleSet = new Set(previewModules);
  const payload = resolveReportPayload(reportData);
  const sectionsNode = payload?.sections;
  const sections: MbtiPreviewSectionViewModel[] = [];

  const pushSection = (
    sectionKey: string,
    sectionModuleCode: string,
    rawCards: Record<string, unknown>[],
    rawSection?: Record<string, unknown> | null
  ) => {
    const previewCards = rawCards
      .map((rawCard) => normalizePreviewCard(rawCard, sectionKey, sectionModuleCode))
      .filter((card): card is MbtiPreviewCardViewModel => Boolean(card))
      .filter((card) => isVisiblePreviewCard(card, previewModuleSet));

    const sectionAccessLevel = normalizeText(rawSection?.access_level).toLowerCase();
    const hasLockedRemainder =
      rawSection?.locked === true ||
      sectionAccessLevel === "paid" ||
      rawCards.some((card) => normalizeText(card.access_level).toLowerCase() === "paid");

    sections.push(buildSectionViewModel(sectionKey, sectionModuleCode, previewCards, hasLockedRemainder));
  };

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
      pushSection(sectionKey, sectionModuleCode, asArray<Record<string, unknown>>(section.blocks), section);
    }
  } else {
    const sectionsRecord = asRecord(sectionsNode);
    if (sectionsRecord) {
      for (const [key, rawValue] of Object.entries(sectionsRecord)) {
        const section = asRecord(rawValue);
        if (!section) {
          continue;
        }

        const sectionKey = normalizeText(key).toLowerCase();
        if (!sectionKey) {
          continue;
        }

        const sectionModuleCode = normalizeText(section.module_code).toLowerCase() || resolveDefaultModuleCode(sectionKey);
        pushSection(sectionKey, sectionModuleCode, asArray<Record<string, unknown>>(section.cards), section);
      }
    }
  }

  const visibleSectionKeys = sections.filter((section) => section.hasPreviewContent).map((section) => section.key);
  const isPreviewMode = (reportData.locked === true || variant === "free") && (previewModules.length > 0 || visibleSectionKeys.length > 0);

  return finalizeViewModel(sections, previewModules, isPreviewMode);
}

export function buildMbtiPreviewViewModel(reportData: ReportResponse): MbtiPreviewViewModel {
  if (reportData.mbti_preview_v1) {
    return buildPreviewViewModelFromContract(reportData.mbti_preview_v1);
  }

  return buildPreviewViewModelFromLegacyReport(reportData);
}
