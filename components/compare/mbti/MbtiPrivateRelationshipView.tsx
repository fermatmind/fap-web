"use client";

import Link from "next/link";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";
import type { PrivateMbtiRelationshipViewModel } from "@/lib/mbti/privateRelationship";

function resolveAccessBadge(accessState: string, locale: Locale): { label: string; className: string } {
  switch (accessState) {
    case "private_access_ready":
      return {
        label: locale === "zh" ? "双方可见" : "Shared privately",
        className: "border-emerald-200 bg-emerald-50 text-emerald-800",
      };
    case "private_access_partial":
      return {
        label: locale === "zh" ? "部分可见" : "Partial private access",
        className: "border-sky-200 bg-sky-50 text-sky-800",
      };
    case "joined_public_only":
      return {
        label: locale === "zh" ? "仅公开对比已就绪" : "Public compare only",
        className: "border-amber-200 bg-amber-50 text-amber-800",
      };
    default:
      return {
        label: locale === "zh" ? "等待双方加入" : "Awaiting both sides",
        className: "border-slate-200 bg-slate-50 text-slate-700",
      };
  }
}

export default function MbtiPrivateRelationshipView({
  locale,
  viewModel,
  onSectionClick,
  onActionPromptClick,
}: {
  locale: Locale;
  viewModel: PrivateMbtiRelationshipViewModel;
  onSectionClick?: (sectionKey: string) => void;
  onActionPromptClick?: (actionKey: string) => void;
}) {
  const relationship = viewModel.relationship;
  const consent = viewModel.consent;
  const accessBadge = resolveAccessBadge(relationship?.accessState || consent?.accessState || "", locale);
  const actionPrompt = relationship?.actionPrompt;

  return (
    <main data-testid="mbti-private-relationship-view" className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_48%,_#eff6ff_100%)] px-6 py-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge data-testid="mbti-private-access-badge" className={accessBadge.className}>
                {accessBadge.label}
              </Badge>
              {relationship?.scope ? (
                <Badge className="border-slate-200 bg-white text-slate-700">{relationship.scope}</Badge>
              ) : null}
              {consent?.consentState ? (
                <Badge data-testid="mbti-private-consent-badge" className="border-slate-200 bg-white text-slate-700">
                  {consent.consentState}
                </Badge>
              ) : null}
            </div>
            <div className="space-y-2">
              <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                {locale === "zh" ? "私密关系洞察" : "Private relationship sync"}
              </h1>
              <p className="m-0 max-w-3xl text-sm leading-7 text-slate-600">
                {relationship?.overviewSummary
                  || (locale === "zh"
                    ? "这里只显示双方可见的私密关系摘要，不暴露底层结果标识或原始报告内容。"
                    : "This surface only shows protected dyadic summaries that both sides may view, without exposing raw identifiers or private report payloads.")}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {relationship?.inviterCard ? (
            <div className="space-y-3">
              <h2 className="m-0 text-lg font-semibold text-slate-900">
                {locale === "zh" ? "邀请者" : "Inviter"}
              </h2>
              <MbtiShareSummaryCard
                locale={locale}
                card={relationship.inviterCard}
                variant="compact"
                showActions={false}
                testId="mbti-private-inviter-card"
              />
            </div>
          ) : null}
          {relationship?.inviteeCard ? (
            <div className="space-y-3">
              <h2 className="m-0 text-lg font-semibold text-slate-900">
                {locale === "zh" ? "受邀者" : "Invitee"}
              </h2>
              <MbtiShareSummaryCard
                locale={locale}
                card={relationship.inviteeCard}
                variant="compact"
                showActions={false}
                testId="mbti-private-invitee-card"
              />
            </div>
          ) : null}
        </section>

        {relationship ? (
          <Card data-testid="mbti-private-relationship-card" className="border-white/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-950">
                {relationship.overviewTitle || (locale === "zh" ? "关系概览" : "Relationship overview")}
              </CardTitle>
              {relationship.overviewSummary ? (
                <p className="m-0 text-sm leading-7 text-slate-600">{relationship.overviewSummary}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {(relationship.sharedCount !== null || relationship.divergingCount !== null) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "共享模式" : "Shared patterns"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{relationship.sharedCount ?? "--"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      {locale === "zh" ? "张力线索" : "Tension signals"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{relationship.divergingCount ?? "--"}</p>
                  </div>
                </div>
              ) : null}

              {relationship.sections.length > 0 ? (
                <div className="grid gap-3 lg:grid-cols-2">
                  {relationship.sections.map((section, index) => (
                    <button
                      key={section.key}
                      type="button"
                      data-testid={`mbti-private-section-${section.key}`}
                      onClick={() => onSectionClick?.(section.key)}
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

              {actionPrompt ? (
                <div data-testid="mbti-private-action-card" className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
                  <div className="space-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">
                      {locale === "zh" ? "私密下一步" : "Private next step"}
                    </p>
                    <p className="m-0 text-lg font-semibold text-slate-950">{actionPrompt.title}</p>
                    {actionPrompt.summary ? (
                      <p className="m-0 text-sm leading-7 text-slate-700">{actionPrompt.summary}</p>
                    ) : null}
                  </div>
                  {actionPrompt.ctaPath ? (
                    <Link
                      href={actionPrompt.ctaPath}
                      data-testid="mbti-private-action-link"
                      className={buttonVariants({ className: "mt-4" })}
                      onClick={() => onActionPromptClick?.(actionPrompt.key)}
                    >
                      {actionPrompt.ctaLabel || (locale === "zh" ? "继续查看" : "Continue")}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}
