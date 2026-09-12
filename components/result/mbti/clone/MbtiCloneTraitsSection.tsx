"use client";

import { useState } from "react";
import Link from "next/link";
import { DimensionBars } from "@/components/result/DimensionBars";
import { MbtiCloneAssetSlot } from "@/components/result/mbti/clone/MbtiCloneAssetSlot";
import { MbtiCloneSectionHeading } from "@/components/result/mbti/clone/MbtiCloneSectionHeading";
import { getMbtiDesktopAnchorId } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { AxisExplainers, MbtiDesktopCloneAssetSlotId } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import styles from "@/components/result/mbti/clone/mbtiDesktopClone.module.css";
import type { PersonalityDesktopCloneAssetSlot } from "@/lib/cms/personality-desktop-clone";
import type { Locale } from "@/lib/i18n/locales";
import { describeMbtiAxisClarity } from "@/lib/mbti/resultScientificInterpretation";
import { selectMbtiTraitEntry, type MbtiTraitCatalog } from "@/lib/cms/mbti-trait-explanations";

const ZH_AXIS_TITLES: Record<string, string> = { EI: "能量", SN: "心智", TF: "天性", JP: "应对方式", AT: "身份特征" };
const ZH_EI_LABELS: Record<string, string> = { E: "外向", I: "内向" };

type TraitTool = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

