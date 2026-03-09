"use client";

import Link from "next/link";
import { useState } from "react";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { DimensionBars } from "@/components/result/DimensionBars";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfferPayload, ReportResponse } from "@/lib/api/v0_3";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  normalizeSupportedScaleCode,
  SCALE_CANONICAL_SLUG_MAP,
  type SupportedScaleCode,
} from "@/lib/assessmentSlugMap";

type RichResultScaleCode = Extract<SupportedScaleCode, "MBTI" | "BIG5_OCEAN" | "IQ_RAVEN" | "EQ_60">;

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

type RichResultGate = {
  isFreeVariant: boolean;
  modulesAllowed: Set<string>;
  freeSections: Set<string> | null;
};

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

export function resolveReportScaleCode(reportData: ReportResponse | null | undefined): RichResultScaleCode | null {
  const payload = resolveReportPayload(reportData);
  const candidates = [
    normalizeText(payload?.scale_code),
    normalizeText(reportData?.meta?.scale_code),
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

function resolveModulesAllowed(reportData: ReportResponse): Set<string> {
  return new Set(
    normalizeStringArray(reportData.modules_allowed).map((item) => item.trim().toLowerCase())
  );
}

function resolveFreeSections(reportData: ReportResponse): Set<string> | null {
  const policy = asRecord(reportData.view_policy);
  const items = normalizeStringArray(policy?.free_sections).map((item) => item.trim().toLowerCase());
  return items.length > 0 ? new Set(items) : null;
}

function resolveRichResultGate(reportData: ReportResponse): RichResultGate {
  const variant = normalizeText(reportData.variant).toLowerCase();
  const accessLevel = normalizeText(reportData.access_level).toLowerCase();
  const modulesAllowed = resolveModulesAllowed(reportData);
  const isFreeVariant =
    reportData.locked === true ||
    variant === "free" ||
    accessLevel === "free" ||
    (modulesAllowed.size > 0 && !modulesAllowed.has("full"));

  return {
    isFreeVariant,
    modulesAllowed,
    freeSections: resolveFreeSections(reportData),
  };
}

function resolveTypeCode(reportData: ReportResponse): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.type_code);
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
    access_level: normalizeText(card.access_level).toLowerCase(),
    module_code: normalizeText(card.module_code).toLowerCase(),
  };
}

function isBlockVisibleInGate(block: ReportBlock, gate: RichResultGate): boolean {
  if (!gate.isFreeVariant) {
    return true;
  }

  const accessLevel = normalizeText(block.access_level).toLowerCase();
  if (accessLevel === "paid") {
    return false;
  }

  const moduleCode = normalizeText(block.module_code).toLowerCase();
  if (!moduleCode || moduleCode === "core_free") {
    return true;
  }

  if (gate.modulesAllowed.size === 0) {
    return false;
  }

  return gate.modulesAllowed.has(moduleCode);
}

function shouldForceSectionLocked(section: ReportSection, gate: RichResultGate): boolean {
  if (!gate.isFreeVariant) {
    return false;
  }

  const key = normalizeText(section.key).toLowerCase();
  if (gate.freeSections && key && !gate.freeSections.has(key)) {
    return true;
  }

  const accessLevel = normalizeText(section.access_level).toLowerCase();
  if (accessLevel === "paid") {
    return true;
  }

  const moduleCode = normalizeText(section.module_code).toLowerCase();
  if (!moduleCode || moduleCode === "core_free") {
    return false;
  }

  if (gate.modulesAllowed.size === 0) {
    return true;
  }

  return !gate.modulesAllowed.has(moduleCode);
}

