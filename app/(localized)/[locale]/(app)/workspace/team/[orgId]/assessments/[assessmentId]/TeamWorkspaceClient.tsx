"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import {
  getOrgAssessmentProgress,
  getOrgAssessmentSummary,
  type AssessmentProgressListItem,
  type AssessmentProgressResponse,
  type AssessmentSummaryResponse,
  type TeamDynamicsV1Raw,
  type WorkspaceSurfaceV1Raw,
} from "@/lib/api/v0_4";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

type WorkspaceCopy = {
  kicker: string;
  title: string;
  description: string;
  loading: string;
  unauthorized: string;
  focus: string;
  teamCoverage: string;
  communication: string;
  decision: string;
  stress: string;
  blindspots: string;
  nextActions: string;
  memberProgress: string;
  completedMembers: string;
  pendingMembers: string;
  managerLoop: string;
  jumpToProgress: string;
  noTeamAuthority: string;
  noMembers: string;
  expandMember: string;
  collapseMember: string;
  completed: string;
  pending: string;
  memberCompletedAt: string;
  memberStartedAt: string;
  protectedHint: string;
};

const COPY: Record<"en" | "zh", WorkspaceCopy> = {
  en: {
    kicker: "Protected workspace",
    title: "Team dynamics workspace",
    description: "This workspace turns the backend team synthesis into a manager-facing loop without exposing member-private result truth.",
    loading: "Loading protected workspace...",
    unauthorized: "This workspace is only available inside the permitted organization scope.",
    focus: "Current team focus",
    teamCoverage: "Team coverage",
    communication: "Communication fit",
    decision: "Decision mix",
    stress: "Stress patterns",
    blindspots: "Blindspots to watch",
    nextActions: "Manager next actions",
    memberProgress: "Member progress",
    completedMembers: "Completed members",
    pendingMembers: "Pending members",
    managerLoop: "Manager loop",
    jumpToProgress: "Review member progress",
    noTeamAuthority: "Team authority will appear here after at least two members complete the assessment.",
    noMembers: "No member rows are available yet.",
    expandMember: "Review member status",
    collapseMember: "Hide member status",
    completed: "Completed",
    pending: "Pending",
    memberCompletedAt: "Completed at",
    memberStartedAt: "Started at",
    protectedHint: "Protected org/tenant boundary",
  },
  zh: {
    kicker: "受保护工作区",
    title: "团队洞察工作区",
    description: "这里把 backend 团队合成结果变成 manager 可操作的最小闭环，同时不暴露成员私有结果 truth。",
    loading: "正在加载受保护工作区...",
    unauthorized: "该工作区仅在合法组织范围内可访问。",
    focus: "当前团队焦点",
    teamCoverage: "团队覆盖度",
    communication: "沟通协作",
    decision: "决策组合",
    stress: "压力模式",
    blindspots: "需要留意的盲区",
    nextActions: "Manager 下一步动作",
    memberProgress: "成员进度",
    completedMembers: "已完成成员",
    pendingMembers: "待完成成员",
    managerLoop: "Manager 行动闭环",
    jumpToProgress: "查看成员进度",
    noTeamAuthority: "至少两名成员完成测评后，这里才会出现团队洞察 authority。",
    noMembers: "当前还没有可展示的成员进度。",
    expandMember: "查看成员状态",
    collapseMember: "收起成员状态",
    completed: "已完成",
    pending: "待完成",
    memberCompletedAt: "完成时间",
    memberStartedAt: "开始时间",
    protectedHint: "受保护的 org/tenant 边界",
  },
};

function normalizeId(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeStringList(values: string[] | undefined | null): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
}

function maskSubjectValue(value: string | undefined, locale: "en" | "zh"): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return locale === "zh" ? "成员状态" : "Member status";
  }

  const atIndex = normalized.indexOf("@");
  if (atIndex <= 1) {
    return locale === "zh" ? "成员状态" : "Member status";
  }

  const prefix = normalized.slice(0, Math.min(2, atIndex));
  const domain = normalized.slice(atIndex);
  return `${prefix}***${domain}`;
}

