import { BoundaryNotice } from "@/components/career/display/BoundaryNotice";
import { CareerDisplayCTA } from "@/components/career/display/CareerDisplayCTA";
import { CareerDisplayHero } from "@/components/career/display/CareerDisplayHero";
import { CareerFAQBlock } from "@/components/career/display/CareerFAQBlock";
import { EvidenceContainer } from "@/components/career/display/EvidenceContainer";
import { FermatDecisionCard } from "@/components/career/display/FermatDecisionCard";
import { MarketSignalCard } from "@/components/career/display/MarketSignalCard";
import { RelatedNextPages } from "@/components/career/display/RelatedNextPages";
import { SourceList } from "@/components/career/display/SourceList";
import type { CareerDisplaySection, CareerDisplaySurfaceViewModel } from "@/lib/career/displaySurface";

type CareerDisplaySurfaceProps = {
  surface: CareerDisplaySurfaceViewModel | null;
};

function findSection(sections: CareerDisplaySection[], component: string): CareerDisplaySection | null {
  return sections.find((section) => section.component === component) ?? null;
}

function findSections(sections: CareerDisplaySection[], component: string): CareerDisplaySection[] {
  return sections.filter((section) => section.component === component);
}

export function CareerDisplaySurface({ surface }: CareerDisplaySurfaceProps) {
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

  return (
    <article className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6" data-testid="career-display-surface">
      <CareerDisplayHero hero={surface.hero} />
      {decision ? <FermatDecisionCard section={decision} /> : null}
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
      {marketSignal ? <MarketSignalCard section={marketSignal} /> : null}
      {comparison ? <EvidenceContainer section={comparison} testId="comparison-block" /> : null}
      {aiImpact ? <EvidenceContainer section={aiImpact} testId="ai-impact-block" /> : null}
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
      <CareerDisplayCTA surface={surface} />
    </article>
  );
}
