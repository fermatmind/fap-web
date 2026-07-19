import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ClaimGuard } from "@/components/career/ClaimGuard";
import { CareerAiImpactPreviewSection } from "@/components/career/ai-impact/CareerAiImpactPreviewSection";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CareerExplainabilityPanel } from "@/components/career/CareerExplainabilityPanel";
import { CareerSalaryAssetPreviewSection } from "@/components/career/salary/CareerSalaryAssetPreviewSection";
import { StrainRadar } from "@/components/career/StrainRadar";
import { CareerProjectionDeltaPanel } from "@/components/career/timeline/CareerProjectionDeltaPanel";
import { CareerProjectionTimeline } from "@/components/career/timeline/CareerProjectionTimeline";
import { CareerShortlistAction } from "@/components/career/CareerShortlistAction";
import { TrustStrip } from "@/components/career/TrustStrip";
import { WarningBanner } from "@/components/career/WarningBanner";
import { ConfidenceBadge, ConfidenceBoundary } from "@/components/career/v1/ConfidenceBoundary";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import { NextStepRail, type NextStepRailItem } from "@/components/career/v1/NextStepRail";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { adaptCareerFirstWaveNextStepLinks } from "@/lib/career/adapters/adaptCareerFirstWaveNextStepLinks";
import { adaptCareerJobExplainability } from "@/lib/career/adapters/adaptCareerExplainability";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";
import type {
  CareerExplainabilityAdapter,
  CareerFirstWaveNextStepLinksSummaryAdapter,
  CareerJobBundleAdapter,
  CareerRuntimeConfigAdapter,
} from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import {
  CAREER_DISPLAY_RIASEC_TEST_SLUG,
  buildCareerDisplayCtaHref,
  buildCareerDisplayFAQPageJsonLd,
} from "@/lib/career/displaySurface";
import { fetchCareerFirstWaveNextStepLinks } from "@/lib/career/api/fetchCareerFirstWaveNextStepLinks";
import { fetchCareerAiImpactAssetPreview } from "@/lib/career/api/fetchCareerAiImpactAssetPreview";
import { fetchCareerJobExplainability } from "@/lib/career/api/fetchCareerJobExplainability";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { fetchCareerRuntimeConfig } from "@/lib/career/api/fetchCareerRuntimeConfig";
import { fetchCareerSalaryAssetPreview } from "@/lib/career/api/fetchCareerSalaryAssetPreview";
import {
  buildCareerFamilyFrontendUrl,
  buildCareerJobFrontendUrl,
  normalizeCareerBundleCanonicalPath,
} from "@/lib/career/urls";
import { getCareerV1RendererCopy, getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { splitInternalLinkText } from "@/lib/content/internalLinkText";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { appendAttributionParamsToHref, extractAttributionParamsFromRecord } from "@/lib/tracking/attribution";

export const revalidate = 300;
export const CAREER_DETAIL_MAX_BACKEND_REQUESTS_PER_RENDER = 6;

type CareerJobSearchParams = Record<string, string | string[] | undefined>;

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildCareerJobFrontendUrl(locale, slug);
}

