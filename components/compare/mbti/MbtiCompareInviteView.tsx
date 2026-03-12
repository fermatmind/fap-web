import Link from "next/link";
import MbtiShareSummaryCard from "@/components/share/MbtiShareSummaryCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MbtiCompareInviteResponse, ShareSummaryResponse } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";

type CompareAxisViewModel = {
  key: string;
  label: string;
  summary: string;
  state: string;
  inviterSide: string;
  inviteeSide: string;
};

type CompareSummaryViewModel = {
  title: string;
  summary: string;
  sharedCount: number | null;
  divergingCount: number | null;
  axes: CompareAxisViewModel[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeCount(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeInviteSummary(value: unknown): ShareSummaryResponse {
  return (asRecord(value) ?? {}) as ShareSummaryResponse;
}

function normalizeCompareSummary(value: unknown): CompareSummaryViewModel | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const axes = Array.isArray(record.axes)
    ? record.axes
        .map((item, index) => {
          const axis = asRecord(item);
          if (!axis) {
            return null;
          }

          const key = normalizeText(axis.code, axis.key, axis.id, index + 1);
          const label = normalizeText(axis.label, axis.title, axis.name, key);
          if (!label) {
            return null;
          }

          return {
            key: key || `${index + 1}`,
            label,
            summary: normalizeText(axis.summary, axis.description, axis.text),
            state: normalizeText(axis.state, axis.relation, axis.match_state),
            inviterSide: normalizeText(axis.inviter_side, axis.inviter, axis.left_side),
            inviteeSide: normalizeText(axis.invitee_side, axis.invitee, axis.right_side),
          };
        })
        .filter((item): item is CompareAxisViewModel => Boolean(item))
    : [];

  return {
    title: normalizeText(record.title, record.headline, record.label),
    summary: normalizeText(record.summary, record.description, record.text),
    sharedCount: normalizeCount(record.shared_count),
    divergingCount: normalizeCount(record.diverging_count),
    axes,
  };
}

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
  data,
  primaryCtaHref,
}: {
  locale: Locale;
  data: MbtiCompareInviteResponse;
  primaryCtaHref?: string;
}) {
  const inviter = normalizeInviteSummary(data.inviter);
  const invitee = normalizeInviteSummary(data.invitee);
  const compare = normalizeCompareSummary(data.compare);
  const status = normalizeText(data.status) || "pending";
  const statusBadge = resolveStatusBadge(status, locale);
  const showReadyContent = status === "ready" || status === "purchased";

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

            {primaryCtaHref && data.primary_cta_label ? (
              <Link href={primaryCtaHref} className={buttonVariants({ className: "min-w-[220px]" })}>
                {data.primary_cta_label}
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
            data={inviter}
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
              data={invitee}
              variant="compact"
              showActions={false}
              testId="mbti-compare-invitee-card"
            />
          </section>
        ) : null}

        {showReadyContent && compare ? (
          <Card data-testid="mbti-compare-summary-card" className="border-white/80 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl text-slate-950">
                {compare.title || (locale === "zh" ? "对比摘要" : "Compare summary")}
              </CardTitle>
              {compare.summary ? (
                <p className="m-0 text-sm leading-7 text-slate-600">{compare.summary}</p>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-5">
              {(compare.sharedCount !== null || compare.divergingCount !== null) ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "相同维度" : "Shared axes"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{compare.sharedCount ?? "--"}</p>
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
                      {locale === "zh" ? "差异维度" : "Diverging axes"}
                    </p>
                    <p className="m-0 mt-2 text-2xl font-semibold text-slate-950">{compare.divergingCount ?? "--"}</p>
                  </div>
                </div>
              ) : null}

              {compare.axes.length > 0 ? (
                <div className="grid gap-3">
                  {compare.axes.map((axis) => (
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
      </div>
    </main>
  );
}