function formatTimestamp(value: string | null | undefined): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return "";
  }

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolveActionLabel(key: string, locale: "en" | "zh"): string {
  const map: Record<string, { en: string; zh: string }> = {
    "team.action.sync_communication_cadence": {
      en: "Sync communication cadence",
      zh: "同步沟通节奏",
    },
    "team.action.document_async_then_discuss": {
      en: "Document async first, then discuss",
      zh: "先异步记录，再集中讨论",
    },
    "team.action.separate_idea_and_decision_rounds": {
      en: "Separate idea and decision rounds",
      zh: "把创意轮和决策轮分开",
    },
    "team.action.assign_decision_owner": {
      en: "Assign a clear decision owner",
      zh: "明确单一决策 owner",
    },
    "team.action.define_escalation_norms": {
      en: "Define escalation norms",
      zh: "明确升级与求助规则",
    },
    "team.action.add_recovery_buffer": {
      en: "Add recovery buffer",
      zh: "预留恢复缓冲区",
    },
    "team.action.align_decision_rules": {
      en: "Align team decision rules",
      zh: "对齐团队决策规则",
    },
    "team.action.close_execution_gaps": {
      en: "Close execution gaps",
      zh: "补齐执行缺口",
    },
    "review_team_action_prompts": {
      en: "Review team action prompts",
      zh: "查看团队行动提示",
    },
    "check_member_progress": {
      en: "Check member progress",
      zh: "检查成员进度",
    },
    "invite_more_members": {
      en: "Invite more members",
      zh: "邀请更多成员",
    },
  };

  return map[key]?.[locale] ?? key;
}

function resolveSectionTitle(key: string, locale: "en" | "zh"): string {
  const map: Record<string, { en: string; zh: string }> = {
    "team.communication.energy_translation": { en: "Energy translation", zh: "沟通能量翻译" },
    "team.communication.abstract_first": { en: "Abstract-first communication", zh: "先抽象后细节" },
    "team.communication.concrete_first": { en: "Concrete-first communication", zh: "先细节后抽象" },
    "team.decision.logic_empathy_mix": { en: "Logic and empathy mix", zh: "理性与共情并存" },
    "team.decision.structured_closure": { en: "Structured closure", zh: "偏结构化收束" },
    "team.decision.iterative_exploration": { en: "Iterative exploration", zh: "偏迭代探索" },
    "team.stress.stability_gap": { en: "Stability gap", zh: "稳定性落差" },
    "team.stress.reactivity_spikes": { en: "Reactivity spikes", zh: "压力反应峰值" },
    "team.stress.steady_recovery": { en: "Steady recovery", zh: "恢复节奏稳定" },
    "team.blindspot.context_translation": { en: "Context translation", zh: "上下文翻译缺口" },
    "team.blindspot.decision_friction": { en: "Decision friction", zh: "决策摩擦点" },
    "team.blindspot.execution_alignment": { en: "Execution alignment", zh: "执行对齐盲区" },
  };

  return map[key]?.[locale] ?? key;
}

function MemberRow({
  item,
  sectionKey,
  locale,
  copy,
}: {
  item: AssessmentProgressListItem;
  sectionKey: "completed_members" | "pending_members";
  locale: "en" | "zh";
  copy: WorkspaceCopy;
}) {
  const [expanded, setExpanded] = useState(false);
  const label = maskSubjectValue(item.subject_value, locale);
  const statusLabel = sectionKey === "completed_members" ? copy.completed : copy.pending;

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-4" data-testid={`team-workspace-member-${sectionKey}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="m-0 text-sm font-semibold text-slate-900">{label}</p>
          <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-500">{statusLabel}</p>
        </div>
        <button
          type="button"
          className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
          data-testid={`team-workspace-member-toggle-${sectionKey}`}
          onClick={() => {
            const nextExpanded = !expanded;
            setExpanded(nextExpanded);
            trackEvent("ui_card_interaction", {
              slug: "team-workspace",
              scale_code: "TEAM",
              visual_kind: "team_member_drill_in",
              interaction: "click",
              sectionKey,
              ctaKey: nextExpanded ? "member_drill_in_open" : "member_drill_in_close",
              continueTarget: "member_progress_detail",
              locale,
            });
          }}
        >
          {expanded ? copy.collapseMember : copy.expandMember}
        </button>
      </div>
      {expanded ? (
        <div className="mt-3 space-y-2 text-sm text-slate-600" data-testid={`team-workspace-member-details-${sectionKey}`}>
          {item.completed_at ? (
            <p className="m-0">
              {copy.memberCompletedAt}
              {locale === "zh" ? "：" : ": "}
              {formatTimestamp(item.completed_at)}
            </p>
          ) : null}
          {item.started_at ? (
            <p className="m-0">
              {copy.memberStartedAt}
              {locale === "zh" ? "：" : ": "}
              {formatTimestamp(item.started_at)}
            </p>
          ) : null}
          <p className="m-0 text-xs text-slate-500">{copy.protectedHint}</p>
        </div>
      ) : null}
    </div>
  );
}