type MbtiCloneTraitsSectionProps = {
  locale: Locale;
  title: string;
  illustrationSlotId: MbtiDesktopCloneAssetSlotId;
  illustrationLabel: string;
  assetSlots?: PersonalityDesktopCloneAssetSlot[] | null;
  dimensions: Array<Record<string, unknown>>;
  summaryTitleFallback: string;
  summaryValueFallback: string;
  summaryLabelFallback: string;
  summaryDescriptionFallback: string;
  summarySlotId: MbtiDesktopCloneAssetSlotId;
  summarySlotLabel: string;
  axisExplainers?: AxisExplainers | null;
  traitCatalog?: MbtiTraitCatalog | null;
  traitCatalogPending?: boolean;
  paragraphs: string[];
  bodySource: "overview" | "traits";
  tools: TraitTool[];
  toolsPrompt?: string;
  bodyPending?: boolean;
  bodyUnavailable?: boolean;
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function normalizeNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function normalizeAxisCode(value: Record<string, unknown>, fallbackIndex: number): string {
  const code = normalizeText(value.axisCode, value.axis_code, value.code, value.key).toUpperCase();
  return code || `DIMENSION_${fallbackIndex + 1}`;
}

function resolveStrengthBandLabel(locale: Locale, band: string): string {
  const normalized = band.trim().toLowerCase();
  if (!normalized) {
    return "";
  }

  const labels = {
    boundary: locale === "zh" ? "边界轴" : "Boundary axis",
    moderate: locale === "zh" ? "中等强度" : "Moderate signal",
    clear: locale === "zh" ? "清晰倾向" : "Clear signal",
    strong: locale === "zh" ? "强烈倾向" : "Strong signal",
    very_clear: locale === "zh" ? "非常清晰" : "Very clear signal",
  } as const;

  return labels[normalized as keyof typeof labels] ?? normalized.replace(/_/g, " ");
}

function resolveEditorialBand(dominantPct: number | null | undefined): "light" | "clear" | "strong" | null {
  if (typeof dominantPct !== "number" || !Number.isFinite(dominantPct)) {
    return null;
  }

  if (dominantPct <= 56) {
    return "light";
  }

  if (dominantPct <= 67) {
    return "clear";
  }

  return "strong";
}

export function MbtiCloneTraitsSection({
  locale,
  title,
  illustrationSlotId,
  illustrationLabel,
  assetSlots,
  dimensions,
  summaryTitleFallback,
  summaryValueFallback,
  summaryLabelFallback,
  summaryDescriptionFallback,
  summarySlotId,
  summarySlotLabel,
  axisExplainers = null,
  traitCatalog = null,
  traitCatalogPending = false,
  paragraphs,
  bodySource,
  tools,
  toolsPrompt,
  bodyPending = false,
  bodyUnavailable = false,
}: MbtiCloneTraitsSectionProps) {
  const [selectedAxisCode, setSelectedAxisCode] = useState<string | null>(null);
  const normalizedDimensions = dimensions
    .map((dimension, index) => {
      const record = dimension as Record<string, unknown>;
      const axisCode = normalizeAxisCode(record, index);
      const dominantPct = normalizeNumber(record.dominantPct, record.dominant_pct, record.percent, record.pct) ?? undefined;
      const dominantPole = normalizeText(record.dominantPole, record.dominant_pole, record.side).toUpperCase();
      const dominantLabel = normalizeText(record.dominantLabel, record.dominant_label, record.sideLabel, record.side_label);
      const axisTitle = normalizeText(record.axisTitle, record.axis_title, record.label);
      const summary = normalizeText(record.summary, record.description);
      const leftPole = normalizeText(record.leftPole, record.left_pole, record.leftLabel);
      const rightPole = normalizeText(record.rightPole, record.right_pole, record.rightLabel);
      const leftCode = normalizeText(record.leftCode, record.left_code, axisCode.split(/[/_-]/)[0]);
      const rightCode = normalizeText(record.rightCode, record.right_code, axisCode.split(/[/_-]/)[1]);
      const strengthBand = normalizeText(record.strengthBand, record.strength_band);

      return {
        ...record,
        axisCode,
        dominantPct,
        dominantPole,
        dominantLabel: locale === "zh" && axisCode === "EI" ? ZH_EI_LABELS[dominantPole] ?? dominantLabel : dominantLabel,
        axisTitle: locale === "zh" ? ZH_AXIS_TITLES[axisCode] ?? axisTitle : axisTitle,
        summary,
        leftPole: locale === "zh" && axisCode === "EI" ? ZH_EI_LABELS[leftCode] ?? leftPole : leftPole,
        rightPole: locale === "zh" && axisCode === "EI" ? ZH_EI_LABELS[rightCode] ?? rightPole : rightPole,
        leftCode,
        rightCode,
        strengthBand,
      };
    })
    .filter((dimension) => Boolean(dimension.axisCode));
  const activeAxis =
    normalizedDimensions.find((dimension) => dimension.axisCode === selectedAxisCode) ?? normalizedDimensions[0] ?? null;
  const traitEntry = activeAxis && locale === "zh"
    ? selectMbtiTraitEntry(traitCatalog, activeAxis.axisCode, activeAxis.dominantPole, activeAxis.dominantPct)
    : null;
  const summaryTitle = activeAxis?.axisTitle || summaryTitleFallback;
  const summaryValue =
    typeof activeAxis?.dominantPct === "number" ? `${Math.round(activeAxis.dominantPct)}%` : summaryValueFallback;
  const activeClarity = typeof activeAxis?.dominantPct === "number"
    ? describeMbtiAxisClarity({
        axisCode: activeAxis.axisCode,
        percent: activeAxis.dominantPct,
        dominantLabel: activeAxis.dominantLabel,
      })
    : null;
  const hasCriticalClarity = locale === "zh" && Boolean(activeClarity && activeClarity.percent <= 55);
  const summaryLabel = locale === "zh" && Math.round(activeAxis?.dominantPct ?? -1) === 50
    ? "两侧持平"
    : hasCriticalClarity
    ? activeClarity?.label ?? summaryLabelFallback
    : activeAxis?.dominantLabel || summaryLabelFallback;
  const summaryDescription = hasCriticalClarity
    ? activeClarity?.description ?? summaryDescriptionFallback
    : activeAxis?.summary || summaryDescriptionFallback;
  const summaryMeta = [
    activeAxis?.leftPole && activeAxis?.rightPole
      ? [activeAxis.leftCode, activeAxis.leftPole].filter(Boolean).join(" ")
          + " / "
          + [activeAxis.rightCode, activeAxis.rightPole].filter(Boolean).join(" ")
      : "",
    hasCriticalClarity
      ? activeClarity?.state === "tie"
        ? "未形成清晰偏好"
        : "当前仅有轻微偏向"
      : activeAxis?.strengthBand
        ? resolveStrengthBandLabel(locale, activeAxis.strengthBand)
        : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const activeBand = resolveEditorialBand(activeAxis?.dominantPct);
  const bandNuance = !hasCriticalClarity
    && (locale !== "zh" || activeAxis?.axisCode !== "AT")
    && activeAxis
    && activeBand
    ? normalizeText(
        axisExplainers?.[activeAxis.axisCode]?.[activeAxis.dominantPole]?.[activeBand]?.bandNuance,
      )
    : "";

  return (
    <section
      id={getMbtiDesktopAnchorId("traits")}
      data-testid="mbti-chapter-traits"
      data-pdf-section="personality-traits"
      className={styles.section}
    >
      <MbtiCloneAssetSlot
        slotId={illustrationSlotId}
        assetSlots={assetSlots}
        fallbackLabel={illustrationLabel}
        className={styles.illustrationSlot}
        labelClassName={styles.slotLabel}
        testId="mbti-asset-slot-traits"
      />
      <MbtiCloneSectionHeading number={1} title={title} />
      <div className={styles.traitsCard} data-testid="mbti-traits-card">
        <div className={styles.traitsOverviewRow}>
          <div className={styles.traitsMetrics}>
            <DimensionBars
              dimensions={normalizedDimensions}
              variant="clone16p"
              className={styles.cloneBars}
              activeDimensionCode={activeAxis?.axisCode ?? null}
              onDimensionSelect={setSelectedAxisCode}
            />
          </div>
          <aside className={styles.summaryPane} data-testid="mbti-traits-summary-pane">
            <div key={activeAxis?.axisCode} className={styles.summaryContent}>
              {locale === "zh" ? <header className={styles.traitSummaryHeader}>
                <p className={styles.microLabel}>{summaryTitle}</p>
                <p className={styles.traitSummaryResult}>
                  <span style={{ color: ({ EI: "#4D9FC1", SN: "#D6A43A", TF: "#3CAA8C", JP: "#8E63B1", AT: "#E56B73" } as Record<string, string>)[activeAxis?.axisCode ?? ""] }}>{summaryValue}</span>
                  <span>{summaryLabel}</span>
                </p>
              </header> : <div>
                <p className={styles.microLabel}>{summaryTitle}</p>
                <p className={styles.summaryValue}>{summaryValue}</p>
                <p className={styles.summaryLead}>{summaryLabel}</p>
              </div>}
              <MbtiCloneAssetSlot
                slotId={summarySlotId}
                assetSlots={assetSlots}
                fallbackLabel={summarySlotLabel}
                className={styles.summaryIllustration}
                labelClassName={styles.slotLabel}
                testId="mbti-asset-slot-traits-summary"
              />
              {locale !== "zh" && summaryMeta ? <p className={styles.summaryMeta}>{summaryMeta}</p> : null}
              {locale === "zh" ? (
                <div className={styles.traitEditorial} data-testid="mbti-trait-editorial" data-content-status={traitEntry ? "ready" : traitCatalogPending ? "loading" : "unavailable"}
                  data-content-revision={traitCatalog?.revision} data-band={traitEntry ? `${traitEntry.min}-${traitEntry.max}` : undefined}>
                  {traitEntry ? <>
                    <p className={styles.summaryText} data-testid="mbti-trait-a">{traitEntry.a}</p>
                    <p className={styles.summarySupplement} data-testid="mbti-trait-b">{traitEntry.b}</p>
                  </> : <p className={styles.summaryText} role="status">{traitCatalogPending ? "正在加载维度解读…" : "维度解读暂时不可用，请稍后重试。"}</p>}
                </div>
              ) : <p className={styles.summaryText}>{summaryDescription}</p>}
              {locale !== "zh" && bandNuance ? (
                <p className={styles.summarySupplement} data-testid="mbti-traits-band-nuance">
                  {bandNuance}
                </p>
              ) : null}
            </div>
          </aside>
        </div>
        {tools.length > 0 ? (
          <div className={styles.traitsFooter} data-testid="mbti-traits-tools">
            {toolsPrompt ? <p className={styles.traitsFooterLead}>{toolsPrompt}</p> : null}
            <div className={styles.traitsTools}>
              {tools.map((tool, index) => {
                const key = `${tool.label}-${tool.href ?? "button"}`;
                const className = [
                  styles.subtleTool,
                  index === 0 ? styles.subtleToolPrimary : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                if (tool.onClick) {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => void tool.onClick?.()}
                      disabled={tool.disabled}
                      className={className}
                    >
                      {tool.label}
                    </button>
                  );
                }

                if (!tool.href) {
                  return null;
                }

                if (tool.href.startsWith("#")) {
                  return (
                    <a key={key} href={tool.href} className={className}>
                      {tool.label}
                    </a>
                  );
                }

                return (
                  <Link key={key} href={tool.href} className={className}>
                    {tool.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div
        className={styles.sectionParagraphs}
        data-testid="mbti-traits-body"
        data-body-source={bodySource}
      >
        {bodyPending || bodyUnavailable ? <p role="status">{bodyPending ? "正在加载人格解读…" : "人格解读暂时不可用，请稍后重试。"}</p> : null}
        {paragraphs.map((paragraph, index) => (
          <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
