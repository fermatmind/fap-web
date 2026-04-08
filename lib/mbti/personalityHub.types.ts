export interface HubCtaLink {
  label: string;
  href: string;
  kind: "primary" | "secondary" | "tertiary";
  trackingSurface?: string;
}

export interface HubMetric {
  key: string;
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "friction";
}

export interface ScenarioCard {
  key: string;
  title: string;
  summary: string;
  href: string;
  metric?: HubMetric;
  cta?: HubCtaLink;
}

export interface ScenarioMatrixCard {
  key: string;
  title: string;
  summary: string;
  href: string;
  primaryMetric: HubMetric;
  secondaryMetric?: HubMetric;
  primaryCta: HubCtaLink;
  secondaryCta?: HubCtaLink;
  familyHints: string[];
  topTypeCodes: string[];
}

export interface TypeDecisionCard {
  typeCode: string;
  slug: string;
  title: string;
  excerpt: string;
  href: string;
  groupKey: string;
  groupTitle: string;
  launchTier: "stable" | "candidate" | "hold";
  integrity_state?: string;
  claim_permissions?: string[];
}

export interface CareerPreviewCard {
  key: string;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
  matchedJobSlugs: string[];
}

export type TypeWorkbenchSortKey =
  | "all"
  | "stable"
  | "recommendation"
  | "introvert"
  | "extravert"
  | "analysts"
  | "diplomats"
  | "sentinels"
  | "explorers";

export type TypeWorkbenchTraitKey =
  | "introvert"
  | "extravert"
  | "intuition"
  | "sensing"
  | "thinking"
  | "feeling"
  | "judging"
  | "perceiving";

export interface TypeWorkbenchSortOption {
  key: TypeWorkbenchSortKey;
  label: string;
  description: string;
}

export interface TypeWorkbenchCard extends TypeDecisionCard {
  recommendationHref: string;
  recommendationReady: boolean;
  derivedTraitKeys: TypeWorkbenchTraitKey[];
  derivedTraitLabels: string[];
}

export interface TypeWorkbenchPayload {
  sortOptions: TypeWorkbenchSortOption[];
  cards: TypeWorkbenchCard[];
}

export interface QuickLocateTypeResult {
  kind: "type";
  typeCode: string;
  title: string;
  excerpt: string;
  href: string;
  recommendationHref: string;
  groupKey: string;
  groupTitle: string;
  launchTier: "stable" | "candidate" | "hold";
  keywords: string[];
}

export interface QuickLocateCareerResult {
  kind: "career";
  slug: string;
  title: string;
  summary: string;
  href: string;
  keywords: string[];
}

export interface MethodologyBlock {
  key: string;
  title: string;
  body: string;
}

export interface FaqBlock {
  question: string;
  answer: string;
}

export interface QuickLocateResult {
  query: string;
  matchedTypeCodes: string[];
  typeResults: QuickLocateTypeResult[];
  careerResults: QuickLocateCareerResult[];
}

export interface PersonalityHubHero {
  eyebrow: string;
  title: string;
  summary: string;
  primaryCta: HubCtaLink;
  secondaryCta: HubCtaLink;
  discoverabilityLinks: HubCtaLink[];
  metrics: HubMetric[];
}

export interface PersonalityHubFamilyGroup {
  groupKey: string;
  title: string;
  summary: string;
  cards: TypeDecisionCard[];
}

export interface PersonalityHubPayload {
  hero: PersonalityHubHero;
  scenarioCards: ScenarioCard[];
  scenarioMatrixSeed: ScenarioCard[];
  familyGroups: PersonalityHubFamilyGroup[];
  typeDecisionCards: TypeDecisionCard[];
  typeWorkbenchSeed: TypeWorkbenchCard[];
  careerPreviewCards: CareerPreviewCard[];
  methodologyBlocks: MethodologyBlock[];
  faqBlocks: FaqBlock[];
  inventoryLinks: { typeCode: string; href: string }[];
  quickLocateSeed: QuickLocateResult[];
  integrity_state?: string;
  claim_permissions?: string[];
  faqItems?: FaqBlock[];
  methodologyItems?: MethodologyBlock[];
  jsonLdInputs?: {
    faqItems?: FaqBlock[];
    typeItemList?: { name: string; url: string }[];
  };
}
