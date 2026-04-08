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
  familyGroups: PersonalityHubFamilyGroup[];
  typeDecisionCards: TypeDecisionCard[];
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