function formatUsdAnnual(value: number | null, locale: Locale): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value}%`;
}

function renderScoreValue(value: number | null): string {
  return value === null ? "—" : String(value);
}

function isIndexableState(indexState: string | null | undefined): boolean {
  const normalized = String(indexState ?? "").trim().toLowerCase();
  return normalized === "index" || normalized === "indexable" || normalized === "indexed";
}

function robotsAllowIndex(robotsPolicy: string | null | undefined): boolean | null {
  const normalized = String(robotsPolicy ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (normalized.includes("noindex")) {
    return false;
  }

  return normalized.includes("index") ? true : null;
}

function hasPublishedIndexAuthority(job: CareerJobBundleAdapter): boolean {
  if (job.seoSurface) {
    return (
      job.seoSurface.robotsPolicyExplicit === true &&
      robotsAllowIndex(job.seoSurface.robotsPolicy) === true &&
      job.seoSurface.indexEligible === true &&
      isIndexableState(job.seoSurface.indexState)
    );
  }

  return job.seoContract.indexEligible === true && isIndexableState(job.seoContract.indexState);
}

function hasLocalCareerIndexTrust(job: CareerJobBundleAdapter): boolean {
  const trustReviewed =
    job.trustManifest?.legacyReview.reviewed === true ||
    job.trustManifest?.legacyReview.reviewerStatus === "reviewed" ||
    job.trustManifest?.legacyReview.reviewerStatus === "approved";

  return (
    job.renderState.canRenderAnswerSurface ||
    job.renderState.canRenderOutlookSurface ||
    job.renderState.canRenderFitSurface ||
    (trustReviewed && job.claimPermissions.allow_strong_claim === true)
  );
}

function hasRuntimeProjectionIndexAuthority(job: CareerJobBundleAdapter): boolean {
  const reasonCodes = new Set(job.seoContract.reasonCodes.map((item) => item.trim().toLowerCase()));
  const hasRuntimePublicationAuthority =
    reasonCodes.has("validated_display_asset_backed_release") ||
    reasonCodes.has("release_gate_pass") ||
    reasonCodes.has("runtime_published_navigation_shell");

  return (
    hasPublishedIndexAuthority(job) &&
    reasonCodes.has("runtime_publish_projection") &&
    hasRuntimePublicationAuthority
  );
}

function hasTrustedPublishedIndexAuthority(job: CareerJobBundleAdapter): boolean {
  return (
    hasPublishedIndexAuthority(job) &&
    (job.renderState.canIndexPage || hasLocalCareerIndexTrust(job) || hasRuntimeProjectionIndexAuthority(job))
  );
}

function hasBackendStructuredDataKey(job: CareerJobBundleAdapter, key: string): boolean {
  const normalizedKey = key.toLowerCase();
  return Boolean(job.seoSurface?.structuredDataKeys.some((item) => item.toLowerCase() === normalizedKey));
}

function shouldRenderOccupationJsonLd(job: CareerJobBundleAdapter): boolean {
  if (!job.structuredData.occupation || !job.renderState.canRenderStructuredData) {
    return false;
  }

  if (job.seoSurface) {
    return hasBackendStructuredDataKey(job, "Occupation");
  }

  return job.renderState.canRenderStructuredData;
}

function containsCjkText(value: string | null | undefined): boolean {
  return /[\u3400-\u9fff]/.test(String(value ?? ""));
}

function shouldRedirectEnglishJobDetailToChinese(job: CareerJobBundleAdapter, locale: Locale): boolean {
  if (locale !== "en") {
    return false;
  }

  const trustLocale = job.trustManifest?.locale_context.locale;
  const displayMarket = job.trustManifest?.locale_context.display_market;
  const crosswalkMode = job.trustManifest?.methodology.crosswalk_mode;

  return (
    trustLocale === "zh-CN" ||
    displayMarket === "zh-CN" ||
    crosswalkMode === "docx_baseline" ||
    containsCjkText(job.contentBodyMd) ||
    job.contentSections.some((section) => containsCjkText(section.title) || containsCjkText(section.bodyMd))
  );
}

const loadCareerJobBundle = cache(async (locale: Locale, slug: string): Promise<CareerJobBundleAdapter | null> => {
  const payload = await fetchCareerJobBundle({ locale, slug, includeSeoAuthority: true });
  return adaptCareerJobBundle({ locale, requestedSlug: slug, payload });
});

const loadCareerSalaryAssetPreview = cache(async (locale: Locale, slug: string) => {
  return fetchCareerSalaryAssetPreview({ locale, slug });
});

const loadCareerAiImpactAssetPreview = cache(async (locale: Locale, slug: string) => {
  return fetchCareerAiImpactAssetPreview({ locale, slug });
});

async function resolveCareerJobSearchParams(
  searchParams?: CareerJobSearchParams | Promise<CareerJobSearchParams>
): Promise<CareerJobSearchParams> {
  return searchParams ? await searchParams : {};
}

async function loadCareerJobExplainability(locale: Locale, slug: string): Promise<CareerExplainabilityAdapter | null> {
  const payload = await fetchCareerJobExplainability({ locale, slug });
  return adaptCareerJobExplainability(payload);
}

async function loadCareerNextStepLinks(locale: Locale, slug: string): Promise<CareerFirstWaveNextStepLinksSummaryAdapter | null> {
  const payload = await fetchCareerFirstWaveNextStepLinks({ locale, slug });
  return adaptCareerFirstWaveNextStepLinks({ payload });
}

async function loadRuntimeConfig(locale: Locale): Promise<CareerRuntimeConfigAdapter> {
  const payload = await fetchCareerRuntimeConfig({ locale });
  return adaptCareerRuntimeConfig(payload);
}

type CareerRendererContractState = "blocked" | "provisional" | "restricted";

function getJobRendererContractState(job: CareerJobBundleAdapter): CareerRendererContractState | null {
  if (job.renderState.careerDataStatus === "unavailable" || !job.renderState.canIndexPage) {
    return "blocked";
  }

  if (job.renderState.careerDataStatus === "trust_limited") {
    return "provisional";
  }

  if (!job.renderState.canRenderSalarySurface || !job.renderState.canRenderOutlookSurface || !job.renderState.canRenderFitSurface) {
    return "restricted";
  }

  return null;
}

function renderJobBoundary(job: CareerJobBundleAdapter, locale: Locale) {
  const rendererState = getJobRendererContractState(job);
  const stateCopy = rendererState ? getCareerV1RendererCopy(rendererState) : getCareerV1StateCopy(job.renderState.careerDataStatus);

  if (!stateCopy || stateCopy.tone === "complete") {
    return null;
  }

  return (
    <ConfidenceBoundary
      tone={stateCopy.tone}
      title={stateCopy.label}
      description={stateCopy.description}
      actionLabel={locale === "zh" ? "查看依据" : "View evidence"}
    />
  );
}

function renderCareerJobProtocolStatus(job: CareerJobBundleAdapter) {
  return (
    <div
      className="sr-only"
      data-testid="career-job-protocol-status"
      data-career-data-status={job.renderState.careerDataStatus}
      data-renderer-state={getJobRendererContractState(job) ?? "complete"}
      data-index-eligible={job.seoContract.indexEligible ? "true" : "false"}
    >
      Career claim gate
    </div>
  );
}

function buildNextStepRailItems(
  locale: Locale,
  summary: CareerFirstWaveNextStepLinksSummaryAdapter | null,
  landingPath: string,
  subjectSlug: string,
  attributionParams: ReturnType<typeof extractAttributionParamsFromRecord> = {},
  includeAttributedRiasecCta = false
): NextStepRailItem[] {
  const items: NextStepRailItem[] = [];

  if (includeAttributedRiasecCta) {
    items.push({
      title: locale === "zh" ? "RIASEC 职业兴趣测试" : "RIASEC career interest test",
      description:
        locale === "zh"
          ? "先确认职业兴趣结构，再回到当前职业页判断。"
          : "Check your career-interest structure before deciding on this role.",
      href: buildCareerDisplayCtaHref({
        locale,
        landingPath,
        subjectSlug,
        attributionParams,
      }),
      eventName: CAREER_TRACKING_EVENTS.jobDetailCtaClick,
      eventPayload: {
        locale,
        entrySurface: "career_job_detail",
        sourcePageType: "career_job_detail",
        targetAction: "start_riasec_test",
        landingPath,
        routeFamily: "job_detail",
        subjectKind: "job_slug",
        subjectKey: subjectSlug,
        queryMode: "non_query",
      },
    });
  }

  if (summary) {
    for (const link of summary.familyHubLinks) {
      items.push({
        title: locale === "zh" ? "进入职业家族" : "Open career family",
        description: link.titleEn ?? link.canonicalSlug,
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerFamilyFrontendUrl(locale, link.canonicalSlug)),
      });
    }

    for (const link of summary.jobDetailLinks) {
      items.push({
        title: link.canonicalTitleEn ?? (locale === "zh" ? "相关职业" : "Related role"),
        description: locale === "zh" ? "查看相邻职业资料。" : "Inspect a related role profile.",
        href: normalizeCareerBundleCanonicalPath(locale, link.canonicalPath, buildCareerJobFrontendUrl(locale, link.canonicalSlug)),
        eventName: CAREER_TRACKING_EVENTS.jobDetailCtaClick,
        eventPayload: {
          locale,
          entrySurface: "career_job_detail",
          sourcePageType: "career_job_detail",
          targetAction: "open_next_step_link",
          landingPath,
          routeFamily: "job_detail",
          subjectKind: "job_slug",
          subjectKey: link.canonicalSlug,
          queryMode: "non_query",
        },
      });
    }
  }

  items.push({
    title: locale === "zh" ? "回到职业库" : "Back to job library",
    description: locale === "zh" ? "继续比较其他职业。" : "Compare this with other roles.",
    href: localizedPath("/career/jobs", locale),
  });

  return items.slice(0, 3);
}

function MetricCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="m-0 mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{caption}</p>
    </div>
  );
}

function LegacyCareerJobCta({
  locale,
  landingPath,
  subjectSlug,
  attributionParams,
}: {
  locale: Locale;
  landingPath: string;
  subjectSlug: string;
  attributionParams: ReturnType<typeof extractAttributionParamsFromRecord>;
}) {
  const href = buildCareerDisplayCtaHref({
    locale,
    landingPath,
    subjectSlug,
    attributionParams,
  });

  return (
    <section className="rounded-lg border border-slate-950 bg-slate-950 p-5 text-white" data-testid="career-display-cta">
      <h2 className="m-0 text-2xl font-semibold tracking-normal">{locale === "zh" ? "下一步" : "Next step"}</h2>
      <p className="m-0 mt-3 text-sm leading-7 text-slate-200">
        {locale === "zh"
          ? "用 RIASEC 先确认职业兴趣结构，再回到职业页做风险和行动判断。"
          : "Use RIASEC to check your career-interest structure before making a job-path decision."}
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100"
        data-entry-surface="career_job_detail"
        data-source-page-type="career_job_detail"
        data-target-action="start_riasec_test"
        data-test-slug={CAREER_DISPLAY_RIASEC_TEST_SLUG}
        data-landing-path={landingPath}
      >
        {locale === "zh" ? "开始 RIASEC 职业兴趣测试" : "Start the RIASEC career interest test"}
      </Link>
    </section>
  );
}

function renderMarkdownLine(line: string, index: number, locale: Locale) {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const bullet = trimmed.match(/^[-•]\s*(.+)$/);
  if (bullet) {
    return (
      <li key={index} className="pl-1">
        {renderInternalLinkText(bullet[1] ?? "", locale)}
      </li>
    );
  }

  const ordered = trimmed.match(/^(\d+)\.\s*(.+)$/);
  if (ordered) {
    return (
      <li key={index} className="pl-1">
        {renderInternalLinkText(ordered[2] ?? "", locale)}
      </li>
    );
  }

  return (
    <p key={index} className="m-0">
      {renderInternalLinkText(trimmed, locale)}
    </p>
  );
}

function renderInternalLinkText(text: string, locale: Locale) {
  return splitInternalLinkText(text, {}, locale).map((part, index) => {
    if (part.type === "link") {
      return (
        <a key={`${part.href}-${index}`} href={part.href} className="text-[var(--fm-accent)] underline-offset-2 hover:underline">
          {part.label}
        </a>
      );
    }

    return <span key={`text-${index}`}>{part.text}</span>;
  });
}

function stripOrderedListMarker(line: string): string {
  return line.replace(/^\d+\.\s*/, "").trim();
}

function ContentSection({ section, locale }: { section: CareerJobBundleAdapter["contentSections"][number]; locale: Locale }) {
  const lines = section.bodyMd.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const bulletLines = lines.filter((line) => /^[-•]\s+/.test(line));
  const orderedItems = lines.filter((line) => /^\d+\.\s+/.test(line)).map(stripOrderedListMarker).filter(Boolean);
  const proseLines = lines.filter((line) => !/^[-•]\s+/.test(line) && !/^\d+\.\s+/.test(line));

  return (
    <article className="space-y-4 border-t border-slate-200 pt-6 first:border-t-0 first:pt-0">
      <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{section.title}</h2>
      <div className="space-y-3 text-base leading-8 text-slate-600">
        {proseLines.map((line, index) => renderMarkdownLine(line, index, locale))}
        {bulletLines.length > 0 ? <ul className="m-0 list-disc space-y-2 pl-5">{bulletLines.map((line, index) => renderMarkdownLine(line, index, locale))}</ul> : null}
        {orderedItems.length > 0 ? <ul className="m-0 list-disc space-y-2 pl-5">{orderedItems.map((item, index) => <li key={index} className="pl-1">{renderInternalLinkText(item, locale)}</li>)}</ul> : null}
      </div>
    </article>
  );
}

type MarkdownBlock =
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "snapshot"; rows: Array<[string, string, string, string]> }
  | { kind: "table"; rows: string[][] }
  | { kind: "ordered"; items: string[] };

function formatCareerJobDocumentText(text: string): string {
  return text
    .replace(/表格未单列额外工作经验要求/g, "暂无额外工作经验要求")
    .replace(/表格未单列额外培训要求/g, "暂无额外培训要求")
    .replace(/(\$[\d,.]+ \/ 小时)(?!（参考美国标准）)/g, "$1（参考美国标准）");
}

function formatCareerJobDocumentCell(cell: string, previousCell?: string): string {
  if (/^表格未单列额外(?:工作经验|培训)要求$/.test(cell)) {
    return "暂无";
  }

  if (previousCell === "时薪中位数") {
    return formatCareerJobDocumentText(cell);
  }

  return formatCareerJobDocumentText(cell);
}

function stripMatchingDocumentTitle(bodyMd: string, title: string): string {
  const lines = bodyMd.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim() !== "");
  if (firstContentIndex < 0) {
    return "";
  }

  const first = lines[firstContentIndex]?.trim() ?? "";
  if (first === `# ${title}` || first.replace(/^#\s+/, "") === title) {
    return lines.slice(firstContentIndex + 1).join("\n").trim();
  }

  return bodyMd.trim();
}

