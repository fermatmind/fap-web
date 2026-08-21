import type { ReactNode } from "react";
import Link from "next/link";
import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { EvidenceContainer } from "@/components/career/display/EvidenceContainer";
import { FermatDecisionCard } from "@/components/career/display/FermatDecisionCard";
import {
  CAREER_COMPONENT_TITLES_ZH,
  CareerPublishedSemanticSection,
} from "@/components/career/display/CareerPublishedSemanticSection";
import type {
  CareerDisplayComponentId,
  CareerDisplaySection,
  CareerDisplaySurfaceViewModel,
} from "@/lib/career/displaySurface";

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

function publishedRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function publishedText(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value;
  const record = publishedRecord(value);
  if (!record) return null;
  const text = [record.value, record.label].find((item) => typeof item === "string" && item.trim().length > 0);
  return typeof text === "string" ? text : null;
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
  if (locale !== "zh") return value;
  const bilingual = value.split("/").map((item) => item.trim()).filter(Boolean);
  return bilingual.find((item) => /[\u3400-\u9fff]/u.test(item)) ?? value;
}

function ComponentFrame({ id, children }: { id: CareerDisplayComponentId; children: ReactNode }) {
  return (
    <div id={`career-component-${id}`} data-career-component-id={id} className="scroll-mt-24">
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

  if (surface.locale !== "zh") {
    return (
      <section className="rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8">
        <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{related.intro}</h2>
        <ul className="m-0 mt-4 grid gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {related.links.map((page) => (
            <li
              key={page.slug}
              data-related-career-slug={page.slug}
              data-related-career-source={page.source}
              data-related-career-nofollow={String(page.nofollow)}
              className="list-none rounded-xl border border-[#E5E9F2] bg-[#F0F3FA] px-4 py-3 text-sm font-semibold text-[#2C3E8C]"
            >
              {page.titleEn}
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
        {related.links.map((page) => (
          <li
            key={page.slug}
            data-related-career-slug={page.slug}
            data-related-career-source={page.source}
            data-related-career-nofollow={String(page.nofollow)}
            className={`list-none rounded-[10px] border border-[#E5E9F2] bg-[#F0F3FA] text-[13.5px] font-semibold text-[#2C3E8C] ${visual.relatedCard}`}
          >
            <span data-career-api-field={`related_next_pages.links.${page.slug}.title_en`}>{page.titleEn}</span>
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
  const riasec = firstSection(visibleSections, "RIASECFitBlock");
  const snapshot = firstSection(visibleSections, "CareerSnapshotCard");
  const aiImpact = firstSection(visibleSections, "AIImpactTable");
  const published = surface.publishedComponents;
  const publishedSnapshot = published && typeof published.career_snapshot_primary_locale === "object" && !Array.isArray(published.career_snapshot_primary_locale)
    ? published.career_snapshot_primary_locale
    : null;
  const publishedRiasec = published && typeof published.riasec_fit_block === "object" && !Array.isArray(published.riasec_fit_block)
    ? published.riasec_fit_block
    : null;
  const publishedRisks = published && typeof published.career_risk_cards === "object" && !Array.isArray(published.career_risk_cards)
    ? published.career_risk_cards
    : null;
  const publishedSalary = publishedRecord(publishedSnapshot?.salary);
  const publishedBlsRows = Array.isArray(publishedSalary?.bls_table)
    ? publishedSalary.bls_table.map(publishedRecord).filter((row): row is Record<string, unknown> => row !== null)
    : [];
  const publishedAiImpact = publishedRecord(published?.ai_impact_table);
  const badges = published
    ? [publishedRiasec?.riasec_short, publishedText(publishedSalary?.china_soc_row), publishedRisks?.badge].filter((item): item is string => typeof item === "string")
    : (riasec?.profile ?? []).slice(0, 3);
  const metrics = published
    ? publishedBlsRows.slice(0, 5).flatMap((row) => {
        const label = publishedText(row["指标"] ?? row.label);
        const value = publishedText(row["数值"] ?? row.value);
        const note = publishedText(row["说明"]);
        return label && value ? [[label, value, note] as const] : [];
      })
    : (snapshot?.rows ?? []).slice(0, 5).map(([label, value]) => [label, value, null] as const);
  const aiScore = published
    ? publishedText(publishedSalary?.china_ai_row)
    : aiImpact?.score ?? null;
  const aiHeading = published
    ? (typeof publishedAiImpact?.ai_head_sub === "string" ? "AI 曝光评分" : "AI 影响")
    : aiImpact?.heading;
  const subjectCodes = [
    surface.subject.socCode ? `SOC ${surface.subject.socCode}` : null,
    surface.subject.onetCode ? `O*NET ${surface.subject.onetCode}` : null,
  ].filter((item): item is string => item !== null).join(" · ");
  const heroSubtitle = surface.hero.subtitle ?? (surface.locale === "zh" ? subjectCodes : "");
  const publishedHero = Boolean(published);

  return (
    <header
      className={publishedHero
        ? `relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E8C] to-[#3a4fa6] text-white shadow-[0_8px_30px_rgba(44,62,140,.18)] ${visual.hero}`
        : "relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E8C] to-[#3a4fa6] px-6 py-8 text-white shadow-[0_8px_30px_rgba(44,62,140,.18)] md:px-8 md:py-8"}
      data-testid="career-display-hero"
    >
      <div className="max-w-[640px] pr-0 lg:pr-10">
        {heroSubtitle ? <p className="m-0 text-sm font-normal text-white/80">{heroSubtitle}</p> : null}
        <h1 className={publishedHero
          ? "m-0 mt-2 text-[26px] font-extrabold leading-[1.25] sm:text-[32px]"
          : "m-0 mt-2 text-3xl font-extrabold leading-tight md:text-[32px]"}>{surface.hero.h1}</h1>
        {badges.length > 0 ? (
          <div className="my-3 flex flex-wrap gap-2" data-testid="career-production-hero-badges">
            {badges.map((badge) => (
              <span key={badge} className={publishedHero
                ? `rounded-full border border-white/25 bg-white/[.16] text-[12.5px] font-medium ${visual.heroBadge}`
                : "rounded-full border border-white/25 bg-white/[.16] px-3 py-1 text-xs font-medium"}>
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        <p className="m-0 mt-2 text-[15.5px] leading-7 text-white/95">{surface.hero.quickAnswer}</p>
      </div>
      {aiScore ? (
        <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white/[.14] px-4 py-2 lg:absolute lg:right-[30px] lg:top-[30px] lg:mt-0 lg:block lg:h-[118px] lg:w-[118px] lg:rounded-full lg:px-3 lg:pt-7 lg:text-center" data-testid="career-production-ai-gauge">
          <strong className="block text-2xl leading-none lg:text-3xl" data-career-api-field={published ? "career_snapshot_primary_locale.salary.china_ai_row" : undefined}>{aiScore}</strong>
          <span className="block pt-1 text-xs leading-4 text-white/85">{aiHeading}</span>
        </div>
      ) : null}
      {metrics.length > 0 ? (
        <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" data-testid="career-production-hero-stats">
          {metrics.map(([label, value, note]) => (
            <div key={`${label}:${value}`} className="rounded-xl bg-white/[.12] px-3 py-3">
              <strong className="block text-lg leading-tight">{value}</strong>
              <span className="mt-1 block text-xs leading-4 text-white/85">{label}</span>
              {note ? <span className="mt-1 block text-[10px] leading-4 text-white/65">{note}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
      <Link
        href={primaryCtaHref}
        className={publishedHero
          ? `mt-6 inline-flex min-h-11 items-center rounded-[10px] bg-[#0E9F94] text-[15px] font-bold text-white hover:brightness-105 hover:no-underline ${visual.heroCta}`
          : "mt-6 inline-flex min-h-11 items-center rounded-[10px] bg-[#0E9F94] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 hover:no-underline"}
      >
        {publishedCtaLabel(surface.cta.label, surface.locale, surface.cta.label)}
      </Link>
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
              return <li key={`${label}-${index}`} className="flex list-none gap-2">{index ? <span>/</span> : null}{item.href ? <Link href={item.href}>{label}</Link> : <strong>{label}</strong>}</li>;
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
    if (componentId === "source_card") return publishedComponents
      ? <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]} sources={surface.sources} />
      : <SourceCard surface={surface} />;
    if (componentId === "review_validity_card") return publishedComponents
      ? <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]} />
      : <ReviewCard surface={surface} />;
    if (componentId === "boundary_notice") {
      if (publishedComponents) {
        return <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]} />;
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
          <h2 className="m-0 text-2xl font-bold text-[#1A2233]">常见问题</h2>
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
      return <CareerPublishedSemanticSection componentId={componentId} testId={COMPONENT_TEST_IDS[componentId]} value={publishedComponents[componentId]} />;
    }

    const originalSection = orderedSection(componentId, surface.sections);
    const visibleSection = orderedSection(componentId, visibleSections);
    if (restrictedIds.has(componentId) || !visibleSection) {
      return <BoundaryCard surface={surface} title={originalSection?.heading ?? componentId} />;
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

  const legacyTocSections = surface.componentOrder
    .map((componentId) => ({ componentId, section: orderedSection(componentId, surface.sections) }))
    .filter((item): item is { componentId: CareerDisplayComponentId; section: CareerDisplaySection } => Boolean(item.section));

  if (!publishedComponents) {
    return (
      <article
        className="mx-auto max-w-[1100px] px-4 py-5 text-[#1A2233] md:px-5"
        data-testid="career-display-surface"
        data-career-production-template="career-production-v1"
        data-career-renderer-release={rendererRelease}
      >
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10" data-testid="career-source-disclosure">
          <main className="min-w-0 space-y-6">
            {surface.componentOrder.map((componentId) => {
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
            <section className="rounded-2xl bg-gradient-to-br from-[#0E9F94] to-[#13b3a6] p-5 text-white shadow-[0_6px_20px_rgba(14,159,148,.25)]" data-testid="career-production-assessment-rail">
              <h2 className="m-0 text-base font-bold">{surface.cta.label}</h2>
              <p className="m-0 mt-2 text-sm leading-6 text-white/95">{surface.hero.quickAnswer}</p>
              <Link href={primaryCtaHref} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-4 py-3 text-sm font-bold text-[#0E9F94] hover:no-underline">
                {surface.cta.label}
              </Link>
            </section>
          </aside>
        </div>
      </article>
    );
  }

  const tocSections = surface.componentOrder
    .filter((componentId) => !["breadcrumb", "hero", "primary_cta", "final_cta"].includes(componentId))
    .map((componentId) => ({
      componentId,
      label: publishedComponents
        ? CAREER_COMPONENT_TITLES_ZH[componentId]
        : orderedSection(componentId, surface.sections)?.heading ?? null,
    }))
    .filter((item): item is { componentId: CareerDisplayComponentId; label: string } => Boolean(item.label));

  const breadcrumb = renderComponent("breadcrumb");
  const mainComponentOrder = surface.componentOrder.filter((componentId) => componentId !== "breadcrumb");

  return (
    <article
      className={`mx-auto max-w-[1100px] font-sans text-[#1A2233] ${visual.article}`}
      data-testid="career-display-surface"
      data-career-production-template="career-production-v1"
      data-career-renderer-release={rendererRelease}
    >
      <ComponentFrame id="breadcrumb">{breadcrumb}</ComponentFrame>
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10" data-testid="career-source-disclosure">
        <main className={`min-w-0 ${visual.componentStack}`}>
          {mainComponentOrder.map((componentId) => {
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
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[84px]" aria-label={isZh ? "页面目录" : "Page contents"}>
          <div className="rounded-2xl border border-[#E5E9F2] bg-white p-5 text-sm">
          <h2 className="m-0 text-xs font-bold uppercase tracking-wide text-[#5B6678]">{isZh ? "页面目录" : "Contents"}</h2>
          <nav className="mt-3 grid">
            {tocSections.map(({ componentId, label }) => <a key={componentId} href={`#career-component-${componentId}`} className={`border-b border-[#F0F3FA] text-[#3a4255] last:border-0 hover:text-[#2C3E8C] hover:no-underline ${visual.tocLink}`}>{label}</a>)}
          </nav>
          </div>
          <section className="rounded-2xl bg-gradient-to-br from-[#0E9F94] to-[#13b3a6] p-5 text-white shadow-[0_6px_20px_rgba(14,159,148,.25)]" data-testid="career-production-assessment-rail">
            <h2 className="m-0 text-base font-bold">{publishedCtaLabel(surface.cta.label, surface.locale, surface.cta.label)}</h2>
            <p className="m-0 mt-2 text-sm leading-6 text-white/95">{surface.hero.quickAnswer}</p>
            <Link href={primaryCtaHref} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-white px-4 py-3 text-sm font-bold text-[#0E9F94] hover:no-underline">
              {publishedCtaLabel(surface.cta.label, surface.locale, surface.cta.label)}
            </Link>
          </section>
        </aside>
      </div>
    </article>
  );
}
