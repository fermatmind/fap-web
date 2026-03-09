"use client";

import Link from "next/link";
import { useState } from "react";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { DimensionBars } from "@/components/result/DimensionBars";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfferPayload, ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import {
  buildPersonalityFrontendUrl,
  type CmsPersonalityProfile,
  type CmsPersonalitySection,
} from "@/lib/cms/personality";
import { renderPersonalitySections } from "@/lib/cms/personality-sections";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  normalizeSupportedScaleCode,
  SCALE_CANONICAL_SLUG_MAP,
  type SupportedScaleCode,
} from "@/lib/assessmentSlugMap";

type RichResultScaleCode = Extract<SupportedScaleCode, "MBTI" | "BIG5_OCEAN" | "IQ_RAVEN" | "EQ_60">;

type ResultPayload = NonNullable<ResultResponse["result"]>;

type ReportBlock = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
  access_level?: string;
  module_code?: string;
  [key: string]: unknown;
};

type ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: ReportBlock[];
  [key: string]: unknown;
};

type PersonalitySupplementKey =
  | "core_snapshot"
  | "work_style"
  | "strengths"
  | "growth_edges"
  | "career_fit"
  | "relationships";

const MBTI_DIMENSION_LABELS: Record<string, string> = {
  EI: "E / I",
  SN: "S / N",
  TF: "T / F",
  JP: "J / P",
  AT: "A / T",
};

const BIG5_DIMENSION_LABELS: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

const DEFAULT_PERSONALITY_SUPPLEMENT_KEYS: PersonalitySupplementKey[] = [
  "core_snapshot",
  "work_style",
  "strengths",
  "growth_edges",
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function resolveReportPayload(reportData: ReportResponse | null | undefined): Record<string, unknown> | null {
  return asRecord(reportData?.report);
}

function resolveMetaScaleCode(reportData: ReportResponse | null | undefined): string {
  return normalizeText(reportData?.meta?.scale_code);
}

export function resolveReportScaleCode(reportData: ReportResponse | null | undefined): RichResultScaleCode | null {
  const payload = resolveReportPayload(reportData);
  const candidates = [
    normalizeText(payload?.scale_code),
    normalizeText(reportData?.type_code),
    resolveMetaScaleCode(reportData),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeSupportedScaleCode(candidate);
    if (
      normalized === "MBTI" ||
      normalized === "BIG5_OCEAN" ||
      normalized === "IQ_RAVEN" ||
      normalized === "EQ_60"
    ) {
      return normalized;
    }
  }

  return null;
}

export function isRichResultScaleCode(scaleCode: string | null | undefined): scaleCode is RichResultScaleCode {
  return (
    scaleCode === "MBTI" ||
    scaleCode === "BIG5_OCEAN" ||
    scaleCode === "IQ_RAVEN" ||
    scaleCode === "EQ_60"
  );
}

export function isGeneratingReportResponse(reportData: ReportResponse | null | undefined): boolean {
  if (!reportData) return false;
  if (reportData.generating === true) return true;

  const meta = asRecord(reportData.meta);
  return meta?.generating === true;
}

function resolveTypeCode(reportData: ReportResponse, fallbackResult?: ResultPayload | null): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.type_code, reportData.type_code, fallbackResult?.type_code);
}

function resolveBaseMbtiType(typeCode: string): string {
  const normalized = normalizeText(typeCode).toUpperCase();
  const matched = normalized.match(/^[A-Z]{4}/);
  return matched?.[0] ?? "";
}

function resolveSectionTitle(key: string, section: Record<string, unknown>, locale: Locale): string {
  const explicitTitle = normalizeText(section.title);
  if (explicitTitle) {
    return explicitTitle;
  }

  const defaults: Record<string, { en: string; zh: string }> = {
    traits: { en: "Personality overview", zh: "人格概览" },
    career: { en: "Career path", zh: "职业道路" },
    growth: { en: "Growth edges", zh: "成长提示" },
    relationships: { en: "Relationships", zh: "人际与亲密关系" },
    stress_recovery: { en: "Stress and recovery", zh: "压力与恢复" },
  };

  const localized = defaults[key];
  if (localized) {
    return locale === "zh" ? localized.zh : localized.en;
  }

  return key;
}