function parseMarkdownDocument(bodyMd: string, title: string): MarkdownBlock[] {
  const source = stripMatchingDocumentTitle(bodyMd, title);
  const blocks: MarkdownBlock[] = [];
  let bullets: string[] = [];
  let ordered: string[] = [];
  let lastHeading = "";
  const sectionNumerals: Record<string, string> = {
    "01": "一",
    "02": "二",
    "03": "三",
    "04": "四",
    "05": "五",
    "06": "六",
  };

  const isTableLine = (line: string): boolean => /^\|.*\|\s*$/.test(line);
  const isTableSeparatorLine = (line: string): boolean => {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
  };
  const parseTableRow = (line: string): string[] =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.replace(/\\\|/g, "|").trim());
  const formatHeadingText = (text: string): string => {
    const sectionHeading = text.match(/^(0[1-6])\s+(.+)$/);
    if (!sectionHeading) {
      return text;
    }

    return `${sectionNumerals[sectionHeading[1]]}、${sectionHeading[2]}`;
  };

  const flushBullets = () => {
    if (bullets.length > 0) {
      if (lastHeading === "职业快照" && bullets.length >= 2) {
        const pairs = bullets.map((item) => {
          const [label, ...rest] = item.split("：");
          return [label?.trim() ?? "", rest.join("：").trim()] as [string, string];
        });
        const rows: Array<[string, string, string, string]> = [];
        for (let index = 0; index < pairs.length; index += 2) {
          rows.push([pairs[index]?.[0] ?? "", pairs[index]?.[1] ?? "", pairs[index + 1]?.[0] ?? "", pairs[index + 1]?.[1] ?? ""]);
        }
        blocks.push({ kind: "snapshot", rows });
      } else {
        blocks.push({ kind: "bullets", items: bullets });
      }
      bullets = [];
    }
  };
  const flushOrdered = () => {
    if (ordered.length > 0) {
      blocks.push({ kind: "ordered", items: ordered });
      ordered = [];
    }
  };
  const flushAll = () => {
    flushBullets();
    flushOrdered();
  };

  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = (lines[index] ?? "").trim();
    if (!line) {
      if (ordered.length > 0) {
        continue;
      }

      flushAll();
      continue;
    }

    if (line.startsWith("<!--")) {
      flushAll();
      continue;
    }

    if (isTableLine(line)) {
      flushAll();
      const tableRows: string[][] = [];
      while (index < lines.length && isTableLine((lines[index] ?? "").trim())) {
        const tableLine = (lines[index] ?? "").trim();
        if (!isTableSeparatorLine(tableLine)) {
          tableRows.push(parseTableRow(tableLine));
        }
        index += 1;
      }
      index -= 1;
      if (tableRows.length > 0) {
        blocks.push({ kind: "table", rows: tableRows });
      }
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      flushAll();
      lastHeading = heading[2];
      blocks.push({ kind: "heading", level: heading[1].length as 2 | 3, text: formatHeadingText(lastHeading) });
      continue;
    }

    const bullet = line.match(/^[-•]\s*(.+)$/);
    if (bullet) {
      flushOrdered();
      bullets.push(bullet[1]);
      continue;
    }

    const orderedItem = line.match(/^\d+\.\s*(.+)$/);
    if (orderedItem) {
      flushBullets();
      if (ordered.length === 0 && lastHeading === "05 相近职业与延伸方向") {
        lastHeading = "06 在费马测试里，建议这样继续判断";
        blocks.push({ kind: "heading", level: 2, text: formatHeadingText(lastHeading) });
      }
      ordered.push(orderedItem[1]);
      continue;
    }

    flushBullets();
    flushOrdered();
    blocks.push({ kind: "paragraph", text: line });
  }

  flushAll();

  return blocks;
}