function normalizeRichSections(reportData: ReportResponse, locale: Locale, gate: RichResultGate): ReportSection[] {
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
      .map((section) => {
        const normalized: ReportSection = {
          ...section,
          key: normalizeText(section.key),
          title: normalizeText(section.title),
          access_level: normalizeText(section.access_level).toLowerCase(),
          module_code: normalizeText(section.module_code).toLowerCase(),
          blocks: asArray<ReportBlock>(section.blocks).filter((block) => isBlockVisibleInGate(block, gate)),
        };

        if (shouldForceSectionLocked(normalized, gate)) {
          return {
            ...normalized,
            access_level: "paid",
            blocks: [],
          };
        }

        return normalized;
      })
      .filter((section) => asArray(section.blocks).length > 0 || normalizeText(section.access_level) === "paid");
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
        .filter((card) => card.title || card.body || asArray(card.bullets).length > 0)
        .filter((card) => isBlockVisibleInGate(card, gate));

      const locked = section.locked === true;
      const normalizedSection: ReportSection = {
        key,
        title: resolveSectionTitle(key, section, locale),
        access_level: normalizeText(section.access_level).toLowerCase() || (locked ? "paid" : "free"),
        module_code: normalizeText(section.module_code).toLowerCase() || key,
        blocks: cards,
      };

      if (locked || shouldForceSectionLocked(normalizedSection, gate)) {
        return {
          ...normalizedSection,
          access_level: "paid",
          blocks: [],
        } satisfies ReportSection;
      }

      return normalizedSection;
    });

  return normalizedSections
    .filter((section): section is ReportSection => section !== null)
    .filter((section) => asArray(section.blocks).length > 0 || section.access_level === "paid");
}

function normalizeHighlightSection(reportData: ReportResponse, locale: Locale, gate: RichResultGate): ReportSection | null {
  const payload = resolveReportPayload(reportData);
  const items = asArray<Record<string, unknown>>(payload?.highlights)
    .map((item) => ({
      id: normalizeText(item.id),
      kind: "card",
      title: normalizeText(item.title, item.label),
      body: normalizeText(item.text, item.body, item.desc),
      tips: normalizeStringArray(item.tips),
      tags: normalizeStringArray(item.tags),
      access_level: normalizeText(item.access_level).toLowerCase(),
      module_code: normalizeText(item.module_code).toLowerCase(),
    }))
    .filter((item) => item.title || item.body)
    .filter((item) => isBlockVisibleInGate(item, gate));

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
  reportData: ReportResponse
): Array<Record<string, unknown>> {
  return normalizeDimensionsFromScores(scaleCode, reportData);
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

function resolveProfileSummary(reportData: ReportResponse): string {
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(profile?.short_summary);
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

function resolveDisplayTags(reportData: ReportResponse): string[] {
  const payload = resolveReportPayload(reportData);
  const reportTags = normalizeStringArray(payload?.tags ?? payload?.report_tags);
  return reportTags.length > 0 ? reportTags : resolveProfileKeywords(reportData);
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

function RichResultCta({
  locale,
  scaleCode,
}: {
  locale: Locale;
  scaleCode: RichResultScaleCode;
}) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "failed">("idle");
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP[scaleCode]}/take`, locale);

  async function handleShare() {
    if (typeof window === "undefined") return;

    const shareUrl = window.location.href;
    const shareTitle = locale === "zh" ? "测试结果" : "Assessment result";

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
    asRecord(payload.profile) ||
      normalizeStringArray(payload.tags ?? payload.report_tags).length > 0 ||
      Array.isArray(payload.highlights) ||
      Array.isArray(payload.sections) ||
      asRecord(payload.sections) ||
      asRecord(payload.scores_pct) ||
      asRecord(payload.scores)
  );
}

export function RichResultReport({
  locale,
  reportData,
}: {
  locale: Locale;
  reportData: ReportResponse;
}) {
  const scaleCode = resolveReportScaleCode(reportData);
  if (!scaleCode) {
    return null;
  }

  const gate = resolveRichResultGate(reportData);
  const typeCode = resolveTypeCode(reportData);
  const typeName = resolveProfileTypeName(reportData);
  const tagline = resolveProfileTagline(reportData);
  const rarity = resolveProfileRarity(reportData);
  const tags = resolveDisplayTags(reportData);
  const summary = resolveProfileSummary(reportData);
  const dimensions = normalizeDimensions(scaleCode, reportData);
  const highlightSection = normalizeHighlightSection(reportData, locale, gate);
  const richSections = normalizeRichSections(reportData, locale, gate);
  const offers = normalizeOffers(reportData);
  const headline = normalizeText(typeCode, typeName, scaleCode) || scaleCode;
  const reportLocked = gate.isFreeVariant;

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

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                >
                  {tag}
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

      <RichResultCta locale={locale} scaleCode={scaleCode} />
    </div>
  );
}
