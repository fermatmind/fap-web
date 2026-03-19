"use client";

import { useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultPersonalizationViewModel, MbtiSceneFingerprintEntryViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiVariantKeys,
} from "@/lib/mbti/personalizationTelemetry";

type MbtiSceneFingerprintSummaryProps = {
  locale: Locale;
  personalization: MbtiResultPersonalizationViewModel | null;
};

const SCENE_ORDER = [
  "work",
  "relationships",
  "growth",
  "decision",
  "stress_recovery",
  "communication",
] as const;

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function buildSceneTelemetryPayload(
  scene: MbtiSceneFingerprintEntryViewModel,
  locale: Locale,
  personalization: MbtiResultPersonalizationViewModel | null
) {
  return {
    slug: "mbti-result-shell",
    scale_code: "MBTI",
    visual_kind: "mbti_scene_fingerprint",
    sceneKey: scene.scene,
    styleKey: normalizeText(scene.styleKey),
    sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
    boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
    axisBands: summarizeMbtiAxisBands(personalization),
    typeCode: normalizeText(personalization?.typeCode),
    identity: normalizeText(personalization?.identity),
    variantKeys: summarizeMbtiVariantKeys(personalization),
    packId: normalizeText(personalization?.packId),
    engineVersion: normalizeText(personalization?.engineVersion),
    locale,
  };
}

export function MbtiSceneFingerprintSummary({
  locale,
  personalization,
}: MbtiSceneFingerprintSummaryProps) {
  const impressionRef = useRef<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<"accurate" | "mixed" | null>(null);
  const entries = SCENE_ORDER.map((sceneKey) => personalization?.sceneFingerprint[sceneKey]).filter(
    (entry): entry is MbtiSceneFingerprintEntryViewModel => Boolean(entry)
  );

  useEffect(() => {
    for (const entry of entries) {
      if (impressionRef.current.has(entry.scene)) {
        continue;
      }

      impressionRef.current.add(entry.scene);
      trackEvent("ui_card_impression", buildSceneTelemetryPayload(entry, locale, personalization));
    }
  }, [entries, locale, personalization]);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section
      id="scene-fingerprint"
      data-testid="mbti-scene-fingerprint"
      className="scroll-mt-28 space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "场景指纹" : "Scene fingerprint"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {locale === "zh"
            ? "把类型结果翻译成你在不同场景里的稳定模式"
            : "Translate the type result into stable patterns across situations"}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <Card
            key={entry.scene}
            data-testid={`mbti-scene-card-${entry.scene}`}
            data-style-key={entry.styleKey || undefined}
            className="border-slate-200 bg-white/95 shadow-[0_14px_36px_rgba(15,23,42,0.06)]"
          >
            <CardHeader className="space-y-2 pb-3">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {entry.scene.replace(/_/g, " ")}
              </p>
              <CardTitle className="text-lg text-slate-900">{entry.title || entry.scene}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="m-0 text-sm leading-7 text-slate-700">{entry.summary}</p>
              {entry.chapterAnchor ? (
                <a
                  href={`#${entry.chapterAnchor}`}
                  className={buttonVariants({ variant: "outline", className: "w-full" })}
                  onClick={() => {
                    trackEvent("ui_card_interaction", {
                      ...buildSceneTelemetryPayload(entry, locale, personalization),
                      interaction: `jump_to_${entry.chapterAnchor}`,
                    });
                  }}
                >
                  {locale === "zh" ? "查看对应章节" : "Open related chapter"}
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        data-testid="mbti-scene-feedback"
        data-feedback-state={feedback ?? "idle"}
        className="border-slate-200 bg-[var(--fm-surface-muted)]/70 shadow-none"
      >
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="m-0 text-sm font-semibold text-slate-900">
              {locale === "zh" ? "这一组场景指纹像你吗？" : "Do these scene patterns feel like you?"}
            </p>
            <p className="m-0 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "这是一个轻反馈，用来判断场景化解释是否比传统类型页更贴近真实体验。"
                : "This light feedback helps measure whether scene-based interpretation feels more accurate than a static type page."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={buttonVariants({
                variant: feedback === "accurate" ? "default" : "outline",
              })}
              onClick={() => {
                setFeedback("accurate");
                trackEvent("accuracy_feedback", {
                  feedback: "accurate",
                  sectionKey: "scene_fingerprint",
                  sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
                  boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
                  axisBands: summarizeMbtiAxisBands(personalization),
                  typeCode: normalizeText(personalization?.typeCode),
                  identity: normalizeText(personalization?.identity),
                  variantKeys: summarizeMbtiVariantKeys(personalization),
                  packId: normalizeText(personalization?.packId),
                  engineVersion: normalizeText(personalization?.engineVersion),
                  locale,
                });
              }}
            >
              {locale === "zh" ? "很像我" : "Feels accurate"}
            </button>
            <button
              type="button"
              className={buttonVariants({
                variant: feedback === "mixed" ? "default" : "outline",
              })}
              onClick={() => {
                setFeedback("mixed");
                trackEvent("accuracy_feedback", {
                  feedback: "mixed",
                  sectionKey: "scene_fingerprint",
                  sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
                  boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
                  axisBands: summarizeMbtiAxisBands(personalization),
                  typeCode: normalizeText(personalization?.typeCode),
                  identity: normalizeText(personalization?.identity),
                  variantKeys: summarizeMbtiVariantKeys(personalization),
                  packId: normalizeText(personalization?.packId),
                  engineVersion: normalizeText(personalization?.engineVersion),
                  locale,
                });
              }}
            >
              {locale === "zh" ? "有些偏差" : "Mixed"}
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
