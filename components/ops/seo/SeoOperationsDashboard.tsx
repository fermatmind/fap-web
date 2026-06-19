"use client";

import { useMemo, useState } from "react";
import {
  BellDot,
  CheckCircle2,
  Download,
  FileSearch,
  Globe2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ops/shared/DataTable";
import { FilterBar } from "@/components/ops/shared/FilterBar";
import { KpiCard } from "@/components/ops/shared/KpiCard";
import { OpsHeader } from "@/components/ops/shared/OpsHeader";
import { OpsShell } from "@/components/ops/shared/OpsShell";
import { StatusBadge, type StatusTone } from "@/components/ops/shared/StatusBadge";
import { IssueQueueTable } from "@/components/ops/seo/IssueQueueTable";
import {
  type KeywordRow,
  type PagePerformanceRow,
  type SeoContentType,
  type SeoIssueFocus,
  type SeoIssueTask,
  type TrafficPoint,
} from "@/components/ops/seo/mockSeoOperations";
import type { Locale } from "@/lib/i18n/locales";
import type { SeoOperationsReadModel, SeoOperationsReadModelSource } from "@/lib/ops/seoOperationsReadModel";
import { cn } from "@/lib/utils";

const contentTypeOptions: Array<{ value: SeoContentType; label: string }> = [
  { value: "all", label: "全部" },
  { value: "article", label: "文章" },
  { value: "career_job", label: "职业岗位" },
  { value: "career_guide", label: "职业指南" },
  { value: "landing_surface", label: "落地页" },
  { value: "content_page", label: "内容页" },
];

const issueFocusOptions: Array<{ value: SeoIssueFocus; label: string }> = [
  { value: "all", label: "全部问题" },
  { value: "metadata", label: "元数据" },
  { value: "canonical", label: "Canonical" },
  { value: "robots", label: "Robots" },
  { value: "social", label: "社交预览" },
  { value: "growth", label: "增长阻断" },
];

const sortOptions = [
  { value: "priority", label: "优先级" },
  { value: "traffic", label: "流量" },
  { value: "freshness", label: "最近发现" },
];

const typeLabel: Record<Exclude<SeoContentType, "all">, string> = {
  article: "文章",
  career_job: "职业岗位",
  career_guide: "职业指南",
  landing_surface: "落地页",
  content_page: "内容页",
};

const keywordStatusTone: Record<KeywordRow["status"], StatusTone> = {
  winning: "success",
  watch: "warning",
  blocked: "danger",
};

const keywordStatusLabel: Record<KeywordRow["status"], string> = {
  winning: "领先",
  watch: "观察",
  blocked: "阻断",
};

const indexStateTone: Record<PagePerformanceRow["indexState"], StatusTone> = {
  indexable: "success",
  noindex: "warning",
  blocked: "danger",
};

const indexStateLabel: Record<PagePerformanceRow["indexState"], string> = {
  indexable: "可索引",
  noindex: "noindex",
  blocked: "阻断",
};

const severityRank: Record<SeoIssueTask["severity"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const readModelTone: Record<SeoOperationsReadModelSource, StatusTone> = {
  live_read_model: "success",
  artifact_sample: "info",
  mock_fixture: "warning",
  unavailable: "danger",
};

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function matchesSearch(values: string[], search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return values.some((value) => value.toLowerCase().includes(query));
}

function ProgressMeter({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const tone = safeValue >= 85 ? "bg-emerald-500" : safeValue >= 70 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div className="flex min-w-24 items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={cn("h-full rounded-full transition-[width]", tone)} style={{ width: `${safeValue}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-slate-700">{safeValue}%</span>
    </div>
  );
}

function buildLine(points: TrafficPoint[], key: "clicks" | "impressions" | "indexed") {
  const values = points.map((point) => point[key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);
  const width = 420;
  const height = 118;
  const pad = 10;

  return points
    .map((point, index) => {
      const x = pad + (index / Math.max(1, points.length - 1)) * (width - pad * 2);
      const y = pad + (1 - (point[key] - min) / range) * (height - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function TrafficTrendPanel({ points }: { points: TrafficPoint[] }) {
  const latest = points[points.length - 1];
  const previous = points[points.length - 2] ?? latest;
  const clickDelta = latest.clicks - previous.clicks;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">流量趋势</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">轻量 SVG 预览，后续接入 seo_intel 聚合趋势。</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge tone={clickDelta >= 0 ? "success" : "warning"}>{clickDelta >= 0 ? `+${clickDelta}` : clickDelta} clicks</StatusBadge>
          <StatusBadge tone="info">{formatNumber(latest.indexed)} indexed</StatusBadge>
        </div>
      </div>

      <div className="mt-4 h-48 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <svg viewBox="0 0 420 150" role="img" aria-label="Organic traffic trend" className="h-full w-full">
          <line x1="10" x2="410" y1="118" y2="118" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="10" x2="410" y1="66" y2="66" stroke="#e2e8f0" strokeWidth="1" />
          <line x1="10" x2="410" y1="14" y2="14" stroke="#e2e8f0" strokeWidth="1" />
          <polyline points={buildLine(points, "impressions")} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />
          <polyline points={buildLine(points, "clicks")} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={buildLine(points, "indexed")} fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          {points.map((point, index) => {
            const x = 10 + (index / Math.max(1, points.length - 1)) * 400;
            return (
              <text key={point.label} x={x} y="142" textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} className="fill-slate-400 text-[10px]">
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-slate-900" />
          点击 {formatNumber(latest.clicks)}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-slate-400" />
          展现 {formatNumber(latest.impressions)}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-5 rounded-full bg-sky-600" />
          可索引 {formatNumber(latest.indexed)}
        </div>
      </div>
    </section>
  );
}

export function SeoOperationsDashboard({ locale, readModel }: { locale: Locale; readModel: SeoOperationsReadModel }) {
  const operationsData = readModel.data;
  const [search, setSearch] = useState("");
  const [contentType, setContentType] = useState<SeoContentType>("all");
  const [issueFocus, setIssueFocus] = useState<SeoIssueFocus>("all");
  const [sort, setSort] = useState("priority");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<string | null>(null);

  const filteredKeywords = useMemo(() => {
    return operationsData.keywords.filter((keyword) => {
      const typeOk = contentType === "all" || keyword.type === contentType;
      return typeOk && matchesSearch([keyword.term, keyword.intent, keyword.primaryUrl], search);
    });
  }, [contentType, operationsData.keywords, search]);

  const filteredPages = useMemo(() => {
    const rows = operationsData.pages.filter((page) => {
      const typeOk = contentType === "all" || page.type === contentType;
      const issueOk = issueFocus === "all" || page.issues.includes(issueFocus);
      return typeOk && issueOk && matchesSearch([page.title, page.path, page.type], search);
    });

    return [...rows].sort((a, b) => {
      if (sort === "traffic") return b.clicks - a.clicks;
      if (sort === "freshness") return a.lastSeen.localeCompare(b.lastSeen);
      return a.readiness - b.readiness;
    });
  }, [contentType, issueFocus, operationsData.pages, search, sort]);

  const filteredTasks = useMemo(() => {
    const rows = operationsData.tasks.filter((task) => {
      const typeOk = contentType === "all" || task.type === contentType;
      const issueOk = issueFocus === "all" || task.focus === issueFocus;
      return typeOk && issueOk && matchesSearch([task.title, task.path, task.owner, task.surface], search);
    });

    return [...rows].sort((a, b) => {
      if (sort === "traffic") return a.path.localeCompare(b.path);
      if (sort === "freshness") return a.due.localeCompare(b.due);
      return severityRank[a.severity] - severityRank[b.severity];
    });
  }, [contentType, issueFocus, operationsData.tasks, search, sort]);

  const selectedVisibleCount = filteredTasks.filter((task) => selectedIds.has(task.id)).length;

  function toggleTask(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllVisibleTasks() {
    setSelectedIds((current) => {
      const next = new Set(current);
      const allVisibleSelected = filteredTasks.length > 0 && filteredTasks.every((task) => next.has(task.id));
      for (const task of filteredTasks) {
        if (allVisibleSelected) {
          next.delete(task.id);
        } else {
          next.add(task.id);
        }
      }
      return next;
    });
  }

  function runBulkAction(action: string) {
    // TODO(CMS API): Submit selected task IDs to a backend review/job endpoint instead of mutating CMS content here.
    setNotice(`${action} 已准备提交：${selectedVisibleCount} 个当前筛选任务。`);
  }

  const keywordColumns: Array<DataTableColumn<KeywordRow>> = [
    {
      key: "term",
      header: "关键词",
      render: (row) => (
        <div className="min-w-56">
          <p className="font-semibold text-slate-950">{row.term}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{row.primaryUrl}</p>
        </div>
      ),
    },
    { key: "intent", header: "意图", render: (row) => <span className="text-slate-700">{row.intent}</span> },
    { key: "type", header: "类型", render: (row) => <StatusBadge tone="neutral">{typeLabel[row.type]}</StatusBadge> },
    { key: "volume", header: "月量", render: (row) => formatNumber(row.volume) },
    { key: "position", header: "排名", render: (row) => <span className="font-semibold text-slate-900">#{row.position.toFixed(1)}</span> },
    { key: "clicks", header: "点击", render: (row) => formatNumber(row.clicks) },
    { key: "status", header: "状态", render: (row) => <StatusBadge tone={keywordStatusTone[row.status]}>{keywordStatusLabel[row.status]}</StatusBadge> },
  ];

  const pageColumns: Array<DataTableColumn<PagePerformanceRow>> = [
    {
      key: "page",
      header: "页面",
      render: (row) => (
        <div className="min-w-72">
          <p className="font-semibold text-slate-950">{row.title}</p>
          <p className="mt-1 font-mono text-xs text-slate-500">{row.path}</p>
        </div>
      ),
    },
    { key: "type", header: "类型", render: (row) => <StatusBadge tone="neutral">{typeLabel[row.type]}</StatusBadge> },
    { key: "traffic", header: "流量", render: (row) => `${formatNumber(row.clicks)} / ${formatNumber(row.impressions)}` },
    { key: "ctr", header: "CTR", render: (row) => `${row.ctr.toFixed(2)}%` },
    { key: "readiness", header: "就绪", render: (row) => <ProgressMeter value={row.readiness} /> },
    { key: "index", header: "索引", render: (row) => <StatusBadge tone={indexStateTone[row.indexState]}>{indexStateLabel[row.indexState]}</StatusBadge> },
    {
      key: "issues",
      header: "问题",
      render: (row) => (
        <div className="flex min-w-32 flex-wrap gap-1.5">
          {row.issues.length > 0 ? row.issues.map((issue) => <StatusBadge key={issue} tone="warning">{issue}</StatusBadge>) : <StatusBadge tone="success">clean</StatusBadge>}
        </div>
      ),
    },
    { key: "lastSeen", header: "发现", render: (row) => <span className="text-xs text-slate-500">{row.lastSeen}</span> },
  ];

  return (
    <OpsShell locale={locale} activeHref="/ops/seo-operations">
      <OpsHeader
        eyebrow="SEO 与增长"
        title="SEO 运营看板"
        description="面向运营的只读 dashboard shell。数据经 read-model boundary 注入；当前任务队列读取本地 issue queue artifact，关键词、趋势、页面表现仍保留 mock，后续接入 seo_intel 观测层和 CMS API 资源摘要。"
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={readModelTone[readModel.source]}>{readModel.sourceLabel}</StatusBadge>
            <StatusBadge tone="info">Contract-backed mock</StatusBadge>
          </div>
        }
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              同步状态
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              导出队列
            </button>
          </>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <section className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">Read-model boundary</h2>
              <p className="mt-1 leading-5">{readModel.sourceDetail}</p>
              <p className="mt-1 font-mono text-[11px] text-slate-500">source={readModel.source}</p>
            </div>
            <StatusBadge tone="neutral">更新 {readModel.generatedAt}</StatusBadge>
          </div>
          {readModel.warnings.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {readModel.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          ) : null}
        </section>

        <FilterBar
          search={search}
          onSearchChange={setSearch}
          contentType={contentType}
          contentTypeOptions={contentTypeOptions}
          onContentTypeChange={setContentType}
          issueFocus={issueFocus}
          issueFocusOptions={issueFocusOptions}
          onIssueFocusChange={setIssueFocus}
          sort={sort}
          onSortChange={setSort}
          sortOptions={sortOptions}
        />

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {operationsData.kpis.map((kpi) => (
            <KpiCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              detail={kpi.detail}
              trend={kpi.trend}
              direction={kpi.direction}
              tone={kpi.tone}
              icon={
                kpi.id === "readiness" ? (
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                ) : kpi.id === "indexed" ? (
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                ) : kpi.id === "issues" ? (
                  <FileSearch className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <BellDot className="h-4 w-4" aria-hidden="true" />
                )
              }
            />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
          <TrafficTrendPanel points={operationsData.traffic} />

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-950">任务列表</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">批量动作只提交后台任务，不在前端直接修改 CMS 权威字段。</p>
              </div>
              <StatusBadge tone={selectedVisibleCount > 0 ? "info" : "neutral"}>{selectedVisibleCount} 已选</StatusBadge>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {["提交 CMS 审核", "同步 canonical", "标记已排查"].map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={selectedVisibleCount === 0}
                  onClick={() => runBulkAction(action)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {action}
                </button>
              ))}
            </div>
            {notice ? <p className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-800">{notice}</p> : null}
          </section>
        </div>

        <section className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-950">关键词</h2>
              <p className="mt-1 text-xs text-slate-500">按意图、排名和主要 URL 扫描增长机会。</p>
            </div>
            <StatusBadge tone="neutral">更新 {operationsData.generatedAt}</StatusBadge>
          </div>
          <DataTable rows={filteredKeywords} columns={keywordColumns} rowKey={(row) => row.term} emptyState="当前筛选没有关键词。" />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">页面表现</h2>
            <p className="mt-1 text-xs text-slate-500">页面层只展示公开观测和后端权威摘要，不承接 CMS 编辑权威。</p>
          </div>
          <DataTable rows={filteredPages} columns={pageColumns} rowKey={(row) => row.id} emptyState="当前筛选没有页面。" />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">问题队列</h2>
            <p className="mt-1 text-xs text-slate-500">这些任务来自 SEO-ISSUE-QUEUE-01 sample-only artifact；未来替换为 seo_intel issue summary 与 CMS publish checklist。</p>
          </div>
          <IssueQueueTable
            tasks={filteredTasks}
            selectedIds={selectedIds}
            onToggle={toggleTask}
            onToggleAll={toggleAllVisibleTasks}
          />
        </section>
      </div>
    </OpsShell>
  );
}
