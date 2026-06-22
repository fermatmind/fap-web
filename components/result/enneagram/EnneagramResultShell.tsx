"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  assignEnneagramObservation,
  fetchEnneagramObservation,
  submitEnneagramObservationDay3,
  submitEnneagramObservationDay7,
  type EnneagramObservationDay3Payload,
  type EnneagramObservationDay7Payload,
  type EnneagramObservationStateV1,
} from "@/lib/api/v0_3";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { buildEnneagramTakeHref } from "@/lib/enneagram/forms";
import { resolveEnneagramTechnicalNoteHref } from "@/lib/enneagram/technicalNote";
import type {
  EnneagramReportV2Module,
  EnneagramReportV2Page,
  EnneagramResultViewModel,
  EnneagramTypeRow,
} from "@/lib/enneagram/resultAssembler";
import type { Locale } from "@/lib/i18n/locales";
import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";

function formatScore(score: number | null): string {
  if (score === null) {
    return "";
  }

  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

const INTERNAL_VISIBLE_TEXT_PATTERNS = [
  /\[object Object\]/i,
  /analyzer_close_call/i,
  /deferred_to_future/i,
  /not_shipped/i,
  /^workplace_context_mode_not_enabled$/i,
  /^history_share_surface_not_shipped$/i,
  /^version\s*[·:]\s*unavailable$/i,
  /^COMMUNICATION_MANUAL$/i,
  /^content_maturity$/i,
  /^evidence_level$/i,
  /^high_profile_entropy$/i,
  /^observe_7_days$/i,
  /^blind_spot\.type_/i,
  /^diffuse\s+enneagram_likert_105$/i,
  /^center summary$/i,
  /^stance summary$/i,
  /^harmonic summary$/i,
  /^unavailable$/i,
  /^placeholder$/i,
];

const SUPPRESSED_PUBLIC_MODULE_KEYS = new Set([
  "context_mode_placeholder",
  "history_share_retake_placeholder",
  "arrow_growth_reference_placeholder",
  "blind_spot_card",
  "blind_spot_in_relationship",
  "center_summary",
  "stance_summary",
  "harmonic_summary",
  "sample_report_link",
]);

function safePublicText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") {
    return "";
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return "";
  }

  if (INTERNAL_VISIBLE_TEXT_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return "";
  }

  return normalized;
}

function firstSafePublicText(...values: unknown[]): string {
  for (const value of values) {
    const text = safePublicText(value);
    if (text) {
      return text;
    }
  }

  return "";
}

function normalizeBarWidth(score: number | null): number | null {
  if (score === null) {
    return null;
  }

  if (score >= 0 && score <= 1) {
    return Math.max(2, Math.min(100, score * 100));
  }

  return Math.max(2, Math.min(100, score));
}

function moduleText(module: EnneagramReportV2Module | null | undefined, key: string): string {
  return safePublicText(module?.content?.[key]);
}

function moduleArray(module: EnneagramReportV2Module | null | undefined, key: string): Record<string, unknown>[] {
  const value = module?.content?.[key];
  return Array.isArray(value) ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object")) : [];
}

function formBadgeCopy(viewModel: EnneagramResultViewModel, locale: Locale): { label: string; body: string } {
  const fromModule = viewModel.moduleMap.instant_summary?.content.form_badge;
  if (fromModule && typeof fromModule === "object" && !Array.isArray(fromModule)) {
    return {
      label: safePublicText((fromModule as Record<string, unknown>).label),
      body: safePublicText((fromModule as Record<string, unknown>).body),
    };
  }

  if (viewModel.formVariant === "fc144" || viewModel.formCode === "enneagram_forced_choice_144") {
    return {
      label: locale === "zh" ? "FC144 深度版" : "FC144 Deep Form",
      body: locale === "zh" ? "同模型，不同分数空间。" : "Same model, different score space.",
    };
  }

  return {
    label: locale === "zh" ? "E105 标准版" : "E105 Standard Form",
    body: locale === "zh" ? "同模型，不同分数空间。" : "Same model, different score space.",
  };
}

function stateLead(viewModel: EnneagramResultViewModel, locale: Locale): string {
  const primary = viewModel.primaryType?.label ?? viewModel.primaryType?.code ?? "";
  const secondary = moduleText(viewModel.moduleMap.instant_summary, "secondary_candidate");

  switch (viewModel.interpretationScope) {
    case "close_call":
      return locale === "zh"
        ? `你可能在 ${primary || "当前主候选"} 与 ${secondary || "第二候选"} 之间摇摆`
        : `You may be oscillating between ${primary || "the current lead"} and ${secondary || "the second candidate"}`;
    case "diffuse":
      return locale === "zh" ? "这次结果呈现分散结构" : "This result shows a diffuse profile shape";
    case "low_quality":
      return locale === "zh" ? "这次结果可以阅读，但解释边界较宽" : "This result is readable, but the interpretation boundary is wider";
    case "clear":
    default:
      return locale === "zh" ? `当前结果更接近 ${primary || "当前主候选"}` : `This result currently leans toward ${primary || "the current lead"}`;
  }
}

function nextActionHint(viewModel: EnneagramResultViewModel, locale: Locale): string {
  const recommendation = moduleText(viewModel.moduleMap.form_recommendation, "recommended_first_action");
  if (recommendation) {
    return recommendation;
  }

  const recommendationKey = moduleText(viewModel.moduleMap.form_recommendation, "recommendation_key");
  if (recommendationKey === "consider_fc144_followup") {
    return locale === "zh" ? "如果你仍在犹豫，可补做 FC144 作为后续辨析。" : "If you are still uncertain, FC144 is the next follow-up form.";
  }
  if (recommendationKey === "observe_before_retake") {
    return locale === "zh" ? "先观察一周，再决定是否重测。" : "Observe for a week before deciding to retake.";
  }
  if (recommendationKey === "retake_same_form_after_quality_check") {
    return locale === "zh" ? "先检查答题状态，再决定是否重测同一版本。" : "Check response quality first, then decide whether to retake the same form.";
  }

  return locale === "zh" ? "把这份结果当作当前工作假设来阅读。" : "Use this result as the current working interpretation.";
}

function typeRefLabel(value: unknown): string {
  const direct = safePublicText(value);
  if (direct) {
    return direct;
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  const record = value as Record<string, unknown>;

  return (
    safePublicText(record.label) ||
    safePublicText(record.type_name_cn) ||
    safePublicText(record.type_name_en) ||
    safePublicText(record.type) ||
    safePublicText(record.code) ||
    ""
  );
}

function observationGuidanceCopy(viewModel: EnneagramResultViewModel, locale: Locale): string {
  switch (viewModel.interpretationScope) {
    case "close_call":
      return locale === "zh"
        ? "你不需要立刻把自己钉死在一个号码上。接下来 7 天，你要观察的是：你更像 Top1 的核心动力，还是 Top2 的核心动力。"
        : "You do not need to force a single type immediately. Over the next 7 days, observe whether your core motive fits Top 1 or Top 2 more closely.";
    case "diffuse":
      return locale === "zh"
        ? "这次结果更适合先观察 Top3 与三中心线索，而不是强行认定单一号码。"
        : "This result is better used to observe Top 3 and center-level cues before forcing a single-number judgement.";
    case "low_quality":
      return locale === "zh"
        ? "这次结果可以阅读，但解释边界较宽。更建议在状态稳定时重测同一题型，而不是立刻换成另一个 form。"
        : "This result is readable, but the interpretation boundary is wider. Retaking the same form in a steadier state is better than switching forms immediately.";
    case "clear":
    default:
      return locale === "zh"
        ? "你可以用 7 天观察来验证这个主候选在现实中的稳定性。"
        : "Use a 7-day observation window to verify whether the current lead remains stable in daily life.";
  }
}

function observationActionLabel(action: string | null | undefined, locale: Locale): string {
  switch (action) {
    case "observe_7_days":
      return locale === "zh" ? "继续观察" : "Continue observing";
    case "do_fc144":
      return locale === "zh" ? "可补做 FC144 深度版" : "FC144 follow-up is available";
    case "retest_same_form":
      return locale === "zh" ? "建议重测同一题型" : "Retake the same form";
    case "read_top3":
      return locale === "zh" ? "先阅读 Top3 与方法边界" : "Read Top 3 and the method boundary first";
    case "no_action":
      return locale === "zh" ? "暂无下一步" : "No immediate next step";
    default:
      return locale === "zh" ? "继续观察" : "Continue observing";
  }
}

function isObservationAssigned(state: EnneagramObservationStateV1 | null): boolean {
  return Boolean(state && state.status && state.status !== "initial_result");
}

function TypeChip({ type }: { type: EnneagramTypeRow }) {
  const score = formatScore(type.score);

  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
      {type.rank ? `#${type.rank} · ` : ""}
      {type.label}
      {score ? ` · ${score}` : ""}
    </span>
  );
}

