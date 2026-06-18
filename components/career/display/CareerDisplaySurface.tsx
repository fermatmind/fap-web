import { BoundaryNotice } from "@/components/career/display/BoundaryNotice";
import { CareerDisplayCTA } from "@/components/career/display/CareerDisplayCTA";
import { CareerDisplayHero } from "@/components/career/display/CareerDisplayHero";
import { CareerFAQBlock } from "@/components/career/display/CareerFAQBlock";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { EvidenceContainer } from "@/components/career/display/EvidenceContainer";
import { FermatDecisionCard } from "@/components/career/display/FermatDecisionCard";
import { MarketSignalCard } from "@/components/career/display/MarketSignalCard";
import { RelatedNextPages } from "@/components/career/display/RelatedNextPages";
import { SourceList } from "@/components/career/display/SourceList";
import type {
  CareerDisplayClaimPermissions,
  CareerDisplaySection,
  CareerDisplaySurfaceViewModel,
  CareerDisplayTableRow,
} from "@/lib/career/displaySurface";
import type { AttributionParams } from "@/lib/tracking/attribution";

type CareerDisplaySurfaceProps = {
  surface: CareerDisplaySurfaceViewModel | null;
  ctaAttributionParams?: AttributionParams;
  ctaLandingPath?: string;
  suppressLegacySalaryMetadata?: boolean;
};

function findSection(sections: CareerDisplaySection[], component: string): CareerDisplaySection | null {
  return sections.find((section) => section.component === component) ?? null;
}

function findSections(sections: CareerDisplaySection[], component: string): CareerDisplaySection[] {
  return sections.filter((section) => section.component === component);
}

function textIncludesAny(value: string | undefined, patterns: string[]): boolean {
  const normalized = value?.toLowerCase() ?? "";
  return patterns.some((pattern) => normalized.includes(pattern));
}

const SALARY_CLAIM_PATTERNS = [
  "salary",
  "wage",
  "pay",
  "income",
  "compensation",
  "median",
  "hourly",
  "薪资",
  "工资",
  "收入",
  "薪酬",
  "中位",
  "时薪",
];

function rowIncludesSalaryClaim(row: CareerDisplayTableRow): boolean {
  return row.some((cell) => textIncludesAny(cell, SALARY_CLAIM_PATTERNS));
}

function stringListIncludesSalaryClaim(value: string[] | undefined): boolean {
  return (value ?? []).some((item) => textIncludesAny(item, SALARY_CLAIM_PATTERNS));
}

function bodyIncludesSalaryClaim(body: CareerDisplaySection["body"]): boolean {
  if (Array.isArray(body)) {
    return body.some((paragraph) => textIncludesAny(paragraph, SALARY_CLAIM_PATTERNS));
  }

  return textIncludesAny(body, SALARY_CLAIM_PATTERNS);
}

function sectionIncludesSalaryClaim(section: CareerDisplaySection): boolean {
  return (
    textIncludesAny(section.intro, SALARY_CLAIM_PATTERNS) ||
    bodyIncludesSalaryClaim(section.body) ||
    textIncludesAny(section.answer, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.fitTitle, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.cautionTitle, SALARY_CLAIM_PATTERNS) ||
    (section.rows ?? []).some(rowIncludesSalaryClaim) ||
    (section.entryTable ?? []).some(rowIncludesSalaryClaim) ||
    (section.signalMeta ?? []).some(rowIncludesSalaryClaim) ||
    stringListIncludesSalaryClaim(section.items) ||
    stringListIncludesSalaryClaim(section.fitItems) ||
    stringListIncludesSalaryClaim(section.cautionItems) ||
    stringListIncludesSalaryClaim(section.profile) ||
    stringListIncludesSalaryClaim(section.traits) ||
    stringListIncludesSalaryClaim(section.contexts) ||
    stringListIncludesSalaryClaim(section.keywords) ||
    stringListIncludesSalaryClaim(section.careerRisks) ||
    textIncludesAny(section.caveat, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.warning, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.note, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.interpretation, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.linkedinNote, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.score, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.question, SALARY_CLAIM_PATTERNS) ||
    textIncludesAny(section.fermatView, SALARY_CLAIM_PATTERNS) ||
    (section.checks ?? []).some((check) => (
      typeof check === "string"
        ? textIncludesAny(check, SALARY_CLAIM_PATTERNS)
        : textIncludesAny(check.title, SALARY_CLAIM_PATTERNS) ||
          textIncludesAny(check.question, SALARY_CLAIM_PATTERNS) ||
          textIncludesAny(check.note, SALARY_CLAIM_PATTERNS)
    )) ||
    (section.steps ?? []).some((step) => (
      textIncludesAny(step.title, SALARY_CLAIM_PATTERNS) ||
      stringListIncludesSalaryClaim(step.items)
    )) ||
    (section.faqItems ?? []).some((item) => (
      textIncludesAny(item.question, SALARY_CLAIM_PATTERNS) ||
      textIncludesAny(item.answer, SALARY_CLAIM_PATTERNS)
    ))
  );
}

