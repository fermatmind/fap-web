"use client";

import Link from "next/link";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiCompareInviteViewModel } from "@/lib/mbti/compareInvite";

function resolveStatusBadge(status: string | undefined, locale: Locale): { label: string; className: string } {
  switch (status) {
    case "ready":
      return {
        label: locale === "zh" ? "已可查看对比" : "Compare ready",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    case "purchased":
      return {
        label: locale === "zh" ? "已购买完整版" : "Purchased",
        className: "border-sky-200 bg-sky-50 text-sky-800",
      };
    default:
      return {
        label: locale === "zh" ? "等待对方完成" : "Waiting for invitee",
        className: "border-amber-200 bg-amber-50 text-amber-800",
      };
  }
}

export default function MbtiCompareInviteView({
  locale,
  viewModel,
  primaryCtaHref,
  onRelationshipSectionClick,
  onActionPromptClick,
}: {
  locale: Locale;
  viewModel: MbtiCompareInviteViewModel;
  primaryCtaHref?: string;
  onRelationshipSectionClick?: (sectionKey: string) => void;
  onActionPromptClick?: (actionKey: string) => void;
}) {
  const statusBadge = resolveStatusBadge(viewModel.status, locale);
  const showReadyContent = viewModel.status === "ready" || viewModel.status === "purchased";
  const compareSummary = viewModel.compareSummary;
  const relationshipSync = viewModel.relationshipSync;
  const actionPromptHref = relationshipSync?.actionPrompt?.ctaPath || "#mbti-dyadic-sync-card";

  return (
    <main data-testid="mbti-compare-invite-view" className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_48%,_#eff6ff_100%)] px-6 py-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <Badge data-testid="mbti-compare-status-badge" className={statusBadge.className}>
                {statusBadge.label}
              </Badge>
              <div className="space-y-2">
                <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  {locale === "zh" ? "MBTI 对比邀请" : "MBTI compare invite"}
                </h1>
                <p className="m-0 max-w-2xl text-sm leading-7 text-slate-600">
                  {locale === "zh"
                    ? "这里只显示公开可分享的结果摘要与对比信息，不包含任何付费报告内容。"
                    : "This page only shows public-safe summary and compare data, without any paid report content."}
                </p>
              </div>
            </div>

            {primaryCtaHref && viewModel.primaryCtaLabel ? (
              <Link href={primaryCtaHref} className={buttonVariants({ className: "min-w-[220px]" })}>
                {viewModel.primaryCtaLabel}
              </Link>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="m-0 text-lg font-semibold text-slate-900">
            {locale === "zh" ? "邀请者摘要" : "Inviter summary"}
          </h2>
          <MbtiShareSummaryCard
            locale={locale}
            card={viewModel.inviterCard}
            variant="compact"
            showActions={false}
            testId="mbti-compare-inviter-card"
          />
        </section>

        {showReadyContent ? (
          <section className="space-y-3">
            <h2 className="m-0 text-lg font-semibold text-slate-900">
              {locale === "zh" ? "受邀者摘要" : "Invitee summary"}
            </h2>
            <MbtiShareSummaryCard
              locale={locale}
              card={viewModel.inviteeCard}
              variant="compact"
              showActions={false}
              testId="mbti-compare-invitee-card"
            />
          </section>
        ) : null}

        {showReadyContent && compareSummary ? (
          <Card data-testid="mbti-compare-summary-card" className="border-white/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-950">
                {compareSummary.title || (locale === "zh" ? "对比摘要" : "Compare summary")}
              </CardTitle>
              {compareSummary.summary ? (
                <p className="m-0 text-sm leading-7 text-slate-600">{compareSummary.summary}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {(compareSummary.sharedCount !== null || compareSummary.divergingCount !== null) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "相同维度" : "Shared axes"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{compareSummary.sharedCount ?? "--"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      {locale === "zh" ? "差异维度" : "Diverging axes"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{compareSummary.divergingCount ?? "--"}</p>
                  </div>
                </div>
              ) : null}

              {compareSummary.axes.length > 0 ? (
                <div className="grid gap-3">
                  {compareSummary.axes.map((axis) => (
                    <div key={axis.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="m-0 text-base font-semibold text-slate-900">{axis.label}</p>
                          {axis.summary ? (
                            <p className="m-0 text-sm leading-6 text-slate-600">{axis.summary}</p>
                          ) : null}
                        </div>
                        {axis.state ? (
                          <Badge className="border-slate-200 bg-white text-slate-700">{axis.state}</Badge>
                        ) : null}
                      </div>

                      {(axis.inviterSide || axis.inviteeSide) ? (
                        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <span className="font-semibold text-slate-900">{locale === "zh" ? "邀请者" : "Inviter"}:</span>{" "}
                            <span>{axis.inviterSide || "--"}</span>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                            <span className="font-semibold text-slate-900">{locale === "zh" ? "受邀者" : "Invitee"}:</span>{" "}
                            <span>{axis.inviteeSide || "--"}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {relationshipSync ? (
          <Card
            id="mbti-dyadic-sync-card"
            data-testid="mbti-dyadic-sync-card"
            className="border-white/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
          >
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-sky-200 bg-sky-50 text-sky-800">
                  {locale === "zh" ? "关系同步" : "Relationship sync"}
                </Badge>
                {relationshipSync.scope ? (
                  <Badge data-testid="mbti-dyadic-sync-scope" className="border-slate-200 bg-white text-slate-700">
                    {relationshipSync.scope}
                  </Badge>
                ) : null}
                {relationshipSync.subjectJoinMode ? (
                  <Badge className="border-slate-200 bg-white text-slate-700">
                    {relationshipSync.subjectJoinMode}
                  </Badge>
                ) : null}
              </div>
              <CardTitle className="text-xl text-slate-950">
                {relationshipSync.overviewTitle || (locale === "zh" ? "双人关系同步" : "Relationship sync")}
              </CardTitle>
              {relationshipSync.overviewSummary ? (
                <p className="m-0 text-sm leading-7 text-slate-600">{relationshipSync.overviewSummary}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {(relationshipSync.sharedCount !== null || relationshipSync.divergingCount !== null) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "共享模式" : "Shared patterns"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{relationshipSync.sharedCount ?? "--"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      {locale === "zh" ? "张力线索" : "Tension signals"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{relationshipSync.divergingCount ?? "--"}</p>
                  </div>
                </div>
              ) : null}

              {relationshipSync.sections.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {relationshipSync.sections.map((section, index) => (
                    <button
                      key={section.key}
                      type="button"
                      data-testid={`mbti-dyadic-section-${section.key}`}
                      onClick={() => onRelationshipSectionClick?.(section.key)}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="m-0 text-base font-semibold text-slate-900">{section.title}</p>
                          {section.summary ? (
                            <p className="m-0 text-sm leading-6 text-slate-600">{section.summary}</p>
                          ) : null}
                        </div>
                        <Badge className="border-slate-200 bg-white text-slate-700">{index + 1}</Badge>
                      </div>
                      {section.bullets.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {section.bullets.slice(0, 2).map((bullet) => (
                            <p key={bullet} className="m-0 text-sm leading-6 text-slate-700">
                              {bullet}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              ) : null}

              {relationshipSync.actionPrompt ? (
                <div
                  data-testid="mbti-dyadic-action-card"
                  className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5"
                >
                  <div className="space-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                      {locale === "zh" ? "下一步建议" : "Next step"}
                    </p>
                    <p className="m-0 text-lg font-semibold text-slate-950">{relationshipSync.actionPrompt.title}</p>
                    {relationshipSync.actionPrompt.summary ? (
                      <p className="m-0 text-sm leading-7 text-slate-700">{relationshipSync.actionPrompt.summary}</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    {viewModel.dyadicGraph ? (
                      <span data-testid="mbti-dyadic-graph-meta">
                        {locale === "zh" ? "图节点" : "Graph nodes"}: {viewModel.dyadicGraph.nodes.length}
                      </span>
                    ) : null}
                    {relationshipSync.fingerprint ? (
                      <span className="font-mono text-xs text-slate-500">
                        {relationshipSync.fingerprint.slice(0, 12)}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <Link
                      href={actionPromptHref}
                      data-testid="mbti-dyadic-action-link"
                      className={buttonVariants({ className: "min-w-[220px]" })}
                      onClick={() => onActionPromptClick?.(relationshipSync.actionPrompt?.key || "")}
                    >
                      {relationshipSync.actionPrompt.ctaLabel ||
                        (locale === "zh" ? "查看下一步" : "Use this next step")}
                    </Link>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
