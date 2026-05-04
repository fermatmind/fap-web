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

function bodyIncludesSalaryClaim(body: CareerDisplaySection["body"]): boolean {
  if (Array.isArray(body)) {
    return body.some((paragraph) => textIncludesAny(paragraph, SALARY_CLAIM_PATTERNS));
  }

  return textIncludesAny(body, SALARY_CLAIM_PATTERNS);
}

function sectionIncludesSalaryClaim(section: CareerDisplaySection): boolean {
  return (
    bodyIncludesSalaryClaim(section.body) ||
    (section.rows ?? []).some(rowIncludesSalaryClaim) ||
    (section.entryTable ?? []).some(rowIncludesSalaryClaim)
  );
}

function stripSalaryClaims(section: CareerDisplaySection, allowSalaryComparison: boolean): CareerDisplaySection | null {
  if (allowSalaryComparison) {
    return section;
  }

  const rows = (section.rows ?? []).filter((row) => !rowIncludesSalaryClaim(row));
  const entryTable = (section.entryTable ?? []).filter((row) => !rowIncludesSalaryClaim(row));
  const body = bodyIncludesSalaryClaim(section.body) ? undefined : section.body;
  const hasContent =
    Boolean(body) ||
    rows.length > 0 ||
    entryTable.length > 0 ||
    (section.items?.length ?? 0) > 0 ||
    (section.contexts?.length ?? 0) > 0 ||
    (section.checks?.length ?? 0) > 0 ||
    (section.profile?.length ?? 0) > 0;

  if (!hasContent) {
    return null;
  }

  return {
    ...section,
    ...(body ? { body } : { body: undefined }),
    rows,
    entryTable,
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
}: CareerDisplaySurfaceProps) {
  if (!surface) {
    return null;
  }

  const decision = findSection(surface.sections, "FermatDecisionCard");
  const snapshots = findSections(surface.sections, "CareerSnapshotCard");
  const fitDecision = findSection(surface.sections, "FitDecisionChecklist");
  const riasecFit = findSection(surface.sections, "RIASECFitBlock");
  const personalityFit = findSection(surface.sections, "PersonalityFitBlock");
  const definition = findSection(surface.sections, "DefinitionBlock");
  const responsibilities = findSection(surface.sections, "ResponsibilitiesBlock");
  const workContext = findSection(surface.sections, "WorkContextBlock");
  const marketSignal = findSection(surface.sections, "MarketSignalCard");
  const comparison = findSection(surface.sections, "AdjacentCareerComparisonTable");
  const aiImpact = findSection(surface.sections, "AIImpactTable");
  const careerRisks = findSection(surface.sections, "CareerRiskCards");
  const contractRisks = findSection(surface.sections, "ContractRiskBlock");
  const nextSteps = findSection(surface.sections, "NextStepsBlock");
  const faq = findSection(surface.sections, "CareerFAQBlock");
  const claimPermissions = surface.claimPermissions;
  const salaryClaimsRestricted =
    !claimPermissions.allowSalaryComparison && snapshots.some((section) => sectionIncludesSalaryClaim(section));
  const salarySafeSnapshots = snapshots
    .map((section) => stripSalaryClaims(section, claimPermissions.allowSalaryComparison))
    .filter((section): section is CareerDisplaySection => section !== null);

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
      {salarySafeSnapshots.map((section, index) => (
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
      {faq ? <CareerFAQBlock heading={faq.heading} items={surface.faqItems} /> : null}
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
