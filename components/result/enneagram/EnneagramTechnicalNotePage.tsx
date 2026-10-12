"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import {
  fetchEnneagramTechnicalNote,
  fetchRiasecTechnicalNote,
  type ScaleMetricDefinition,
  type ScaleTechnicalNoteDisclaimer,
  type ScaleTechnicalNoteResponse,
  type ScaleTechnicalNoteSection,
  type ScaleTechnicalNoteV1,
} from "@/lib/api/v0_3";
import {
  getEnneagramTechnicalNoteNotClaimedLabel,
  getEnneagramTechnicalNoteStatusLabel,
  isCanonicalEnneagramTechnicalNote,
} from "@/lib/enneagram/technicalNote";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

const REQUIRED_SECTION_ORDER = [
  "test_goal",
  "e105_fc144_forms",
  "score_space_boundary",
  "dominance_gap",
  "confidence_band",
  "close_call",
  "diffuse",
  "low_quality",
  "retake_stability",
  "e105_fc144_agreement",
  "resonance_feedback",
  "method_boundaries",
  "privacy",
  "measurement_boundary",
  "riasec_140_context",
  "quality_boundary",
  "snapshot_boundary",
  "career_examples_boundary",
  "feedback_boundary",
] as const;

const DATA_STATUS_ORDER = [
  "currently_operational",
  "collecting_data",
  "pending_sample",
  "partial",
  "planned",
  "unavailable",
  "not_claimed",
] as const;

type Props = {
  locale: Locale;
  testSlug: string;
  testTitle: string;
};

type TechnicalNotePageProps = Props & {
  fetchTechnicalNote: () => Promise<ScaleTechnicalNoteResponse>;
  pageTestId: string;
  testIdPrefix: string;
  heading: string;
  validateTechnicalNote?: (note: ScaleTechnicalNoteV1, locale: Locale) => boolean;
};

function normalizeDisclaimer(entry: ScaleTechnicalNoteDisclaimer | string): { key: string; label: string; copy: string } {
  if (typeof entry === "string") {
    return {
      key: entry,
      label: entry,
      copy: entry,
    };
  }

  return {
    key: String(entry.key ?? entry.label ?? entry.copy ?? "").trim(),
    label: String(entry.label ?? entry.key ?? "").trim(),
    copy: String(entry.copy ?? "").trim(),
  };
}

function SectionStatusBadge({ status, testIdPrefix, locale }: { status: string | null | undefined; testIdPrefix: string; locale: Locale }) {
  return (
    <span
      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
      data-testid={`${testIdPrefix}-status-${String(status ?? "unavailable").trim() || "unavailable"}`}
    >
      {getEnneagramTechnicalNoteStatusLabel(status, locale)}
    </span>
  );
}

function formatSummaryLabels(
  technicalNote: ScaleTechnicalNoteV1,
  entries: string[],
  locale: Locale
): string[] {
  const sectionLabelMap = new Map(
    (technicalNote.sections ?? []).map((section) => [String(section.section_key ?? "").trim(), String(section.title ?? section.section_key ?? "").trim()])
  );
  const metricLabelMap = new Map(
    (technicalNote.metric_definitions ?? []).map((metric) => [String(metric.metric_key ?? "").trim(), String(metric.label ?? metric.metric_key ?? "").trim()])
  );

  return entries
    .map((entry) => {
      const normalized = String(entry ?? "").trim();
      return sectionLabelMap.get(normalized) ?? metricLabelMap.get(normalized) ?? getEnneagramTechnicalNoteNotClaimedLabel(normalized, locale);
    })
    .filter((entry) => entry.length > 0);
}

function extractStatusEntries(summary: Record<string, unknown>, status: string): string[] {
  const direct = Array.isArray(summary[status]) ? (summary[status] as unknown[]).map(String) : [];
  const metrics =
    summary.metrics && typeof summary.metrics === "object" && !Array.isArray(summary.metrics)
      ? (summary.metrics as Record<string, unknown>)
      : {};
  const sections =
    summary.sections && typeof summary.sections === "object" && !Array.isArray(summary.sections)
      ? (summary.sections as Record<string, unknown>)
      : {};

  const merged = [
    ...direct,
    ...(Array.isArray(metrics[status]) ? (metrics[status] as unknown[]).map(String) : []),
    ...(Array.isArray(sections[status]) ? (sections[status] as unknown[]).map(String) : []),
  ].map((entry) => String(entry).trim()).filter((entry) => entry.length > 0);

  return [...new Set(merged)];
}