function normalizeReportSectionCard(card: Record<string, unknown>): ReportBlock {
  return {
    id: normalizeText(card.id),
    kind: normalizeText(card.kind) || "card",
    title: normalizeText(card.title),
    body: normalizeText(card.desc, card.body, card.content, card.text),
    bullets: normalizeStringArray(card.bullets),
    tips: normalizeStringArray(card.tips),
    tags: normalizeStringArray(card.tags),
    access_level: normalizeText(card.access_level),
    module_code: normalizeText(card.module_code),
  };
}

function normalizeRichSections(reportData: ReportResponse, locale: Locale): ReportSection[] {
  const payload = resolveReportPayload(reportData);
  const sectionsNode = payload?.sections;

  if (Array.isArray(sectionsNode)) {
    return sectionsNode
      .filter((item): item is ReportSection => Boolean(item && typeof item === "object"))
      .map((section) => ({
        ...section,
        blocks: asArray<ReportBlock>(section.blocks).filter(
          (block): block is ReportBlock => Boolean(block && typeof block === "object")
        ),
      }))
      .filter((section) => asArray(section.blocks).length > 0);
  }

  const sections = asRecord(sectionsNode);
  if (!sections) {
    return [];
  }

  const normalizedSections = Object.entries(sections)
    .map<ReportSection | null>(([key, value]) => {
      const section = asRecord(value);
      if (!section) return null;

      const cards = asArray<Record<string, unknown>>(section.cards)
        .map((card) => normalizeReportSectionCard(card))
        .filter((card) => card.title || card.body || asArray(card.bullets).length > 0);

      const locked = section.locked === true;

      return {
        key,
        title: resolveSectionTitle(key, section, locale),
        access_level: normalizeText(section.access_level) || (locked ? "paid" : "free"),
        module_code: normalizeText(section.module_code) || key,
        blocks: cards,
      } satisfies ReportSection;
    });

  return normalizedSections
    .filter((section): section is ReportSection => section !== null)
    .filter((section) => asArray(section.blocks).length > 0 || section.access_level === "paid");
}

function normalizeHighlightSection(reportData: ReportResponse, locale: Locale): ReportSection | null {
  const payload = resolveReportPayload(reportData);
  const items = asArray<Record<string, unknown>>(payload?.highlights)
    .map((item) => ({
      id: normalizeText(item.id),
      kind: "card",
      title: normalizeText(item.title, item.label),
      body: normalizeText(item.text, item.body, item.desc),
      tips: normalizeStringArray(item.tips),
      tags: normalizeStringArray(item.tags),
    }))
    .filter((item) => item.title || item.body);

  if (items.length === 0) {
    return null;
  }

  return {
    key: "highlights",
    title: locale === "zh" ? "核心亮点" : "Core highlights",
    access_level: "free",
    blocks: items,
  };
}

function normalizeDimensionsFromScores(
  scaleCode: RichResultScaleCode,
  reportData: ReportResponse
): Array<Record<string, unknown>> {
  const payload = resolveReportPayload(reportData);
  const scoresPct =
    asRecord(payload?.scores_pct) ??
    asRecord((payload as { scoresPct?: unknown } | null)?.scoresPct) ??
    asRecord(payload?.scores);

  if (!scoresPct) {
    return [];
  }

  const labels = scaleCode === "MBTI" ? MBTI_DIMENSION_LABELS : scaleCode === "BIG5_OCEAN" ? BIG5_DIMENSION_LABELS : {};

  const dimensions = Object.entries(scoresPct)
    .map<Record<string, unknown> | null>(([key, value]) => {
      const number = normalizeNumber(value);
      if (number === null) {
        return null;
      }

      return {
        code: key,
        label: labels[key] ?? key,
        percent: number,
      };
    });

  return dimensions.filter((item): item is Record<string, unknown> => item !== null);
}