const SEARCH_INTENT_METADATA_PATTERNS = [
  "search intent",
  "搜索意图",
  "career_exploration",
  "career_fit",
  "salary_and_outlook",
  "how_to_enter",
];

const LEGACY_SALARY_METADATA_PATTERNS = [
  "salary data type",
  "薪资数据类型",
  "industry_proxy",
  "source_bounded_reference_only",
  "recruitment_sample",
  "official_reference",
];

function sectionIncludesSearchIntentMetadata(section: CareerDisplaySection): boolean {
  return (
    textIncludesAny(section.heading, SEARCH_INTENT_METADATA_PATTERNS) ||
    (section.rows ?? []).some((row) => row.some((cell) => textIncludesAny(cell, SEARCH_INTENT_METADATA_PATTERNS))) ||
    stringListIncludesSalaryClaim(section.contexts) ||
    (section.contexts ?? []).some((item) => textIncludesAny(item, SEARCH_INTENT_METADATA_PATTERNS))
  );
}

function sectionIncludesLegacySalaryMetadata(section: CareerDisplaySection): boolean {
  const bodyHasLegacyMetadata = Array.isArray(section.body)
    ? section.body.some((paragraph) => textIncludesAny(paragraph, LEGACY_SALARY_METADATA_PATTERNS))
    : textIncludesAny(section.body, LEGACY_SALARY_METADATA_PATTERNS);

  return (
    textIncludesAny(section.heading, LEGACY_SALARY_METADATA_PATTERNS) ||
    bodyHasLegacyMetadata ||
    (section.rows ?? []).some((row) => row.some((cell) => textIncludesAny(cell, LEGACY_SALARY_METADATA_PATTERNS))) ||
    (section.signalMeta ?? []).some((row) => row.some((cell) => textIncludesAny(cell, LEGACY_SALARY_METADATA_PATTERNS)))
  );
}

function isLegacyMetadataSection(section: CareerDisplaySection): boolean {
  return sectionIncludesSearchIntentMetadata(section) || sectionIncludesLegacySalaryMetadata(section);
}

