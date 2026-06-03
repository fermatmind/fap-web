"use client";

import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusTone } from "@/components/ops/shared/StatusBadge";
import type { SeoIssueTask, SeoSeverity, SeoTaskStatus } from "@/components/ops/seo/mockSeoOperations";

const severityTone: Record<SeoSeverity, StatusTone> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "neutral",
};

const statusTone: Record<SeoTaskStatus, StatusTone> = {
  queued: "warning",
  in_review: "info",
  blocked: "danger",
  ready: "success",
};

const statusLabel: Record<SeoTaskStatus, string> = {
  queued: "待处理",
  in_review: "审核中",
  blocked: "阻断",
  ready: "可执行",
};

const sourceLabel: Record<SeoIssueTask["source"], string> = {
  seo_intel_mock: "seo_intel mock",
  cms_api_mock: "CMS API mock",
  issue_queue_artifact: "Issue queue artifact",
};

function TaskIcon({ status }: { status: SeoTaskStatus }) {
  const className = "h-4 w-4";
  if (status === "blocked") return <ShieldAlert className={className} aria-hidden="true" />;
  if (status === "ready") return <CheckCircle2 className={className} aria-hidden="true" />;
  if (status === "in_review") return <Clock3 className={className} aria-hidden="true" />;
  return <AlertTriangle className={className} aria-hidden="true" />;
}

export function IssueQueueTable({
  tasks,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  tasks: SeoIssueTask[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allVisibleSelected = tasks.length > 0 && tasks.every((task) => selectedIds.has(task.id));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={onToggleAll}
                  aria-label="选择当前任务"
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
              </th>
              <th className="px-4 py-3">任务</th>
              <th className="px-4 py-3">范围</th>
              <th className="px-4 py-3">严重度</th>
              <th className="px-4 py-3">状态</th>
              <th className="px-4 py-3">负责人</th>
              <th className="px-4 py-3">来源</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length > 0 ? (
              tasks.map((task) => {
                const selected = selectedIds.has(task.id);
                return (
                  <tr key={task.id} className={cn("align-top transition", selected ? "bg-slate-50" : "hover:bg-slate-50/70")}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => onToggle(task.id)}
                        aria-label={`选择 ${task.title}`}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900"
                      />
                    </td>
                    <td className="min-w-72 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <span className={cn("mt-0.5 text-slate-400", task.status === "blocked" && "text-rose-600")}>
                          <TaskIcon status={task.status} />
                        </span>
                        <div>
                          <p className="font-semibold text-slate-950">{task.title}</p>
                          <p className="mt-1 font-mono text-xs text-slate-500">{task.path}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800">{task.surface}</div>
                      <div className="mt-1 text-xs text-slate-500">{task.focus}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={severityTone[task.severity]}>{task.severity}</StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone[task.status]}>{statusLabel[task.status]}</StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{task.owner}</div>
                      <div className="mt-1 text-xs text-slate-500">{task.due}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{sourceLabel[task.source]}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  当前筛选没有任务。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
