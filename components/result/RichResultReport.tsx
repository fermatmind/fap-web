"use client";

import Link from "next/link";
import { useState } from "react";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { Big5ResultPageV2Shell } from "@/components/result/big5/Big5ResultPageV2Shell";
import { Big5ResultShell } from "@/components/result/big5/Big5ResultShell";
import { EnneagramResultShell } from "@/components/result/enneagram/EnneagramResultShell";
import { MbtiResultShell } from "@/components/result/mbti/MbtiResultShell";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { DimensionBars } from "@/components/result/DimensionBars";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptInviteUnlockProgressView } from "@/lib/access/inviteUnlock";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { Big5PublicProjection, OfferPayload, ReportResponse } from "@/lib/api/v0_3";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { MbtiSnapshotContentStatus } from "@/lib/result/mbtiSnapshotContent";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import { filterBig5ResultPageV2PayloadForGate, getBig5ResultPageV2Payload } from "@/lib/big5/resultPageV2";
import { assembleEnneagramResultViewModel, hasEnneagramProjection } from "@/lib/enneagram/resultAssembler";
import { assembleRiasecResultViewModel, hasRiasecProjection } from "@/lib/riasec/resultAssembler";
import { isEqV5ReportResponse } from "@/components/result/eq/utils";
import {
  buildMbtiResultProjectionViewModel,
  hasMbtiResultProjection,
} from "@/lib/mbti/publicProjection";
import { buildMbtiPreviewViewModel, type MbtiPreviewViewModel } from "@/lib/mbti/preview";
import {
  normalizeSupportedScaleCode,
  SCALE_CANONICAL_SLUG_MAP,
  type SupportedScaleCode,
} from "@/lib/assessmentSlugMap";

type RichResultScaleCode = Extract<SupportedScaleCode, "MBTI" | "BIG5_OCEAN" | "ENNEAGRAM" | "RIASEC" | "IQ_RAVEN" | "EQ_60">;

export type ReportBlock = {
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

export type ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: ReportBlock[];
  [key: string]: unknown;
};

export type HighlightCard = {
  title: string;
  body: string;
  tips: string[];
};

type RichResultGate = {
  isFreeVariant: boolean;
  modulesAllowed: Set<string>;
  modulesPreview: Set<string>;
  previewSections: Set<string>;
  freeSections: Set<string> | null;
  preservePreviewBlocks: boolean;
};

type LockedSectionContent = {
  teaser: string;
  benefits: string[];
  offerModule: string;
};

export type ResolvedOffer = {
  key: string;
  title: string;
  price: string;
  description: string;
  modules: string[];
  moduleCodes: string[];
};

export type RichResultHeadline = {
  badge: string;
  typeCode: string;
  displayName: string;
  supportingLine: string;
  summary: string;
  rarity: string;
};

export type MbtiSectionUnlock = {
  teaser: string;
  benefits: string[];
  offer: ResolvedOffer | null;
};

const TECHNICAL_TAG_PREFIXES = [
  "axis:",
  "state:",
  "type:",
  "role:",
  "strategy:",
  "borderline:",
];

const MBTI_DIMENSION_META: Record<
  string,
  {
    label: { en: string; zh: string };
    left: { en: string; zh: string };
    right: { en: string; zh: string };
  }
> = {
  EI: {
    label: { en: "E / I", zh: "E / I" },
    left: { en: "Extraversion", zh: "外向 E" },
    right: { en: "Introversion", zh: "内向 I" },
  },
  SN: {
    label: { en: "S / N", zh: "S / N" },
    left: { en: "Sensing", zh: "实感 S" },
    right: { en: "Intuition", zh: "直觉 N" },
  },
  TF: {
    label: { en: "T / F", zh: "T / F" },
    left: { en: "Thinking", zh: "理性 T" },
    right: { en: "Feeling", zh: "情感 F" },
  },
  JP: {
    label: { en: "J / P", zh: "J / P" },
    left: { en: "Judging", zh: "判断 J" },
    right: { en: "Perceiving", zh: "知觉 P" },
  },
  AT: {
    label: { en: "A / T", zh: "A / T" },
    left: { en: "Assertive", zh: "自信 A" },
    right: { en: "Turbulent", zh: "敏感 T" },
  },
};

const BIG5_DIMENSION_LABELS: Record<
  string,
  {
    en: string;
    zh: string;
  }
> = {
  O: { en: "Openness", zh: "开放性" },
  C: { en: "Conscientiousness", zh: "尽责性" },
  E: { en: "Extraversion", zh: "外向性" },
  A: { en: "Agreeableness", zh: "宜人性" },
  N: { en: "Neuroticism", zh: "情绪性" },
};

const MODULE_LABELS: Record<
  string,
  {
    en: string;
    zh: string;
  }
> = {
  core_full: { en: "Full personality deep dive", zh: "完整人格解读" },
  career: { en: "Career direction", zh: "职业道路模块" },
  relationships: { en: "Relationship insights", zh: "关系解读模块" },
};

const OFFER_COPY: Record<
  string,
  {
    title: { en: string; zh: string };
    description: { en: string; zh: string };
  }