function CareerJobDocument({ bodyMd, title, locale }: { bodyMd: string; title: string; locale: Locale }) {
  const blocks = parseMarkdownDocument(bodyMd, title);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white px-5 py-7 shadow-sm md:px-10 md:py-10" data-testid="career-job-docx-document">
      <div className="space-y-7 text-lg leading-9 text-slate-600 [overflow-wrap:anywhere]">
        {blocks.map((block, index) => {
          if (block.kind === "heading") {
            const Heading = block.level === 2 ? "h2" : "h3";
            return (
              <Heading key={index} className="m-0 border-t border-slate-200 pt-8 text-3xl font-semibold leading-tight tracking-tight text-slate-950 first:border-t-0 first:pt-0">
                {block.text}
              </Heading>
            );
          }

          if (block.kind === "bullets") {
            return (
              <ul key={index} className="m-0 list-disc space-y-3 pl-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {renderInternalLinkText(formatCareerJobDocumentText(item), locale)}
                  </li>
                ))}
              </ul>
            );
          }

          if (block.kind === "snapshot") {
            return (
              <div key={index} className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left text-base leading-7">
                  <tbody>
                    {block.rows.map((row, rowIndex) => {
                      const firstValue = formatCareerJobDocumentCell(row[1], row[0]);
                      const secondValue = formatCareerJobDocumentCell(row[3], row[2]);

                      return (
                        <tr key={rowIndex} className="border-t border-slate-200 first:border-t-0">
                          <th className="w-1/4 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{row[0]}</th>
                          <td className="w-1/4 px-4 py-3 text-slate-600">{firstValue}</td>
                          <th className="w-1/4 bg-slate-50 px-4 py-3 font-semibold text-slate-700">{row[2]}</th>
                          <td className="w-1/4 px-4 py-3 text-slate-600">{secondValue}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.kind === "table") {
            return (
              <div key={index} className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-full border-collapse text-left text-base leading-7 md:min-w-[640px]">
                  <tbody>
                    {block.rows.map((row, rowIndex) => {
                      const cells = row.length > 0 ? row : [""];
                      const isKeyValueSnapshotRow = cells.length === 4;

                      return (
                        <tr key={rowIndex} className="border-t border-slate-200 first:border-t-0">
                          {cells.map((cell, cellIndex) => {
                            const Cell = isKeyValueSnapshotRow && cellIndex % 2 === 0 ? "th" : "td";
                            const displayCell =
                              isKeyValueSnapshotRow && cellIndex % 2 === 1
                                ? formatCareerJobDocumentCell(cell, cells[cellIndex - 1])
                                : formatCareerJobDocumentText(cell);
                            return (
                              <Cell
                                key={cellIndex}
                                className={
                                  isKeyValueSnapshotRow && cellIndex % 2 === 0
                                    ? "bg-slate-50 px-3 py-3 font-semibold text-slate-700 [overflow-wrap:anywhere] md:px-4"
                                    : "px-3 py-3 text-slate-600 [overflow-wrap:anywhere] md:px-4"
                                  }
                              >
                                {displayCell}
                              </Cell>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          if (block.kind === "ordered") {
            return (
              <ul key={index} className="m-0 list-disc space-y-3 pl-6">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {renderInternalLinkText(formatCareerJobDocumentText(item), locale)}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={index} className="m-0">
              {renderInternalLinkText(formatCareerJobDocumentText(block.text), locale)}
            </p>
          );
        })}
      </div>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const job = await loadCareerJobBundle(locale, slug);

  if (!job) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const seoSurface = job.seoSurface;
  const canonicalPath =
    seoSurface?.canonicalPath ?? normalizeCareerBundleCanonicalPath(locale, job.seoContract.canonicalPath, buildCanonicalPath(job.slug, locale));
  const canRenderStrongClaimSurface =
    job.renderState.canRenderAnswerSurface || job.renderState.canRenderOutlookSurface || job.renderState.canRenderFitSurface;
  const fallbackDescription =
    canRenderStrongClaimSurface && job.summary
      ? job.summary
      : locale === "zh"
        ? `${job.title} 的职业概览与下一步路径。`
        : `Career overview and next steps for ${job.title}.`;
  const backendSeoAllowsIndex = hasTrustedPublishedIndexAuthority(job);
  const effectiveIndexEligible = (seoSurface?.indexEligible ?? job.seoContract.indexEligible) === true;
  const effectiveIndexState = seoSurface?.indexState || job.seoContract.indexState;

  return buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: job.title,
    description: fallbackDescription,
    seoSurface,
    explicitIndexGate: {
      indexEligible: effectiveIndexEligible && backendSeoAllowsIndex,
      indexState: effectiveIndexState,
    },
    noindex: !backendSeoAllowsIndex,
    alternatesByLocale: {
      en: buildCareerJobFrontendUrl("en", job.slug),
      zh: buildCareerJobFrontendUrl("zh", job.slug),
      xDefault: "/",
    },
  });
}

export default async function CareerJobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams?: CareerJobSearchParams | Promise<CareerJobSearchParams>;
}) {
  const { locale: localeParam, slug } = await params;
  const query = await resolveCareerJobSearchParams(searchParams);
  const locale = resolveLocale(localeParam);
  const job = await loadCareerJobBundle(locale, slug);

  if (!job) {
    return notFound();
  }

  const publishedIndexAuthority = hasPublishedIndexAuthority(job);

  if (!job.displaySurfaceV1 && !publishedIndexAuthority && shouldRedirectEnglishJobDetailToChinese(job, locale)) {
    permanentRedirect(buildCareerJobFrontendUrl("zh", job.slug));
  }

  const renderState = job.renderState;
  const jobDetailLandingPath = localizedPath(`/career/jobs/${job.slug}`, locale);
  const displayCtaAttributionParams = extractAttributionParamsFromRecord(query);
  const hasInboundAttribution = Object.keys(displayCtaAttributionParams).length > 0;
  const displayCtaLandingPath = appendAttributionParamsToHref(jobDetailLandingPath, displayCtaAttributionParams);
  const displaySurface = job.displaySurfaceV1;

  if (displaySurface) {
    const [salaryAssetPreview, aiImpactAssetPreview] = await Promise.all([
      loadCareerSalaryAssetPreview(locale, job.slug),
      loadCareerAiImpactAssetPreview(locale, job.slug),
    ]);
    const displayFAQJsonLd = buildCareerDisplayFAQPageJsonLd(displaySurface);
    const breadcrumbItems = [
      { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
      { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
      { label: locale === "zh" ? "职业库" : "Jobs", href: localizedPath("/career/jobs", locale) },
      { label: job.title },
    ];

    return (
      <main className="min-h-screen bg-slate-50">
        <Container as="div" className="py-4 md:py-8">
          <AnalyticsPageViewTracker
            eventName={CAREER_TRACKING_EVENTS.jobDetailView}
            properties={buildCareerAttributionPayload({
              locale,
              entrySurface: "career_job_detail",
              sourcePageType: "career_job_detail",
              targetAction: "view_surface",
              landingPath: jobDetailLandingPath,
              routeFamily: "job_detail",
              subjectKind: "job_slug",
              subjectKey: job.slug,
            })}
          />
          {shouldRenderOccupationJsonLd(job) ? <JsonLd id={`career-job-occupation-${job.slug}`} data={job.structuredData.occupation} /> : null}
          {job.structuredData.breadcrumbList ? <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={job.structuredData.breadcrumbList} /> : null}
          {displayFAQJsonLd ? <JsonLd id={`career-job-display-faq-${job.slug}`} data={displayFAQJsonLd} /> : null}
          <CareerDisplaySurface
            surface={displaySurface}
            breadcrumbItems={breadcrumbItems}
            ctaAttributionParams={displayCtaAttributionParams}
            ctaLandingPath={displayCtaLandingPath}
            suppressLegacySalaryMetadata={salaryAssetPreview !== null}
            aiImpactSlot={
              aiImpactAssetPreview ? <CareerAiImpactPreviewSection asset={aiImpactAssetPreview} locale={locale} /> : null
            }
            salarySlot={<CareerSalaryAssetPreviewSection asset={salaryAssetPreview} locale={locale} />}
          />
        </Container>
      </main>
    );
  }

  const [salaryAssetPreview, explainability, nextStepLinks, runtimeConfig] = await Promise.all([
    loadCareerSalaryAssetPreview(locale, job.slug),
    renderState.canRenderFitSurface ? loadCareerJobExplainability(locale, slug) : Promise.resolve(null),
    loadCareerNextStepLinks(locale, slug),
    loadRuntimeConfig(locale),
  ]);
  const canRenderAiStrategy = job.claimPermissions.allow_ai_strategy && renderState.careerDataStatus !== "unavailable";
  const canRenderStrongClaimSurface =
    renderState.canRenderAnswerSurface || renderState.canRenderOutlookSurface || renderState.canRenderFitSurface;
  const visibleContentBodyMd = canRenderStrongClaimSurface ? job.contentBodyMd : null;
  const visibleContentSections = canRenderStrongClaimSurface ? job.contentSections : [];
  const aiStrategyClaimBlocked =
    canRenderStrongClaimSurface &&
    !job.claimPermissions.allow_ai_strategy &&
    renderState.careerDataStatus !== "unavailable" &&
    job.truthLayer.aiExposure !== null;
  const stateCopy = getCareerV1StateCopy(renderState.careerDataStatus);
  const nextSteps = buildNextStepRailItems(
    locale,
    nextStepLinks,
    displayCtaLandingPath,
    job.slug,
    displayCtaAttributionParams,
    publishedIndexAuthority && !hasInboundAttribution
  );
  const shouldRenderLegacyCareerJobCta = locale === "zh" && publishedIndexAuthority;

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.jobDetailView}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_job_detail",
            sourcePageType: "career_job_detail",
            targetAction: "view_surface",
            landingPath: jobDetailLandingPath,
            routeFamily: "job_detail",
            subjectKind: "job_slug",
            subjectKey: job.slug,
          })}
        />
        {shouldRenderOccupationJsonLd(job) ? <JsonLd id={`career-job-occupation-${job.slug}`} data={job.structuredData.occupation} /> : null}
        {job.structuredData.breadcrumbList ? <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={job.structuredData.breadcrumbList} /> : null}
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "职业库" : "Jobs", href: localizedPath("/career/jobs", locale) },
            { label: job.title },
          ]}
        />
        {visibleContentBodyMd ? (
          <>
            <section className="space-y-3" data-testid="career-job-document-overview">
              <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{job.title}</h1>
              {job.titles.canonicalEn ? <p className="m-0 text-base leading-7 text-slate-500">{job.titles.canonicalEn}</p> : null}
            </section>
            <CareerJobDocument bodyMd={visibleContentBodyMd} title={job.title} locale={locale} />
            <CareerSalaryAssetPreviewSection asset={salaryAssetPreview} locale={locale} />
            {publishedIndexAuthority ? (
              <NextStepRail
                title="下一步"
                description="只保留少量真实可走的路径。"
                items={nextSteps}
                testId="career-job-next-step-links"
              />
            ) : null}
            {shouldRenderLegacyCareerJobCta ? (
              <LegacyCareerJobCta
                locale={locale}
                landingPath={displayCtaLandingPath}
                subjectSlug={job.slug}
                attributionParams={displayCtaAttributionParams}
              />
            ) : null}
          </>
        ) : (
          <>
            <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]" data-testid="career-job-v1-overview">
              <div className="space-y-5">
                <ConfidenceBadge tone={stateCopy.tone}>{stateCopy.label}</ConfidenceBadge>
                <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{job.title}</h1>
                {canRenderStrongClaimSurface && job.summary ? <p className="m-0 max-w-3xl text-base leading-8 text-slate-600">{job.summary}</p> : null}
                {renderJobBoundary(job, locale)}
                <div className="flex flex-wrap gap-3">
                  <CareerShortlistAction
                    locale={locale}
                    subjectSlug={job.slug}
                    sourcePageType="career_job_detail"
                    entrySurface="career_job_detail"
                    routeFamily="job_detail"
                    landingPath={jobDetailLandingPath}
                    testId="career-job-shortlist-action"
                  />
                  <Link href={localizedPath("/career/jobs", locale)} className={buttonVariants({ variant: "outline" })}>
                    {locale === "zh" ? "回到职业库" : "Back to job library"}
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {locale === "zh" ? "当前判断" : "Current read"}
                </p>
                <p className="m-0 mt-3 text-sm leading-6 text-slate-500">
                  {locale === "zh" ? "先看概览，再看匹配边界，最后选择下一步。" : "Start with the overview, check fit boundaries, then pick the next step."}
                </p>
              </div>
            </section>

        {visibleContentSections.length > 0 ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-8" data-testid="career-job-docx-content">
            <div className="space-y-8">
              {visibleContentSections.map((section) => (
                <ContentSection key={`${section.sectionKey}-${section.title}`} section={section} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4" data-testid="career-job-v1-at-a-glance">
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? "一眼判断" : "At a glance"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title={locale === "zh" ? "适合度" : "Fit"}
              value={job.renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.fitScore.value) : "—"}
              caption={locale === "zh" ? "用于初步判断是否值得继续看。" : "A first signal for whether to keep exploring."}
            />
            <MetricCard
              title={locale === "zh" ? "压力/损耗" : "Strain"}
              value={job.renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.strainScore.value) : "—"}
              caption={locale === "zh" ? "越需要谨慎，越应该看边界说明。" : "Higher strain means the boundaries matter more."}
            />
            <MetricCard
              title={locale === "zh" ? "转型难度" : "Transition"}
              value={job.renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.mobilityScore.value) : "—"}
              caption={locale === "zh" ? "用于判断从相邻路径切入的难度。" : "A compact signal for moving in from adjacent paths."}
            />
          </div>
        </section>

        <CareerSalaryAssetPreviewSection asset={salaryAssetPreview} locale={locale} />

        <section className="grid gap-4 lg:grid-cols-2" data-testid="career-job-v1-fit-and-facts">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "适不适合继续看？" : "Is this worth exploring?"}
            </h2>
            <div className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <p className="m-0">{locale === "zh" ? `适合度：${renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.fitScore.value) : "—"}` : `Fit signal: ${renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.fitScore.value) : "—"}`}</p>
              <p className="m-0">{locale === "zh" ? `信心：${renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.confidenceScore.value) : "—"}` : `Confidence: ${renderState.canRenderFitSurface ? renderScoreValue(job.scoreBundle.confidenceScore.value) : "—"}`}</p>
              {renderState.canRenderOutlookSurface ? (
                <p className="m-0">{locale === "zh" ? `十年趋势：${formatPercent(job.truthLayer.outlookPct20242034)}` : `Ten-year outlook: ${formatPercent(job.truthLayer.outlookPct20242034)}`}</p>
              ) : null}
            </div>
            <ClaimGuard
              allowed={canRenderStrongClaimSurface}
              fallback={
                <div className="mt-5">
                  <ConfidenceBoundary
                    tone="limited"
                    title={locale === "zh" ? "暂不做强推荐判断" : "Strong recommendation is not open yet"}
                    description={locale === "zh" ? "当前数据不足以做强匹配判断，但你仍可以查看职业概览和下一步。" : "There is not enough data for a strong fit judgment, but the overview and next steps remain available."}
                  />
                </div>
              }
            >
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "这页可以用于继续比较，但建议结合测评推荐页一起判断。" : "Use this page as one comparison point, then validate with a recommendation path."}
              </p>
            </ClaimGuard>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-job-v1-claim-safe-facts">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "你需要知道" : "What you should know"}
            </h2>
            <div className="mt-5 grid gap-3 text-sm leading-6 text-slate-600">
              <ClaimGuard
                allowed={job.renderState.canRenderSalarySurface}
                fallback={
                  <ConfidenceBoundary
                    tone="limited"
                    title={locale === "zh" ? "薪资结论暂不开放" : "Salary claim is not open yet"}
                    description={locale === "zh" ? "这部分还需要更多数据支持。" : "This section needs more supporting data before display."}
                  />
                }
              >
                <p className="m-0">{locale === "zh" ? "薪资" : "Salary"}: {formatUsdAnnual(job.truthLayer.medianPayUsdAnnual, locale)}</p>
              </ClaimGuard>
              <ClaimGuard allowed={canRenderStrongClaimSurface}>
                {job.truthLayer.entryEducation ? <p className="m-0">{locale === "zh" ? "入门学历" : "Entry education"}: {job.truthLayer.entryEducation}</p> : null}
                {job.truthLayer.workExperience ? <p className="m-0">{locale === "zh" ? "工作经验" : "Work experience"}: {job.truthLayer.workExperience}</p> : null}
                {job.truthLayer.onTheJobTraining ? <p className="m-0">{locale === "zh" ? "在岗训练" : "On-the-job training"}: {job.truthLayer.onTheJobTraining}</p> : null}
              </ClaimGuard>
              {canRenderAiStrategy && job.truthLayer.aiExposure !== null ? <p className="m-0">AI exposure: {job.truthLayer.aiExposure}</p> : null}
              {aiStrategyClaimBlocked ? (
                <ConfidenceBoundary
                  tone="limited"
                  title={locale === "zh" ? "AI 影响判断暂不开放" : "AI impact claim is not open yet"}
                  description={locale === "zh" ? "这部分还需要更多数据支持。" : "This section needs more supporting data before display."}
                />
              ) : null}
            </div>
          </div>
        </section>

        <section data-testid="career-job-v1-next-steps">
          <NextStepRail
            title={locale === "zh" ? "下一步" : "Next steps"}
            description={locale === "zh" ? "只保留少量真实可走的路径。" : "A short list of real paths you can take from here."}
            items={nextSteps}
            testId="career-job-next-step-links"
          />
        </section>

        <section
          className="space-y-3"
          data-testid="career-job-v1-evidence"
          data-evidence-container="true"
          data-evidence-page-family="career_job_detail"
          data-evidence-source-type="career_backend_bundle"
          data-evidence-readiness="partial"
        >
          <EvidenceDrawer title={locale === "zh" ? "查看评分依据" : "View scoring basis"} testId="career-job-v1-score-drawer" evidenceBlock="evidence_facts">
            {renderState.canRenderFitSurface && job.whiteBoxScores.strainScore?.radarDimensions ? (
              <StrainRadar locale={locale} dimensions={job.whiteBoxScores.strainScore.radarDimensions} testId="career-job-strain-radar" />
            ) : null}
            {renderState.canRenderFitSurface && explainability ? (
              <CareerExplainabilityPanel
                locale={locale}
                explainability={explainability}
                title={locale === "zh" ? "评分说明" : "Scoring explanation"}
                subtitle={locale === "zh" ? "复杂评分依据默认折叠，避免干扰主要决策。" : "Detailed scoring is folded by default so it does not dominate the decision flow."}
                testId="career-job-explainability-panel"
                showStrainRadar={false}
              />
            ) : null}
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看信任边界" : "View trust boundaries"} testId="career-job-v1-boundary-drawer" evidenceBlock="caveat">
            {renderCareerJobProtocolStatus(job)}
            <div className="sr-only" data-testid="career-job-claim-gated-status">
              Salary: {renderState.canRenderSalarySurface ? "open" : "closed"}; fit: {renderState.canRenderFitSurface ? "open" : "closed"}; answer: {renderState.canRenderAnswerSurface ? "open" : "closed"}
            </div>
            <div data-testid="career-job-renderer-status" data-renderer-state={getJobRendererContractState(job) ?? "complete"}>
              {renderJobBoundary(job, locale) ?? <p className="m-0 text-sm text-slate-500">{locale === "zh" ? "当前没有额外展示限制。" : "No additional display boundary is active."}</p>}
            </div>
            <WarningBanner
              locale={locale}
              warnings={job.warnings}
              copyVariant={runtimeConfig.experiments.warningCopy.enabled ? runtimeConfig.experiments.warningCopy.variant : "control"}
              testId="career-job-warning-banner"
            />
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看数据来源" : "View data source"} testId="career-job-v1-data-source-drawer" evidenceBlock="evidence_facts">
            <TrustStrip
              locale={locale}
              publicReview={job.trustManifest?.publicReview}
              indexState={job.seoContract.indexState}
              reasonCodes={job.claimPermissions.reason_codes}
              contentVersion={job.provenanceMeta.contentVersion}
              dataVersion={job.provenanceMeta.dataVersion}
              logicVersion={job.provenanceMeta.logicVersion}
              compilerVersion={job.provenanceMeta.compilerVersion}
              compiledAt={job.provenanceMeta.compiledAt}
              compileRunId={job.provenanceMeta.compileRunId}
              truthMetricId={job.provenanceMeta.truthMetricId}
              trustManifestId={job.provenanceMeta.trustManifestId}
              indexStateId={job.provenanceMeta.indexStateId}
              testId="career-job-trust-strip"
            />
          </EvidenceDrawer>

          <EvidenceDrawer title={locale === "zh" ? "查看推荐变化记录" : "View recommendation change history"} testId="career-job-v1-lifecycle-drawer" evidenceBlock="evidence_facts">
            {job.lifecycleCompanion.timeline ? (
              <CareerProjectionTimeline locale={locale} timeline={job.lifecycleCompanion.timeline} testId="career-job-lifecycle-companion-timeline" />
            ) : null}
            {job.lifecycleCompanion.deltaSummary ? (
              <CareerProjectionDeltaPanel locale={locale} delta={job.lifecycleCompanion.deltaSummary} testId="career-job-lifecycle-companion-delta" />
            ) : null}
            {!job.lifecycleCompanion.timeline && !job.lifecycleCompanion.deltaSummary ? (
              <p className="m-0 text-sm text-slate-500">{locale === "zh" ? "暂无变化记录。" : "No change history is available yet."}</p>
            ) : null}
          </EvidenceDrawer>
        </section>

        {job.aliasIndex.length > 0 ? (
          <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "也可能这样称呼" : "Also called"}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              {job.aliasIndex.map((alias) => (
                <span key={`${alias.lang}-${alias.alias}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                  {alias.alias}
                </span>
              ))}
            </div>
          </section>
        ) : null}
          </>
        )}
      </Container>
    </main>
  );
}