function normalizeDimensions(
  scaleCode: RichResultScaleCode,
  reportData: ReportResponse,
  fallbackResult?: ResultPayload | null
): Array<Record<string, unknown>> {
  if (Array.isArray(reportData.dimensions) && reportData.dimensions.length > 0) {
    return reportData.dimensions;
  }

  const payload = resolveReportPayload(reportData);
  if (Array.isArray(payload?.dimensions) && payload.dimensions.length > 0) {
    return payload.dimensions as Array<Record<string, unknown>>;
  }

  const fromScores = normalizeDimensionsFromScores(scaleCode, reportData);
  if (fromScores.length > 0) {
    return fromScores;
  }

  return Array.isArray(fallbackResult?.dimensions) ? fallbackResult.dimensions : [];
}

function normalizeOffers(reportData: ReportResponse): OfferPayload[] {
  if (Array.isArray(reportData.offers)) {
    return reportData.offers.filter((item): item is OfferPayload => Boolean(item && typeof item === "object"));
  }

  const offersRecord = asRecord(reportData.offers);
  if (offersRecord) {
    return Object.values(offersRecord).filter(
      (item): item is OfferPayload => Boolean(item && typeof item === "object")
    );
  }

  const offer = asRecord(reportData.offer) as OfferPayload | null;
  return offer ? [offer] : [];
}

function resolveProfileSummary(
  reportData: ReportResponse,
  fallbackResult?: ResultPayload | null,
  personalityProfile?: CmsPersonalityProfile | null
): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.short_summary, reportData.summary, fallbackResult?.summary, personalityProfile?.excerpt);
}

function resolveProfileRarity(reportData: ReportResponse): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);
  const rarity = profile?.rarity;

  if (typeof rarity === "string" || typeof rarity === "number") {
    return String(rarity);
  }

  const rarityRecord = asRecord(rarity);
  if (!rarityRecord) {
    return "";
  }

  return normalizeText(rarityRecord.label, rarityRecord.text, rarityRecord.value);
}

function resolveProfileKeywords(reportData: ReportResponse): string[] {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeStringArray(profile?.keywords);
}

function resolveProfileTypeName(reportData: ReportResponse): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.type_name);
}

function resolveProfileTagline(reportData: ReportResponse): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.tagline);
}

function normalizeSupplementSections(
  personalityProfile: CmsPersonalityProfile | null | undefined,
  reportSections: ReportSection[]
): CmsPersonalitySection[] {
  if (!personalityProfile) {
    return [];
  }

  const reportSectionKeys = new Set(reportSections.map((section) => normalizeText(section.key)));
  const desiredKeys = new Set<PersonalitySupplementKey>(DEFAULT_PERSONALITY_SUPPLEMENT_KEYS);

  if (!reportSectionKeys.has("career")) {
    desiredKeys.add("career_fit");
  }
  if (!reportSectionKeys.has("relationships")) {
    desiredKeys.add("relationships");
  }

  return personalityProfile.sections.filter((section) =>
    desiredKeys.has(section.sectionKey as PersonalitySupplementKey)
  );
}