function renderMetricCard(metric: ScaleMetricDefinition, testIdPrefix: string, locale: Locale) {
  return (
    <article
      key={metric.metric_key}
      data-testid={`${testIdPrefix}-metric-${metric.metric_key}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.metric_key}</p>
          <h3 className="m-0 text-lg font-semibold text-slate-950">{metric.label ?? metric.metric_key}</h3>
        </div>
        <SectionStatusBadge status={metric.data_status} testIdPrefix={testIdPrefix} locale={locale} />
      </div>
      {metric.description ? <p className="mt-3 text-sm leading-7 text-slate-700">{metric.description}</p> : null}
      {metric.minimum_sample_guidance ? (
        <p className="mt-3 text-sm text-slate-600">{locale === "en" ? "Sample requirements: " : "最小样本边界："}{metric.minimum_sample_guidance}</p>
      ) : null}
      {metric.privacy_notes ? <p className="mt-2 text-sm text-slate-600">{locale === "en" ? "Privacy: " : "隐私说明："}{metric.privacy_notes}</p> : null}
    </article>
  );
}

function ScaleTechnicalNotePage({ locale, testSlug, testTitle, fetchTechnicalNote, pageTestId, testIdPrefix, heading, validateTechnicalNote }: TechnicalNotePageProps) {
  const [technicalNote, setTechnicalNote] = useState<ScaleTechnicalNoteV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchTechnicalNote()
      .then((response: ScaleTechnicalNoteResponse) => {
        if (!active) {
          return;
        }

        const note = response.technical_note_v1 ?? null;
        if (!note || !Array.isArray(note.sections) || (validateTechnicalNote && !validateTechnicalNote(note, locale))) {
          setError((locale === "en" ? "This technical note is unavailable. You can still read the method boundaries on the result page." : "当前技术说明暂时不可用。你仍可以先按结果页的方法边界阅读本次测量结果。"));
          setTechnicalNote(null);
          return;
        }

        setTechnicalNote(note);
        setError(null);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setError((locale === "en" ? "The technical note could not be loaded. You can still read the method boundaries on the result page." : "当前无法读取技术说明。你仍可以先按结果页的方法边界阅读本次测量结果。"));
        setTechnicalNote(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchTechnicalNote, locale, validateTechnicalNote]);

  const orderedSections = useMemo(() => {
    if (!technicalNote) {
      return [];
    }

    const priority = new Map<string, number>(REQUIRED_SECTION_ORDER.map((key, index) => [key, index]));

    return [...technicalNote.sections].sort((left, right) => {
      const leftKey = String(left.section_key ?? "").trim();
      const rightKey = String(right.section_key ?? "").trim();
      const leftRank = priority.get(leftKey) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = priority.get(rightKey) ?? Number.MAX_SAFE_INTEGER;
      return leftRank - rightRank || leftKey.localeCompare(rightKey);
    });
  }, [technicalNote]);

  const disclaimers = useMemo(() => {
    if (!technicalNote?.disclaimers) {
      return [];
    }

    return technicalNote.disclaimers.map(normalizeDisclaimer).filter((entry) => entry.copy.length > 0);
  }, [technicalNote]);

  const methodBoundaries = useMemo(() => {
    const entries = technicalNote?.method_boundaries ?? {};
    return Object.entries(entries)
      .map(([key, value]) => {
        const record = value && typeof value === "object" && !Array.isArray(value) ? value : {};
        return {
          key,
          label: String((record as Record<string, unknown>).label ?? key).trim(),
          copy: String((record as Record<string, unknown>).copy ?? "").trim(),
          evidenceLevel: String((record as Record<string, unknown>).evidence_level ?? "").trim(),
        };
      })
      .filter((entry) => entry.copy.length > 0);
  }, [technicalNote]);

  const statusSummary = useMemo(() => {
    const summary = technicalNote?.data_status_summary ?? {};
    const notClaimed = extractStatusEntries(summary, "not_claimed");

    return DATA_STATUS_ORDER.map((status) => {
      const entries = status === "not_claimed" ? notClaimed : extractStatusEntries(summary, status);

      return {
        status,
        labels: technicalNote ? formatSummaryLabels(technicalNote, entries, locale) : entries,
      };
    }).filter((bucket) => bucket.labels.length > 0);
  }, [technicalNote, locale]);

  const backHref = localizedPath(`/tests/${testSlug}`, locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-[var(--fm-container-gutter)] py-[var(--fm-space-6)]" data-testid={pageTestId}>
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <Link href={backHref} className="text-sm font-medium text-sky-700 hover:text-sky-800">
          {locale === "en" ? "Back to assessment" : "返回测试详情"}
        </Link>
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{locale === "en" ? "Technical note v0.1" : "技术说明 v0.1"}</p>
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950">{heading}</h1>
          <p className="m-0 max-w-3xl text-base leading-8 text-slate-700">
            {locale === "en" ? "Read the assessment methods, their limits, and the current evidence status." : "本页只渲染后端技术说明契约返回的公开安全方法、边界与数据状态。"}
          </p>
          <p className="m-0 text-sm text-slate-500">{testTitle}</p>
        </div>
        {technicalNote ? (
          <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4" data-testid={`${testIdPrefix}-meta`}>
            <div>
              <dt className="font-medium text-slate-500">{locale === "en" ? "Technical note version" : "技术说明版本"}</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.technical_note_version ?? (locale === "en" ? "Not specified" : "未标注")}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">{locale === "en" ? "Registry version" : "Registry 版本"}</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.registry_version ?? (locale === "en" ? "Not specified" : "未标注")}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Release Hash</dt>
              <dd className="mt-1 break-all text-slate-900">{technicalNote.registry_release_hash ?? (locale === "en" ? "Not specified" : "未标注")}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">{locale === "en" ? "Generated at" : "生成时间"}</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.generated_at ?? (locale === "en" ? "Not specified" : "未标注")}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {loading ? (
        <section className="py-10" data-testid={`${testIdPrefix}-loading`}>
          <p className="m-0 text-sm text-slate-600">{locale === "en" ? "Loading technical note…" : "正在加载技术说明…"}</p>
        </section>
      ) : null}

      {error ? (
        <section className="py-8" data-testid={`${testIdPrefix}-error`}>
          <Alert>
            <p className="m-0 font-medium">{locale === "en" ? "Technical note unavailable" : "技术说明暂不可用"}</p>
            <p className="m-0 mt-1">{error}</p>
          </Alert>
        </section>
      ) : null}

      {!loading && !error && technicalNote ? (
        <div className="space-y-12 py-10">
          <section className="space-y-5" data-testid={`${testIdPrefix}-sections`}>
            <div className="space-y-2">
              <h2 className="m-0 text-2xl font-semibold text-slate-950">{locale === "en" ? "Methods and boundaries" : "方法与边界"}</h2>
              <p className="m-0 text-sm text-slate-600">{locale === "en" ? "Only public-safe sections provided by the backend are shown. Missing sections do not produce placeholder clutter." : "只显示 backend 已提供的 public-safe 章节。缺失章节不会渲染占位噪音。"}</p>
            </div>
            <div className="space-y-4">
              {orderedSections.map((section: ScaleTechnicalNoteSection) => (
                <article
                  key={section.section_key}
                  data-testid={`${testIdPrefix}-section-${section.section_key}`}
                  className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{section.section_key}</p>
                      <h3 className="m-0 text-xl font-semibold text-slate-950">{section.title ?? section.section_key}</h3>
                    </div>
                    <SectionStatusBadge status={section.data_status} testIdPrefix={testIdPrefix} locale={locale} />
                  </div>
                  {section.body ? <p className="mt-3 max-w-4xl text-sm leading-8 text-slate-700">{section.body}</p> : null}
                </article>
              ))}
            </div>
          </section>

          {methodBoundaries.length > 0 ? (
            <section className="space-y-5" data-testid={`${testIdPrefix}-method-boundaries`}>
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">{locale === "en" ? "Method boundaries" : "方法边界"}</h2>
                <p className="m-0 text-sm text-slate-600">{locale === "en" ? "These entries come from the backend’s method boundaries. Cross-form comparisons and theoretical hints are not presented as firm conclusions." : "这些条目来自 backend 的 method boundaries，不把跨题型比较或理论层提示写成硬判定。"}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {methodBoundaries.map((boundary) => (
                  <article key={boundary.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="m-0 text-lg font-semibold text-slate-950">{boundary.label}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{boundary.copy}</p>
                    {boundary.evidenceLevel ? <p className="mt-2 text-xs text-slate-500">evidence_level · {boundary.evidenceLevel}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {technicalNote.metric_definitions && technicalNote.metric_definitions.length > 0 ? (
            <section className="space-y-5" data-testid="enneagram-technical-note-metrics">
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">{locale === "en" ? "Metric definitions" : "指标定义"}</h2>
                <p className="m-0 text-sm text-slate-600">{locale === "en" ? "Definitions, evidence status, sample requirements, and privacy limits are shown here. A definition is not a measured value." : "这里只展示指标定义、状态、最小样本边界和隐私说明，不展示伪造数值。"}</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {technicalNote.metric_definitions.map((metric) => renderMetricCard(metric, testIdPrefix, locale))}
              </div>
            </section>
          ) : null}

          {statusSummary.length > 0 ? (
            <section className="space-y-5" data-testid={`${testIdPrefix}-data-status-summary`}>
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">{locale === "en" ? "Evidence status" : "数据状态总览"}</h2>
                <p className="m-0 text-sm text-slate-600">{locale === "en" ? "See which methods are operational, which still need samples, and which claims are not made." : "这部分用来明确哪些已经可运行，哪些仍在积累样本，以及哪些不作此类声明。"}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {statusSummary.map((bucket) => (
                  <article key={bucket.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="m-0 text-lg font-semibold text-slate-950">{getEnneagramTechnicalNoteStatusLabel(bucket.status, locale)}</h3>
                      <SectionStatusBadge status={bucket.status} testIdPrefix={testIdPrefix} locale={locale} />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-slate-700">
                      {bucket.labels.map((label) => (
                        <li key={label}>{label}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {disclaimers.length > 0 ? (
            <section className="space-y-5" data-testid={`${testIdPrefix}-disclaimers`}>
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">{locale === "en" ? "Use boundaries" : "使用边界"}</h2>
                <p className="m-0 text-sm text-slate-600">{locale === "en" ? "These limits also apply when you interpret results or add observations." : "以下边界必须成立，不会因为结果页文案或观察反馈而改变。"}</p>
              </div>
              <div className="space-y-3">
                {disclaimers.map((entry) => (
                  <article key={entry.key} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="m-0 text-base font-semibold text-slate-950">{entry.label}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-700">{entry.copy}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

export function EnneagramTechnicalNotePage({ locale, testSlug, testTitle }: Props) {
  const fetchNote = useCallback(() => fetchEnneagramTechnicalNote(locale), [locale]);
  return (
    <ScaleTechnicalNotePage
      locale={locale}
      testSlug={testSlug}
      testTitle={testTitle}
      fetchTechnicalNote={fetchNote}
      pageTestId="enneagram-technical-note-page"
      testIdPrefix="enneagram-technical-note"
      heading={locale === "en" ? "Enneagram Technical Note" : "九型人格技术说明"}
      validateTechnicalNote={isCanonicalEnneagramTechnicalNote}
    />
  );
}

function isLocalizedRiasecTechnicalNote(note: ScaleTechnicalNoteV1, locale: Locale) {
  return note.scale_code === "RIASEC" && note.canonical_locale === (locale === "zh" ? "zh-CN" : "en");
}

export function RiasecTechnicalNotePage({ locale, testSlug, testTitle }: Props) {
  const fetchNote = useCallback(() => fetchRiasecTechnicalNote(locale), [locale]);
  return (
    <ScaleTechnicalNotePage
      locale={locale}
      testSlug={testSlug}
      testTitle={testTitle}
      fetchTechnicalNote={fetchNote}
      validateTechnicalNote={isLocalizedRiasecTechnicalNote}
      pageTestId="riasec-technical-note-page"
      testIdPrefix="riasec-technical-note"
      heading={locale === "en" ? "RIASEC Technical Note" : "RIASEC 技术说明"}
    />
  );
}