> = {
  MBTI_REPORT_FULL: {
    title: { en: "Full personality report", zh: "完整人格报告" },
    description: {
      en: "Unlock the full personality, growth, career, and relationship reading in one go.",
      zh: "一次解锁完整人格、成长、职业与关系模块。",
    },
  },
  MBTI_CAREER: {
    title: { en: "Career direction module", zh: "职业道路模块" },
    description: {
      en: "See role fit, work environment cues, and the situations where you perform best.",
      zh: "查看更适合你的岗位方向、协作场景与工作节奏提示。",
    },
  },
  MBTI_RELATIONSHIP: {
    title: { en: "Relationship insights module", zh: "关系解读模块" },
    description: {
      en: "Understand your communication needs, boundaries, and relationship blind spots.",
      zh: "查看你在亲密关系和日常沟通中的需求、边界与误区提醒。",
    },
  },
};

const MBTI_FULL_OFFER_KEYS = ["MBTI_REPORT_FULL", "MBTI_REPORT_FULL_199", "REPORT_FULL"] as const;

const LOCKED_SECTION_COPY: Record<
  string,
  {
    en: LockedSectionContent;
    zh: LockedSectionContent;
  }
> = {
  traits: {
    en: {
      teaser: "See the fuller personality pattern behind your current result, not just the headline type.",
      benefits: [
        "A deeper read on your stable tendencies and hidden friction points",
        "How your strengths show up in real situations",
        "What tends to throw you off when pressure rises",
      ],
      offerModule: "core_full",
    },
    zh: {
      teaser: "继续往下看，你会看到这次结果背后更完整的人格画像，而不只是一个类型代号。",
      benefits: [
        "更完整的人格模式与稳定偏好",
        "你的优势会如何在真实场景里发挥",
        "压力上来时最容易失衡的地方",
      ],
      offerModule: "core_full",
    },
  },
  career: {
    en: {
      teaser: "This module turns your result into concrete workplace fit, role cues, and collaboration guidance.",
      benefits: [
        "Work environments where you are more likely to thrive",
        "Role directions that match your strengths and rhythm",
        "Common work risks and how to avoid them",
      ],
      offerModule: "career",
    },
    zh: {
      teaser: "这一部分会把你的结果翻译成更具体的职业适配、岗位节奏和协作建议。",
      benefits: [
        "更适合你的工作环境与职责边界",
        "更容易出成绩的岗位方向",
        "工作中的常见风险与规避提醒",
      ],
      offerModule: "career",
    },
  },
  growth: {
    en: {
      teaser: "Growth focuses on blind spots, triggers, and the next practical step instead of abstract advice.",
      benefits: [
        "Your key blind spots and common trigger points",
        "Actionable steps you can actually try next",
        "A clearer path to turn strengths into repeatable methods",
      ],
      offerModule: "core_full",
    },
    zh: {
      teaser: "成长模块会把盲点、触发点和下一步行动整理成真正能落地的建议。",
      benefits: [
        "关键盲点与容易被触发的节点",
        "可以马上尝试的行动建议",
        "把优势沉淀成方法论的路径",
      ],
      offerModule: "core_full",
    },
  },
  relationships: {
    en: {
      teaser: "This section focuses on how you connect, where you feel safe, and what easily creates misunderstanding.",
      benefits: [
        "Your relationship needs and communication style",
        "Signals that are easy to misread on both sides",
        "Repair suggestions when tension shows up",
      ],
      offerModule: "relationships",
    },
    zh: {
      teaser: "关系模块会聚焦你在亲密关系与日常沟通里的稳定模式，而不只是情绪瞬间。",
      benefits: [
        "你的关系需求与沟通偏好",
        "容易被误解的地方与边界提醒",
        "出现摩擦时更有效的修复建议",
      ],
      offerModule: "relationships",
    },
  },
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

function uniqStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function resolveReportPayload(reportData: ReportResponse | null | undefined): Record<string, unknown> | null {
  return asRecord(reportData?.report);
}

function resolveIdentityCard(reportData: ReportResponse | null | undefined): Record<string, unknown> | null {
  const payload = resolveReportPayload(reportData);
  return asRecord(payload?.identity_card);
}

function isTechnicalTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  return TECHNICAL_TAG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function filterVisibleTags(tags: string[]): string[] {
  return uniqStrings(tags).filter((tag) => !isTechnicalTag(tag));
}

export function resolveReportScaleCode(reportData: ReportResponse | null | undefined): RichResultScaleCode | null {
  const payload = resolveReportPayload(reportData);
  const candidates = [
    normalizeText(payload?.scale_code),
    normalizeText(reportData?.scale_code),
    normalizeText(reportData?.meta?.scale_code),
  ];

  for (const candidate of candidates) {
    const normalized = normalizeSupportedScaleCode(candidate);
    if (
      normalized === "MBTI" ||
      normalized === "BIG5_OCEAN" ||
      normalized === "ENNEAGRAM" ||
      normalized === "RIASEC" ||
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
    scaleCode === "ENNEAGRAM" ||
    scaleCode === "RIASEC" ||
    scaleCode === "IQ_RAVEN" ||
    scaleCode === "EQ_60"
  );
}

export function isGeneratingReportResponse(reportData: ReportResponse | null | undefined): boolean {
  if (!reportData) return false;
  if (getBig5ResultPageV2Payload(reportData)) return false;

  if (reportData.generating === true) return true;

  const meta = asRecord(reportData.meta);
  return meta?.generating === true;
}

function resolveModulesAllowed(reportData: ReportResponse): Set<string> {
  return new Set(normalizeStringArray(reportData.modules_allowed).map((item) => item.toLowerCase()));
}

function resolveModulesPreview(reportData: ReportResponse, previewView?: MbtiPreviewViewModel | null): Set<string> {
  const modules =
    previewView
      ? previewView.previewModules
      : normalizeStringArray(reportData.modules_preview).map((item) => item.toLowerCase());

  return new Set(modules);
}

function resolveFreeSections(reportData: ReportResponse): Set<string> | null {
  const policy = asRecord(reportData.view_policy);
  const items = normalizeStringArray(policy?.free_sections).map((item) => item.toLowerCase());
  return items.length > 0 ? new Set(items) : null;
}

const FULL_ACCESS_MODULES_BY_SCALE: Record<RichResultScaleCode, Set<string>> = {
  MBTI: new Set(["full"]),
  BIG5_OCEAN: new Set(["full", "big5_full", "report.full", "report_full"]),
  ENNEAGRAM: new Set(["full", "enneagram_full", "report.full", "report_full"]),
  RIASEC: new Set(["full", "riasec_full", "report.full", "report_full"]),
  IQ_RAVEN: new Set(["full", "iq_raven_full", "raven_full", "report.full", "report_full"]),
  EQ_60: new Set(["full", "eq_60_full", "eq_full", "report.full", "report_full"]),
};

function hasFullAccessModule(scaleCode: RichResultScaleCode, modulesAllowed: Set<string>): boolean {
  const fullAccessModules = FULL_ACCESS_MODULES_BY_SCALE[scaleCode];
  return Array.from(modulesAllowed).some((moduleCode) => fullAccessModules.has(moduleCode));
}

function isRestrictedRichResultVariant({
  reportData,
  scaleCode,
  variant,
  accessLevel,
  modulesAllowed,
}: {
  reportData: ReportResponse;
  scaleCode: RichResultScaleCode;
  variant: string;
  accessLevel: string;
  modulesAllowed: Set<string>;
}): boolean {
  if (reportData.locked === true) {
    return true;
  }

  if (variant === "free" || variant === "preview" || variant === "partial") {
    return true;
  }

  if (accessLevel === "free" || accessLevel === "preview" || accessLevel === "partial") {
    return true;
  }

  return modulesAllowed.size > 0 && !hasFullAccessModule(scaleCode, modulesAllowed);
}

function resolveRichResultGate(
  reportData: ReportResponse,
  scaleCode: RichResultScaleCode,
  previewView?: MbtiPreviewViewModel | null
): RichResultGate {
  const variant = normalizeText(reportData.variant).toLowerCase();
  const accessLevel = normalizeText(reportData.access_level).toLowerCase();
  const modulesAllowed = resolveModulesAllowed(reportData);
  const modulesPreview = resolveModulesPreview(reportData, previewView);

  return {
    isFreeVariant: isRestrictedRichResultVariant({
      reportData,
      scaleCode,
      variant,
      accessLevel,
      modulesAllowed,
    }),
    modulesAllowed,
    modulesPreview,
    previewSections: new Set((previewView?.visibleSections ?? []).map((item) => item.toLowerCase())),
    freeSections: resolveFreeSections(reportData),
    preservePreviewBlocks: scaleCode === "MBTI",
  };
}

function resolveTypeCode(reportData: ReportResponse): string {
  const identityCard = resolveIdentityCard(reportData);
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  return normalizeText(identityCard?.type_code, profile?.type_code);
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
  if (accessLevel === "preview") {
    if (!gate.preservePreviewBlocks) {
      return false;
    }

    if (!moduleCode || moduleCode === "core_free") {
      return true;
    }

    return gate.modulesPreview.has(moduleCode);
  }

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
  const accessLevel = normalizeText(section.access_level).toLowerCase();
  if (gate.freeSections && key && !gate.freeSections.has(key)) {
    if (!(gate.preservePreviewBlocks && (accessLevel === "preview" || gate.previewSections.has(key)))) {
      return true;
    }
  }

  if (accessLevel === "paid") {
    return true;
  }

  const moduleCode = normalizeText(section.module_code).toLowerCase();
  if (accessLevel === "preview") {
    if (!gate.preservePreviewBlocks) {
      return true;
    }

    if (!moduleCode || moduleCode === "core_free") {
      return false;
    }

    return !gate.modulesPreview.has(moduleCode);
  }

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

  return Object.entries(sections)
    .map<ReportSection | null>(([key, value]) => {
      const section = asRecord(value);
      if (!section) return null;

      const cards = asArray<Record<string, unknown>>(section.cards)
        .map((card) => normalizeReportSectionCard(card))
        .filter((card) => card.title || card.body || asArray(card.bullets).length > 0)
        .filter((card) => isBlockVisibleInGate(card, gate));

      const locked = section.locked === true;
      const normalizedKey = normalizeText(key).toLowerCase();
      const hasVisiblePreviewBlocks =
        cards.some((card) => normalizeText(card.access_level).toLowerCase() === "preview") ||
        gate.previewSections.has(normalizedKey);
      const normalizedSection: ReportSection = {
        key,
        title: resolveSectionTitle(key, section, locale),
        access_level: normalizeText(section.access_level).toLowerCase() || (locked ? (hasVisiblePreviewBlocks ? "preview" : "paid") : "free"),
        module_code: normalizeText(section.module_code).toLowerCase() || key,
        blocks: cards,
      };

      if ((locked && !hasVisiblePreviewBlocks) || shouldForceSectionLocked(normalizedSection, gate)) {
        return {
          ...normalizedSection,
          access_level: "paid",
          blocks: [],
        };
      }

      return normalizedSection;
    })
    .filter((section): section is ReportSection => section !== null)
    .filter((section) => asArray(section.blocks).length > 0 || section.access_level === "paid");
}

function normalizeHighlights(reportData: ReportResponse, gate: RichResultGate, locale: Locale): HighlightCard[] {
  const payload = resolveReportPayload(reportData);
  return asArray<Record<string, unknown>>(payload?.highlights)
    .map((item) => ({
      title: normalizeText(item.title, item.label),
      body: normalizeText(item.text, item.body, item.desc),
      tips: normalizeStringArray(item.tips),
      access_level: normalizeText(item.access_level).toLowerCase(),
      module_code: normalizeText(item.module_code).toLowerCase(),
    }))
    .filter((item) => item.title || item.body)
    .filter((item) =>
      isBlockVisibleInGate(
        {
          title: item.title,
          body: item.body,
          access_level: item.access_level,
          module_code: item.module_code,
        },
        gate
      )
    )
    .map((item) => ({
      title: item.title || (item.body ? (locale === "zh" ? "亮点" : "Highlight") : ""),
      body: item.body,
      tips: item.tips,
    }));
}

function resolveRecommendedReads(reportData: ReportResponse) {
  const payload = resolveReportPayload(reportData);
  return Array.isArray(payload?.recommended_reads)
    ? payload.recommended_reads.filter((item) => Boolean(item && typeof item === "object"))
    : [];
}

function normalizeDimensionsFromScores(
  scaleCode: RichResultScaleCode,
  reportData: ReportResponse,
  locale: Locale
): Array<Record<string, unknown>> {
  const payload = resolveReportPayload(reportData);
  const scoresPct =
    asRecord(payload?.scores_pct) ??
    asRecord((payload as { scoresPct?: unknown } | null)?.scoresPct) ??
    asRecord(payload?.scores);

  if (!scoresPct) {
    return [];
  }

  return Object.entries(scoresPct)
    .map<Record<string, unknown> | null>(([key, value]) => {
      const number = normalizeNumber(value);
      if (number === null) {
        return null;
      }

      if (scaleCode === "MBTI" && MBTI_DIMENSION_META[key]) {
        const meta = MBTI_DIMENSION_META[key];
        const firstPoleWins = number >= 50;
        const winner = firstPoleWins ? meta.left[locale] : meta.right[locale];

        return {
          code: key,
          label: meta.label[locale],
          percent: number,
          leftLabel: meta.left[locale],
          rightLabel: meta.right[locale],
          winnerLabel:
            locale === "zh"
              ? `当前更偏向 ${winner}`
              : `Currently leaning toward ${winner}`,
        };
      }

      const label = BIG5_DIMENSION_LABELS[key];
      return {
        code: key,
        label: label ? label[locale] : key,
        percent: number,
      };
    })
    .filter((item): item is Record<string, unknown> => item !== null);
}

function normalizeDimensions(
  scaleCode: RichResultScaleCode,
  reportData: ReportResponse,
  locale: Locale
): Array<Record<string, unknown>> {
  if (scaleCode === "BIG5_OCEAN") {
    const projection = resolveBig5Projection(reportData);
    const traitVector = Array.isArray(projection?.trait_vector) ? projection.trait_vector : [];
    if (traitVector.length > 0) {
      return traitVector
        .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
        .map((item) => ({
          code: normalizeText(item.key),
          label: normalizeText(item.label),
          percent: normalizeNumber(item.percentile) ?? 0,
          winnerLabel: normalizeText(item.band_label),
        }));
    }
  }

  return normalizeDimensionsFromScores(scaleCode, reportData, locale);
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

function resolveVisibleTags(reportData: ReportResponse): string[] {
  const identityCard = resolveIdentityCard(reportData);
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);

  const preferred = filterVisibleTags(normalizeStringArray(identityCard?.tags));
  if (preferred.length > 0) {
    return preferred;
  }

  const profileTags = filterVisibleTags(normalizeStringArray(profile?.keywords));
  if (profileTags.length > 0) {
    return profileTags;
  }

  return filterVisibleTags(normalizeStringArray(payload?.tags ?? payload?.report_tags));
}

function resolveBig5Projection(reportData: ReportResponse): Big5PublicProjection | null {
  if (reportData.big5_public_projection_v1 && typeof reportData.big5_public_projection_v1 === "object") {
    return reportData.big5_public_projection_v1;
  }

  const reportMeta = asRecord(reportData.report?._meta);
  const projection = asRecord(reportMeta?.big5_public_projection_v1);
  return projection as Big5PublicProjection | null;
}

function resolveHeadline(scaleCode: RichResultScaleCode, reportData: ReportResponse): RichResultHeadline {
  const identityCard = resolveIdentityCard(reportData);
  const payload = resolveReportPayload(reportData);
  const profile = asRecord(payload?.profile);
  const big5Projection = scaleCode === "BIG5_OCEAN" ? resolveBig5Projection(reportData) : null;
  const primaryTrait = Array.isArray(big5Projection?.dominant_traits) ? big5Projection?.dominant_traits?.[0] : null;
  const primaryTraitLabel = normalizeText(asRecord(primaryTrait)?.label);

  return {
    badge: normalizeText(
      asRecord(identityCard?.badge)?.text,
      scaleCode === "BIG5_OCEAN" ? "Big Five" : "MBTI"
    ),
    typeCode: resolveTypeCode(reportData) || (scaleCode === "BIG5_OCEAN" ? "BIG5" : ""),
    displayName: normalizeText(identityCard?.title, profile?.type_name, primaryTraitLabel),
    supportingLine: normalizeText(identityCard?.subtitle, identityCard?.tagline, profile?.tagline),
    summary: normalizeText(
      identityCard?.summary,
      profile?.short_summary,
      asRecord(big5Projection?.explainability_summary)?.headline
    ),
    rarity: resolveProfileRarity(reportData),
  };
}

function humanizeModule(moduleCode: string, locale: Locale): string {
  const normalized = moduleCode.trim().toLowerCase();
  const copy = MODULE_LABELS[normalized];
  return copy ? copy[locale] : moduleCode;
}

function formatPrice(offer: OfferPayload, locale: Locale): string {
  if (typeof offer.formatted_price === "string" && offer.formatted_price.trim().length > 0) {
    return offer.formatted_price.trim();
  }

  const priceCents =
    typeof offer.price_cents === "number"
      ? offer.price_cents
      : typeof offer.amount_cents === "number"
        ? offer.amount_cents
        : null;
  const currency = normalizeText(offer.currency) || "CNY";

  if (priceCents === null) {
    return locale === "zh" ? "价格以结算页为准" : "Price shown at checkout";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(priceCents / 100);
}

function resolveOfferModules(offer: OfferPayload, locale: Locale): string[] {
  const modules = Array.isArray(offer.modules_included)
    ? offer.modules_included
    : Array.isArray(offer.modules_allowed)
      ? offer.modules_allowed
      : [];

  return uniqStrings(modules.map((moduleCode) => humanizeModule(moduleCode, locale)));
}

function resolveOfferKey(offer: OfferPayload): string {
  return normalizeText(offer.benefit_code, offer.entitlement_id, offer.sku, offer.title);
}

function isMbtiFullOffer(offer: OfferPayload): boolean {
  const key = resolveOfferKey(offer).toUpperCase();
  const sku = normalizeText(offer.sku, offer.sku_code).toUpperCase();
  const modules = Array.isArray(offer.modules_included)
    ? offer.modules_included.map((moduleCode) => normalizeText(moduleCode).toLowerCase()).filter(Boolean)
    : Array.isArray(offer.modules_allowed)
      ? offer.modules_allowed.map((moduleCode) => normalizeText(moduleCode).toLowerCase()).filter(Boolean)
      : [];

  return (
    modules.includes("core_full")
    || MBTI_FULL_OFFER_KEYS.some((candidate) => key.includes(candidate) || sku.includes(candidate))
  );
}

function filterMbtiOffers(offers: OfferPayload[]): OfferPayload[] {
  const filtered = offers.filter((offer) => isMbtiFullOffer(offer));
  return filtered.length > 0 ? filtered : offers;
}

function resolveOfferCopy(offer: OfferPayload, locale: Locale): ResolvedOffer {
  const key = resolveOfferKey(offer);
  const normalizedKey = key.toUpperCase();
  const mapped = OFFER_COPY[normalizedKey];
  const moduleCodes = Array.isArray(offer.modules_included)
    ? offer.modules_included.map((moduleCode) => normalizeText(moduleCode).toLowerCase()).filter(Boolean)
    : Array.isArray(offer.modules_allowed)
      ? offer.modules_allowed.map((moduleCode) => normalizeText(moduleCode).toLowerCase()).filter(Boolean)
      : [];
  const modules = resolveOfferModules(offer, locale);

  return {
    key,
    title:
      mapped?.title[locale] ??
      normalizeText(offer.label, offer.title) ??
      (locale === "zh" ? "报告解锁" : "Report unlock"),
    price: formatPrice(offer, locale),
    description:
      mapped?.description[locale] ??
      (modules.length > 0
        ? locale === "zh"
          ? `包含：${modules.join("、")}`
          : `Includes: ${modules.join(", ")}`
        : locale === "zh"
          ? "查看该档位包含的权益内容。"
          : "See what is included in this plan."),
    modules,
    moduleCodes,
  };
}

function resolveLockedSectionCopy(sectionKey: string, locale: Locale): LockedSectionContent {
  const fallback = locale === "zh"
    ? {
        teaser: "解锁后可查看这一模块的完整解读。",
        benefits: ["完整分析", "更具体的行动建议", "与当前结果对应的延展说明"],
        offerModule: "core_full",
      }
    : {
        teaser: "Unlock to view the complete reading for this module.",
        benefits: ["Full analysis", "More concrete actions", "Extended interpretation for this result"],
        offerModule: "core_full",
      };

  return LOCKED_SECTION_COPY[sectionKey]?.[locale] ?? fallback;
}

function resolveOfferTargetForSection(section: ReportSection): string {
  const key = normalizeText(section.key).toLowerCase();
  const moduleCode = normalizeText(section.module_code).toLowerCase();
  if (moduleCode === "career" || key === "career") return "career";
  if (moduleCode === "relationships" || key === "relationships") return "relationships";
  return resolveLockedSectionCopy(key, "en").offerModule;
}

function findOfferForSection(section: ReportSection, offers: OfferPayload[]): OfferPayload | null {
  const mbtiFullOffer = offers.find((offer) => isMbtiFullOffer(offer)) ?? null;
  if (mbtiFullOffer) {
    return mbtiFullOffer;
  }

  const target = resolveOfferTargetForSection(section);
  const matched = offers.find((offer) => {
    const modules = Array.isArray(offer.modules_included) ? offer.modules_included.map((item) => item.toLowerCase()) : [];
    return modules.includes(target);
  });

  if (matched) {
    return matched;
  }

  if (target === "core_full") {
    return offers.find((offer) => {
      const key = resolveOfferKey(offer).toUpperCase();
      return key.includes("REPORT_FULL") || key.includes("REPORT");
    }) ?? null;
  }

  return null;
}

function resolveRecommendedOffers(lockedSections: ReportSection[], offers: OfferPayload[]): OfferPayload[] {
  const matched = lockedSections
    .map((section) => findOfferForSection(section, offers))
    .filter((offer): offer is OfferPayload => offer !== null);

  const bySku = new Map<string, OfferPayload>();
  for (const offer of matched) {
    bySku.set(normalizeText(offer.sku, offer.title), offer);
  }

  return Array.from(bySku.values());
}

function LockBadge({ locale }: { locale: Locale }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
        <path d="M6 8V6a4 4 0 1 1 8 0v2h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1h1Zm2 0h4V6a2 2 0 1 0-4 0v2Z" />
      </svg>
      {locale === "zh" ? "待解锁模块" : "Locked module"}
    </span>
  );
}

function HighlightsSection({
  locale,
  cards,
}: {
  locale: Locale;
  cards: HighlightCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="m-0 text-xl font-semibold text-slate-900">{locale === "zh" ? "核心亮点" : "Core highlights"}</h3>
        <p className="m-0 text-sm text-slate-500">
          {locale === "zh"
            ? "这一部分只展示当前免费结果里已开放的正式亮点。"
            : "This section only shows the highlights already opened in the current free result."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card, index) => (
          <Card
            key={`${card.title}-${index}`}
            className="border-slate-200 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-700">
              <p className="m-0 whitespace-pre-wrap leading-7">{card.body}</p>
              {card.tips.length > 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-3">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {locale === "zh" ? "行动提示" : "Action tip"}
                  </p>
                  <ul className="mb-0 mt-2 list-disc space-y-1 pl-4">
                    {card.tips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function LockedModuleSection({
  locale,
  section,
  offer,
}: {
  locale: Locale;
  section: ReportSection;
  offer: OfferPayload | null;
}) {
  const sectionKey = normalizeText(section.key).toLowerCase();
  const copy = resolveLockedSectionCopy(sectionKey, locale);
  const resolvedOffer = offer ? resolveOfferCopy(offer, locale) : null;

  return (
    <section data-testid="locked-module-card" className="space-y-3">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/60 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-4">
              <LockBadge locale={locale} />
              <div className="space-y-2">
                <h3 className="m-0 text-xl font-semibold text-slate-900">{section.title ?? section.key}</h3>
                <p className="m-0 text-sm leading-7 text-slate-600">{copy.teaser}</p>
              </div>

              <div className="rounded-2xl border border-white/90 bg-white/90 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {locale === "zh" ? "解锁后你将获得" : "What you unlock"}
                </p>
                <ul className="mb-0 mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
                  {copy.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
                {locale === "zh" ? "对应解锁方案" : "Suggested unlock"}
              </p>
              <p className="mt-3 text-lg font-semibold">
                {resolvedOffer?.title ?? (locale === "zh" ? "完整人格报告" : "Full personality report")}
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{resolvedOffer?.price ?? ""}</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                {resolvedOffer?.description ??
                  (locale === "zh" ? "解锁后可查看本模块完整内容。" : "Unlock to view the full content of this module.")}
              </p>

              {resolvedOffer?.modules.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resolvedOffer.modules.map((module) => (
                    <span
                      key={module}
                      className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/90"
                    >
                      {module}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function RecommendedOffersSection({
  locale,
  offers,
}: {
  locale: Locale;
  offers: OfferPayload[];
}) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="m-0 text-xl font-semibold text-slate-900">{locale === "zh" ? "推荐解锁方案" : "Recommended unlocks"}</h3>
        <p className="m-0 text-sm text-slate-500">
          {locale === "zh"
            ? "只展示与当前结果页解锁直接相关的正式方案。"
            : "Only the offers directly related to unlocking this result page are shown here."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {offers.map((offer, index) => {
          const resolved = resolveOfferCopy(offer, locale);
          return (
            <Card
              key={`${resolved.key}-${index}`}
              className="border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]"
            >
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {locale === "zh" ? "可解锁" : "Unlock"}
                  </p>
                  <p className="m-0 text-lg font-semibold text-slate-900">{resolved.title}</p>
                  <p className="m-0 text-3xl font-bold tracking-tight text-slate-950">{resolved.price}</p>
                </div>

                <p className="m-0 text-sm leading-6 text-slate-600">{resolved.description}</p>

                {resolved.modules.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resolved.modules.map((module) => (
                      <span
                        key={module}
                        className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
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
    const shareTitle = locale === "zh" ? "分享我的测试结果" : "Share my result";

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
    <Card className="border-slate-200 bg-slate-950 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-white">{locale === "zh" ? "接下来你可以" : "Next steps"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="m-0 text-sm leading-6 text-slate-300">
          {locale === "zh"
            ? "当前先保留最需要的两个动作：分享结果，或者重新测一次确认当下状态。"
            : "For now, keep the two most useful next steps: share your result or retake the test."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void handleShare()}>
            {locale === "zh" ? "分享结果" : "Share result"}
          </Button>
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "重新测试" : "Retake test"}
          </Link>
        </div>
        {shareStatus === "copied" ? (
          <p className="m-0 text-sm text-emerald-200">{locale === "zh" ? "结果链接已复制。" : "Result link copied."}</p>
        ) : null}
        {shareStatus === "failed" ? (
          <p className="m-0 text-sm text-slate-300">
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

  if (isEqV5ReportResponse(reportData)) {
    return false;
  }

  if (scaleCode === "MBTI" && reportData && hasMbtiResultProjection(reportData)) {
    return true;
  }

  if (scaleCode === "ENNEAGRAM" && reportData && hasEnneagramProjection(reportData)) {
    return true;
  }

  if (scaleCode === "RIASEC" && reportData && hasRiasecProjection(reportData)) {
    return true;
  }

  if (scaleCode === "BIG5_OCEAN" && getBig5ResultPageV2Payload(reportData)) {
    return true;
  }

  const payload = resolveReportPayload(reportData);
  if (!payload) {
    return false;
  }

  return Boolean(
    asRecord(payload.profile) ||
      asRecord(payload.identity_card) ||
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
  accessProjection,
  inviteUnlockProgress,
  printSnapshotMode = false,
  snapshotDesktopCloneContent = null,
  snapshotContentStatus = null,
}: {
  locale: Locale;
  reportData: ReportResponse;
  accessProjection?: AttemptReportAccessView | null;
  inviteUnlockProgress?: AttemptInviteUnlockProgressView | null;
  printSnapshotMode?: boolean;
  snapshotDesktopCloneContent?: PersonalityDesktopCloneContentPayload | null;
  snapshotContentStatus?: MbtiSnapshotContentStatus | null;
}) {
  const scaleCode = resolveReportScaleCode(reportData);
  if (!scaleCode) {
    return null;
  }

  const previewView = scaleCode === "MBTI" ? buildMbtiPreviewViewModel(reportData) : null;
  const gate = resolveRichResultGate(reportData, scaleCode, previewView);
  const headline = resolveHeadline(scaleCode, reportData);
  const tags = resolveVisibleTags(reportData);
  const projectionViewModel = scaleCode === "MBTI" ? buildMbtiResultProjectionViewModel(reportData) : null;
  const dimensions =
    scaleCode === "MBTI" && projectionViewModel?.dimensions.length
      ? projectionViewModel.dimensions
      : scaleCode === "MBTI"
        ? []
        : scaleCode === "BIG5_OCEAN"
          ? []
          : scaleCode === "ENNEAGRAM"
            ? []
        : normalizeDimensions(scaleCode, reportData, locale);
  const highlights = normalizeHighlights(reportData, gate, locale);
  const recommendedReads = resolveRecommendedReads(reportData);
  const sections =
    scaleCode === "BIG5_OCEAN" || scaleCode === "ENNEAGRAM"
      ? []
      : normalizeRichSections(reportData, locale, gate);
  const rawOffers = normalizeOffers(reportData);
  const offers = scaleCode === "MBTI" ? filterMbtiOffers(rawOffers) : rawOffers;
  const resolvedOffers = offers.map((offer) => resolveOfferCopy(offer, locale));

  if (scaleCode === "MBTI") {
    const sectionUnlocks = Object.fromEntries(
      sections.map((section) => {
        const sectionKey = normalizeText(section.key).toLowerCase();
        const copy = resolveLockedSectionCopy(sectionKey, locale);
        const offer = findOfferForSection(section, offers);

        return [
          sectionKey,
          {
            teaser: copy.teaser,
            benefits: copy.benefits,
            offer: offer ? resolveOfferCopy(offer, locale) : null,
          } satisfies MbtiSectionUnlock,
        ];
      })
    ) as Record<string, MbtiSectionUnlock>;

    return (
      <MbtiResultShell
        locale={locale}
        scaleCode={scaleCode}
        reportData={reportData}
        accessProjection={accessProjection}
        inviteUnlockProgress={inviteUnlockProgress}
        headline={headline}
        tags={tags}
        dimensions={dimensions}
        projectionViewModel={projectionViewModel}
        highlights={highlights}
        recommendedReads={recommendedReads}
        previewView={previewView}
        sections={sections}
        sectionUnlocks={sectionUnlocks}
        offers={resolvedOffers}
        printSnapshotMode={printSnapshotMode}
        initialDesktopCloneContent={snapshotDesktopCloneContent}
        snapshotContentStatus={snapshotContentStatus}
      />
    );
  }

  if (scaleCode === "RIASEC" && hasRiasecProjection(reportData)) {
    return (
      <RiasecResultShell
        locale={locale}
        viewModel={assembleRiasecResultViewModel(reportData)}
        attemptId={typeof reportData.attempt_id === "string" ? reportData.attempt_id : null}
      />
    );
  }

  const visibleSections = gate.isFreeVariant
    ? sections.filter((section) => normalizeText(section.access_level).toLowerCase() !== "paid")
    : sections;
  const lockedSections = gate.isFreeVariant
    ? sections.filter((section) => normalizeText(section.access_level).toLowerCase() === "paid")
    : [];

  if (scaleCode === "BIG5_OCEAN") {
    const resultPageV2Payload = getBig5ResultPageV2Payload(reportData);
    if (resultPageV2Payload) {
      return (
        <Big5ResultPageV2Shell
          locale={locale}
          payload={filterBig5ResultPageV2PayloadForGate(resultPageV2Payload, {
            isFreeVariant: gate.isFreeVariant,
            modulesAllowed: gate.modulesAllowed,
          })}
        />
      );
    }

    const assembled = assembleBig5ResultViewModel({
      locale,
      reportData,
      gate: {
        isFreeVariant: gate.isFreeVariant,
        modulesAllowed: gate.modulesAllowed,
        modulesPreview: gate.modulesPreview,
        freeSections: gate.freeSections,
      },
    });
    const recommendedOffers = resolveRecommendedOffers(assembled.lockedSections, offers);

    return (
      <Big5ResultShell
        locale={locale}
        attemptId={accessProjection?.attemptId ?? ""}
        reportLocked={accessProjection ? accessProjection.accessState !== "ready" : reportData.locked === true}
        accessProjection={accessProjection}
        headline={headline}
        tags={tags}
        dimensions={assembled.dimensions}
        projection={assembled.projection}
        formSummaryLabel={assembled.formSummaryLabel}
        normsStatus={assembled.normsStatus}
        qualityLevel={assembled.qualityLevel}
        visibleSections={assembled.visibleSections}
        lockedSections={assembled.lockedSections}
        recommendedOffers={recommendedOffers}
      />
    );
  }

  if (scaleCode === "ENNEAGRAM") {
    const assembled = assembleEnneagramResultViewModel({
      locale,
      reportData,
      gate: {
        isFreeVariant: gate.isFreeVariant,
        modulesAllowed: gate.modulesAllowed,
        modulesPreview: gate.modulesPreview,
      },
    });

    return (
      <EnneagramResultShell
        locale={locale}
        attemptId={accessProjection?.attemptId ?? ""}
        reportLocked={accessProjection ? accessProjection.accessState !== "ready" : reportData.locked === true}
        accessProjection={accessProjection}
        viewModel={assembled}
      />
    );
  }

  const recommendedOffers = resolveRecommendedOffers(lockedSections, offers);

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-emerald-50/60 to-slate-50 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {headline.badge}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {headline.typeCode}
              {headline.displayName ? <span className="text-slate-600"> · {headline.displayName}</span> : null}
            </h2>
            {headline.supportingLine ? (
              <p className="m-0 text-lg font-medium text-slate-700">{headline.supportingLine}</p>
            ) : null}
            {headline.rarity ? (
              <p className="m-0 text-sm text-slate-500">
                {locale === "zh" ? "稀有度：" : "Rarity: "}
                {headline.rarity}
              </p>
            ) : null}
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-white/80 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {headline.summary ? (
            <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{headline.summary}</p>
          ) : null}
        </CardContent>
      </Card>

      <DimensionBars dimensions={dimensions} />
      <HighlightsSection locale={locale} cards={highlights} />

      {visibleSections.map((section) => (
        <SectionRenderer
          key={section.key ?? section.title ?? "section"}
          section={section}
          locked={false}
          locale={locale}
          scaleCode={scaleCode}
        />
      ))}

      {lockedSections.map((section) => (
        <LockedModuleSection
          key={section.key ?? section.title ?? "locked-section"}
          locale={locale}
          section={section}
          offer={findOfferForSection(section, offers)}
        />
      ))}

      <RecommendedOffersSection locale={locale} offers={recommendedOffers} />

      <RichResultCta locale={locale} scaleCode={scaleCode} />
    </div>
  );
}
