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
  CareerDossierFitCenter,
  supportsCareerDossierFitCenter,
} from "@/components/career/display/CareerDossierFitCenter";
import {
  CareerDossierOutlookTransitions,
  CareerDossierProgression,
  CareerDossierWorkRisk,
  supportsCareerOutlookTransitions,
  supportsCareerProgression,
  supportsCareerWorkRisk,
} from "@/components/career/display/CareerDossierDecisionJourney";
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
  careerComponentForV3CopyKey,
  isCareerInternalV3BlockCopyKey,
  isCareerRegisteredV3BlockCopyKey,
  type CareerDossierRenderPlanBlock,
} from "@/lib/career/dossierRenderPlan";
import {
  careerContentV3CardCopy,
  careerContentV3ColumnCopy,
  careerContentV3ItemCopy,
  careerContentV3QuestionCopy,
  careerContentV3UiCopy,
  type CareerContentV3,
  type CareerContentV3Item,
} from "@/lib/career/contentV3";
import {
  CAREER_VISUAL_GROUPS,
  CAREER_VISUAL_GROUP_IDS,
  type CareerVisualGroupDefinition,
  type CareerVisualGroupId,
} from "@/lib/career/careerVisualGroups";
import type {
  CareerPublishedFitDecisionCenter,
  CareerPublishedOutlookTransitions,
  CareerPublishedOnetStructuredFieldsBlock,
  CareerPublishedProgression,
  CareerPublishedQuickAnswersBlock,
  CareerPublishedUnavailableComponent,
  CareerPublishedWorkRisk,
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

function supportsRiasecFit(value: unknown): value is {
  fit_interest: string;
  interest: string;
  riasec: string;
  riasec_short: string;
} {
  if (!isRecordValue(value)) return false;
  return ["fit_interest", "interest", "riasec", "riasec_short"]
    .every((key) => typeof value[key] === "string" && value[key].trim().length > 0);
}

function ComponentFrame({
  id,
  children,
  hidden = false,
  instanceKey,
}: {
  id: CareerDisplayComponentId;
  children: ReactNode;
  hidden?: boolean;
  instanceKey?: string;
}) {
  const instanceSuffix = instanceKey ? `-${instanceKey.replace(/[^a-z0-9_-]/gi, "-")}` : "";
  return (
    <div id={`career-component-${id}${instanceSuffix}`} data-career-component-id={id} className={hidden ? "hidden" : "scroll-mt-24"}>
      {children}
    </div>
  );
}

function CareerV3Placeholder({
  locale,
  compact = false,
}: {
  locale: CareerContentV3["locale"];
  compact?: boolean;
}) {
  const copy = careerContentV3UiCopy(locale);
  return (
    <aside
      className="rounded-xl border border-dashed border-[#C7CFDF] bg-[#F7F9FC] px-5 py-4 text-sm leading-6 text-[#5B6678]"
      data-nosnippet="true"
      aria-live="polite"
    >
      <strong className="block text-[#3A4255]">{copy.unavailableTitle}</strong>
      <span>{compact ? copy.missingItem : copy.unavailableBody}</span>
    </aside>
  );
}

function CareerV3PrimitiveItem({ item, content }: { item: CareerContentV3Item; content: CareerContentV3 }) {
  const locale = content.locale;
  const copy = careerContentV3UiCopy(locale);
  if (item.availability === "missing") return <CareerV3Placeholder locale={locale} compact />;

  if (item.type === "prose" || item.type === "notice") {
    return (
      <div className="space-y-3 text-[15px] leading-7 text-[#2A3346]">
        {(item.data.paragraphs as string[]).map((paragraph, index) => <p className="m-0" key={`${item.id}-${index}`}>{paragraph}</p>)}
      </div>
    );
  }
  if (item.type === "list") {
    return <ul className="m-0 space-y-2 pl-5 text-[15px] leading-7 text-[#2A3346]">{(item.data.entries as string[]).map((entry, index) => <li key={`${item.id}-${index}`}>{entry}</li>)}</ul>;
  }
  if (item.type === "cards" || item.type === "timeline") {
    return <div className="grid gap-3 md:grid-cols-2">{(item.data.entries as Array<{ id: string; values: string[] }>).map((entry, entryIndex) => (
      <article className="rounded-xl border border-[#E5E9F2] bg-[#F7F9FC] p-4" key={entry.id}>
        <h4 className="m-0 text-base font-bold text-[#1A2233]">{careerContentV3CardCopy(item.copyKey, entry.id, entryIndex, locale)}</h4>
        {entry.values.map((value, index) => <p className="m-0 mt-2 text-sm leading-6 text-[#3A4255]" key={`${entry.id}-${index}`}>{value}</p>)}
      </article>
    ))}</div>;
  }
  if (item.type === "faq") {
    return <div className="space-y-3">{(item.data.entries as Array<{ id: string; question_key: string; answer: string }>).map((entry) => (
      <details key={entry.id} className="group rounded-xl border border-[#E5E9F2] bg-white px-4">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-4 font-bold text-[#1A2233] after:text-xl after:font-normal after:text-[#2C3E8C] after:content-['+'] group-open:after:content-['−']">
          {careerContentV3QuestionCopy(entry.question_key, locale, content.subject.name)}
        </summary>
        <p className="m-0 pb-4 text-sm leading-7 text-[#2A3346]">{entry.answer}</p>
      </details>
    ))}</div>;
  }
  if (item.type === "links") {
    return <ul className="m-0 grid gap-2 p-0 sm:grid-cols-2">{(item.data.entries as Array<{ id: string; entity: string; url: string }>).map((entry) => (
      <li className="list-none" key={entry.id}>{entry.url.startsWith("#") ? (
        <a className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url}>{entry.entity}<span className="ml-1" aria-hidden="true">→</span></a>
      ) : entry.url.startsWith("/") ? (
        <Link className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url}>{entry.entity}<span className="ml-1" aria-hidden="true">→</span></Link>
      ) : (
        <a className="inline-flex min-h-11 items-center font-semibold text-[#2C3E8C]" href={entry.url} target="_blank" rel="noreferrer" aria-label={`${entry.entity} (${copy.externalLink})`}>{entry.entity}<span className="ml-1" aria-hidden="true">↗</span></a>
      )}</li>
    ))}</ul>;
  }
  if (item.type === "sources") {
    return <ul className="m-0 space-y-2 p-0">{(item.data.entries as Array<{ id: string; name: string; url: string | null }>).map((entry) => (
      <li className="list-none text-sm leading-6" key={entry.id}>{entry.url ? <a className="font-semibold text-[#2C3E8C]" href={entry.url} target="_blank" rel="noreferrer" aria-label={`${entry.name} (${copy.externalLink})`}>{entry.name}<span className="ml-1" aria-hidden="true">↗</span></a> : <span>{entry.name}</span>}</li>
    ))}</ul>;
  }
  if (item.type === "metrics") {
    return <dl className="grid gap-3 sm:grid-cols-2">{(item.data.entries as Array<{ key: string; value: string }>).map((entry, index) => (
      <div className="rounded-xl border border-[#E5E9F2] bg-[#F7F9FC] p-4" key={`${entry.key}-${index}`}>
        <dt className="font-bold text-[#1A2233]">{careerContentV3CardCopy(item.copyKey, entry.key, index, locale)}</dt>
        <dd className="m-0 mt-1 text-sm leading-6 text-[#3A4255]">{entry.value}</dd>
      </div>
    ))}</dl>;
  }

  const columns = item.data.column_keys as string[];
  const rows = item.data.rows as string[][];
  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-[#E5E9F2]" tabIndex={0} role="region" aria-label={careerContentV3ItemCopy(item.copyKey, locale) ?? undefined}>
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-[#F0F3FA]"><tr>{columns.map((column, index) => <th className="px-4 py-3 font-bold text-[#1A2233]" key={column} scope="col">{careerContentV3ColumnCopy(column, locale) ?? copy.fieldLabel(index)}</th>)}</tr></thead>
        <tbody>{rows.map((row, rowIndex) => <tr className="border-t border-[#E5E9F2]" key={rowIndex}>{row.map((cell, cellIndex) => <td className="px-4 py-3 align-top leading-6 text-[#2A3346]" key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function CareerV3PrimitiveBlock({ block, content }: { block: CareerDossierRenderPlanBlock; content: CareerContentV3 }) {
  const copy = careerContentV3UiCopy(content.locale);
  const groups: Array<{ copyKey: string; items: CareerContentV3Item[] }> = [];
  for (const item of block.items) {
    const previous = groups.at(-1);
    if (previous?.copyKey === item.copyKey) previous.items.push(item);
    else groups.push({ copyKey: item.copyKey, items: [item] });
  }
  return (
    <div className="space-y-5">
      {groups.map((group, groupIndex) => (
        <section className="space-y-3" key={`${group.copyKey}:${groupIndex}`}>
          <h3 className="m-0 text-lg font-bold text-[#1A2233]">{careerContentV3ItemCopy(group.copyKey, content.locale) ?? copy.additionalContent}</h3>
          <div className="space-y-4">{group.items.map((item) => <CareerV3PrimitiveItem item={item} content={content} key={item.id} />)}</div>
        </section>
      ))}
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

function SourceCard({ surface, embedded = false }: { surface: CareerDisplaySurfaceViewModel; embedded?: boolean }) {
  const Container = embedded ? "div" : "section";
  const Heading = embedded ? "h3" : "h2";
  return (
    <Container className={embedded ? visual.sourceRegisterInline : "rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8"}>
      <Heading className="m-0 text-2xl font-bold text-[#1A2233]">{surface.locale === "zh" ? "资料来源" : "Sources"}</Heading>
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
    </Container>
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

  const renderComponent = (
    componentId: CareerDisplayComponentId,
    groupHeader?: { label: string; labelId: string }
  ) => {
    if (!surface.componentOrder.includes(componentId)) return null;
    if (["boundary_notice", "review_validity_card", "final_cta"].includes(componentId)) return null;

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
      ? <CareerPublishedSemanticSection componentId={componentId} value={publishedComponents[componentId]!} sources={surface.sources} reviewValidity={surface.reviewValidity} locale={surface.locale} />
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
        <section className={groupHeader ? visual.dossierFaq : "rounded-2xl border border-[#E5E9F2] bg-white p-5 shadow-[0_2px_12px_rgba(26,34,51,.05)] md:p-8"} data-testid="career-display-faq" data-career-api-component="faq_block">
          {groupHeader ? (
            <header className={visual.fitCenterHero}>
              <div className={visual.fitCenterTitleRow}>
                <h2 id={groupHeader.labelId}>{groupHeader.label}</h2>
                <span aria-hidden="true" />
              </div>
            </header>
          ) : <h2 className="m-0 text-2xl font-bold text-[#1A2233]">{isZh ? "常见问题" : "Frequently asked questions"}</h2>}
          <div className={groupHeader ? visual.dossierFaqBody : "mt-4 space-y-3"}>
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

  const renderV3RichBlock = (
    block: CareerDossierRenderPlanBlock,
  ): ReactNode | null => {
    if (!publishedComponents || !isCareerRegisteredV3BlockCopyKey(block.copyKey)) return null;
    const availableComponents = new Set(
      block.items
        .filter((item) => item.availability === "available")
        .map((item) => careerComponentForV3CopyKey(item.copyKey))
        .filter((componentId): componentId is CareerDisplayComponentId => componentId !== null),
    );
    const declares = (...componentIds: CareerDisplayComponentId[]) => componentIds.every((componentId) => availableComponents.has(componentId));

    if (block.copyKey === "career.block.quick-decision" && declares("fermat_decision_card", "fit_decision_checklist")) {
      const decision = publishedComponents.fermat_decision_card;
      const checklist = publishedComponents.fit_decision_checklist;
      if (decision !== undefined && checklist !== undefined && !isPublishedComponentUnavailable(decision) && !isPublishedComponentUnavailable(checklist)) {
        return <>
          <ComponentFrame id="fermat_decision_card" instanceKey={block.instanceKey}>
            <CareerDossierQuickDecisionAnswer value={decision} />
          </ComponentFrame>
          <ComponentFrame id="fit_decision_checklist" instanceKey={block.instanceKey}>
            <CareerDossierFitDecision value={checklist} locale={surface.locale} subjectTitle={surface.subject.title} />
          </ComponentFrame>
        </>;
      }
    }

    if (block.copyKey === "career.block.profile" && declares(
      "definition_block", "responsibilities_block", "work_context_block", "career_quick_answers_block", "onet_structured_fields_block",
    ) && supportsStructuredCareerDossierProfile(publishedComponents)) {
      return <CareerDossierProfile
          definition={publishedComponents.definition_block as string}
          responsibilities={publishedComponents.responsibilities_block as string[]}
          workContext={publishedComponents.work_context_block as string}
          quickAnswers={publishedComponents.career_quick_answers_block as CareerPublishedQuickAnswersBlock}
          professionalBasis={publishedComponents.onet_structured_fields_block as CareerPublishedOnetStructuredFieldsBlock}
          locale={surface.locale}
        />;
    }

    const directionComparison = publishedComponents.adjacent_career_comparison_table;
    if (block.copyKey === "career.block.direction-comparison" && declares("adjacent_career_comparison_table") &&
      directionComparison !== undefined && supportsCareerDossierDirectionComparison(directionComparison)) {
      return <ComponentFrame id="adjacent_career_comparison_table" instanceKey={block.instanceKey}>
        <CareerDossierDirectionComparison value={directionComparison} locale={surface.locale} />
      </ComponentFrame>;
    }

    const aiImpact = publishedComponents.ai_impact_table;
    if (block.copyKey === "career.block.ai-impact" && declares("ai_impact_table") && aiImpact !== undefined && supportsCareerDossierAiImpact(aiImpact)) {
      return <ComponentFrame id="ai_impact_table" instanceKey={block.instanceKey}>
        <CareerDossierAiImpact value={aiImpact} locale={surface.locale} />
      </ComponentFrame>;
    }

    const chinaSalary = publishedComponents.career_snapshot_primary_locale;
    if (block.copyKey === "career.block.china-salary" && declares("career_snapshot_primary_locale") && chinaSalary !== undefined && supportsCareerDossierChinaSalary(chinaSalary)) {
      return <ComponentFrame id="career_snapshot_primary_locale" instanceKey={block.instanceKey}>
        <CareerDossierChinaSalary value={chinaSalary} locale={surface.locale} />
      </ComponentFrame>;
    }

    const usSalary = publishedComponents.career_snapshot_secondary_locale;
    if (block.copyKey === "career.block.us-salary" && declares("career_snapshot_secondary_locale") && usSalary !== undefined && supportsCareerDossierUsSalary(usSalary)) {
      return <ComponentFrame id="career_snapshot_secondary_locale" instanceKey={block.instanceKey}>
        <CareerDossierUsSalary value={usSalary} locale={surface.locale} />
      </ComponentFrame>;
    }

    const riasec = publishedComponents.riasec_fit_block;
    const fitCenter = publishedComponents.personality_fit_block;
    if (block.copyKey === "career.block.fit" && declares("riasec_fit_block", "personality_fit_block") && supportsRiasecFit(riasec) && supportsCareerDossierFitCenter(fitCenter)) {
      return <>
        <ComponentFrame id="riasec_fit_block" instanceKey={block.instanceKey} hidden><span data-career-api-component="riasec_fit_block" /></ComponentFrame>
        <ComponentFrame id="personality_fit_block" instanceKey={block.instanceKey}>
          <CareerDossierFitCenter value={fitCenter as CareerPublishedFitDecisionCenter} riasec={riasec} locale={surface.locale} sectionLabel={block.title} sectionLabelId={`${block.anchorId}-title`} />
        </ComponentFrame>
      </>;
    }

    const workRisk = publishedComponents.career_risk_cards;
    if (block.copyKey === "career.block.risk" && declares("career_risk_cards") && supportsCareerWorkRisk(workRisk)) {
      return <ComponentFrame id="career_risk_cards" instanceKey={block.instanceKey}>
        <CareerDossierWorkRisk value={workRisk as CareerPublishedWorkRisk} locale={surface.locale} sectionLabel={block.title} sectionLabelId={`${block.anchorId}-title`} />
      </ComponentFrame>;
    }

    const progression = publishedComponents.career_path_block;
    if (block.copyKey === "career.block.path" && declares("career_path_block") && supportsCareerProgression(progression)) {
      return <ComponentFrame id="career_path_block" instanceKey={block.instanceKey}>
        <CareerDossierProgression value={progression as CareerPublishedProgression} locale={surface.locale} sectionLabel={block.title} sectionLabelId={`${block.anchorId}-title`} />
      </ComponentFrame>;
    }

    const outlook = publishedComponents.market_signal_card;
    if (block.copyKey === "career.block.market-signals" && declares("market_signal_card") && supportsCareerOutlookTransitions(outlook)) {
      return <ComponentFrame id="market_signal_card" instanceKey={block.instanceKey}>
        <CareerDossierOutlookTransitions value={outlook as CareerPublishedOutlookTransitions} locale={surface.locale} sectionLabel={block.title} sectionLabelId={`${block.anchorId}-title`} />
      </ComponentFrame>;
    }

    if (block.copyKey === "career.block.sources") {
      const nodes = block.declaredComponentIds.flatMap((componentId) => {
        if (!availableComponents.has(componentId)) return [];
        if (["boundary_notice", "review_validity_card", "final_cta"].includes(componentId)) return [];
        if (publishedComponents[componentId] === undefined) return [
          <ComponentFrame key={componentId} id={componentId} instanceKey={block.instanceKey}>
            <CareerV3Placeholder compact locale={surface.locale} />
          </ComponentFrame>,
        ];
        const component = renderComponent(componentId, {
          label: block.title,
          labelId: `${block.anchorId}-title`,
        });
        return component == null ? [
          <ComponentFrame key={componentId} id={componentId} instanceKey={block.instanceKey}>
            <CareerV3Placeholder compact locale={surface.locale} />
          </ComponentFrame>,
        ] : [
          <ComponentFrame key={componentId} id={componentId} instanceKey={block.instanceKey}>{component}</ComponentFrame>,
        ];
      });
      return nodes.length > 0 ? <>{nodes}</> : null;
    }

    const components = block.declaredComponentIds.filter((componentId) =>
      !["boundary_notice", "review_validity_card", "final_cta"].includes(componentId)
    );
    if (components.length === 0 || components.some((componentId) => publishedComponents[componentId] === undefined)) return null;
    const nodes = components.map((componentId) => renderComponent(componentId));
    if (nodes.some((node) => node === null)) return null;
    return <>{nodes.map((node, index) => (
      <ComponentFrame id={components[index]} instanceKey={block.instanceKey} key={`${components[index]}:${index}`}>{node}</ComponentFrame>
    ))}</>;
  };

  if (surface.dossierRenderPlan?.source === "content_v3") {
    const plan = surface.dossierRenderPlan;
    const copy = careerContentV3UiCopy(surface.locale);
    const breadcrumb = renderComponent("breadcrumb");
    const hero = renderComponent("hero");
    const successfulBlocks = plan.blocks.filter((block) => block.visibleInToc);
    const shellClassName = (block: CareerDossierRenderPlanBlock, usesRegisteredRenderer: boolean): string => {
      if (!usesRegisteredRenderer) return `${visual.visualGroup} ${visual.compoundGroup}`;
      if (block.presentation === "quick-decision") return `${visual.visualGroup} ${visual.compoundGroup} ${visual.accountantsQuickDecisionGroup}`;
      if (block.presentation === "profile") return `${visual.visualGroup} ${visual.compoundGroup} ${visual.profileGroup} ${visual.accountantsProfileGroup}`;
      if (block.presentation === "fit") return `${visual.visualGroup} ${visual.compoundGroup} ${visual.accountantsFitCenterGroup}`;
      if (block.presentation === "decision-journey") return `${visual.visualGroup} ${visual.compoundGroup} ${visual.accountantsDecisionJourneyGroup}`;
      if (block.presentation === "sources") return `${visual.visualGroup} ${visual.compoundGroup} ${visual.accountantsSourcesGroup}`;
      return visual.visualGroup;
    };

    const missingItemPlaceholders = (block: CareerDossierRenderPlanBlock) => {
      const missingItems = block.items.filter((item) => item.availability === "missing");
      return missingItems.length > 0 ? (
        <div className="mt-4 space-y-3">
          {missingItems.map((item) => <CareerV3Placeholder compact key={item.id} locale={surface.locale} />)}
        </div>
      ) : null;
    };

    const renderPlannedBlock = (block: CareerDossierRenderPlanBlock): ReactNode => {
      if (isCareerInternalV3BlockCopyKey(block.copyKey)) return null;
      if (!block.renderable) {
        return (
          <section
            className={visual.visualGroup}
            id={block.anchorId}
            data-career-v3-block-copy-key={block.copyKey}
            data-career-v3-presentation={block.presentation}
            data-content-block-id={block.id}
            key={block.instanceKey}
          >
            <CareerV3Placeholder locale={surface.locale} />
          </section>
        );
      }

      const registeredSemantic = isCareerRegisteredV3BlockCopyKey(block.copyKey);
      const richContent = registeredSemantic ? renderV3RichBlock(block) : null;
      const usesRegisteredRenderer = richContent !== null;
      const usesQuickDecisionHeader = usesRegisteredRenderer && block.presentation === "quick-decision";
      const ownsAccessibleTitle = usesRegisteredRenderer && ["profile", "direction-comparison", "ai-impact", "salary"].includes(block.presentation);
      const labelledByComponent = usesRegisteredRenderer && ["fit", "decision-journey", "sources"].includes(block.presentation);

      return (
        <section
          className={shellClassName(block, usesRegisteredRenderer)}
          id={block.anchorId}
          key={block.instanceKey}
          data-career-visual-group={block.id}
          data-career-v3-block-copy-key={block.copyKey}
          data-career-v3-presentation={block.presentation}
          data-content-block-id={block.id}
          aria-labelledby={usesQuickDecisionHeader || labelledByComponent || !usesRegisteredRenderer ? `${block.anchorId}-title` : undefined}
          aria-label={ownsAccessibleTitle ? block.title : undefined}
        >
          {block.anchorId === `career-content-${block.id}` ? (
            <span id={`career-visual-group-${block.id}`} aria-hidden="true" className="sr-only" />
          ) : null}
          {usesQuickDecisionHeader ? (
            <header className={visual.quickDecisionHeader}>
              <h2 className={visual.quickDecisionTitle} id={`${block.anchorId}-title`}>{block.title}</h2>
            </header>
          ) : !usesRegisteredRenderer ? (
            <h2 className={visual.groupTitle} id={`${block.anchorId}-title`}>{block.title}</h2>
          ) : null}
          <div className={visual.groupStack}>
            {richContent ?? (registeredSemantic
              ? <CareerV3Placeholder locale={surface.locale} />
              : <CareerV3PrimitiveBlock block={block} content={plan.content} />)}
            {usesRegisteredRenderer ? missingItemPlaceholders(block) : null}
          </div>
        </section>
      );
    };

    return (
      <article
        className={`mx-auto w-full max-w-[1440px] px-5 font-sans leading-7 text-[#1A2233] sm:px-6 md:px-8 xl:px-10 ${visual.article}`}
        data-testid="career-display-surface"
        data-career-production-template="career-production-v1"
        data-career-dossier-layout="responsive-v2"
        data-career-dossier-plan="content_v3"
        data-content-contract={plan.content.contractVersion}
        data-career-renderer-release={rendererRelease}
      >
        {breadcrumb ? <div data-career-visual-group-component="hero"><ComponentFrame id="breadcrumb">{breadcrumb}</ComponentFrame></div> : null}
        <div className={`mt-5 grid items-start gap-5 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-6 ${visual.layout}`} data-testid="career-source-disclosure">
          <aside className={`flex min-w-0 flex-col gap-4 lg:sticky lg:top-[84px] ${visual.rail} ${visual.accountantsRail}`} aria-label={copy.pageContents}>
            <div className={visual.toc} data-testid="career-dossier-toc">
              <div className={visual.tocHeading}><span className={visual.tocKicker}>{copy.dossier}</span></div>
              <nav className={visual.tocNav} aria-label={copy.contents}>
                {successfulBlocks.map((block, index) => (
                  <a className={visual.tocLink} href={`#${block.anchorId}`} key={block.instanceKey}>
                    <span aria-hidden="true" className={visual.tocIndex}>{String(index + 1).padStart(2, "0")}</span>
                    <span>{block.title}</span>
                  </a>
                ))}
              </nav>
            </div>
            <section className={visual.assessmentRail} data-testid="career-production-assessment-rail">
              <Link href={primaryCtaHref} className={visual.assessmentRailCta}>{copy.startTest}<span aria-hidden="true">→</span></Link>
            </section>
          </aside>
          <main className={`min-w-0 ${visual.componentStack}`}>
            {hero ? <section data-career-visual-group="overview">{hero}</section> : null}
            {plan.blocks.map(renderPlannedBlock)}
          </main>
        </div>
      </article>
    );
  }

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
    } else if (
      group.id === "fit" && isEnhanced &&
      supportsRiasecFit(publishedComponents.riasec_fit_block) &&
      supportsCareerDossierFitCenter(publishedComponents.personality_fit_block)
    ) {
      const riasec = publishedComponents.riasec_fit_block;
      const fitCenter = publishedComponents.personality_fit_block;
      componentNodes = [
        <ComponentFrame key="riasec_fit_block" id="riasec_fit_block" hidden>
          <span data-career-api-component="riasec_fit_block" />
        </ComponentFrame>,
        <ComponentFrame key="personality_fit_block" id="personality_fit_block">
          <CareerDossierFitCenter
            value={fitCenter as CareerPublishedFitDecisionCenter}
            riasec={riasec}
            locale={surface.locale}
            sectionLabel={visualGroupLabel(group, isZh)}
            sectionLabelId={`career-visual-group-title-${group.id}`}
          />
        </ComponentFrame>,
      ];
    } else if (group.id === "risk" && isEnhanced && supportsCareerWorkRisk(publishedComponents.career_risk_cards)) {
      componentNodes = [
        <ComponentFrame key="career_risk_cards" id="career_risk_cards">
          <CareerDossierWorkRisk value={publishedComponents.career_risk_cards as CareerPublishedWorkRisk} locale={surface.locale} sectionLabel={visualGroupLabel(group, isZh)} sectionLabelId={`career-visual-group-title-${group.id}`} />
        </ComponentFrame>,
      ];
    } else if (group.id === "path" && isEnhanced && supportsCareerProgression(publishedComponents.career_path_block)) {
      componentNodes = [
        <ComponentFrame key="career_path_block" id="career_path_block">
          <CareerDossierProgression value={publishedComponents.career_path_block as CareerPublishedProgression} locale={surface.locale} sectionLabel={visualGroupLabel(group, isZh)} sectionLabelId={`career-visual-group-title-${group.id}`} />
        </ComponentFrame>,
      ];
    } else if (group.id === "market-signals" && isEnhanced && supportsCareerOutlookTransitions(publishedComponents.market_signal_card)) {
      componentNodes = [
        <ComponentFrame key="market_signal_card" id="market_signal_card">
          <CareerDossierOutlookTransitions value={publishedComponents.market_signal_card as CareerPublishedOutlookTransitions} locale={surface.locale} sectionLabel={visualGroupLabel(group, isZh)} sectionLabelId={`career-visual-group-title-${group.id}`} />
        </ComponentFrame>,
      ];
    } else {
      componentNodes = surface.componentOrder.filter((componentId) => group.componentIds.includes(componentId)).map((componentId) => {
        const component = renderComponent(componentId, group.id === "sources" && isEnhanced ? {
          label: visualGroupLabel(group, isZh),
          labelId: `career-visual-group-title-${group.id}`,
        } : undefined);
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
    const usesEnhancedFitCenter = group.id === "fit" && isEnhanced &&
      supportsRiasecFit(publishedComponents.riasec_fit_block) &&
      supportsCareerDossierFitCenter(publishedComponents.personality_fit_block);
    const usesDecisionJourney = isEnhanced && (
      (group.id === "risk" && supportsCareerWorkRisk(publishedComponents.career_risk_cards)) ||
      (group.id === "path" && supportsCareerProgression(publishedComponents.career_path_block)) ||
      (group.id === "market-signals" && supportsCareerOutlookTransitions(publishedComponents.market_signal_card))
    );
    const usesEnhancedSourcesHero = group.id === "sources" && isEnhanced && publishedComponents.faq_block !== undefined;
    const hasVisibleGroupTitle = (!usesDecisionJourney && titledGroupIds.has(group.id)) || usesEnhancedQuickDecision || usesEnhancedFitCenter || usesEnhancedSourcesHero;

    return (
      <section
        key={group.id}
        id={`career-visual-group-${group.id}`}
        className={`${visual.visualGroup} ${compoundGroupIds.has(group.id) ? visual.compoundGroup : ""} ${group.id === "profile" ? visual.profileGroup : ""} ${group.id === "profile" && usesStructuredProfile ? visual.accountantsProfileGroup : ""} ${usesEnhancedQuickDecision ? visual.accountantsQuickDecisionGroup : ""} ${usesEnhancedFitCenter ? visual.accountantsFitCenterGroup : ""} ${usesDecisionJourney ? visual.accountantsDecisionJourneyGroup : ""} ${usesEnhancedSourcesHero ? visual.accountantsSourcesGroup : ""}`}
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
        ) : usesEnhancedFitCenter || usesDecisionJourney || usesEnhancedSourcesHero ? null : titledGroupIds.has(group.id) && !(group.id === "profile" && usesStructuredProfile) ? (
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