function RichResultCta({
  locale,
  scaleCode,
  typeCode,
}: {
  locale: Locale;
  scaleCode: RichResultScaleCode;
  typeCode: string;
}) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const baseMbtiType = resolveBaseMbtiType(typeCode);
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);
  const personalityHref = scaleCode === "MBTI" && baseMbtiType
    ? buildPersonalityFrontendUrl(locale, baseMbtiType)
    : null;

  async function handleShare() {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareTitle = typeCode || (locale === "zh" ? "测试结果" : "Assessment result");

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        setShareStatus("idle");
        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus("copied");
        return;
      }
    } catch {
      // Fall through to failed state.
    }

    setShareStatus("failed");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale === "zh" ? "接下来你可以" : "Next steps"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {personalityHref ? (
            <Link href={personalityHref} className={buttonVariants({ variant: "default" })}>
              {locale === "zh" ? "查看人格详情" : "View personality profile"}
            </Link>
          ) : null}
          <Button type="button" variant="outline" onClick={() => void handleShare()}>
            {locale === "zh" ? "分享结果" : "Share result"}
          </Button>
          <Link href={retakeHref} className={buttonVariants({ variant: "ghost" })}>
            {locale === "zh" ? "重新测试" : "Retake test"}
          </Link>
        </div>
        {shareStatus === "copied" ? (
          <p className="m-0 text-sm text-slate-600">{locale === "zh" ? "结果链接已复制。" : "Result link copied."}</p>
        ) : null}
        {shareStatus === "failed" ? (
          <p className="m-0 text-sm text-slate-600">
            {locale === "zh" ? "当前环境不支持自动分享，请手动复制链接。" : "Sharing is unavailable here. Copy the URL manually."}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function canRenderRichResultReport(reportData: ReportResponse | null | undefined): boolean {
  const scaleCode = resolveReportScaleCode(reportData);
  if (!scaleCode || isGeneratingReportResponse(reportData)) {
    return false;
  }

  const payload = resolveReportPayload(reportData);
  if (!payload) {
    return false;
  }

  return Boolean(
    normalizeText(payload.summary, reportData?.summary, reportData?.type_code) ||
      asRecord(payload.profile) ||
      Array.isArray(payload.sections) ||
      asRecord(payload.sections) ||
      Array.isArray(payload.highlights) ||
      Array.isArray(reportData?.dimensions)
  );
}

export function RichResultReport({
  locale,
  reportData,
  fallbackResult,
  personalityProfile,
}: {
  locale: Locale;
  reportData: ReportResponse;
  fallbackResult?: ResultPayload | null;
  personalityProfile?: CmsPersonalityProfile | null;
}) {
  const scaleCode = resolveReportScaleCode(reportData);
  if (!scaleCode) {
    return null;
  }

  const typeCode = resolveTypeCode(reportData, fallbackResult);
  const typeName = resolveProfileTypeName(reportData);
  const tagline = resolveProfileTagline(reportData);
  const rarity = resolveProfileRarity(reportData);
  const keywords = resolveProfileKeywords(reportData);
  const summary = resolveProfileSummary(reportData, fallbackResult, personalityProfile);
  const dimensions = normalizeDimensions(scaleCode, reportData, fallbackResult);
  const highlightSection = normalizeHighlightSection(reportData, locale);
  const richSections = normalizeRichSections(reportData, locale);
  const supplementarySections = normalizeSupplementSections(personalityProfile, richSections);
  const renderedSupplementarySections = renderPersonalitySections(supplementarySections, locale);
  const offers = normalizeOffers(reportData);
  const headline = normalizeText(typeCode, typeName, scaleCode);
  const reportLocked = reportData.locked === true;

  return (
    <div className="space-y-[var(--fm-gap-md)]">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{scaleCode}</p>
            <h2 className="m-0 text-3xl font-bold text-slate-900">
              {headline}
              {typeName && typeName !== headline ? <span className="text-xl font-semibold text-slate-600"> · {typeName}</span> : null}
            </h2>
            {tagline ? <p className="m-0 text-lg text-slate-700">{tagline}</p> : null}
            {rarity ? (
              <p className="m-0 text-sm text-slate-500">
                {locale === "zh" ? "稀有度：" : "Rarity: "}
                {rarity}
              </p>
            ) : null}
          </div>

          {keywords.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}

          {summary ? <p className="m-0 whitespace-pre-wrap text-base leading-7 text-slate-700">{summary}</p> : null}
        </CardContent>
      </Card>

      <DimensionBars dimensions={dimensions} />

      {highlightSection ? (
        <SectionRenderer section={highlightSection} locked={false} locale={locale} scaleCode={scaleCode} />
      ) : null}

      {richSections.map((section) => (
        <SectionRenderer
          key={section.key ?? section.title ?? "section"}
          section={section}
          locked={reportLocked}
          locale={locale}
          scaleCode={scaleCode}
        />
      ))}

      {renderedSupplementarySections}

      {reportLocked && offers.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "可解锁模块" : "Unlock options"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {offers.map((offer, index) => (
              <OfferCard key={`${normalizeText(offer.sku, offer.title, offer.label, index)}-${index}`} offer={offer} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      <RichResultCta locale={locale} scaleCode={scaleCode} typeCode={typeCode} />
    </div>
  );
}
