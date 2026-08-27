import type { ReactNode } from "react";
import Link from "next/link";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { EvidenceContainer } from "@/components/career/display/EvidenceContainer";
import { FermatDecisionCard } from "@/components/career/display/FermatDecisionCard";
import { CareerQuickAnswersBlock } from "@/components/career/display/CareerQuickAnswersBlock";
import { OnetStructuredFieldsBlock } from "@/components/career/display/OnetStructuredFieldsBlock";
import { CareerDossierProfile } from "@/components/career/display/CareerDossierProfile";
import {
  CareerDossierDirectionComparison,
  supportsCareerDossierDirectionComparison,
} from "@/components/career/display/CareerDossierDirectionComparison";
import {
  CareerDossierAiImpact,
  supportsCareerDossierAiImpact,
} from "@/components/career/display/CareerDossierAiImpact";
import {
  CareerDossierChinaSalary,
  CareerDossierUsSalary,
  supportsCareerDossierChinaSalary,
  supportsCareerDossierUsSalary,
} from "@/components/career/display/CareerDossierSalaryReference";
import {
  CareerDossierFitDecision,
  CareerDossierQuickDecisionAnswer,
} from "@/components/career/display/CareerDossierQuickDecision";
import {
  CAREER_COMPONENT_TITLES_EN,
  CAREER_COMPONENT_TITLES_ZH,
  CareerPublishedSemanticSection,
} from "@/components/career/display/CareerPublishedSemanticSection";
import {
  CAREER_DISPLAY_SUPPORTED_COMPONENTS,
  type CareerDisplayComponentId,
  type CareerDisplaySection,
  type CareerDisplaySurfaceViewModel,
} from "@/lib/career/displaySurface";
import {
  CAREER_VISUAL_GROUPS,
  CAREER_VISUAL_GROUP_IDS,
  type CareerVisualGroupDefinition,
  type CareerVisualGroupId,
} from "@/lib/career/careerVisualGroups";
import type {
  CareerPublishedOnetStructuredFieldsBlock,
  CareerPublishedQuickAnswersBlock,
  CareerPublishedUnavailableComponent,
} from "@/lib/career/publishedComponentContract";

type BreadcrumbItem = { label: string; href?: string };

type Props = {
  surface: CareerDisplaySurfaceViewModel;
  rendererRelease?: string;
  visibleSections: CareerDisplaySection[];
  breadcrumbItems: BreadcrumbItem[];
  primaryCtaHref: string;
  aiImpactSlot?: ReactNode;
  salarySlot?: ReactNode;
};

const COMPONENT_TO_SECTION: Partial<Record<CareerDisplayComponentId, string>> = {
  fermat_decision_card: "FermatDecisionCard",
  career_snapshot_primary_locale: "CareerSnapshotCard",
  career_snapshot_secondary_locale: "CareerSnapshotCard",
  fit_decision_checklist: "FitDecisionChecklist",
  riasec_fit_block: "RIASECFitBlock",
  personality_fit_block: "PersonalityFitBlock",
  definition_block: "DefinitionBlock",
  career_ai_description_block: "CareerAiDescriptionBlock",
  responsibilities_block: "ResponsibilitiesBlock",
  work_context_block: "WorkContextBlock",
  market_signal_card: "MarketSignalCard",
  adjacent_career_comparison_table: "AdjacentCareerComparisonTable",
  ai_impact_table: "AIImpactTable",
  career_risk_cards: "CareerRiskCards",
  career_path_block: "CareerPathBlock",
  contract_project_risk_block: "ContractRiskBlock",
  next_steps_block: "NextStepsBlock",
  faq_block: "CareerFAQBlock",
};

const COMPONENT_TEST_IDS: Partial<Record<CareerDisplayComponentId, string>> = {
  career_snapshot_primary_locale: "career-snapshot-primary",
  career_snapshot_secondary_locale: "career-snapshot-secondary",
  fit_decision_checklist: "fit-decision-checklist",
  riasec_fit_block: "riasec-fit-block",
  personality_fit_block: "personality-fit-block",
  definition_block: "definition-block",
  career_ai_description_block: "career-ai-description-block",
  responsibilities_block: "responsibilities-block",
  work_context_block: "work-context-block",
  adjacent_career_comparison_table: "comparison-block",
  ai_impact_table: "ai-impact-block",
  career_risk_cards: "career-risks-block",
  career_path_block: "career-path-block",
  contract_project_risk_block: "contract-risks-block",
};

const EN_VISUAL_GROUP_LABELS: Record<CareerVisualGroupDefinition["id"], string> = {
  overview: "Career overview",
  "quick-decision": "Quick decision",
  profile: "Career profile",
  "direction-comparison": "Career direction comparison",
  "ai-impact": "AI impact",
  "china-salary": "Chinese mainland salary reference",
  "us-salary": "United States salary reference",
  fit: "Fit map",
  risk: "Risks and change",
  path: "Development path",
  "market-signals": "Market signals",
  sources: "Questions and sources",
};

function visualGroupLabel(group: CareerVisualGroupDefinition, isZh: boolean): string {
  return isZh ? group.label : EN_VISUAL_GROUP_LABELS[group.id];
}

function orderedSection(
  componentId: CareerDisplayComponentId,
  sections: CareerDisplaySection[]
): CareerDisplaySection | null {
  const component = COMPONENT_TO_SECTION[componentId];
  if (!component) return null;
  const matches = sections.filter((section) => section.component === component);
  if (component === "CareerSnapshotCard") {
    return matches[componentId === "career_snapshot_primary_locale" ? 0 : 1] ?? null;
  }
  return matches[0] ?? null;
}

function firstSection(sections: CareerDisplaySection[], component: string): CareerDisplaySection | null {
  return sections.find((section) => section.component === component) ?? null;
}