function stripSalaryClaims(section: CareerDisplaySection, allowSalaryComparison: boolean): CareerDisplaySection | null {
  if (allowSalaryComparison) {
    return section;
  }

  const rows = (section.rows ?? []).filter((row) => !rowIncludesSalaryClaim(row));
  const entryTable = (section.entryTable ?? []).filter((row) => !rowIncludesSalaryClaim(row));
  const signalMeta = (section.signalMeta ?? []).filter((row) => !rowIncludesSalaryClaim(row));
  const body = bodyIncludesSalaryClaim(section.body) ? undefined : section.body;
  const faqItems = (section.faqItems ?? []).filter(
    (item) =>
      !textIncludesAny(item.question, SALARY_CLAIM_PATTERNS) &&
      !textIncludesAny(item.answer, SALARY_CLAIM_PATTERNS)
  );
  const filterStrings = (value: string[] | undefined): string[] | undefined => {
    const filtered = (value ?? []).filter((item) => !textIncludesAny(item, SALARY_CLAIM_PATTERNS));
    return filtered.length > 0 ? filtered : undefined;
  };
  const checks = (section.checks ?? []).filter((check) => (
    typeof check === "string"
      ? !textIncludesAny(check, SALARY_CLAIM_PATTERNS)
      : !textIncludesAny(check.title, SALARY_CLAIM_PATTERNS) &&
        !textIncludesAny(check.question, SALARY_CLAIM_PATTERNS) &&
        !textIncludesAny(check.note, SALARY_CLAIM_PATTERNS)
  ));
  const steps = (section.steps ?? [])
    .map((step) => ({
      ...step,
      items: step.items.filter((item) => !textIncludesAny(item, SALARY_CLAIM_PATTERNS)),
    }))
    .filter((step) => !textIncludesAny(step.title, SALARY_CLAIM_PATTERNS) && step.items.length > 0);
  const hasContent =
    Boolean(body) ||
    Boolean(section.answer && !textIncludesAny(section.answer, SALARY_CLAIM_PATTERNS)) ||
    rows.length > 0 ||
    entryTable.length > 0 ||
    signalMeta.length > 0 ||
    Boolean(filterStrings(section.items)) ||
    Boolean(filterStrings(section.contexts)) ||
    checks.length > 0 ||
    Boolean(filterStrings(section.profile)) ||
    Boolean(section.heading);

  if (!hasContent) {
    return null;
  }

  return {
    ...section,
    ...(textIncludesAny(section.intro, SALARY_CLAIM_PATTERNS) ? { intro: undefined } : {}),
    ...(body ? { body } : { body: undefined }),
    ...(textIncludesAny(section.answer, SALARY_CLAIM_PATTERNS) ? { answer: undefined } : {}),
    ...(textIncludesAny(section.fitTitle, SALARY_CLAIM_PATTERNS) ? { fitTitle: undefined } : {}),
    ...(textIncludesAny(section.cautionTitle, SALARY_CLAIM_PATTERNS) ? { cautionTitle: undefined } : {}),
    rows,
    entryTable,
    signalMeta,
    items: filterStrings(section.items),
    fitItems: filterStrings(section.fitItems),
    cautionItems: filterStrings(section.cautionItems),
    checks,
    profile: filterStrings(section.profile),
    traits: filterStrings(section.traits),
    contexts: filterStrings(section.contexts),
    keywords: filterStrings(section.keywords),
    careerRisks: filterStrings(section.careerRisks),
    ...(textIncludesAny(section.caveat, SALARY_CLAIM_PATTERNS) ? { caveat: undefined } : {}),
    ...(textIncludesAny(section.warning, SALARY_CLAIM_PATTERNS) ? { warning: undefined } : {}),
    ...(textIncludesAny(section.note, SALARY_CLAIM_PATTERNS) ? { note: undefined } : {}),
    ...(textIncludesAny(section.interpretation, SALARY_CLAIM_PATTERNS) ? { interpretation: undefined } : {}),
    ...(textIncludesAny(section.linkedinNote, SALARY_CLAIM_PATTERNS) ? { linkedinNote: undefined } : {}),
    ...(textIncludesAny(section.score, SALARY_CLAIM_PATTERNS) ? { score: undefined } : {}),
    ...(textIncludesAny(section.question, SALARY_CLAIM_PATTERNS) ? { question: undefined } : {}),
    ...(textIncludesAny(section.fermatView, SALARY_CLAIM_PATTERNS) ? { fermatView: undefined } : {}),
    steps,
    faqItems,
  };
}

function ClaimPermissionNotice({
  locale,
  kind,
}: {
  locale: CareerDisplaySurfaceViewModel["locale"];
  kind: "integrity" | "strong_claim" | "salary" | "market" | "ai";
}) {
  const copy: Record<typeof kind, Record<CareerDisplaySurfaceViewModel["locale"], string>> = {
    integrity: {
      zh: "此页面包含受限声明，已按证据权限降级展示。",
      en: "Some claims on this page are evidence-limited and are shown with restricted permissions.",
    },
    strong_claim: {
      zh: "适配判断证据不足，强适配表述已隐藏。",
      en: "Strong fit language is hidden because the claim evidence is limited.",
    },
    salary: {
      zh: "薪资对比证据不足，直接薪资比较已隐藏。",
      en: "Direct salary comparison is hidden because salary evidence is limited.",
    },
    market: {
      zh: "市场信号证据不足，样本解释已隐藏。",
      en: "Market-signal interpretation is hidden because market evidence is limited.",
    },
    ai: {
      zh: "AI 影响证据不足，AI 策略表述已隐藏。",
      en: "AI strategy language is hidden because AI exposure evidence is limited.",
    },
  };

  return (
    <section
      className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"
      data-testid={`claim-permission-notice-${kind}`}
    >
      {copy[kind][locale]}
    </section>
  );
}

function shouldShowIntegrityNotice(claimPermissions: CareerDisplayClaimPermissions): boolean {
  return claimPermissions.integrityState === "restricted" || claimPermissions.integrityState === "blocked";
}

