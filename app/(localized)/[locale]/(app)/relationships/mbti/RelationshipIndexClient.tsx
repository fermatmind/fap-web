"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trackEvent } from "@/lib/analytics";
import { ApiError } from "@/lib/api-client";
import { getPrivateMbtiRelationshipIndex, type MbtiRelationshipIndexResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import {
  buildRelationshipIndexViewModel,
  resolveRelationshipIndexBucket,
  type RelationshipIndexItemViewModel,
} from "@/lib/mbti/relationshipIndex";
import { captureError } from "@/lib/observability/sentry";

const BUCKET_ORDER = [
  "ready_to_continue",
  "needs_consent_refresh",
  "restricted_access",
  "awaiting_partner",
  "recently_active",
] as const;

function formatUpdatedAt(value: string, locale: Locale): string {
  if (!value) {
    return locale === "zh" ? "待同步" : "Pending sync";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolveBucketLabel(bucket: string, locale: Locale): string {
  if (locale === "zh") {
    switch (bucket) {
      case "ready_to_continue":
        return "可继续";
      case "needs_consent_refresh":
        return "需刷新授权";
      case "restricted_access":
        return "访问受限";
      case "awaiting_partner":
        return "等待对方";
      default:
        return "最近活跃";
    }
  }

  switch (bucket) {
    case "ready_to_continue":
      return "Ready to continue";
    case "needs_consent_refresh":
      return "Refresh required";
    case "restricted_access":
      return "Restricted access";
    case "awaiting_partner":
      return "Awaiting partner";
    default:
      return "Recently active";
  }
}

function resolveParticipantRoleLabel(role: string, locale: Locale): string {
  if (locale === "zh") {
    return role === "invitee" ? "参与者" : "发起者";
  }

  return role === "invitee" ? "Participant" : "Inviter";
}

function resolveJourneySummary(item: RelationshipIndexItemViewModel, locale: Locale): string {
  if (item.resume?.resumeReason) {
    return item.resume.resumeReason;
  }

  if (locale === "zh") {
    return item.lastDyadicPulseSignal || "继续回到这段关系的下一步。";
  }

  return item.lastDyadicPulseSignal || "Return to the next shared step in this relationship.";
}

export default function RelationshipIndexClient({
  locale,
}: {
  locale: Locale;
}) {
  const [data, setData] = useState<MbtiRelationshipIndexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const impressionTrackedRef = useRef(false);
  const viewModel = useMemo(() => buildRelationshipIndexViewModel(data), [data]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getPrivateMbtiRelationshipIndex({ locale });
        if (!active) {
          return;
        }

        setData(response);
      } catch (cause) {
        if (!active) {
          return;
        }

        const resolvedError = cause instanceof ApiError ? cause : null;
        setError(
          resolvedError?.status === 401
            ? locale === "zh"
              ? "需要先登录后才能查看关系回访入口。"
              : "Sign in to open the relationship hub."
            : locale === "zh"
              ? "关系回访入口暂时不可用。"
              : "Relationship hub is not available."
        );
        captureError(cause, {
          route: "/(app)/relationships/mbti",
          stage: "load_relationship_index",
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!viewModel || impressionTrackedRef.current) {
      return;
    }

    impressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-relationship-index",
      scale_code: "MBTI",
      visual_kind: "relationship_index_surface",
      continueTarget: viewModel.items[0]?.resumeTarget || "relationship_index_empty",
      entrySurface: "relationship_index_page",
      relationshipIndexVersion: viewModel.version,
      relationshipIndexFingerprint: viewModel.fingerprint,
      indexScope: viewModel.scope,
      relationshipScope: viewModel.items[0]?.relationshipScope || "",
      consentState: viewModel.items[0]?.consentState || "",
      accessState: viewModel.items[0]?.accessState || "",
      journeyState: viewModel.items[0]?.journeyState || "",
      progressState: viewModel.items[0]?.progressState || "",
      participantRole: viewModel.items[0]?.participantRole || "",
      locale,
    });
  }, [locale, viewModel]);

  const groups = useMemo(() => {
    const grouped = new Map<string, RelationshipIndexItemViewModel[]>();

    for (const bucket of BUCKET_ORDER) {
      grouped.set(bucket, []);
    }

    for (const item of viewModel?.items ?? []) {
      const bucket = resolveRelationshipIndexBucket(item);
      if (!grouped.has(bucket)) {
        grouped.set(bucket, []);
      }

      grouped.get(bucket)?.push(item);
    }

    return grouped;
  }, [viewModel]);

  const handleResumeClick = (item: RelationshipIndexItemViewModel, displayOrder: number) => {
    trackEvent("ui_card_interaction", {
      slug: "mbti-relationship-index",
      scale_code: "MBTI",
      visual_kind: "relationship_index_resume",
      interaction: "click",
      sectionKey: resolveRelationshipIndexBucket(item),
      ctaKey: item.resume?.relationshipEntryKeys[0] || item.revisitPriorityKeys[0] || "relationship_resume",
      continueTarget: item.resumeTarget,
      entrySurface: "relationship_index_page",
      relationshipIndexVersion: viewModel?.version || "",
      relationshipIndexFingerprint: viewModel?.fingerprint || "",
      indexScope: viewModel?.scope || "",
      relationshipScope: item.relationshipScope,
      consentState: item.consentState,
      accessState: item.accessState,
      journeyState: item.journeyState,
      progressState: item.progressState,
      participantRole: item.participantRole,
      revisitReorderReason: item.resume?.revisitReorderReason || "",
      displayOrder,
      locale,
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-44 w-full rounded-3xl" />
      </div>
    );
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  return (
    <div data-testid="mbti-relationship-index" className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_48%,_#eff6ff_100%)] px-6 py-8 shadow-[0_24px_64px_rgba(15,23,42,0.08)]">
        <div className="space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
            {locale === "zh" ? "关系回访入口" : "Relationship revisit hub"}
          </p>
          <h1 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            {locale === "zh" ? "我的关系洞察" : "My relationship insights"}
          </h1>
          <p className="m-0 max-w-3xl text-sm leading-7 text-slate-600">
            {locale === "zh"
              ? "这里集中列出你当前可访问的私密关系洞察，并给出最适合继续的入口，不再依赖单条深链回访。"
              : "This hub lists the private relationship insights you can currently access and surfaces the most relevant way to continue without relying on a single deep link."}
          </p>
        </div>
      </section>

      {!viewModel || viewModel.items.length === 0 ? (
        <Card data-testid="mbti-relationship-index-empty">
          <CardContent className="py-8 text-sm text-slate-600">
            {locale === "zh"
              ? "当前还没有可回访的私密关系洞察。完成双人 compare 邀请后，这里会成为稳定的关系回访入口。"
              : "There are no private relationship insights to revisit yet. Once a dyadic compare invite is completed, this becomes the stable relationship revisit entry."}
          </CardContent>
        </Card>
      ) : null}

      {BUCKET_ORDER.map((bucket) => {
        const items = groups.get(bucket) ?? [];
        if (items.length === 0) {
          return null;
        }

        return (
          <section key={bucket} data-testid={`mbti-relationship-index-bucket-${bucket}`} className="space-y-3">
            <div className="space-y-1">
              <h2 className="m-0 text-lg font-semibold text-slate-950">{resolveBucketLabel(bucket, locale)}</h2>
              <p className="m-0 text-sm text-slate-600">
                {locale === "zh"
                  ? "以下关系会按当前最适合继续的优先级排序。"
                  : "Relationships here are ordered by the most relevant next revisit step."}
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((item, index) => (
                <Card
                  key={item.inviteId}
                  data-testid="mbti-relationship-index-card"
                  className="border-white/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                >
                  <CardHeader className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{item.entrySummary.badgeLabel || resolveBucketLabel(bucket, locale)}</Badge>
                      {item.participantRole ? (
                        <Badge className="border-slate-200 bg-white text-slate-700">
                          {resolveParticipantRoleLabel(item.participantRole, locale)}
                        </Badge>
                      ) : null}
                      {item.accessState ? (
                        <Badge className="border-slate-200 bg-white text-slate-700">{item.accessState}</Badge>
                      ) : null}
                      {item.consentState ? (
                        <Badge className="border-slate-200 bg-white text-slate-700">{item.consentState}</Badge>
                      ) : null}
                    </div>
                    <CardTitle className="text-xl text-slate-950">
                      {item.entrySummary.title || (locale === "zh" ? "私密关系洞察" : "Private relationship sync")}
                    </CardTitle>
                    <p className="m-0 text-sm leading-7 text-slate-600">
                      {item.entrySummary.summary || resolveJourneySummary(item, locale)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {locale === "zh" ? "继续原因" : "Continue reason"}
                        </p>
                        <p data-testid="mbti-relationship-index-resume-reason" className="m-0 mt-2 text-sm font-semibold text-slate-900">
                          {item.resume?.resumeReason || item.revisitPriorityKeys[0] || "--"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {locale === "zh" ? "最近双人脉冲" : "Last dyadic pulse"}
                        </p>
                        <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
                          {item.lastDyadicPulseSignal || "--"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="m-0 text-xs text-slate-500">
                        {locale === "zh" ? "最近更新：" : "Updated: "}
                        {formatUpdatedAt(item.updatedAt, locale)}
                      </p>
                      <Link
                        href={item.resumeTarget}
                        className={buttonVariants({ className: "w-full sm:w-auto" })}
                        data-testid="mbti-relationship-index-resume"
                        onClick={() => handleResumeClick(item, index + 1)}
                      >
                        {item.resume?.continueLabel || (locale === "zh" ? "继续关系洞察" : "Continue relationship")}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