function publishedCtaHref(value: unknown, locale: CareerDisplaySurfaceViewModel["locale"], fallback: string): string {
  if (typeof value !== "string") return fallback;
  const candidates = value.split("|").map((href) => href.trim()).filter(Boolean);
  const localized = candidates.find((href) => href.startsWith(`/${locale}/tests/`));
  const source = localized ?? candidates[0];
  if (!source) return fallback;

  const published = new URL(source.replace(/^\/(?:en|zh)\//, `/${locale}/`), "https://fermatmind.com");
  const attributed = new URL(fallback, "https://fermatmind.com");
  attributed.searchParams.forEach((item, key) => published.searchParams.set(key, item));
  return `${published.pathname}${published.search}`;
}

function publishedCtaLabel(value: unknown, locale: CareerDisplaySurfaceViewModel["locale"], fallback: string): string {
  if (typeof value !== "string" || value.trim().length === 0) return fallback;
  const bilingual = value.split("/").map((item) => item.trim()).filter(Boolean);
  return locale === "zh"
    ? bilingual.find((item) => /[\u3400-\u9fff]/u.test(item)) ?? value
    : bilingual.find((item) => !/[\u3400-\u9fff]/u.test(item)) ?? value;
}

function isPublishedComponentUnavailable(value: unknown): boolean {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    "availability" in value && value.availability === "unavailable";
}

function isRecordValue(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function supportsStructuredCareerDossierProfile(value: CareerDisplaySurfaceViewModel["publishedComponents"]): boolean {
  if (!value) return false;
  const quickAnswers = value.career_quick_answers_block;
  if (!isRecordValue(quickAnswers)) {
    return false;
  }
  const quickAnswerItems = quickAnswers.items;
  if (!Array.isArray(quickAnswerItems)) return false;

  const minimumRows = new Map([["qa3", 3], ["qa2", 7], ["qa1", 6]]);
  const hasCompleteQuickAnswers = [...minimumRows].every(([key, minimum]) => {
    const item = quickAnswerItems.find((candidate) => isRecordValue(candidate) && candidate.key === key);
    if (!isRecordValue(item) || !isRecordValue(item.table)) return false;
    return Array.isArray(item.table.rows) && item.table.rows.length >= minimum;
  });

  return hasCompleteQuickAnswers;
}

function ComponentFrame({ id, children, hidden = false }: { id: CareerDisplayComponentId; children: ReactNode; hidden?: boolean }) {
  return (
    <div id={`career-component-${id}`} data-career-component-id={id} className={hidden ? "hidden" : "scroll-mt-24"}>
      {children}
    </div>
  );
}

function BoundaryCard({ surface, title }: { surface: CareerDisplaySurfaceViewModel; title: string }) {
  const isZh = surface.locale === "zh";
  return (
    <section className="rounded-2xl border border-amber-200 border-l-4 border-l-[#E8920C] bg-[#FFF6E9] p-5 text-sm leading-7 text-[#55401a] md:p-6">
      <h2 className="m-0 text-xl font-bold text-[#1A2233]">{title}</h2>
      <p className="m-0 mt-2">
        {isZh
          ? "此组件受已发布证据权限约束；当前不展示未经授权的声明。"
          : "This component is bounded by the published evidence permissions; unauthorized claims are not shown."}
      </p>
    </section>
  );
}

function RelatedPages({ surface }: { surface: CareerDisplaySurfaceViewModel }) {
  const related = surface.relatedNextPages;
  if (!related) {
    return null;
  }

  const links = related.links.filter((page, index, pages) =>
    pages.findIndex((candidate) => candidate.slug === page.slug) === index
  );

  if (surface.locale !== "zh") {
    return (
      <section className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8" data-career-api-component="related_next_pages">
        <h2 className="m-0 text-2xl font-bold text-[#1A2233]" data-career-api-field="related_next_pages.intro">{related.intro}</h2>
        <ul className="m-0 mt-4 grid gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3" data-career-api-list="related_next_pages.links">
          {links.slice(0, 12).map((page) => (
            <li
              key={page.slug}
              data-related-career-slug={page.slug}
              data-related-career-source={page.source}
              data-related-career-nofollow={String(page.nofollow)}
              className="list-none rounded-xl border border-[#E5E9F2] bg-[#F0F3FA] px-4 py-3 text-sm font-semibold text-[#2C3E8C]"
            >
              <Link href={`/${surface.locale}/career/jobs/${page.slug}`} data-career-api-field={`related_next_pages.links.${page.slug}.title_en`}>{page.titleEn}</Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={`rounded-2xl border border-[#E5E9F2] bg-white shadow-[0_2px_12px_rgba(26,34,51,.05)] ${visual.card}`} data-career-api-component="related_next_pages">
      <h2 className="m-0 text-[23px] font-bold text-[#1A2233]">相关职业</h2>
      <p className="mb-0 mt-2 text-sm leading-7 text-[#5B6678]" data-career-api-field="related_next_pages.intro">{related.intro}</p>
      <ul className={`m-0 mt-3 grid p-0 sm:grid-cols-2 xl:grid-cols-3 ${visual.relatedGrid}`} data-career-api-list="related_next_pages.links">
        {links.map((page) => (
          <li
            key={page.slug}
            data-related-career-slug={page.slug}
            data-related-career-source={page.source}
            data-related-career-nofollow={String(page.nofollow)}
            className={`list-none rounded-[10px] border border-[#E5E9F2] bg-[#F0F3FA] text-[13.5px] font-semibold text-[#2C3E8C] ${visual.relatedCard}`}
          >
            {page.titleZh ? (
              <Link href={`/${surface.locale}/career/jobs/${page.slug}`} rel={page.nofollow ? "nofollow" : undefined}>
                <span data-career-api-field={`related_next_pages.links.${page.slug}.title_zh`}>{page.titleZh}</span>
              </Link>
            ) : <span data-career-api-field={`related_next_pages.links.${page.slug}.title_en`}>{page.titleEn}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CareerProductionHero({
  surface,
  visibleSections,
  primaryCtaHref,
}: Pick<Props, "surface" | "visibleSections" | "primaryCtaHref">) {
  const published = surface.publishedComponents;
  const presentationV2 = surface.presentationV2;
  const presentationV1 = surface.presentationV1;
  const legacyHero = surface.hero;
  if (!presentationV2 && !presentationV1 && !legacyHero) return null;
  const presentationField = presentationV2 ? "presentation_v2" : presentationV1 ? "presentation_v1" : null;
  const legacyRiasec = !published ? firstSection(visibleSections, "RIASECFitBlock") : null;
  const legacySnapshot = !published ? firstSection(visibleSections, "CareerSnapshotCard") : null;
  const legacyAiImpact = !published ? firstSection(visibleSections, "AIImpactTable") : null;
  const badges = published
    ? presentationV2?.hero.badges ?? presentationV1?.hero.badges ?? []
    : (legacyRiasec?.profile ?? []).slice(0, 3).map((text) => ({ text }));
  const stats = published
    ? presentationV2?.hero.stats ?? presentationV1?.hero.stats ?? []
    : (legacySnapshot?.rows ?? []).slice(0, 5).map(([label, value]) => ({
        label,
        value,
        sourceLabel: "",
      }));
  const aiExposure = presentationV2?.hero.aiExposure ?? presentationV1?.hero.aiExposure ?? null;
  const visibleAiExposure = aiExposure;
  const publishedHero = Boolean(published);
  const presentationCodes = (presentationV1 ? [
    presentationV1.hero.socCode ? `SOC ${presentationV1.hero.socCode}` : null,
    presentationV1.hero.onetCode ? `O*NET ${presentationV1.hero.onetCode}` : null,
  ] : [
    surface.subject.socCode ? `SOC ${surface.subject.socCode}` : null,
    surface.subject.onetCode ? `O*NET ${surface.subject.onetCode}` : null,
  ]).filter((item): item is string => item !== null);
  const presentationSubtitle = [presentationV1?.hero.titleEn, ...presentationCodes]
    .filter((item): item is string => Boolean(item))
    .join(" · ");
  const legacySubjectCodes = [
    surface.subject.socCode ? `SOC ${surface.subject.socCode}` : null,
    surface.subject.onetCode ? `O*NET ${surface.subject.onetCode}` : null,
  ].filter((item): item is string => item !== null).join(" · ");
  const heroTitle = presentationV2?.hero.title ?? (presentationV1
    ? (surface.locale === "zh" ? presentationV1.hero.titleZh : presentationV1.hero.titleEn)
    : legacyHero?.h1);
  const heroSubtitle = presentationV2
    ? presentationCodes.join(" · ")
    : presentationV1
    ? presentationSubtitle
    : legacyHero?.subtitle ?? (surface.locale === "zh" ? legacySubjectCodes : "");
  const heroLead = presentationV2?.hero.lead ?? presentationV1?.hero.lead ?? legacyHero?.quickAnswer;
  const heroCta = presentationV2?.hero.cta ?? presentationV1?.hero.cta ?? (
    published ? { label: surface.cta.label, href: surface.cta.href } : null
  );

  return (
    <header
      className={publishedHero
        ? `relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E8C] to-[#3a4fa6] text-white shadow-[0_8px_30px_rgba(44,62,140,.18)] ${visual.hero}`
        : "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E8C] to-[#3a4fa6] px-6 py-8 text-white shadow-[0_8px_30px_rgba(44,62,140,.18)] md:px-8 md:py-8"}
      data-testid="career-display-hero"
      data-career-api-component="hero"
      data-career-published-hero={published ? "true" : undefined}
    >
      <div className="max-w-[640px] pr-0 lg:pr-10">
        {heroTitle ? <h1 className={publishedHero
          ? "m-0 text-[26px] font-extrabold leading-[1.25] sm:text-[32px]"
          : "m-0 mt-2 text-3xl font-extrabold leading-tight md:text-[32px]"} data-career-api-field={presentationField ? `${presentationField}.hero.title` : "hero.h1"}>{heroTitle}</h1> : null}
        {heroSubtitle ? <p className={`m-0 text-sm font-normal text-white/80 ${publishedHero ? visual.heroSubtitle : "mt-1"}`}>{heroSubtitle}</p> : null}
        {badges.length > 0 ? (
          <div className={`flex flex-wrap ${visual.heroBadges}`} data-testid="career-production-hero-badges">
            {badges.map((badge, index) => (
              <span key={`${badge.text}:${index}`} data-career-api-field={presentationField ? `${presentationField}.hero.badges[${index}].text` : undefined} className={publishedHero
                ? `rounded-full border border-white/25 bg-white/[.16] text-[12.5px] font-normal ${visual.heroBadge}`
                : "rounded-full border border-white/25 bg-white/[.16] px-3 py-1 text-xs font-medium"}>
                {badge.text}
              </span>
            ))}
          </div>
        ) : null}
        {heroLead ? <p className="m-0 mt-2 text-[15.5px] leading-7 text-white/95" data-career-api-field={presentationField ? `${presentationField}.hero.lead` : "hero.quick_answer"}>{heroLead}</p> : null}
        {visibleAiExposure?.note ? <p className={visual.heroGaugeNote} data-career-api-field={`${presentationField}.hero.ai_exposure.note`}>{visibleAiExposure.note}</p> : null}
      </div>
      {visibleAiExposure || legacyAiImpact?.score ? (
        <div className={published ? visual.heroGaugePublished : `mt-4 inline-flex items-center gap-3 rounded-xl px-4 py-2 lg:absolute lg:right-[30px] lg:top-[30px] lg:mt-0 lg:block lg:h-[118px] lg:w-[118px] lg:rounded-full lg:px-3 lg:pt-7 lg:text-center ${visual.heroGauge}`} data-testid="career-production-ai-gauge">
          <div>
            <strong className="block text-2xl leading-none lg:text-3xl" data-career-api-field={visibleAiExposure ? `${presentationField}.hero.ai_exposure.display_value` : undefined}>{visibleAiExposure?.displayValue ?? legacyAiImpact?.score}</strong>
            <span className="block pt-1 text-center text-xs leading-4 text-white/85" data-career-api-field={visibleAiExposure ? `${presentationField}.hero.ai_exposure.label` : undefined}>{visibleAiExposure?.label ?? legacyAiImpact?.heading}</span>
            {visibleAiExposure ? <span className="sr-only" data-career-api-field={`${presentationField}.hero.ai_exposure.source_label`}>{visibleAiExposure.sourceLabel}</span> : null}
          </div>
        </div>
      ) : null}
      {stats.length > 0 ? (
        <div className={`grid ${visual.heroStats}`} data-testid="career-production-hero-stats">
          {stats.map((stat, index) => (
            <div key={`${stat.label}:${stat.value}:${index}`} className={`rounded-xl bg-white/[.12] ${visual.heroStat}`}>
              <strong className={`block ${visual.heroStatValue}`} data-career-api-field={presentationField ? `${presentationField}.hero.stats[${index}].value` : undefined}>{stat.value}</strong>
              <span className={`block text-white/85 ${visual.heroStatLabel}`} data-career-api-field={presentationField ? `${presentationField}.hero.stats[${index}].label` : undefined}>{stat.label}</span>
              {stat.sourceLabel ? <span className={`block text-white/65 ${visual.heroStatSource}`} data-career-api-field={presentationField ? `${presentationField}.hero.stats[${index}].source_label` : undefined}>{stat.sourceLabel}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
      {!published ? <Link
        id={published ? "career-component-primary_cta" : undefined}
        href={heroCta ? publishedCtaHref(heroCta.href, surface.locale, primaryCtaHref) : primaryCtaHref}
        data-career-component-id={published ? "primary_cta" : undefined}
        data-career-visual-group-component={published ? "hero" : undefined}
        data-career-api-component={published ? "primary_cta" : undefined}
        data-career-api-fields={published ? (presentationField ? `${presentationField}.hero.cta.label ${presentationField}.hero.cta.href` : "primary_cta.label primary_cta.href") : undefined}
        className={publishedHero
          ? `mt-6 inline-flex min-h-11 items-center rounded-[10px] bg-[#0E9F94] text-[15px] font-bold text-white hover:brightness-105 hover:no-underline ${visual.heroCta}`
          : "mt-6 inline-flex min-h-11 items-center rounded-[10px] bg-[#0E9F94] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:no-underline"}
      >
        {heroCta ? publishedCtaLabel(heroCta.label, surface.locale, heroCta.label) : publishedCtaLabel(surface.cta.label, surface.locale, surface.cta.label)}
        {published ? <span aria-hidden="true">→</span> : null}
      </Link> : null}
    </header>
  );
}

function SourceCard({ surface }: { surface: CareerDisplaySurfaceViewModel }) {
  return (
    <section className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8">
      <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{surface.locale === "zh" ? "资料来源" : "Sources"}</h2>
      <ul className="m-0 mt-4 space-y-3 p-0" data-testid="source-list">
        {surface.sources.map((source) => (
          <li key={source.key} className="list-none text-sm leading-7 text-[#2a3346]">
            {source.url ? (
              <a href={source.url} className="font-semibold text-[#2C3E8C] hover:underline">
                {source.label}
              </a>
            ) : (
              <span className="font-semibold">{source.label}</span>
            )}
            {source.urlNote ? <span> — {source.urlNote}</span> : null}
            {typeof source.usage === "string" ? <span> — {source.usage}</span> : null}
            {Array.isArray(source.usage) ? (
              <ul className="m-0 mt-1 list-disc pl-5">
                {source.usage.map((usage) => <li key={usage}>{usage}</li>)}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ReviewCard({ surface }: { surface: CareerDisplaySurfaceViewModel }) {
  const review = surface.reviewValidity;
  return (
    <section className="rounded-2xl border border-[#E5E9F2] bg-[#F0F3FA] p-5 md:p-6">
      <h2 className="m-0 text-xl font-bold text-[#1A2233]">{surface.locale === "zh" ? "复核有效期" : "Review validity"}</h2>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {review?.lastReviewed ? <p className="m-0"><span className="text-[#5B6678]">{surface.locale === "zh" ? "最近复核：" : "Last reviewed: "}</span><strong>{review.lastReviewed}</strong></p> : null}
        {review?.nextReviewDue ? <p className="m-0"><span className="text-[#5B6678]">{surface.locale === "zh" ? "下次复核：" : "Next review: "}</span><strong>{review.nextReviewDue}</strong></p> : null}
      </div>
    </section>
  );
}

export function CareerProductionDisplaySurface({
  surface,
  rendererRelease,
  visibleSections,
  breadcrumbItems,
  primaryCtaHref,
  aiImpactSlot,
  salarySlot,
}: Props) {
  const isZh = surface.locale === "zh";
  const publishedComponents = surface.publishedComponents;
  const restrictedIds = new Set<CareerDisplayComponentId>();
  if (!publishedComponents && !surface.claimPermissions.allowStrongClaim) restrictedIds.add("fermat_decision_card");
  if (!publishedComponents && !surface.claimPermissions.allowMarketSignal) restrictedIds.add("market_signal_card");
  if (!publishedComponents && !surface.claimPermissions.allowAiStrategy) restrictedIds.add("ai_impact_table");
  if (!publishedComponents && !surface.claimPermissions.allowSalaryComparison) {
    restrictedIds.add("career_snapshot_primary_locale");
    restrictedIds.add("career_snapshot_secondary_locale");
  }

  const renderComponent = (componentId: CareerDisplayComponentId) => {
    if (!surface.componentOrder.includes(componentId)) return null;

    if (componentId === "breadcrumb") {
      const rawBreadcrumb = publishedComponents?.breadcrumb;
      const breadcrumbData = rawBreadcrumb && typeof rawBreadcrumb === "object" && !Array.isArray(rawBreadcrumb) ? rawBreadcrumb : {};
      return (
        <nav
          aria-label="Breadcrumb"
          className="px-1 text-[13px] text-[#5B6678]"
          data-career-api-component="breadcrumb"
          data-career-breadcrumb-slug={typeof breadcrumbData.slug === "string" ? breadcrumbData.slug : undefined}
        >
          <ol className="m-0 flex flex-wrap gap-2 p-0">
            {(breadcrumbItems.length > 0
              ? breadcrumbItems
              : typeof breadcrumbData.label === "string"
                ? [{ label: breadcrumbData.label }]
                : []
            ).map((item, index, items) => {
              const label = index === items.length - 1 && typeof breadcrumbData.label === "string"
                ? breadcrumbData.label
                : item.label;
              return <li key={`${label}-${index}`} className="flex list-none gap-2" data-career-api-field={index === items.length - 1 ? "breadcrumb.label" : undefined}>{index ? <span>/</span> : null}{item.href ? <Link href={item.href}>{label}</Link> : <strong>{label}</strong>}</li>;
            })}
          </ol>
        </nav>
      );
    }
    if (componentId === "hero") {
      return <CareerProductionHero surface={surface} visibleSections={visibleSections} primaryCtaHref={primaryCtaHref} />;
    }
    if (componentId === "primary_cta" || componentId === "final_cta") {
      const rawCta = publishedComponents?.[componentId];
      const ctaData = rawCta && typeof rawCta === "object" && !Array.isArray(rawCta) ? rawCta : {};
      const rawCtaLabel = typeof ctaData.label === "string" ? ctaData.label : surface.cta.label;
      const ctaLabel = publishedCtaLabel(rawCtaLabel, surface.locale, surface.cta.label);
      const ctaHref = publishedCtaHref(ctaData.href, surface.locale, primaryCtaHref);
      return (
        <section
          className="rounded-2xl bg-gradient-to-br from-[#0E9F94] to-[#13b3a6] p-5 text-white shadow-[0_6px_20px_rgba(14,159,148,.25)] md:p-7"
          data-career-api-component={componentId}
          data-entry-surface={typeof ctaData.entry_surface === "string" ? ctaData.entry_surface : undefined}
          data-source-page-type={typeof ctaData.source_page_type === "string" ? ctaData.source_page_type : undefined}
          data-subject-key={typeof ctaData.subject_key === "string" ? ctaData.subject_key : undefined}
          data-subject-kind={typeof ctaData.subject_kind === "string" ? ctaData.subject_kind : undefined}
          data-target-action={typeof ctaData.target_action === "string" ? ctaData.target_action : undefined}
          data-test-slug={typeof ctaData.test_slug === "string" ? ctaData.test_slug : undefined}
          data-api-href={typeof ctaData.href === "string" ? ctaData.href : undefined}
          data-api-label={rawCtaLabel}
        >
          {typeof ctaData.prompt === "string" ? <p className="m-0 mb-3 text-sm leading-6 text-white/95">{ctaData.prompt}</p> : null}
          <Link href={ctaHref} className={publishedComponents
            ? "inline-flex min-h-11 max-w-full items-center rounded-[10px] bg-white px-6 py-3 text-sm font-bold text-[#0E9F94] hover:brightness-105"
            : "inline-flex min-h-11 items-center rounded-[10px] bg-white px-6 py-3 text-sm font-bold text-[#0E9F94] transition-transform hover:-translate-y-0.5"}>
            {ctaLabel}
          </Link>
        </section>
      );
    }
    if (componentId === "related_next_pages") return <RelatedPages surface={surface} />;
    if (componentId === "career_quick_answers_block" && publishedComponents) {
      if (isPublishedComponentUnavailable(publishedComponents[componentId])) return null;
      return <CareerQuickAnswersBlock
        value={publishedComponents[componentId] as CareerPublishedQuickAnswersBlock | CareerPublishedUnavailableComponent}
        locale={surface.locale}
      />;
    }
    if (componentId === "onet_structured_fields_block" && publishedComponents) {
      if (isPublishedComponentUnavailable(publishedComponents[componentId])) return null;
      return <OnetStructuredFieldsBlock
        value={publishedComponents[componentId] as CareerPublishedOnetStructuredFieldsBlock | CareerPublishedUnavailableComponent}
        locale={surface.locale}
      />;
    }
    if (componentId === "source_card") return publishedComponents
      ? <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]!} sources={surface.sources} locale={surface.locale} />
      : <SourceCard surface={surface} />;
    if (componentId === "review_validity_card") return publishedComponents
      ? <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]!} locale={surface.locale} />
      : <ReviewCard surface={surface} />;
    if (componentId === "boundary_notice") {
      if (publishedComponents) {
        return <CareerPublishedSemanticSection
          componentId={componentId}
          value={publishedComponents[componentId]!}
          usageBoundary={surface.presentationV1?.notices.usageBoundary ?? null}
          locale={surface.locale}
        />;
      }
      return surface.boundaryNotice.length > 0 ? (
        <section className="rounded-2xl border border-amber-200 border-l-4 border-l-[#E8920C] bg-[#FFF6E9] p-5 md:p-6">
          <h2 className="m-0 text-xl font-bold">{isZh ? "使用边界" : "Usage boundaries"}</h2>
          <ul className="m-0 mt-3 space-y-2 pl-5 text-sm leading-7">{surface.boundaryNotice.map((notice) => <li key={notice}>{notice}</li>)}</ul>
        </section>
      ) : <BoundaryCard surface={surface} title={isZh ? "使用边界" : "Usage boundaries"} />;
    }
    if (componentId === "faq_block" && publishedComponents) {
      return (
        <section className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8" data-testid="career-display-faq" data-career-api-component="faq_block">
          <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{isZh ? "常见问题" : "Frequently asked questions"}</h2>
          <div className="mt-4 space-y-3">
            {surface.faqItems.map((item) => (
              <details key={item.question} className={`group rounded-xl border border-[#E5E9F2] bg-white ${visual.faqItem}`}>
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-bold text-[#1A2233] after:text-xl after:font-normal after:text-[#2C3E8C] after:content-['+'] group-open:after:content-['−']">
                  <span data-career-api-field={`faq_block.items.${item.question}.question`}>{item.question}</span>
                </summary>
                <p className="m-0 pb-4 text-sm leading-7 text-[#2a3346]" data-career-api-field={`faq_block.items.${item.question}.answer`}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }

    if (publishedComponents) {
      return <CareerPublishedSemanticSection
        componentId={componentId}
        testId={COMPONENT_TEST_IDS[componentId]}
        value={publishedComponents[componentId]!}
        aiExposureNote={componentId === "ai_impact_table" ? surface.presentationV1?.hero.aiExposure?.note ?? null : null}
        subjectTitle={surface.subject.title}
        subjectSlug={surface.subject.canonicalSlug}
        locale={surface.locale}
      />;
    }

    const originalSection = orderedSection(componentId, surface.sections);
    const visibleSection = orderedSection(componentId, visibleSections);
    if (restrictedIds.has(componentId) || !visibleSection) {
      const localizedTitle = (isZh ? CAREER_COMPONENT_TITLES_ZH : CAREER_COMPONENT_TITLES_EN)[componentId];
      const boundaryTitle = originalSection?.heading && originalSection.heading !== componentId
        ? originalSection.heading
        : localizedTitle;
      return <BoundaryCard surface={surface} title={boundaryTitle} />;
    }
    if (componentId === "fermat_decision_card") {
      return <FermatDecisionCard section={visibleSection} />;
    }
    if (componentId === "faq_block") {
      return (
        <section className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8" data-testid="career-display-faq">
          <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{visibleSection.heading}</h2>
          <div className="mt-4 space-y-3">
            {(visibleSection.faqItems ?? []).map((item) => (
              <details key={item.question} className="group rounded-xl border border-[#E5E9F2] bg-white px-4">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-bold text-[#1A2233] after:text-xl after:font-normal after:text-[#2C3E8C] after:content-['+'] group-open:after:content-['−']">
                  {item.question}
                </summary>
                <p className="m-0 pb-4 text-sm leading-7 text-[#2a3346]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      );
    }
    return (
      <div className="[&_a]:min-h-11 [&>[data-evidence-container]]:rounded-2xl [&>[data-evidence-container]]:border-[#E5E9F2] [&>[data-evidence-container]]:p-5 [&>[data-evidence-container]]:shadow-[0_2px_12px_rgba(26,34,51,.05)] md:[&>[data-evidence-container]]:p-8">
        <EvidenceContainer
          section={visibleSection}
          testId={COMPONENT_TEST_IDS[componentId]}
          bodyFormat={componentId === "career_ai_description_block" ? "markdown" : "plain"}
          locale={surface.locale}
        />
      </div>
    );
  };

  const renderedComponentOrder = surface.componentOrder;
  const legacyTocSections = renderedComponentOrder
    .map((componentId) => ({ componentId, section: orderedSection(componentId, surface.sections) }))
    .filter((item): item is { componentId: CareerDisplayComponentId; section: CareerDisplaySection } => Boolean(item.section));

  if (!publishedComponents) {
    return (
      <article
        className="mx-auto w-full max-w-[1320px] px-6 py-5 text-[#1A2233] md:px-10 xl:px-12"
        data-testid="career-display-surface"
        data-career-production-template="career-production-v1"
        data-career-renderer-release={rendererRelease}
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10" data-testid="career-source-disclosure">
          <main className="min-w-0 space-y-6">
            {renderedComponentOrder.map((componentId) => {
              const component = renderComponent(componentId);
              const content = componentId === "career_risk_cards"
                ? <div data-testid="career-display-group-risks-and-change">{component}{aiImpactSlot}</div>
                : componentId === "career_snapshot_secondary_locale"
                  ? <>{component}{salarySlot}</>
                  : componentId === "final_cta"
                    ? <div data-testid="career-decision-action-block">{component}</div>
                    : component;
              return <ComponentFrame key={componentId} id={componentId}>{content}</ComponentFrame>;
            })}
          </main>
          <aside className="flex flex-col gap-4 lg:sticky lg:top-20" aria-label={isZh ? "页面目录" : "Page contents"}>
            <div className="rounded-2xl border border-[#E5E9F2] bg-white p-5 text-sm">
              <h2 className="m-0 text-xs font-bold uppercase tracking-wide text-[#5B6678]">{isZh ? "页面目录" : "Contents"}</h2>
              <nav className="mt-3 grid">
                {legacyTocSections.map(({ componentId, section }) => <a key={componentId} href={`#career-component-${componentId}`} className="border-b border-[#F0F3FA] py-2 text-[#3a4255] last:border-0 hover:text-[#2C3E8C]">{section.heading}</a>)}
              </nav>
            </div>
            <section className="flex min-h-[132px] flex-col justify-center rounded-2xl bg-gradient-to-br from-[#0E9F94] to-[#13b3a6] p-6 text-white shadow-[0_6px_20px_rgba(14,159,148,.25)]" data-testid="career-production-assessment-rail">
              <Link href={primaryCtaHref} className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-4 py-3 text-sm font-bold text-[#0E9F94] hover:no-underline">
                {surface.cta.label}
              </Link>
            </section>
          </aside>
        </div>
      </article>
    );
  }

  const breadcrumb = renderComponent("breadcrumb");
  const compoundGroupIds = new Set<CareerVisualGroupId>(["quick-decision", "profile", "fit", "risk", "path", "sources"]);
  const titledGroupIds = new Set<CareerVisualGroupId>(["profile", "risk"]);
  const legacyEnhanced = surface.presentationV2 === null && surface.presentationV1 !== null;
  const usesStructuredProfile = supportsStructuredCareerDossierProfile(publishedComponents);
  const usesCanonicalDossierOrder = surface.componentOrder.every((componentId, index, order) =>
    index === 0 || CAREER_DISPLAY_SUPPORTED_COMPONENTS.indexOf(order[index - 1]) < CAREER_DISPLAY_SUPPORTED_COMPONENTS.indexOf(componentId)
  );

  const PendingEnrichment = ({ label }: { label: string }) => (
    <aside
      data-nosnippet
      data-career-pending-enrichment="true"
      className="rounded-xl border border-dashed border-[#C7CFDF] bg-[#F7F9FC] px-5 py-4 text-sm leading-6 text-[#5B6678]"
      aria-label={isZh ? `${label}内容待升级` : `${label} enhanced content pending`}
    >
      <strong className="block text-[#3A4255]">{isZh ? "内容待升级" : "Enhanced content pending"}</strong>
      <span>{isZh
        ? "本区块保留当前权威正文；新版增强卡片生成后将在此补充。"
        : "The current authoritative text remains available; enhanced cards will be added here when published."}</span>
    </aside>
  );

  const renderVisualGroup = (group: CareerVisualGroupDefinition) => {
    let componentNodes: ReactNode[];

    const isEnhanced = group.contentState === "enhanced" || (legacyEnhanced && usesCanonicalDossierOrder);

    if (group.id === "overview") {
      componentNodes = surface.componentOrder
        .filter((componentId) => componentId !== "breadcrumb" && group.componentIds.includes(componentId))
        .map((componentId) => componentId === "hero"
          ? <ComponentFrame key="hero" id="hero">{renderComponent("hero")}</ComponentFrame>
          : componentId === "primary_cta" && (surface.presentationV2?.hero.cta || surface.presentationV1?.hero.cta) ? (
            <ComponentFrame key="primary_cta" id="primary_cta" hidden>
              <span
                data-career-api-component="primary_cta"
                data-career-api-fields={surface.presentationV2
                  ? "presentation_v2.hero.cta.label presentation_v2.hero.cta.href"
                  : "presentation_v1.hero.cta.label presentation_v1.hero.cta.href"}
              >
                {surface.presentationV2?.hero.cta?.label ?? surface.presentationV1?.hero.cta?.label}
              </span>
            </ComponentFrame>
          ) : componentId === "primary_cta" && (surface.presentationV2 || surface.presentationV1)
            ? null
            : <ComponentFrame key={componentId} id={componentId} hidden={surface.componentOrder.includes("hero")}>{renderComponent(componentId)}</ComponentFrame>);
    } else if (group.id === "china-salary" && isEnhanced) {
      const chinaSalary = publishedComponents.career_snapshot_primary_locale;
      if (chinaSalary === undefined) return null;
      componentNodes = [
        <ComponentFrame key="career_snapshot_primary_locale" id="career_snapshot_primary_locale">
          {supportsCareerDossierChinaSalary(chinaSalary)
          ? <CareerDossierChinaSalary value={chinaSalary} locale={surface.locale} />
          : <CareerPublishedSemanticSection
              key="career_snapshot_primary_locale-china"
              componentId="career_snapshot_primary_locale"
              value={chinaSalary}
              snapshotVariant="china"
              salaryBoundary={surface.presentationV1?.notices.salaryBoundary ?? null}
              locale={surface.locale}
             />}
        </ComponentFrame>,
      ];
    } else if (group.id === "us-salary" && isEnhanced) {
      const usSalary = publishedComponents.career_snapshot_secondary_locale;
      if (usSalary === undefined) return null;
      componentNodes = [
        <ComponentFrame key="career_snapshot_secondary_locale" id="career_snapshot_secondary_locale">
          {supportsCareerDossierUsSalary(usSalary)
            ? <CareerDossierUsSalary value={usSalary} locale={surface.locale} />
            : renderComponent("career_snapshot_secondary_locale")}
        </ComponentFrame>,
      ];
    } else if (group.id === "profile" && isEnhanced && usesStructuredProfile) {
      componentNodes = [
        <CareerDossierProfile
          key="career-dossier-profile"
          definition={publishedComponents.definition_block as string}
          responsibilities={publishedComponents.responsibilities_block as string[]}
          workContext={publishedComponents.work_context_block as string}
          quickAnswers={publishedComponents.career_quick_answers_block as CareerPublishedQuickAnswersBlock}
          professionalBasis={publishedComponents.onet_structured_fields_block as CareerPublishedOnetStructuredFieldsBlock}
          locale={surface.locale}
        />,
      ];
    } else if (group.id === "direction-comparison" && isEnhanced) {
      const directionComparison = publishedComponents.adjacent_career_comparison_table;
      const hasDirectionComparison = directionComparison !== undefined && supportsCareerDossierDirectionComparison(directionComparison);
      componentNodes = [
        <ComponentFrame key="adjacent_career_comparison_table" id="adjacent_career_comparison_table">
          {hasDirectionComparison
            ? <CareerDossierDirectionComparison value={directionComparison} locale={surface.locale} />
            : renderComponent("adjacent_career_comparison_table")}
        </ComponentFrame>,
      ];
    } else if (group.id === "ai-impact" && isEnhanced) {
      const aiImpact = publishedComponents.ai_impact_table;
      if (aiImpact === undefined) return null;
      componentNodes = [
        <ComponentFrame key="ai_impact_table" id="ai_impact_table">
          {supportsCareerDossierAiImpact(aiImpact)
            ? <CareerDossierAiImpact value={aiImpact} locale={surface.locale} />
            : renderComponent("ai_impact_table")}
        </ComponentFrame>,
      ];
    } else if (group.id === "quick-decision" && isEnhanced) {
      const decision = publishedComponents.fermat_decision_card;
      const checklist = publishedComponents.fit_decision_checklist;
      if (decision === undefined || checklist === undefined) return null;
      componentNodes = [
        <ComponentFrame key="fermat_decision_card" id="fermat_decision_card">
          <CareerDossierQuickDecisionAnswer value={decision} />
        </ComponentFrame>,
        <ComponentFrame key="fit_decision_checklist" id="fit_decision_checklist">
          <CareerDossierFitDecision value={checklist} locale={surface.locale} subjectTitle={surface.subject.title} />
        </ComponentFrame>,
      ];
    } else {
      componentNodes = surface.componentOrder.filter((componentId) => group.componentIds.includes(componentId)).map((componentId) => {
        const component = renderComponent(componentId);
        if (component == null) return null;
        const content = componentId === "final_cta"
          ? <div data-testid="career-decision-action-block">{component}</div>
          : component;
        return <ComponentFrame key={componentId} id={componentId}>{content}</ComponentFrame>;
      });
    }

    const visibleComponentNodes = componentNodes.filter((node) => node != null);
    if (visibleComponentNodes.length === 0) return null;
    const usesEnhancedQuickDecision = group.id === "quick-decision" && isEnhanced;
    const hasVisibleGroupTitle = titledGroupIds.has(group.id) || usesEnhancedQuickDecision;

    return (
      <section
        key={group.id}
        id={`career-visual-group-${group.id}`}
        className={`${visual.visualGroup} ${compoundGroupIds.has(group.id) ? visual.compoundGroup : ""} ${group.id === "profile" ? visual.profileGroup : ""} ${group.id === "profile" && usesStructuredProfile ? visual.accountantsProfileGroup : ""} ${usesEnhancedQuickDecision ? visual.accountantsQuickDecisionGroup : ""}`}
        data-career-visual-group={group.id}
        aria-labelledby={hasVisibleGroupTitle ? `career-visual-group-title-${group.id}` : undefined}
        aria-label={hasVisibleGroupTitle ? undefined : visualGroupLabel(group, isZh)}
      >
        {usesEnhancedQuickDecision ? (
          <header className={visual.quickDecisionHeader}>
            <h2 id={`career-visual-group-title-${group.id}`} className={visual.quickDecisionTitle}>
              {visualGroupLabel(group, isZh)}
            </h2>
          </header>
        ) : titledGroupIds.has(group.id) && !(group.id === "profile" && usesStructuredProfile) ? (
          <h2 id={`career-visual-group-title-${group.id}`} className={visual.groupTitle}>{visualGroupLabel(group, isZh)}</h2>
        ) : null}
        <div className={visual.groupStack}>
          {visibleComponentNodes}
          {group.contentState === "legacy" && group.pendingEnrichment === "display_placeholder"
            ? <PendingEnrichment label={visualGroupLabel(group, isZh)} />
            : null}
        </div>
      </section>
    );
  };

  const visualGroups: CareerVisualGroupDefinition[] = surface.presentationV2
    ? surface.presentationV2.groups.flatMap((group) => {
        if (!CAREER_VISUAL_GROUP_IDS.includes(group.id as CareerVisualGroupId)) return [];
        return [{
          id: group.id as CareerVisualGroupId,
          label: group.label,
          componentIds: group.componentIds,
          contentState: group.contentState,
          pendingEnrichment: group.pendingEnrichment,
        }];
      })
    : CAREER_VISUAL_GROUPS.flatMap((group) => {
        const componentIds = group.componentIds.filter((componentId) => surface.componentOrder.includes(componentId));
        return componentIds.length > 0 ? [{ ...group, componentIds }] : [];
      });
  const visibleVisualGroups = visualGroups.flatMap((group) => {
    const content = renderVisualGroup(group);
    return content ? [{ group, content }] : [];
  });
  const tocVisualGroups = visibleVisualGroups.filter(({ group }) => group.id !== "overview");

  return (
    <article
      className={`mx-auto w-full max-w-[1440px] px-5 font-sans leading-7 text-[#1A2233] sm:px-6 md:px-8 xl:px-10 ${visual.article}`}
      data-testid="career-display-surface"
      data-career-production-template="career-production-v1"
      data-career-dossier-layout="responsive-v2"
      data-career-renderer-release={rendererRelease}
    >
      {breadcrumb ? <div data-career-visual-group-component="hero"><ComponentFrame id="breadcrumb">{breadcrumb}</ComponentFrame></div> : null}
      <div className={`mt-5 grid items-start gap-5 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-6 ${visual.layout}`} data-testid="career-source-disclosure">
        <aside className={`flex min-w-0 flex-col gap-4 lg:sticky lg:top-[84px] ${visual.rail} ${visual.accountantsRail}`} aria-label={isZh ? "页面目录" : "Page contents"}>
          <div className={visual.toc}>
            <div className={visual.tocHeading}>
              <span className={visual.tocKicker}>{isZh ? "职业档案" : "Career dossier"}</span>
            </div>
            <nav className={visual.tocNav}>
              {tocVisualGroups.map(({ group }, index) => (
                <a
                  key={group.id}
                  href={`#career-visual-group-${group.id}`}
                  className={visual.tocLink}
                >
                  <span aria-hidden="true" className={visual.tocIndex}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{visualGroupLabel(group, isZh)}</span>
                </a>
              ))}
            </nav>
          </div>
          {surface.componentOrder.some((componentId) => componentId === "primary_cta" || componentId === "final_cta") ? <section
            className={visual.assessmentRail}
            data-testid="career-production-assessment-rail"
          >
            {!surface.presentationV1Available ? (
              <span className={visual.assessmentRailLabel}>{isZh ? "找到更适合你的方向" : "Find your best-fit direction"}</span>
            ) : null}
            <Link href={primaryCtaHref} className={visual.assessmentRailCta}>
              {publishedCtaLabel(surface.cta.label, surface.locale, surface.cta.label)}
              <span aria-hidden="true">→</span>
            </Link>
          </section> : null}
        </aside>
        <main className={`min-w-0 ${visual.componentStack}`}>
          {visibleVisualGroups.map(({ content }) => content)}
        </main>
      </div>
    </article>
  );
}
