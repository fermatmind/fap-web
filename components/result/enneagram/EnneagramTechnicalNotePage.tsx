"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/alert";
import {
  fetchEnneagramTechnicalNote,
  type EnneagramMetricDefinition,
  type EnneagramTechnicalNoteDisclaimer,
  type EnneagramTechnicalNoteResponse,
  type EnneagramTechnicalNoteSection,
  type EnneagramTechnicalNoteV1,
} from "@/lib/api/v0_3";
import {
  getEnneagramTechnicalNoteNotClaimedLabel,
  getEnneagramTechnicalNoteStatusLabel,
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
] as const;

const DATA_STATUS_ORDER = [
  "currently_operational",
  "collecting_data",
  "pending_sample",
  "unavailable",
  "not_claimed",
] as const;

type Props = {
  locale: Locale;
  testSlug: string;
  testTitle: string;
};

function normalizeDisclaimer(entry: EnneagramTechnicalNoteDisclaimer | string): { key: string; label: string; copy: string } {
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

function SectionStatusBadge({ status }: { status: string | null | undefined }) {
  return (
    <span
      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
      data-testid={`enneagram-technical-note-status-${String(status ?? "unavailable").trim() || "unavailable"}`}
    >
      {getEnneagramTechnicalNoteStatusLabel(status)}
    </span>
  );
}

function formatSummaryLabels(
  technicalNote: EnneagramTechnicalNoteV1,
  entries: string[]
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
      return sectionLabelMap.get(normalized) ?? metricLabelMap.get(normalized) ?? getEnneagramTechnicalNoteNotClaimedLabel(normalized);
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

function renderMetricCard(metric: EnneagramMetricDefinition) {
  return (
    <article
      key={metric.metric_key}
      data-testid={`enneagram-technical-note-metric-${metric.metric_key}`}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{metric.metric_key}</p>
          <h3 className="m-0 text-lg font-semibold text-slate-950">{metric.label ?? metric.metric_key}</h3>
        </div>
        <SectionStatusBadge status={metric.data_status} />
      </div>
      {metric.description ? <p className="mt-3 text-sm leading-7 text-slate-700">{metric.description}</p> : null}
      {metric.minimum_sample_guidance ? (
        <p className="mt-3 text-sm text-slate-600">最小样本边界：{metric.minimum_sample_guidance}</p>
      ) : null}
      {metric.privacy_notes ? <p className="mt-2 text-sm text-slate-600">隐私说明：{metric.privacy_notes}</p> : null}
    </article>
  );
}

export function EnneagramTechnicalNotePage({ locale, testSlug, testTitle }: Props) {
  const [technicalNote, setTechnicalNote] = useState<EnneagramTechnicalNoteV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void fetchEnneagramTechnicalNote()
      .then((response: EnneagramTechnicalNoteResponse) => {
        if (!active) {
          return;
        }

        const note = response.technical_note_v1 ?? null;
        if (!note || !Array.isArray(note.sections)) {
          setError("当前 Technical Note 暂时不可用。你仍可以先按结果页的方法边界阅读本次测量结果。");
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
        setError("当前无法读取 Technical Note。你仍可以先按结果页的方法边界阅读本次测量结果。");
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
  }, []);

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
        labels: technicalNote ? formatSummaryLabels(technicalNote, entries) : entries,
      };
    }).filter((bucket) => bucket.labels.length > 0);
  }, [technicalNote]);

  const backHref = localizedPath(`/tests/${testSlug}`, locale);

  return (
    <main className="mx-auto w-full max-w-6xl px-[var(--fm-container-gutter)] py-[var(--fm-space-6)]" data-testid="enneagram-technical-note-page">
      <div className="space-y-4 border-b border-slate-200 pb-8">
        <Link href={backHref} className="text-sm font-medium text-sky-700 hover:text-sky-800">
          返回测试详情
        </Link>
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Technical Note v0.1</p>
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950">九型人格技术说明</h1>
          <p className="m-0 max-w-3xl text-base leading-8 text-slate-700">
            这份页面用于说明当前九型测量结果的工作边界、可运营指标、以及哪些部分已经可用，哪些仍在继续积累数据。
          </p>
          <p className="m-0 text-sm text-slate-500">{testTitle}</p>
        </div>
        {technicalNote ? (
          <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4" data-testid="enneagram-technical-note-meta">
            <div>
              <dt className="font-medium text-slate-500">Technical Note 版本</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.technical_note_version ?? "未标注"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Registry 版本</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.registry_version ?? "未标注"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Release Hash</dt>
              <dd className="mt-1 break-all text-slate-900">{technicalNote.registry_release_hash ?? "未标注"}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">生成时间</dt>
              <dd className="mt-1 text-slate-900">{technicalNote.generated_at ?? "未标注"}</dd>
            </div>
          </dl>
        ) : null}
      </div>

      {loading ? (
        <section className="py-10" data-testid="enneagram-technical-note-loading">
          <p className="m-0 text-sm text-slate-600">正在加载 Technical Note…</p>
        </section>
      ) : null}

      {error ? (
        <section className="py-8" data-testid="enneagram-technical-note-error">
          <Alert>
            <p className="m-0 font-medium">Technical Note 暂不可用</p>
            <p className="m-0 mt-1">{error}</p>
          </Alert>
        </section>
      ) : null}

      {!loading && !error && technicalNote ? (
        <div className="space-y-12 py-10">
          <section className="space-y-5" data-testid="enneagram-technical-note-sections">
            <div className="space-y-2">
              <h2 className="m-0 text-2xl font-semibold text-slate-950">方法与边界</h2>
              <p className="m-0 text-sm text-slate-600">只显示 backend 已提供的 public-safe 章节。缺失章节不会渲染占位噪音。</p>
            </div>
            <div className="space-y-4">
              {orderedSections.map((section: EnneagramTechnicalNoteSection) => (
                <article
                  key={section.section_key}
                  data-testid={`enneagram-technical-note-section-${section.section_key}`}
                  className="border-t border-slate-200 pt-5 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{section.section_key}</p>
                      <h3 className="m-0 text-xl font-semibold text-slate-950">{section.title ?? section.section_key}</h3>
                    </div>
                    <SectionStatusBadge status={section.data_status} />
                  </div>
                  {section.body ? <p className="mt-3 max-w-4xl text-sm leading-8 text-slate-700">{section.body}</p> : null}
                </article>
              ))}
            </div>
          </section>

          {methodBoundaries.length > 0 ? (
            <section className="space-y-5" data-testid="enneagram-technical-note-method-boundaries">
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">方法边界</h2>
                <p className="m-0 text-sm text-slate-600">这些条目来自 backend 的 method boundaries，不把跨题型比较或理论层提示写成硬判定。</p>
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
                <h2 className="m-0 text-2xl font-semibold text-slate-950">指标定义</h2>
                <p className="m-0 text-sm text-slate-600">这里只展示指标定义、状态、最小样本边界和隐私说明，不展示伪造数值。</p>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {technicalNote.metric_definitions.map(renderMetricCard)}
              </div>
            </section>
          ) : null}

          {statusSummary.length > 0 ? (
            <section className="space-y-5" data-testid="enneagram-technical-note-data-status-summary">
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">数据状态总览</h2>
                <p className="m-0 text-sm text-slate-600">这部分用来明确哪些已经可运行，哪些仍在积累样本，以及哪些不作此类声明。</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                {statusSummary.map((bucket) => (
                  <article key={bucket.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="m-0 text-lg font-semibold text-slate-950">{getEnneagramTechnicalNoteStatusLabel(bucket.status)}</h3>
                      <SectionStatusBadge status={bucket.status} />
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
            <section className="space-y-5" data-testid="enneagram-technical-note-disclaimers">
              <div className="space-y-2">
                <h2 className="m-0 text-2xl font-semibold text-slate-950">使用边界</h2>
                <p className="m-0 text-sm text-slate-600">以下边界必须成立，不会因为结果页文案或观察反馈而改变。</p>
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