function LegacyTypeVector({ rows }: { rows: EnneagramTypeRow[] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <Card data-testid="enneagram-type-vector" className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-slate-950">Type vector</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => {
          const width = normalizeBarWidth(row.score);
          const score = formatScore(row.score);

          return (
            <div key={row.code} className="grid gap-2 sm:grid-cols-[160px_1fr_56px] sm:items-center">
              <div className="text-sm font-semibold text-slate-800">{row.label}</div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                {width !== null ? <div className="h-full rounded-full bg-sky-600" style={{ width: `${width}%` }} /> : null}
              </div>
              <div className="text-sm text-slate-600">{score}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ModuleCard({
  title,
  children,
  testId,
}: {
  title: string;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <Card data-testid={testId} className="border-slate-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-slate-950">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-7 text-slate-700">{children}</CardContent>
    </Card>
  );
}

function localizedModuleTitle(moduleKey: string, locale: Locale): string {
  const isZh = locale === "zh";
  const labels: Record<string, { zh: string; en: string }> = {
    type_deep_dive_summary: { zh: "主类型深解", en: "Type deep dive" },
    work_style_summary: { zh: "工作方式", en: "Work style" },
    collaboration_strengths: { zh: "协作优势", en: "Collaboration strengths" },
    collaboration_friction: { zh: "协作摩擦点", en: "Collaboration friction" },
    leadership_pattern: { zh: "领导模式", en: "Leadership pattern" },
    managed_by_others: { zh: "被管理时更顺畅的方式", en: "How to manage you well" },
    workplace_trigger_points: { zh: "工作触发点", en: "Workplace triggers" },
    context_mode_placeholder: { zh: "情境模式占位", en: "Context-mode placeholder" },
    history_share_retake_placeholder: { zh: "分享与历史占位", en: "Share and history placeholder" },
    growth_axis: { zh: "成长轴", en: "Growth axis" },
    strength_expression: { zh: "优势表达", en: "Strength expression" },
    cost_expression: { zh: "代价表达", en: "Cost expression" },
    stress_trigger: { zh: "压力触发点", en: "Stress trigger" },
    recovery_action: { zh: "恢复动作", en: "Recovery action" },
    state_spectrum: { zh: "状态光谱", en: "State spectrum" },
    arrow_growth_reference_placeholder: { zh: "箭头参考占位", en: "Arrow reference placeholder" },
    relationship_need: { zh: "关系需要", en: "Relationship needs" },
    relationship_strengths: { zh: "关系优势", en: "Relationship strengths" },
    misread_by_others: { zh: "容易被误读的地方", en: "How others may misread you" },
    conflict_script: { zh: "冲突脚本", en: "Conflict script" },
    communication_manual: { zh: "沟通说明书", en: "Communication manual" },
    sample_report_link: { zh: "样例报告", en: "Sample report" },
  };

  const copy = labels[moduleKey];
  if (!copy) {
    return isZh ? "补充模块" : "Additional module";
  }

  return isZh ? copy.zh : copy.en;
}

function detailLabelCopy(value: string, locale: Locale): string {
  if (locale !== "zh") {
    return "Additional note";
  }

  switch (value) {
    case "growth_principle":
      return "成长原则";
    case "work_mechanism":
      return "工作机制";
    case "relationship_script":
      return "关系脚本";
    case "conflict_pattern":
      return "冲突模式";
    default:
      return "补充说明";
  }
}

function listGroupLabel(value: string, locale: Locale): string {
  if (locale !== "zh") {
    return "Additional list";
  }

  switch (value) {
    case "work_strengths":
      return "工作优势";
    case "work_friction_points":
      return "工作摩擦点";
    case "ideal_environment":
      return "更适合的环境";
    case "collaboration_manual":
      return "协作说明";
    case "managed_by_others":
      return "被管理时更顺畅的方式";
    case "leadership_pattern":
      return "带人方式";
    case "workplace_trigger_points":
      return "工作触发点";
    case "growth_strengths":
      return "成长优势";
    case "growth_costs":
      return "成长代价";
    case "early_warning_signs":
      return "早期信号";
    case "recovery_protocol":
      return "恢复协议";
    case "small_experiments":
      return "小实验";
    case "relationship_strengths":
      return "关系优势";
    case "relationship_traps":
      return "关系陷阱";
    case "conflict_trigger_points":
      return "冲突触发点";
    case "repair_language":
      return "修复语言";
    case "partner_facing_notes":
      return "给关系另一方的提示";
    default:
      return "补充列表";
  }
}

function ListGroupSections({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const groups = moduleArray(module, "list_groups");

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {groups.map((group, index) => {
        const labelKey = safePublicText(group.label_key);
        const items = Array.isArray(group.items)
          ? group.items.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
          : [];

        if (items.length === 0) {
          return null;
        }

        return (
          <div key={`${labelKey || "group"}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{listGroupLabel(labelKey, locale)}</p>
            <div className="mt-3 space-y-3">
              {items.map((item, itemIndex) => {
                const title = safePublicText(item.title);
                const body = safePublicText(item.body);
                if (!title && !body) {
                  return null;
                }

                return (
                  <div key={`${title || "item"}-${itemIndex}`} className="space-y-1">
                    {title ? <p className="m-0 text-sm font-semibold text-slate-800">{title}</p> : null}
                    {body ? <p className="m-0 text-sm text-slate-700">{body}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModuleProvenance({
  module,
  locale,
  extraHint,
}: {
  module: EnneagramReportV2Module;
  locale: Locale;
  extraHint?: string | null;
}) {
  void module;
  void locale;
  void extraHint;
  return null;
}

function AssetBackedCardRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const isZh = locale === "zh";
  const category = moduleText(module, "category");
  const body = moduleText(module, "body_zh");
  const shortBody = moduleText(module, "short_body_zh");
  const cta = moduleText(module, "cta_zh");
  const assetKey = moduleText(module, "asset_key");
  const title = category ? category.replace(/_/g, " ") : localizedModuleTitle(module.moduleKey, locale);

  return (
    <ModuleCard title={title} testId={`enneagram-asset-backed-${category || module.moduleKey}`}>
      <div className="space-y-3 [overflow-wrap:anywhere]">
        {shortBody ? <p className="m-0 text-sm font-semibold text-slate-800">{shortBody}</p> : null}
        {body ? <p data-testid="enneagram-asset-backed-body" className="m-0 whitespace-pre-wrap text-sm leading-7 text-slate-700">{body}</p> : null}
        {cta ? (
          <p data-testid="enneagram-asset-backed-cta" className="m-0 text-sm font-semibold text-[var(--fm-trust-blue)]">
            {cta}
          </p>
        ) : null}
        {assetKey ? (
          <p data-testid="enneagram-asset-backed-provenance" className="m-0 text-xs text-slate-500">
            {assetKey}
          </p>
        ) : null}
        {!body && moduleText(module, "status") ? <p className="m-0 text-xs text-slate-500">{moduleText(module, "status")}</p> : null}
      </div>
      <ModuleProvenance
        module={{
          ...module,
          provenance: {
            ...module.provenance,
            contentMaturity: moduleText(module, "content_maturity") || module.provenance.contentMaturity,
            evidenceLevel: moduleText(module, "evidence_level") || module.provenance.evidenceLevel,
          },
        }}
        locale={locale}
        extraHint={isZh ? "preview only" : "preview only"}
      />
    </ModuleCard>
  );
}

function TypeDeepDiveSummaryRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const cards = [
    { key: "core_desire", label: locale === "zh" ? "核心渴望" : "Core desire" },
    { key: "core_fear", label: locale === "zh" ? "核心担心" : "Core fear" },
    { key: "defense_pattern", label: locale === "zh" ? "惯性防御" : "Defense pattern" },
    { key: "self_misread", label: locale === "zh" ? "容易对自己误读的地方" : "How you may misread yourself" },
  ].filter((item) => moduleText(module, item.key));

  return (
    <ModuleCard title={localizedModuleTitle(module.moduleKey, locale)} testId="enneagram-module-type_deep_dive_summary">
      {moduleText(module, "short_title") ? <p className="m-0 text-sm font-semibold text-slate-800">{moduleText(module, "short_title")}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</p>
            <p className="m-0 mt-2 text-sm text-slate-700">{moduleText(module, card.key)}</p>
          </div>
        ))}
      </div>
      {moduleText(module, "validation_hook") ? (
        <p className="m-0 text-xs text-slate-500">{moduleText(module, "validation_hook")}</p>
      ) : null}
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

function ScenarioCardRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const title = moduleText(module, "title") || localizedModuleTitle(module.moduleKey, locale);
  const body = moduleText(module, "body");
  const typeSummary = moduleText(module, "type_summary");
  const detailLabel = detailLabelCopy(moduleText(module, "detail_label"), locale);
  const detail = moduleText(module, "deep_dive_detail");
  const primaryCandidate = moduleText(module, "primary_candidate");

  return (
    <ModuleCard title={title} testId={`enneagram-module-${module.moduleKey}`}>
      {body ? <p className="m-0">{body}</p> : null}
      {typeSummary ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{locale === "zh" ? "当前主候选对应提示" : "Primary candidate cue"}</p>
          <p className="m-0 mt-2 text-sm text-slate-700">{typeSummary}</p>
        </div>
      ) : null}
      {detail ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{detailLabel}</p>
          <p className="m-0 mt-2 text-sm text-emerald-900">{detail}</p>
        </div>
      ) : null}
      <ListGroupSections module={module} locale={locale} />
      {primaryCandidate ? <p className="m-0 text-xs text-slate-500">{locale === "zh" ? "围绕主候选" : "Grounded in lead candidate"} · {primaryCandidate}</p> : null}
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

function ValueCardRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const title = localizedModuleTitle(module.moduleKey, locale);
  const value = moduleText(module, "value");
  const detail = moduleText(module, "deep_dive_detail");
  const detailLabel = detailLabelCopy(moduleText(module, "detail_label"), locale);
  const typeName = moduleText(module, "type_name_cn") || moduleText(module, "type_name_en");
  const primaryCandidate = moduleText(module, "primary_candidate");

  return (
    <ModuleCard title={title} testId={`enneagram-module-${module.moduleKey}`}>
      {value ? <p className="m-0">{value}</p> : null}
      {detail ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{detailLabel}</p>
          <p className="m-0 mt-2 text-sm text-slate-700">{detail}</p>
        </div>
      ) : null}
      <ListGroupSections module={module} locale={locale} />
      {typeName || primaryCandidate ? (
        <p className="m-0 text-xs text-slate-500">
          {locale === "zh" ? "当前主候选" : "Primary candidate"} · {[typeName, primaryCandidate].filter(Boolean).join(" · ")}
        </p>
      ) : null}
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

function GroupOverlayRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const items = moduleArray(module, "items");
  const title = localizedModuleTitle(module.moduleKey, locale);

  return (
    <ModuleCard title={title} testId={`enneagram-module-${module.moduleKey}`}>
      {items.length > 0 ? (
        <div className="grid gap-3">
          {items.map((item, index) => (
            <div key={`${firstSafePublicText(item.group_ref, item.group_key) || index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {safePublicText(item.group_type) || (locale === "zh" ? "分组" : "Group")} · {firstSafePublicText(item.group_key, item.group_ref)}
              </p>
              {safePublicText(item.value) ? <p className="m-0 mt-2 text-sm text-slate-700">{safePublicText(item.value)}</p> : null}
              {safePublicText(item.description) ? <p className="m-0 mt-2 text-xs text-slate-500">{safePublicText(item.description)}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="m-0 text-sm text-slate-600">{locale === "zh" ? "当前还没有可展示的分组表达。" : "There is no available group overlay to show yet."}</p>
      )}
      <ListGroupSections module={module} locale={locale} />
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

function StateSpectrumRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const isZh = locale === "zh";
  const bands = [
    { key: "stable_expression", label: isZh ? "更稳时" : "More stable" },
    { key: "average_expression", label: isZh ? "日常自动反应" : "Everyday pattern" },
    { key: "strained_expression", label: isZh ? "压力叠加时" : "Under strain" },
  ].filter((entry) => moduleText(module, entry.key));

  return (
    <ModuleCard title={localizedModuleTitle(module.moduleKey, locale)} testId={`enneagram-module-${module.moduleKey}`}>
      <div className="grid gap-3">
        {bands.map((band) => (
          <div key={band.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{band.label}</p>
            <p className="m-0 mt-2 text-sm text-slate-700">{moduleText(module, band.key)}</p>
          </div>
        ))}
      </div>
      {moduleText(module, "recovery_action") ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{isZh ? "恢复动作" : "Recovery action"}</p>
          <p className="m-0 mt-2 text-sm text-emerald-900">{moduleText(module, "recovery_action")}</p>
        </div>
      ) : null}
      {moduleText(module, "type_recovery_action") ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{isZh ? "主类型恢复动作" : "Type recovery action"}</p>
          <p className="m-0 mt-2 text-sm text-emerald-900">{moduleText(module, "type_recovery_action")}</p>
        </div>
      ) : null}
      {moduleText(module, "stress_signal") ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "压力信号" : "Stress signal"}</p>
          <p className="m-0 mt-2 text-sm text-slate-700">{moduleText(module, "stress_signal")}</p>
        </div>
      ) : null}
      {moduleText(module, "growth_principle") ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "成长原则" : "Growth principle"}</p>
          <p className="m-0 mt-2 text-sm text-slate-700">{moduleText(module, "growth_principle")}</p>
        </div>
      ) : null}
      {moduleText(module, "thirty_day_experiment") ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">{isZh ? "30 天实验" : "30-day experiment"}</p>
          <p className="m-0 mt-2 text-sm text-sky-900">{moduleText(module, "thirty_day_experiment")}</p>
        </div>
      ) : null}
      <ListGroupSections module={module} locale={locale} />
      {moduleText(module, "disclaimer") ? <p className="m-0 text-xs text-slate-500">{moduleText(module, "disclaimer")}</p> : null}
      <ModuleProvenance
        module={module}
        locale={locale}
        extraHint={isZh ? "不硬判 health level" : "Not a hard health-level judgement"}
      />
    </ModuleCard>
  );
}

function PlaceholderCardRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const title = localizedModuleTitle(module.moduleKey, locale);
  const reason = moduleText(module, "reason");

  return (
    <ModuleCard title={title} testId={`enneagram-module-${module.moduleKey}`}>
      <p className="m-0">{reason || (locale === "zh" ? "当前仍作为占位显示。": "This module is currently a placeholder.")}</p>
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

function SampleReportRenderer({ module, locale }: { module: EnneagramReportV2Module; locale: Locale }) {
  const isZh = locale === "zh";
  const topTypes = moduleArray(module, "top_types").length > 0
    ? moduleArray(module, "top_types").map((item) => typeRefLabel(item)).filter(Boolean)
    : Array.isArray(module.content.top_types)
      ? (module.content.top_types as unknown[]).map((item) => typeRefLabel(item)).filter(Boolean)
      : [];

  return (
    <ModuleCard title={localizedModuleTitle(module.moduleKey, locale)} testId="enneagram-module-sample-report-link">
      <div className="flex flex-wrap items-center gap-2">
        {moduleText(module, "sample_type") ? (
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {moduleText(module, "sample_type")}
          </span>
        ) : null}
        {moduleText(module, "form_code") ? (
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            {moduleText(module, "form_code")}
          </span>
        ) : null}
      </div>
      {moduleText(module, "short_summary") ? <p className="m-0">{moduleText(module, "short_summary")}</p> : null}
      {moduleText(module, "page_1_preview") ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "首页预览" : "Page 1 preview"}</p>
          <p className="m-0 mt-2 text-sm text-slate-700">{moduleText(module, "page_1_preview")}</p>
        </div>
      ) : null}
      {topTypes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topTypes.map((typeCode) => (
            <span key={typeCode} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
              {typeCode}
            </span>
          ))}
        </div>
      ) : null}
      {moduleText(module, "method_boundary") ? <p className="m-0 text-xs text-slate-500">{moduleText(module, "method_boundary")}</p> : null}
      {moduleText(module, "public_url_slug") ? <p className="m-0 text-xs text-slate-400">{moduleText(module, "public_url_slug")}</p> : null}
      <ModuleProvenance module={module} locale={locale} />
    </ModuleCard>
  );
}

