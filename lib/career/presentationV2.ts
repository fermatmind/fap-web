import type { CareerDisplayComponentId } from "@/lib/career/displaySurface";

export const CAREER_PRESENTATION_V2_VERSION = "career.detail.presentation.v2" as const;
export const CAREER_PRESENTATION_V2_DESIGN_AUTHORITY = "universal-career-dossier-v2" as const;
export const CAREER_PRESENTATION_V2_TEMPLATE_ID = "career-dossier-universal-v2" as const;

export type CareerPresentationV2ContentState = "enhanced" | "legacy";

export type CareerPresentationV2Group = {
  id: string;
  label: string;
  componentIds: CareerDisplayComponentId[];
  contentState: CareerPresentationV2ContentState;
  pendingEnrichment: "display_placeholder" | null;
};

export type CareerPresentationV2 = {
  contractVersion: typeof CAREER_PRESENTATION_V2_VERSION;
  designAuthority: typeof CAREER_PRESENTATION_V2_DESIGN_AUTHORITY;
  templateId: typeof CAREER_PRESENTATION_V2_TEMPLATE_ID;
  locale: "en" | "zh-CN";
  hero: {
    title: string;
    lead: string | null;
    badges: Array<{ key: string; text: string }>;
    stats: Array<{ key: string; label: string; value: string; sourceLabel: string | null }>;
    aiExposure: {
      value: number;
      scale: 10;
      displayValue: string;
      label: string;
      note: string | null;
      sourceLabel: string;
    } | null;
    cta: { label: string; href: string } | null;
  };
  groups: CareerPresentationV2Group[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function normalizeCareerPresentationV2(
  value: unknown,
  locale: "zh" | "en",
  componentOrder: readonly CareerDisplayComponentId[]
): CareerPresentationV2 | null {
  if (!isRecord(value) || !exactKeys(value, [
    "contract_version", "design_authority", "template_id", "locale", "hero", "groups",
  ])) return null;
  const expectedLocale = locale === "zh" ? "zh-CN" : "en";
  if (
    value.contract_version !== CAREER_PRESENTATION_V2_VERSION ||
    value.template_id !== CAREER_PRESENTATION_V2_TEMPLATE_ID ||
    value.locale !== expectedLocale ||
    !isRecord(value.design_authority) ||
    !exactKeys(value.design_authority, ["id"]) ||
    value.design_authority.id !== CAREER_PRESENTATION_V2_DESIGN_AUTHORITY ||
    !isRecord(value.hero) ||
    !exactKeys(value.hero, ["title", "lead", "badges", "stats", "ai_exposure", "cta"]) ||
    !Array.isArray(value.groups) ||
    value.groups.length === 0
  ) return null;

  const title = text(value.hero.title);
  const lead = value.hero.lead === null ? null : text(value.hero.lead);
  if (!title || (value.hero.lead !== null && !lead) || !Array.isArray(value.hero.badges) || !Array.isArray(value.hero.stats)) {
    return null;
  }
  const badges = value.hero.badges.map((item) => {
    if (!isRecord(item) || !exactKeys(item, ["key", "text"])) return null;
    const key = text(item.key);
    const badgeText = text(item.text);
    return key && badgeText ? { key, text: badgeText } : null;
  });
  const stats = value.hero.stats.map((item) => {
    if (!isRecord(item) || !exactKeys(item, ["key", "label", "value", "source_label"])) return null;
    const key = text(item.key);
    const label = text(item.label);
    const statValue = text(item.value);
    const sourceLabel = item.source_label === null ? null : text(item.source_label);
    return key && label && statValue && (item.source_label === null || sourceLabel)
      ? { key, label, value: statValue, sourceLabel }
      : null;
  });
  if (badges.some((item) => item === null) || stats.some((item) => item === null)) return null;

  let aiExposure: CareerPresentationV2["hero"]["aiExposure"] = null;
  if (value.hero.ai_exposure !== null) {
    const source = value.hero.ai_exposure;
    if (!isRecord(source) || !exactKeys(source, ["value", "scale", "display_value", "label", "note", "source_label"])) {
      return null;
    }
    const label = text(source.label);
    const sourceLabel = text(source.source_label);
    const note = source.note === null ? null : text(source.note);
    if (
      !Number.isInteger(source.value) || (source.value as number) < 0 || (source.value as number) > 10 ||
      source.scale !== 10 || source.display_value !== `${source.value}/10` || !label || !sourceLabel ||
      (source.note !== null && !note)
    ) return null;
    aiExposure = {
      value: source.value as number,
      scale: 10,
      displayValue: source.display_value as string,
      label,
      note,
      sourceLabel,
    };
  }

  let cta: CareerPresentationV2["hero"]["cta"] = null;
  if (value.hero.cta !== null) {
    if (!isRecord(value.hero.cta) || !exactKeys(value.hero.cta, ["label", "href"])) return null;
    const label = text(value.hero.cta.label);
    const href = text(value.hero.cta.href);
    if (!label || !href) return null;
    cta = { label, href };
  }

  const seenGroups = new Set<string>();
  const seenComponents = new Set<string>();
  const flattened: CareerDisplayComponentId[] = [];
  const groups: CareerPresentationV2Group[] = [];
  for (const item of value.groups) {
    if (!isRecord(item)) return null;
    const contentState = item.content_state;
    const expectedKeys = contentState === "legacy" && "pending_enrichment" in item
      ? ["id", "label", "component_ids", "content_state", "pending_enrichment"]
      : ["id", "label", "component_ids", "content_state"];
    const id = text(item.id);
    const label = text(item.label);
    if (
      !exactKeys(item, expectedKeys) || !id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id) || seenGroups.has(id) ||
      !label || (contentState !== "enhanced" && contentState !== "legacy") ||
      !Array.isArray(item.component_ids) || item.component_ids.length === 0
    ) return null;
    const componentIds: CareerDisplayComponentId[] = [];
    for (const componentId of item.component_ids) {
      if (typeof componentId !== "string" || !componentOrder.includes(componentId as CareerDisplayComponentId) || seenComponents.has(componentId)) {
        return null;
      }
      componentIds.push(componentId as CareerDisplayComponentId);
      flattened.push(componentId as CareerDisplayComponentId);
      seenComponents.add(componentId);
    }
    const pendingEnrichment = "pending_enrichment" in item ? item.pending_enrichment : null;
    if (pendingEnrichment !== null && (contentState !== "legacy" || pendingEnrichment !== "display_placeholder")) return null;
    seenGroups.add(id);
    groups.push({ id, label, componentIds, contentState, pendingEnrichment });
  }
  if (flattened.length !== componentOrder.length || flattened.some((componentId, index) => componentId !== componentOrder[index])) {
    return null;
  }

  return {
    contractVersion: CAREER_PRESENTATION_V2_VERSION,
    designAuthority: CAREER_PRESENTATION_V2_DESIGN_AUTHORITY,
    templateId: CAREER_PRESENTATION_V2_TEMPLATE_ID,
    locale: expectedLocale,
    hero: {
      title,
      lead,
      badges: badges as Array<{ key: string; text: string }>,
      stats: stats as Array<{ key: string; label: string; value: string; sourceLabel: string | null }>,
      aiExposure,
      cta,
    },
    groups,
  };
}