export default function TeamWorkspaceClient({
  orgId,
  assessmentId,
}: {
  orgId: string;
  assessmentId: string;
}) {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const copy = COPY[locale];
  const numericOrgId = normalizeId(orgId);
  const numericAssessmentId = normalizeId(assessmentId);
  const [summary, setSummary] = useState<AssessmentSummaryResponse["summary"] | null>(null);
  const [progress, setProgress] = useState<AssessmentProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamDynamics = (summary?.team_dynamics_v1 ?? null) as TeamDynamicsV1Raw | null;
  const workspaceSurface = (summary?.workspace_surface_v1 ?? null) as WorkspaceSurfaceV1Raw | null;
  const managerActionKeys = normalizeStringList(workspaceSurface?.manager_action_keys);
  const communicationKeys = normalizeStringList(teamDynamics?.communication_fit_keys);
  const decisionKeys = normalizeStringList(teamDynamics?.decision_mix_keys);
  const stressKeys = normalizeStringList(teamDynamics?.stress_pattern_keys);
  const blindspotKeys = normalizeStringList(teamDynamics?.team_blindspot_keys);
  const completedMembers = Array.isArray(progress?.completed_list) ? progress?.completed_list ?? [] : [];
  const pendingMembers = Array.isArray(progress?.pending_list) ? progress?.pending_list ?? [] : [];

  const progressHref = useMemo(
    () => localizedPath(`/workspace/team/${numericOrgId}/assessments/${numericAssessmentId}#team-member-progress`, locale),
    [locale, numericAssessmentId, numericOrgId]
  );

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [summaryResponse, progressResponse] = await Promise.all([
          getOrgAssessmentSummary({ orgId: numericOrgId, assessmentId: numericAssessmentId }),
          getOrgAssessmentProgress({ orgId: numericOrgId, assessmentId: numericAssessmentId }),
        ]);

        if (!active) {
          return;
        }

        setSummary(summaryResponse.summary ?? null);
        setProgress(progressResponse);
      } catch (cause) {
        if (!active) {
          return;
        }

        const message = cause instanceof Error ? cause.message : copy.unauthorized;
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (numericOrgId > 0 && numericAssessmentId > 0) {
      void run();
    } else {
      setLoading(false);
      setError(copy.unauthorized);
    }

    return () => {
      active = false;
    };
  }, [copy.unauthorized, numericAssessmentId, numericOrgId]);

  useEffect(() => {
    if (!workspaceSurface) {
      return;
    }

    trackEvent("ui_card_impression", {
      slug: "team-workspace",
      scale_code: "TEAM",
      visual_kind: "team_workspace_surface",
      ctaKey: "workspace_surface_view",
      continueTarget: "team_workspace",
      entrySurface: "protected_team_workspace",
      locale,
    });
  }, [locale, workspaceSurface]);

  const handleManagerAction = (actionKey: string) => {
    trackEvent("ui_card_interaction", {
      slug: "team-workspace",
      scale_code: "TEAM",
      visual_kind: "team_manager_action",
      interaction: "click",
      actionKey,
      ctaKey: actionKey,
      continueTarget: "team_member_progress",
      entrySurface: "protected_team_workspace",
      locale,
    });
  };

  return (
    <div data-testid="team-workspace-client" className="space-y-6">
      <section
        data-testid="team-workspace-hero"
        className="rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] px-6 py-6 shadow-[var(--fm-shadow-sm)]"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{copy.kicker}</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h1 className="m-0 text-2xl font-bold text-slate-950">{copy.title}</h1>
            <p className="m-0 max-w-3xl text-sm leading-7 text-slate-600">{copy.description}</p>
            {workspaceSurface ? (
              <p className="m-0 text-sm font-medium text-slate-900">
                {copy.focus}
                {locale === "zh" ? "：" : ": "}
                {resolveSectionTitle(String(workspaceSurface.workspace_focus_key ?? ""), locale)}
              </p>
            ) : null}
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="m-0 font-medium text-slate-900">{copy.teamCoverage}</p>
            <p className="m-0 mt-1">
              {(workspaceSurface?.analyzed_member_count ?? 0)}
              {" / "}
              {(workspaceSurface?.team_member_count ?? progress?.total ?? 0)}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <Card data-testid="team-workspace-loading">
          <CardContent className="py-6 text-sm text-slate-600">{copy.loading}</CardContent>
        </Card>
      ) : null}

      {!loading && error ? <Alert data-testid="team-workspace-error">{error}</Alert> : null}

      {!loading && !error ? (
        <>
          <section className="grid gap-4 lg:grid-cols-2">
            <Card data-testid="team-workspace-communication">
              <CardHeader>
                <CardTitle className="text-lg">{copy.communication}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {communicationKeys.length > 0 ? communicationKeys.map((key) => (
                  <p key={key} className="m-0">{resolveSectionTitle(key, locale)}</p>
                )) : <p className="m-0">{copy.noTeamAuthority}</p>}
              </CardContent>
            </Card>
            <Card data-testid="team-workspace-decision">
              <CardHeader>
                <CardTitle className="text-lg">{copy.decision}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {decisionKeys.length > 0 ? decisionKeys.map((key) => (
                  <p key={key} className="m-0">{resolveSectionTitle(key, locale)}</p>
                )) : <p className="m-0">{copy.noTeamAuthority}</p>}
              </CardContent>
            </Card>
            <Card data-testid="team-workspace-stress">
              <CardHeader>
                <CardTitle className="text-lg">{copy.stress}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {stressKeys.length > 0 ? stressKeys.map((key) => (
                  <p key={key} className="m-0">{resolveSectionTitle(key, locale)}</p>
                )) : <p className="m-0">{copy.noTeamAuthority}</p>}
              </CardContent>
            </Card>
            <Card data-testid="team-workspace-blindspots">
              <CardHeader>
                <CardTitle className="text-lg">{copy.blindspots}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {blindspotKeys.length > 0 ? blindspotKeys.map((key) => (
                  <p key={key} className="m-0">{resolveSectionTitle(key, locale)}</p>
                )) : <p className="m-0">{copy.noTeamAuthority}</p>}
              </CardContent>
            </Card>
          </section>

          <Card data-testid="team-workspace-manager-loop">
            <CardHeader>
              <CardTitle className="text-lg">{copy.managerLoop}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <section className="space-y-3">
                <p className="m-0 text-sm font-medium text-slate-900">{copy.nextActions}</p>
                <div className="flex flex-wrap gap-3">
                  {managerActionKeys.map((key, index) => (
                    <a
                      key={key}
                      href={progressHref}
                      className={cn(buttonVariants({ variant: index === 0 ? "default" : "outline" }), "w-full sm:w-auto")}
                      data-testid={`team-workspace-manager-action-${index}`}
                      onClick={() => handleManagerAction(key)}
                    >
                      {resolveActionLabel(key, locale)}
                    </a>
                  ))}
                  <a
                    href={progressHref}
                    className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                    data-testid="team-workspace-progress-cta"
                    onClick={() => handleManagerAction("check_member_progress")}
                  >
                    {copy.jumpToProgress}
                  </a>
                </div>
              </section>
            </CardContent>
          </Card>

          <section id="team-member-progress" data-testid="team-workspace-progress" className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{copy.completedMembers}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {completedMembers.length > 0 ? completedMembers.map((item, index) => (
                  <MemberRow key={`completed-${index}`} item={item} sectionKey="completed_members" locale={locale} copy={copy} />
                )) : <p className="m-0 text-sm text-slate-600">{copy.noMembers}</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{copy.pendingMembers}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingMembers.length > 0 ? pendingMembers.map((item, index) => (
                  <MemberRow key={`pending-${index}`} item={item} sectionKey="pending_members" locale={locale} copy={copy} />
                )) : <p className="m-0 text-sm text-slate-600">{copy.noMembers}</p>}
              </CardContent>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