type ObservationRendererProps = {
  module: EnneagramReportV2Module;
  viewModel: EnneagramResultViewModel;
  locale: Locale;
  state: EnneagramObservationStateV1 | null;
  loading: boolean;
  error: string | null;
  busyAction: "assign" | "day3" | "day7" | null;
  onAssign: () => Promise<void>;
  onSubmitDay3: (payload: EnneagramObservationDay3Payload) => Promise<void>;
  onSubmitDay7: (payload: EnneagramObservationDay7Payload) => Promise<void>;
};

function ObservationModuleRenderer({
  module,
  viewModel,
  locale,
  state,
  loading,
  error,
  busyAction,
  onAssign,
  onSubmitDay3,
  onSubmitDay7,
}: ObservationRendererProps) {
  const isZh = locale === "zh";
  const assigned = isObservationAssigned(state);
  const tasks =
    state?.tasks && state.tasks.length > 0
      ? state.tasks
      : moduleArray(module, "steps").map((step) => ({
          day: typeof step.day === "number" ? step.day : Number(step.day ?? Number.NaN),
          phase: safePublicText(step.phase) || null,
          prompt: safePublicText(step.prompt) || null,
          suggested_next_action: safePublicText(step.suggested_next_action) || null,
        }));
  const progress = state?.observation_completion_rate ?? 0;
  const currentFormRetakeHref = buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, viewModel.formCode);
  const fc144Href = buildEnneagramTakeHref(
    SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
    locale,
    "enneagram_forced_choice_144"
  );

  const [day3Form, setDay3Form] = useState<EnneagramObservationDay3Payload>({
    more_like: "top1",
    evidence_sentence: "",
    confidence_self_rating: 3,
    scene_type: "work",
  });
  const [day7Form, setDay7Form] = useState<EnneagramObservationDay7Payload>({
    final_resonance: "top1",
    user_confirmed_type: null,
    wants_fc144: false,
    wants_retake_same_form: false,
    user_disagreed_reason: null,
  });
  const hasSeparateFeedbackModule = Boolean(
    viewModel.moduleMap.resonance_feedback_placeholder &&
      viewModel.moduleMap.resonance_feedback_placeholder.visibility !== "collapsed"
  );
  const feedbackContent = !assigned ? (
    <p className="m-0 text-sm text-slate-600">
      {isZh ? "请先启动 7 天观察，再提交 Day3 与 Day7 反馈。" : "Start the 7-day observation before submitting Day 3 and Day 7 feedback."}
    </p>
  ) : (
    <div className="space-y-6">
      {state?.day3_observation_feedback ? (
        <div data-testid="enneagram-observation-day3-summary" className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-sm font-semibold text-slate-800">{isZh ? "Day3 feedback 已记录" : "Day 3 feedback recorded"}</p>
          <p className="m-0 text-sm text-slate-600">
            {safePublicText(state.day3_observation_feedback.more_like)} · {safePublicText(state.day3_observation_feedback.scene_type)}
          </p>
        </div>
      ) : (
        <form
          data-testid="enneagram-observation-day3-form"
          className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmitDay3(day3Form);
          }}
        >
          <p className="m-0 text-sm font-semibold text-slate-800">Day3 feedback</p>
          <label className="block space-y-1 text-sm">
            <span>{isZh ? "更像谁" : "More like"}</span>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={day3Form.more_like}
              onChange={(event) => setDay3Form((current) => ({ ...current, more_like: event.target.value as EnneagramObservationDay3Payload["more_like"] }))}
            >
              <option value="top1">top1</option>
              <option value="top2">top2</option>
              <option value="unclear">unclear</option>
              <option value="other">other</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>{isZh ? "证据句" : "Evidence sentence"}</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={day3Form.evidence_sentence}
              onChange={(event) => setDay3Form((current) => ({ ...current, evidence_sentence: event.target.value }))}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-sm">
              <span>{isZh ? "自评把握度" : "Confidence self-rating"}</span>
              <input
                type="number"
                min={1}
                max={5}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                value={day3Form.confidence_self_rating}
                onChange={(event) =>
                  setDay3Form((current) => ({
                    ...current,
                    confidence_self_rating: Number(event.target.value || 1),
                  }))
                }
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>{isZh ? "场景" : "Scene type"}</span>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                value={day3Form.scene_type}
                onChange={(event) => setDay3Form((current) => ({ ...current, scene_type: event.target.value as EnneagramObservationDay3Payload["scene_type"] }))}
              >
                <option value="work">work</option>
                <option value="relationship">relationship</option>
                <option value="pressure">pressure</option>
                <option value="alone">alone</option>
                <option value="other">other</option>
              </select>
            </label>
          </div>
          <Button type="submit" disabled={busyAction === "day3"}>
            {busyAction === "day3" ? (isZh ? "提交中..." : "Submitting...") : "Day3 feedback"}
          </Button>
        </form>
      )}

      {state?.day7_resonance_feedback ? (
        <div data-testid="enneagram-observation-day7-summary" className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="m-0 text-sm font-semibold text-slate-800">Day7 resonance feedback</p>
          {state.user_confirmed_type ? (
            <>
              <p data-testid="enneagram-observation-user-confirmed" className="m-0 text-sm text-slate-700">
                {isZh ? "你的自我观察确认" : "Your self-observation confirmation"} · {state.user_confirmed_type}
              </p>
              <p className="m-0 text-xs text-slate-500">
                {isZh
                  ? "这不会静默改写本次测量结果。它会作为你的自我观察证据记录在历史中。"
                  : "This does not silently rewrite the measurement result. It is recorded in history as self-observation evidence."}
              </p>
            </>
          ) : null}
        </div>
      ) : (
        <form
          data-testid="enneagram-observation-day7-form"
          className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmitDay7(day7Form);
          }}
        >
          <p className="m-0 text-sm font-semibold text-slate-800">Day7 resonance feedback</p>
          <label className="block space-y-1 text-sm">
            <span>{isZh ? "最终共鸣" : "Final resonance"}</span>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={day7Form.final_resonance}
              onChange={(event) => setDay7Form((current) => ({ ...current, final_resonance: event.target.value as EnneagramObservationDay7Payload["final_resonance"] }))}
            >
              <option value="top1">top1</option>
              <option value="top2">top2</option>
              <option value="top3">top3</option>
              <option value="other">other</option>
              <option value="still_uncertain">still_uncertain</option>
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>{isZh ? "自我观察确认号码" : "Self-observed type confirmation"}</span>
            <select
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={day7Form.user_confirmed_type ?? ""}
              onChange={(event) =>
                setDay7Form((current) => ({
                  ...current,
                  user_confirmed_type: event.target.value ? event.target.value : null,
                }))
              }
            >
              <option value="">{isZh ? "暂不确认" : "Not confirming yet"}</option>
              {Array.from({ length: 9 }, (_, index) => String(index + 1)).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm">
            <span>{isZh ? "补充说明" : "Disagreement note"}</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              value={day7Form.user_disagreed_reason ?? ""}
              onChange={(event) =>
                setDay7Form((current) => ({
                  ...current,
                  user_disagreed_reason: event.target.value || null,
                }))
              }
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={day7Form.wants_fc144}
              onChange={(event) => setDay7Form((current) => ({ ...current, wants_fc144: event.target.checked }))}
            />
            {isZh ? "我想补做 FC144 深度版" : "I want the FC144 follow-up"}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={day7Form.wants_retake_same_form}
              onChange={(event) =>
                setDay7Form((current) => ({ ...current, wants_retake_same_form: event.target.checked }))
              }
            />
            {isZh ? "我想重测同一题型" : "I want to retake the same form"}
          </label>
          <Button type="submit" disabled={busyAction === "day7"}>
            {busyAction === "day7" ? (isZh ? "提交中..." : "Submitting...") : "Day7 resonance feedback"}
          </Button>
        </form>
      )}
    </div>
  );

  if (module.moduleKey === "seven_day_observation") {
    return (
      <ModuleCard title={isZh ? "7 天观察任务" : "7-day observation"} testId="enneagram-module-seven-day-observation">
        <p data-testid="enneagram-observation-guidance" className="m-0">
          {observationGuidanceCopy(viewModel, locale)}
        </p>

        {error ? <Alert data-testid="enneagram-observation-error">{error}</Alert> : null}

        {loading ? <p className="m-0 text-sm text-slate-500">{isZh ? "正在读取观察状态..." : "Loading observation state..."}</p> : null}

        {!assigned ? (
          <div className="space-y-3">
            <p className="m-0 text-sm text-slate-600">
              {isZh
                ? "观察任务不会自动开始。你可以先继续阅读结果页，再决定是否启动这 7 天观察。"
                : "The observation flow does not auto-start. You can keep reading the report and start the 7-day observation when ready."}
            </p>
            <Button
              type="button"
              onClick={() => void onAssign()}
              disabled={busyAction === "assign"}
              data-testid="enneagram-observation-assign"
            >
              {busyAction === "assign" ? (isZh ? "正在启动..." : "Starting...") : isZh ? "开始 7 天观察" : "Start 7-day observation"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {isZh ? "观察进度" : "Observation progress"}
              </p>
              <p data-testid="enneagram-observation-progress" className="m-0 mt-2 text-sm text-slate-800">
                {progress}%
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
              </div>
              {state?.status ? (
                <p className="m-0 mt-3 text-xs uppercase tracking-[0.12em] text-slate-500">{state.status}</p>
              ) : null}
            </div>

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={`${task.day ?? index}-${task.phase ?? ""}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {isZh ? "第" : "Day "} {task.day ?? index + 1}
                    {isZh ? "天" : ""}
                    {task.phase ? ` · ${task.phase}` : ""}
                  </p>
                  {task.prompt ? <p className="m-0 mt-2 text-sm text-slate-700">{task.prompt}</p> : null}
                  {task.suggested_next_action ? (
                    <p className="m-0 mt-2 text-xs text-slate-500">
                      {observationActionLabel(task.suggested_next_action, locale)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            {!hasSeparateFeedbackModule ? <div data-testid="enneagram-observation-feedback-inline">{feedbackContent}</div> : null}
          </div>
        )}
      </ModuleCard>
    );
  }

  if (module.moduleKey === "resonance_feedback_placeholder") {
    return (
      <ModuleCard
        title={isZh ? "Day3 / Day7 反馈" : "Day 3 / Day 7 feedback"}
        testId="enneagram-module-resonance-feedback-placeholder"
      >
        {error ? <Alert data-testid="enneagram-observation-error">{error}</Alert> : null}
        {feedbackContent}
      </ModuleCard>
    );
  }

  return (
    <ModuleCard title={isZh ? "建议下一步" : "Recommended next step"} testId="enneagram-module-form-recommendation">
      {error ? <Alert data-testid="enneagram-observation-error">{error}</Alert> : null}
      <p data-testid="enneagram-observation-next-action" className="m-0">
        {observationActionLabel(state?.suggested_next_action ?? moduleText(module, "recommendation_key"), locale)}
      </p>
      <p className="m-0 text-sm text-slate-600">
        {state?.suggested_next_action === "do_fc144"
          ? isZh
            ? "如果你想继续辨析，可以补做 FC144 深度版。"
            : "If you want a follow-up distinction pass, FC144 is available."
          : state?.suggested_next_action === "retest_same_form"
            ? isZh
              ? "更适合在状态稳定时重测当前题型。"
              : "A same-form retake is the safer next step in a steadier state."
            : moduleText(module, "recommended_first_action") || nextActionHint(viewModel, locale)}
      </p>
      <div className="flex flex-wrap gap-2">
        {state?.suggested_next_action === "do_fc144" ? (
          <Link href={fc144Href} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "查看 FC144 深度版" : "Open FC144 form"}
          </Link>
        ) : null}
        {state?.suggested_next_action === "retest_same_form" ? (
          <Link href={currentFormRetakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重测当前题型" : "Retake current form"}
          </Link>
        ) : null}
      </div>
      {state?.user_confirmed_type ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p data-testid="enneagram-observation-user-confirmed" className="m-0 text-sm text-slate-700">
            {isZh ? "你的自我观察确认" : "Your self-observation confirmation"} · {state.user_confirmed_type}
          </p>
          <p className="m-0 mt-2 text-xs text-slate-500">
            {isZh
              ? "这不会静默改写本次测量结果。它会作为你的自我观察证据记录在历史中。"
              : "This does not silently rewrite the measurement result. It is recorded in history as self-observation evidence."}
          </p>
        </div>
      ) : null}
    </ModuleCard>
  );
}

function renderScoreBars(items: EnneagramTypeRow[]) {
  return (
    <div className="space-y-3">
      {items.map((row) => {
        const width = normalizeBarWidth(row.score);
        return (
          <div key={row.code} className="grid gap-2 sm:grid-cols-[96px_1fr_56px] sm:items-center">
            <div className="text-sm font-semibold text-slate-800">{row.label}</div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              {width !== null ? <div className="h-full rounded-full bg-[var(--fm-trust-blue)]" style={{ width: `${width}%` }} /> : null}
            </div>
            <div className="text-right text-sm text-slate-600">{formatScore(row.score)}</div>
          </div>
        );
      })}
    </div>
  );
}

function renderGenericSummary(module: EnneagramReportV2Module, locale: Locale) {
  const title = moduleText(module, "title");
  const body = moduleText(module, "body");
  const typeSummary = moduleText(module, "type_summary");
  const value = moduleText(module, "value");
  const status = moduleText(module, "status");
  const reason = moduleText(module, "reason");
  const lines = [body, typeSummary, value].filter(Boolean);

  return (
    <ModuleCard
      title={title || (locale === "zh" ? "模块占位" : "Module placeholder")}
      testId={`enneagram-module-${module.moduleKey}`}
    >
      {lines.length > 0 ? lines.map((line) => <p key={line} className="m-0">{line}</p>) : null}
      {status || reason ? (
        <p className="m-0 text-xs text-slate-500">
          {[status, reason].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </ModuleCard>
  );
}

type ObservationSurfaceState = {
  state: EnneagramObservationStateV1 | null;
  loading: boolean;
  error: string | null;
  busyAction: "assign" | "day3" | "day7" | null;
  onAssign: () => Promise<void>;
  onSubmitDay3: (payload: EnneagramObservationDay3Payload) => Promise<void>;
  onSubmitDay7: (payload: EnneagramObservationDay7Payload) => Promise<void>;
};

function renderModule(
  module: EnneagramReportV2Module,
  viewModel: EnneagramResultViewModel,
  locale: Locale,
  observation: ObservationSurfaceState | null
): React.ReactNode {
  const isZh = locale === "zh";

  if (module.kind === "asset_backed_card") {
    return <AssetBackedCardRenderer module={module} locale={locale} />;
  }

  switch (module.moduleKey) {
    case "instant_summary": {
      const badge = formBadgeCopy(viewModel, locale);
      const topCandidates = moduleArray(module, "top_candidates");
      return (
        <Card
          data-testid="enneagram-v2-instant-summary"
          className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-emerald-50/50 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
        >
          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
                {isZh ? "九型人格" : "Enneagram"}
              </span>
              <span data-testid="enneagram-form-badge" className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {badge.label}
              </span>
              {viewModel.formSummaryLabel ? (
                <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                  {viewModel.formSummaryLabel}
                </span>
              ) : null}
            </div>

            <div className="space-y-2">
              <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{stateLead(viewModel, locale)}</h2>
              <p data-testid="enneagram-v2-summary-body" className="m-0 text-base leading-8 text-slate-700">
                {moduleText(module, "body") || viewModel.summary}
              </p>
              <p className="m-0 text-sm font-medium text-slate-600">
                {isZh ? "置信" : "Confidence"} · {moduleText(module, "confidence_level") || viewModel.confidenceLabel || "n/a"}
              </p>
            </div>

            {topCandidates.length > 0 ? (
              <div data-testid="enneagram-v2-summary-top-candidates" className="flex flex-wrap gap-2">
                {topCandidates.map((candidate, index) => (
                  <span key={`${candidate.type ?? index}`} className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700">
                    #{index + 1} · {safePublicText(candidate.type) || "?"}
                    {typeof candidate.display_score === "number" && Number.isFinite(candidate.display_score)
                      ? ` · ${formatScore(candidate.display_score)}`
                      : ""}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "解释状态" : "Interpretation state"}</p>
                <p data-testid="enneagram-v2-interpretation-scope" className="m-0 mt-2 text-sm text-slate-700">
                  {viewModel.interpretationScope === "diffuse"
                    ? isZh ? "分散型结果" : "Diffuse result"
                    : viewModel.interpretationScope === "close_call"
                      ? isZh ? "接近型结果" : "Close-call result"
                      : viewModel.interpretationScope === "low_quality"
                        ? isZh ? "低质量结果" : "Lower-quality result"
                        : isZh ? "清晰型结果" : "Clear result"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "下一步" : "Next action"}</p>
                <p className="m-0 mt-2 text-sm text-slate-700">{nextActionHint(viewModel, locale)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    case "top3_cards": {
      const cards = moduleArray(module, "cards").map((card, index) => ({
        row: {
          code: safePublicText(card.type),
          label: firstSafePublicText(card.type_name_en, card.type_name_cn, card.type),
          score: typeof card.display_score === "number" ? card.display_score : Number(card.display_score ?? Number.NaN),
          rank: index + 1,
          candidateRole: safePublicText(card.candidate_role),
          summary: firstSafePublicText(card.core_logic, card.surface_impression),
        } satisfies EnneagramTypeRow,
        coreLogic: safePublicText(card.core_logic),
        workSummary: safePublicText(card.work_summary),
      }));

      return (
        <ModuleCard title={isZh ? "Top 3 候选" : "Top 3 candidates"} testId="enneagram-module-top3-cards">
          <div className="grid gap-3 md:grid-cols-3">
            {cards.map(({ row, coreLogic, workSummary }) => (
              <div key={row.code} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  #{row.rank} · {row.candidateRole || (isZh ? "候选" : "Candidate")}
                </p>
                <h3 className="m-0 mt-2 text-lg font-semibold text-slate-900">{row.label || row.code}</h3>
                {row.score !== null && Number.isFinite(row.score) ? (
                  <p className="m-0 mt-1 text-sm text-slate-600">{formatScore(row.score)}</p>
                ) : null}
                {coreLogic ? <p className="m-0 mt-3 text-sm text-slate-700">{coreLogic}</p> : null}
                {workSummary ? <p className="m-0 mt-2 text-xs text-slate-500">{workSummary}</p> : null}
              </div>
            ))}
          </div>
        </ModuleCard>
      );
    }
    case "all9_profile": {
      const items = moduleArray(module, "items").map((item, index) => ({
        code: firstSafePublicText(item.type, item.code),
        label: firstSafePublicText(item.type_name_en, item.type_name_cn, item.label, item.type),
        score:
          typeof item.score_display === "number"
            ? item.score_display
            : typeof item.score_norm === "number"
              ? item.score_norm * 100
              : Number(item.score_display ?? item.score_norm ?? Number.NaN),
        rank: typeof item.rank === "number" ? item.rank : index + 1,
      }));
      const rows = items.map((item) => ({
        code: item.code,
        label: item.label || item.code,
        score: Number.isFinite(item.score) ? item.score : null,
        rank: item.rank,
      }));

      return (
        <ModuleCard title={isZh ? "All 9 轮廓" : "All 9 profile"} testId="enneagram-module-all9-profile">
          <div data-testid="enneagram-v2-all9-profile-count" className="hidden">
            {rows.length}
          </div>
          {renderScoreBars(rows)}
        </ModuleCard>
      );
    }
    case "confidence_band_card":
      return (
        <ModuleCard title={isZh ? "置信带" : "Confidence band"} testId="enneagram-module-confidence-band-card">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "置信等级" : "Confidence level"}</p>
              <p className="m-0 mt-1 text-sm text-slate-700">{moduleText(module, "confidence_label") || moduleText(module, "confidence_level") || "n/a"}</p>
            </div>
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{isZh ? "结果结构" : "Profile shape"}</p>
              <p className="m-0 mt-1 text-sm text-slate-700">
                {viewModel.interpretationScope === "diffuse"
                  ? isZh ? "分散型结果" : "Diffuse result"
                  : viewModel.interpretationScope === "close_call"
                    ? isZh ? "接近型结果" : "Close-call result"
                    : viewModel.interpretationScope === "low_quality"
                      ? isZh ? "低质量结果" : "Lower-quality result"
                      : isZh ? "清晰型结果" : "Clear result"}
              </p>
            </div>
          </div>
          <p className="m-0 text-xs text-slate-500">
            {isZh ? "仅在当前 form 的分数空间内解释，不用于跨 form 比较。" : "Interpret within the current form score space only, not across forms."}
          </p>
        </ModuleCard>
      );
    case "dominance_gap_card":
      return (
        <ModuleCard title={isZh ? "优势差距" : "Dominance gap"} testId="enneagram-module-dominance-gap-card">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { key: "dominance_gap_abs", label: isZh ? "绝对差值" : "Absolute gap" },
              { key: "dominance_gap_pct", label: isZh ? "展示百分差" : "Display pct gap" },
              { key: "normalized_gap", label: isZh ? "标准化差值" : "Normalized gap" },
              { key: "profile_entropy", label: isZh ? "轮廓熵" : "Profile entropy" },
            ].map((item) => (
              <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
                <p className="m-0 mt-2 text-sm text-slate-800">{safePublicText(module.content[item.key]) || "n/a"}</p>
              </div>
            ))}
          </div>
          <p className="m-0 text-xs text-slate-500">
            {isZh ? "仅在当前 form 的分数空间内解释，不用于跨 form 比较。" : "Interpret within the current form score space only, not across forms."}
          </p>
        </ModuleCard>
      );
    case "close_call_card": {
      const pair = module.content.pair as Record<string, unknown> | undefined;
      const pairEntry = module.content.pair_entry as Record<string, unknown> | undefined;
      const pairTypeA = typeRefLabel(pair?.type_a);
      const pairTypeB = typeRefLabel(pair?.type_b);
      const triggerReason = safePublicText(pair?.trigger_reason);
      const coreMotivationDifference = safePublicText(pairEntry?.core_motivation_difference);
      const stressReactionDifference = safePublicText(pairEntry?.stress_reaction_difference);
      return (
        <ModuleCard title={isZh ? "Close call 辨析" : "Close-call differentiation"} testId="enneagram-module-close-call-card">
          <p className="m-0 text-sm text-slate-700">
            {pairTypeA || "?"} vs {pairTypeB || "?"}
          </p>
          {triggerReason ? <p className="m-0 text-sm text-slate-700">{triggerReason}</p> : null}
          {coreMotivationDifference ? <p className="m-0">{coreMotivationDifference}</p> : null}
          {stressReactionDifference ? <p className="m-0 text-sm text-slate-600">{stressReactionDifference}</p> : null}
          {!pairEntry ? (
            <p className="m-0 text-xs text-slate-500">{isZh ? "当前只提供 scaffold 内容。" : "This currently uses scaffold content."}</p>
          ) : null}
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    }
    case "type_deep_dive_summary":
      return <TypeDeepDiveSummaryRenderer module={module} locale={locale} />;
    case "work_style_summary":
    case "collaboration_strengths":
    case "collaboration_friction":
    case "leadership_pattern":
    case "managed_by_others":
    case "relationship_need":
    case "conflict_script":
    case "communication_manual":
      return <ScenarioCardRenderer module={module} locale={locale} />;
    case "growth_axis":
    case "stress_trigger":
    case "relationship_strengths":
    case "misread_by_others":
      return <ValueCardRenderer module={module} locale={locale} />;
    case "strength_expression":
    case "cost_expression":
      return <GroupOverlayRenderer module={module} locale={locale} />;
    case "recovery_action":
    case "state_spectrum":
      return <StateSpectrumRenderer module={module} locale={locale} />;
    case "workplace_trigger_points":
      return <ValueCardRenderer module={module} locale={locale} />;
    case "context_mode_placeholder":
    case "history_share_retake_placeholder":
    case "arrow_growth_reference_placeholder":
      return <PlaceholderCardRenderer module={module} locale={locale} />;
    case "blind_spot_card":
    case "blind_spot_in_relationship":
      return (
        <ModuleCard title={isZh ? "盲点提示" : "Blind spot"} testId={`enneagram-module-${module.moduleKey}`}>
          <p className="m-0">{isZh ? "当前没有稳定盲点判定。" : "No stable blind-spot judgement is available yet."}</p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    case "center_summary":
    case "stance_summary":
    case "harmonic_summary":
      return null;
    case "wing_hint_visual":
      return (
        <ModuleCard title={isZh ? "邻位倾向参考" : "Adjacent wing reference"} testId="enneagram-module-wing-hint-visual">
          <p className="m-0">
            {isZh ? "左邻位" : "Left"}: {typeRefLabel(module.content.left) || "n/a"} · {isZh ? "右邻位" : "Right"}:{" "}
            {typeRefLabel(module.content.right) || "n/a"}
          </p>
          {moduleText(module, "strength") ? <p className="m-0">{isZh ? "强度" : "Strength"} · {moduleText(module, "strength")}</p> : null}
          <p className="m-0 text-xs text-slate-500">
            {moduleText(module, "boundary_copy") ||
              (isZh ? "这里只是邻位倾向参考，不是正式 wing 判定。" : "This is an adjacent-wing reference, not a formal wing judgement.")}
          </p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    case "methodology_boundary_card":
    case "method_boundary": {
      const badge = module.content.form_badge as Record<string, unknown> | undefined;
      const badgeLabel = safePublicText(badge?.label);
      return (
        <ModuleCard title={isZh ? "方法边界" : "Method boundary"} testId={`enneagram-module-${module.moduleKey}`}>
          {badgeLabel ? <p className="m-0 text-sm font-semibold text-slate-800">{badgeLabel}</p> : null}
          {moduleText(module, "methodology_copy") ? <p className="m-0">{moduleText(module, "methodology_copy")}</p> : null}
          {moduleText(module, "score_space_boundary") ? <p className="m-0">{moduleText(module, "score_space_boundary")}</p> : null}
          {moduleText(module, "non_diagnostic_boundary") ? <p className="m-0 text-sm text-slate-600">{moduleText(module, "non_diagnostic_boundary")}</p> : null}
          <p className="m-0 text-xs text-slate-500">
            {isZh ? "同模型，不同分数空间；跨 form 结果不直接可比。" : "Same model, different score spaces; cross-form results are not directly comparable."}
          </p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    }
    case "diffuse_boundary":
      return (
        <ModuleCard title={moduleText(module, "title") || (isZh ? "分散边界" : "Diffuse boundary")} testId="enneagram-module-diffuse-boundary">
          <p className="m-0">{isZh ? "当前结果分散，需要更多观察。" : "This result is diffuse and needs more observation."}</p>
          <p className="m-0 text-sm text-slate-600">
            {isZh ? "分布较分散，建议先阅读 Top3 与方法边界。" : "The profile is diffuse, so start with Top 3 and the method boundary."}
          </p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    case "low_quality_boundary":
      return (
        <ModuleCard title={moduleText(module, "title") || (isZh ? "质量边界" : "Quality boundary")} testId="enneagram-module-low-quality-boundary">
          <p className="m-0">
            {isZh ? "当前结果的解释边界较宽，建议结合状态稳定后再阅读或重测。" : "This result has a wider interpretation boundary. Read it with caution or retake in a steadier state."}
          </p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    case "seven_day_observation": {
      if (observation) {
        return <ObservationModuleRenderer module={module} viewModel={viewModel} locale={locale} {...observation} />;
      }
      const steps = moduleArray(module, "steps");
      return (
        <ModuleCard title={isZh ? "七天观察" : "Seven-day observation"} testId="enneagram-module-seven-day-observation">
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={firstSafePublicText(step.day, step.phase) || "step"} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Day {safePublicText(step.day) || "?"} · {safePublicText(step.phase)}
                </p>
                {safePublicText(step.prompt) ? <p className="m-0 mt-2 text-sm text-slate-700">{safePublicText(step.prompt)}</p> : null}
              </div>
            ))}
          </div>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    }
    case "resonance_feedback_placeholder":
      if (observation) {
        return <ObservationModuleRenderer module={module} viewModel={viewModel} locale={locale} {...observation} />;
      }
      return (
        <ModuleCard
          title={isZh ? "Day3 / Day7 反馈" : "Day 3 / Day 7 feedback"}
          testId="enneagram-module-resonance-feedback-placeholder"
        >
          <p className="m-0">
            {isZh ? "当前 observation API 不可用，反馈入口稍后出现。" : "The live observation API is unavailable, so the feedback entry is deferred."}
          </p>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    case "sample_report_link":
      return <SampleReportRenderer module={module} locale={locale} />;
    case "technical_note_link": {
      const sections = moduleArray(module, "sections");
      const technicalNoteHref = resolveEnneagramTechnicalNoteHref(
        moduleText(module, "href") || moduleText(module, "path") || moduleText(module, "url"),
        locale
      );
      return (
        <ModuleCard title={moduleText(module, "label") || (isZh ? "技术说明" : "Technical note")} testId="enneagram-module-technical-note-link">
          {moduleText(module, "technical_note_version") ? (
            <p className="m-0 text-sm text-slate-700">
              {isZh ? "版本" : "Version"} · {moduleText(module, "technical_note_version")}
            </p>
          ) : null}
          {sections.length > 0 ? (
            <ul className="m-0 list-disc space-y-1 pl-5 text-sm text-slate-600">
              {sections.slice(0, 4).map((section) => (
                <li key={safePublicText(section.section_key) || safePublicText(section.title)}>
                  {firstSafePublicText(section.title, section.section_key)}
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href={technicalNoteHref}
            className={buttonVariants({ variant: "outline" })}
            data-testid="enneagram-technical-note-link"
          >
            {isZh ? "阅读技术说明" : "Open Technical Note"}
          </Link>
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    }
    case "form_recommendation":
      if (observation) {
        return <ObservationModuleRenderer module={module} viewModel={viewModel} locale={locale} {...observation} />;
      }
      return (
        <ModuleCard title={isZh ? "建议下一步" : "Recommended next step"} testId="enneagram-module-form-recommendation">
          <p className="m-0">{observationActionLabel(moduleText(module, "recommendation_key") || "no_action", locale)}</p>
          {moduleText(module, "recommended_first_action") ? <p className="m-0 text-sm text-slate-600">{moduleText(module, "recommended_first_action")}</p> : null}
          <ModuleProvenance module={module} locale={locale} />
        </ModuleCard>
      );
    default:
      if (module.kind === "cards_grid" || module.kind === "profile_chart" || module.kind === "summary_card" || module.kind === "metrics_card") {
        return renderGenericSummary(module, locale);
      }
      return (
        <ModuleCard title={localizedModuleTitle(module.moduleKey, locale)} testId={`enneagram-module-${module.moduleKey}`}>
          <p className="m-0">
            {isZh ? "当前模块使用通用渲染。" : "This module is using the generic renderer."}
          </p>
        </ModuleCard>
      );
  }
}

function PageSection({
  page,
  viewModel,
  locale,
  observation,
}: {
  page: EnneagramReportV2Page;
  viewModel: EnneagramResultViewModel;
  locale: Locale;
  observation: ObservationSurfaceState | null;
}) {
  const visibleModules = page.modules.filter(
    (module) => module.visibility === "visible" && !SUPPRESSED_PUBLIC_MODULE_KEYS.has(module.moduleKey)
  );

  return (
    <section
      data-testid={`enneagram-v2-page-${page.pageKey}`}
      className="space-y-4 border-t border-slate-200 pt-8 first:border-t-0 first:pt-0"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{page.pageKey.replace(/_/g, " ")}</p>
        <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-950">{page.title}</h2>
        {page.purpose ? <p className="m-0 max-w-3xl text-sm leading-7 text-slate-600">{page.purpose}</p> : null}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {visibleModules.map((module) => (
          <div
            key={module.moduleKey}
            className={module.moduleKey === "instant_summary" ? "xl:col-span-2" : ""}
            data-testid={`enneagram-v2-page-${page.pageKey}-module-${module.moduleKey}`}
          >
            {renderModule(module, viewModel, locale, observation)}
          </div>
        ))}
      </div>
    </section>
  );
}

function LegacyEnneagramResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  viewModel,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  viewModel: EnneagramResultViewModel;
}) {
  const isZh = locale === "zh";
  const primaryType = viewModel.primaryType;
  const retakeHref = buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, viewModel.formCode);
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const topTypes = viewModel.topTypes;

  return (
    <div
      data-testid="enneagram-result-shell"
      data-domain-id="self_understanding"
      data-domain-role="supporting"
      data-domain-envelope-state="metadata_only"
      className="space-y-8"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/60 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              {isZh ? "九型人格" : "Enneagram"}
            </span>
            {viewModel.formSummaryLabel ? (
              <span
                data-testid="enneagram-form-summary"
                className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {viewModel.formSummaryLabel}
              </span>
            ) : null}
            <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {reportLocked ? (isZh ? "预览访问" : "Preview access") : isZh ? "正式结果" : "Formal result"}
            </span>
            {viewModel.qualityLevel ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "质量" : "Quality"} · {viewModel.qualityLevel.toUpperCase()}
              </span>
            ) : null}
            {viewModel.confidenceLabel ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "置信" : "Confidence"} · {viewModel.confidenceLabel}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {primaryType ? primaryType.label : isZh ? "九型人格结果" : "Enneagram result"}
            </h2>
            {primaryType?.code ? (
              <p data-testid="enneagram-primary-type" className="m-0 text-lg font-medium text-slate-700">
                {isZh ? "主型" : "Primary type"} · {primaryType.code}
              </p>
            ) : null}
            {viewModel.summary ? (
              <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{viewModel.summary}</p>
            ) : null}
          </div>

          {topTypes.length > 0 ? (
            <div data-testid="enneagram-top-types" className="flex flex-wrap gap-2">
              {topTypes.map((type) => (
                <TypeChip key={type.code} type={type} />
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <LegacyTypeVector rows={viewModel.typeVector} />

      <Card data-testid="enneagram-actions-card" className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-950">{isZh ? "继续使用这个结果" : "Continue with this result"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {pdfAttemptId ? (
            <div data-testid="enneagram-pdf-entry">
              <PdfDownloadButton
                attemptId={pdfAttemptId}
                locked={reportLocked}
                accessProjection={accessProjection}
                locale={locale}
                filenamePrefix="enneagram-report"
                safetyDisabled
                safetyDisabledLabel={isZh ? "PDF 暂不可用" : "PDF unavailable"}
                safetyDisabledReason={
                  isZh
                    ? "PDF 导出已安全暂停，避免私有结果链接进入文件页脚。"
                    : "PDF export is paused to keep private result links out of file footers."
                }
              />
            </div>
          ) : null}
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
        </CardContent>
      </Card>

      {viewModel.visibleSections.length > 0 ? (
        <div data-testid="enneagram-sections" className="space-y-4">
          {viewModel.visibleSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "section"}
              section={section}
              locked={false}
              locale={locale}
              scaleCode="ENNEAGRAM"
            />
          ))}
        </div>
      ) : null}

      {viewModel.lockedSections.length > 0 ? (
        <div data-testid="enneagram-locked-sections" className="space-y-4">
          {viewModel.lockedSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "locked-section"}
              section={section}
              locked
              locale={locale}
              scaleCode="ENNEAGRAM"
              ctaLabel={isZh ? "解锁完整报告" : "Unlock full report"}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function EnneagramResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  viewModel,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  viewModel: EnneagramResultViewModel;
}) {
  const reportV2 = viewModel.reportV2;
  const retakeHref = buildEnneagramTakeHref(SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM, locale, viewModel.formCode);
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const isZh = locale === "zh";
  const shouldLoadObservation = Boolean(
    reportV2?.pages.some((page) =>
      page.modules.some((module) =>
        ["seven_day_observation", "resonance_feedback_placeholder", "form_recommendation"].includes(module.moduleKey)
      )
    )
  );
  const [observationState, setObservationState] = useState<EnneagramObservationStateV1 | null>(null);
  const [observationLoading, setObservationLoading] = useState(false);
  const [observationError, setObservationError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<"assign" | "day3" | "day7" | null>(null);

  useEffect(() => {
    if (!shouldLoadObservation) {
      setObservationState(null);
      setObservationError(null);
      setObservationLoading(false);
      return;
    }

    let active = true;
    setObservationLoading(true);
    setObservationError(null);

    void fetchEnneagramObservation({ attemptId })
      .then((response) => {
        if (!active) {
          return;
        }
        setObservationState(response.observation_state_v1 ?? null);
      })
      .catch((cause) => {
        if (!active) {
          return;
        }
        setObservationError(cause instanceof Error ? cause.message : isZh ? "观察状态读取失败。" : "Failed to load observation state.");
      })
      .finally(() => {
        if (active) {
          setObservationLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [attemptId, isZh, shouldLoadObservation]);

  const observation = shouldLoadObservation
    ? {
        state: observationState,
        loading: observationLoading,
        error: observationError,
        busyAction,
        onAssign: async () => {
          setBusyAction("assign");
          setObservationError(null);
          try {
            const response = await assignEnneagramObservation({ attemptId });
            setObservationState(response.observation_state_v1 ?? null);
          } catch (cause) {
            setObservationError(cause instanceof Error ? cause.message : isZh ? "启动观察失败。" : "Failed to start observation.");
          } finally {
            setBusyAction(null);
          }
        },
        onSubmitDay3: async (payload: EnneagramObservationDay3Payload) => {
          setBusyAction("day3");
          setObservationError(null);
          try {
            const response = await submitEnneagramObservationDay3({ attemptId, payload });
            setObservationState(response.observation_state_v1 ?? null);
          } catch (cause) {
            setObservationError(cause instanceof Error ? cause.message : isZh ? "Day3 feedback 提交失败。" : "Failed to submit Day 3 feedback.");
          } finally {
            setBusyAction(null);
          }
        },
        onSubmitDay7: async (payload: EnneagramObservationDay7Payload) => {
          setBusyAction("day7");
          setObservationError(null);
          try {
            const response = await submitEnneagramObservationDay7({ attemptId, payload });
            setObservationState(response.observation_state_v1 ?? null);
          } catch (cause) {
            setObservationError(cause instanceof Error ? cause.message : isZh ? "Day7 feedback 提交失败。" : "Failed to submit Day 7 feedback.");
          } finally {
            setBusyAction(null);
          }
        },
      }
    : null;

  if (!reportV2 || reportV2.pages.length === 0) {
    return (
      <LegacyEnneagramResultShell
        locale={locale}
        attemptId={attemptId}
        reportLocked={reportLocked}
        accessProjection={accessProjection}
        viewModel={viewModel}
      />
    );
  }

  return (
    <div
      data-testid="enneagram-result-shell"
      data-domain-id="self_understanding"
      data-domain-role="supporting"
      data-domain-envelope-state="metadata_only"
      className="space-y-8"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
      <div className="flex flex-wrap gap-2">
        {reportV2.pages.map((page) => (
          <span
            key={page.pageKey}
            className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
          >
            {page.title}
          </span>
        ))}
      </div>

      {reportV2.pages.map((page) => (
        <PageSection key={page.pageKey} page={page} viewModel={viewModel} locale={locale} observation={observation} />
      ))}

      <Card data-testid="enneagram-actions-card" className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-950">{isZh ? "继续使用这个结果" : "Continue with this result"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {pdfAttemptId ? (
            <div data-testid="enneagram-pdf-entry">
              <PdfDownloadButton
                attemptId={pdfAttemptId}
                locked={reportLocked}
                accessProjection={accessProjection}
                locale={locale}
                filenamePrefix="enneagram-report"
                safetyDisabled
                safetyDisabledLabel={isZh ? "PDF 暂不可用" : "PDF unavailable"}
                safetyDisabledReason={
                  isZh
                    ? "PDF 导出已安全暂停，避免私有结果链接进入文件页脚。"
                    : "PDF export is paused to keep private result links out of file footers."
                }
              />
            </div>
          ) : null}
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