export function CareerDisplaySurface({
  surface,
  ctaAttributionParams,
  ctaLandingPath,
  suppressLegacySalaryMetadata = false,
}: CareerDisplaySurfaceProps) {
  if (!surface) {
    return null;
  }

  const claimPermissions = surface.claimPermissions;
  const baseSections = suppressLegacySalaryMetadata
    ? surface.sections.filter((section) => !isLegacyMetadataSection(section) && !sectionIncludesSalaryClaim(section))
    : surface.sections;
  const visibleSections = claimPermissions.allowSalaryComparison
    ? baseSections
    : baseSections
      .map((section) => stripSalaryClaims(section, false))
      .filter((section): section is CareerDisplaySection => section !== null);
  const decision = findSection(visibleSections, "FermatDecisionCard");
  const snapshots = findSections(visibleSections, "CareerSnapshotCard");
  const fitDecision = findSection(visibleSections, "FitDecisionChecklist");
  const riasecFit = findSection(visibleSections, "RIASECFitBlock");
  const personalityFit = findSection(visibleSections, "PersonalityFitBlock");
  const definition = findSection(visibleSections, "DefinitionBlock");
  const responsibilities = findSection(visibleSections, "ResponsibilitiesBlock");
  const workContext = findSection(visibleSections, "WorkContextBlock");
  const marketSignal = findSection(visibleSections, "MarketSignalCard");
  const comparison = findSection(visibleSections, "AdjacentCareerComparisonTable");
  const aiImpact = findSection(visibleSections, "AIImpactTable");
  const careerRisks = findSection(visibleSections, "CareerRiskCards");
  const contractRisks = findSection(visibleSections, "ContractRiskBlock");
  const nextSteps = findSection(visibleSections, "NextStepsBlock");
  const faq = findSection(visibleSections, "CareerFAQBlock");
  const visibleFaqItems = faq?.faqItems ?? [];
  const salaryClaimsRestricted =
    !claimPermissions.allowSalaryComparison && baseSections.some((section) => sectionIncludesSalaryClaim(section));

  return (
    <article className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6" data-testid="career-display-surface">
      <CareerDisplayHero hero={surface.hero} />
      {shouldShowIntegrityNotice(claimPermissions) ? (
        <ClaimPermissionNotice locale={surface.locale} kind="integrity" />
      ) : null}
      <ClaimGuard
        allowed={claimPermissions.allowStrongClaim}
        fallback={decision ? <ClaimPermissionNotice locale={surface.locale} kind="strong_claim" /> : null}
      >
        {decision ? <FermatDecisionCard section={decision} /> : null}
      </ClaimGuard>
      {salaryClaimsRestricted ? <ClaimPermissionNotice locale={surface.locale} kind="salary" /> : null}
      {snapshots.map((section, index) => (
        <EvidenceContainer
          key={section.id}
          section={section}
          testId={index === 0 ? "career-snapshot-primary" : "career-snapshot-secondary"}
        />
      ))}
      {fitDecision ? <EvidenceContainer section={fitDecision} testId="fit-decision-checklist" /> : null}
      {riasecFit ? <EvidenceContainer section={riasecFit} testId="riasec-fit-block" /> : null}
      {personalityFit ? <EvidenceContainer section={personalityFit} testId="personality-fit-block" /> : null}
      {definition ? <EvidenceContainer section={definition} testId="definition-block" /> : null}
      {responsibilities ? <EvidenceContainer section={responsibilities} testId="responsibilities-block" /> : null}
      {workContext ? <EvidenceContainer section={workContext} testId="work-context-block" /> : null}
      <ClaimGuard
        allowed={claimPermissions.allowMarketSignal}
        fallback={marketSignal ? <ClaimPermissionNotice locale={surface.locale} kind="market" /> : null}
      >
        {marketSignal ? <MarketSignalCard section={marketSignal} /> : null}
      </ClaimGuard>
      {comparison ? <EvidenceContainer section={comparison} testId="comparison-block" /> : null}
      <ClaimGuard
        allowed={claimPermissions.allowAiStrategy}
        fallback={aiImpact ? <ClaimPermissionNotice locale={surface.locale} kind="ai" /> : null}
      >
        {aiImpact ? <EvidenceContainer section={aiImpact} testId="ai-impact-block" /> : null}
      </ClaimGuard>
      {careerRisks ? <EvidenceContainer section={careerRisks} testId="career-risks-block" /> : null}
      {contractRisks ? <EvidenceContainer section={contractRisks} testId="contract-risks-block" /> : null}
      {nextSteps ? <EvidenceContainer section={nextSteps} testId="next-steps-block" /> : null}
      {faq ? <CareerFAQBlock heading={faq.heading} items={visibleFaqItems} /> : null}
      <RelatedNextPages heading={surface.locale === "zh" ? "下一步页面" : "Related next pages"} pages={surface.relatedNextPages} />
      <SourceList heading={surface.locale === "zh" ? "来源" : "Sources"} sources={surface.sources} />
      <BoundaryNotice
        heading={surface.locale === "zh" ? "边界说明" : "Boundary notice"}
        notices={surface.boundaryNotice}
        reviewValidity={surface.reviewValidity}
      />
      <CareerDisplayCTA
        surface={surface}
        ctaAttributionParams={ctaAttributionParams}
        ctaLandingPath={ctaLandingPath}
      />
    </article>
  );
}
