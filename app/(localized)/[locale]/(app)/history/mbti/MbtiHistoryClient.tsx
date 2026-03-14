"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMyAttempts, type MeAttemptItem } from "@/lib/api/v0_3";
import { SCALE_CANONICAL_SLUG_MAP, normalizeSupportedScaleCode } from "@/lib/assessmentSlugMap";
import { getDictSync } from "@/lib/i18n/getDict";
import { getLocaleFromPathname, localizedPath } from "@/lib/i18n/locales";

type Row = {
  attemptId: string;
  submittedAt: string;
  typeCode: string;
};

function formatSubmittedAt(value: string, locale: "en" | "zh"): string {
  if (!value) return locale === "zh" ? "时间待同步" : "Pending sync";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return locale === "zh"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function resolveMbtiRow(item: MeAttemptItem): Row | null {
  const attemptId = String(item.attempt_id ?? "").trim();
  if (!attemptId) return null;

  const normalizedScaleCode = normalizeSupportedScaleCode(String(item.scale_code ?? "").trim());
  if (normalizedScaleCode && normalizedScaleCode !== "MBTI") {
    return null;
  }

  return {
    attemptId,
    submittedAt: String(item.submitted_at ?? ""),
    typeCode: String(item.type_code ?? "").trim() || "MBTI",
  };
}

export default function MbtiHistoryClient() {
  const pathname = usePathname() ?? "/";
  const locale = getLocaleFromPathname(pathname);
  const isZh = locale === "zh";
  const copy = getDictSync(locale).history.mbti;
  const startTestHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);
  const orderLookupHref = localizedPath("/orders/lookup", locale);

  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await getMyAttempts({
          scaleCode: "MBTI",
          page,
          pageSize: 10,
        });
        const items = Array.isArray(history.items) ? history.items : [];
        const filteredRows = items
          .map((item) => resolveMbtiRow(item))
          .filter((item): item is Row => item !== null);

        const meta = history.meta ?? {};
        const currentPage = Number((meta as { current_page?: unknown }).current_page ?? page);
        const lastPage = Number((meta as { last_page?: unknown }).last_page ?? currentPage);

        if (!active) return;

        setRows(filteredRows);
        setHasNextPage(Number.isFinite(currentPage) && Number.isFinite(lastPage) && currentPage < lastPage);
      } catch (cause) {
        if (!active) return;
        setError(cause instanceof Error ? cause.message : isZh ? "MBTI 历史加载失败。" : "Failed to load MBTI history.");
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
  }, [isZh, page]);

  return (
    <div data-testid="mbti-history-client" className="space-y-4">
      <section
        data-testid="mbti-history-hero"
        className="space-y-4 rounded-[var(--fm-radius-xl)] border border-[var(--fm-border)] bg-[var(--fm-surface)] px-6 py-6 shadow-[var(--fm-shadow-sm)]"
      >
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">{copy.kicker}</p>
          <h1 className="text-2xl font-bold text-slate-900">{copy.title}</h1>
          <p className="m-0 text-sm leading-7 text-slate-600">{copy.descriptionPrimary}</p>
          <p className="m-0 text-sm leading-7 text-slate-600">{copy.descriptionRecovery}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={orderLookupHref}
            className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
            data-testid="mbti-history-recovery-cta"
          >
            {copy.recoverCta}
          </Link>
        </div>
      </section>

      {error ? <Alert>{error}</Alert> : null}

      {loading ? (
        <Card>
          <CardContent className="py-6 text-sm text-slate-600">{copy.loading}</CardContent>
        </Card>
      ) : null}

      {!loading && rows.length === 0 ? (
        <Card data-testid="mbti-history-empty">
          <CardContent className="space-y-4 py-6">
            <div className="space-y-2">
              <h2 className="m-0 text-lg font-semibold text-slate-950">{copy.emptyTitle}</h2>
              <p className="m-0 text-sm text-slate-600">{copy.emptyDescription}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={startTestHref} className={buttonVariants({ className: "w-full sm:w-auto" })} data-testid="mbti-history-empty-start">
                {copy.emptyStartCta}
              </Link>
              <Link
                href={orderLookupHref}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                data-testid="mbti-history-empty-recovery"
              >
                {copy.emptyRecoverCta}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loading && rows.length > 0 ? (
        <section data-testid="mbti-history-list-copy" className="space-y-1">
          <h2 className="m-0 text-lg font-semibold text-slate-950">{copy.listTitle}</h2>
          <p className="m-0 text-sm text-slate-600">{copy.listSubtitle}</p>
        </section>
      ) : null}

      <div className="grid gap-3" data-testid="mbti-history-list">
        {rows.map((row) => (
          <Card key={row.attemptId} data-testid="mbti-history-card">
            <CardHeader className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {copy.completedLabel}
              </p>
              <CardTitle className="text-base text-slate-950">{row.typeCode}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-700">
              <p className="m-0">
                {copy.submittedAtLabel}
                {isZh ? "：" : ": "}
                {formatSubmittedAt(row.submittedAt, locale)}
              </p>
              <p className="m-0">
                {copy.statusLabel}
                {isZh ? "：" : ": "}
                {copy.statusValue}
              </p>
              <Link
                href={localizedPath(`/result/${row.attemptId}`, locale)}
                className={buttonVariants({ variant: "outline", className: "w-full sm:w-auto" })}
                data-testid={`mbti-history-open-${row.attemptId}`}
              >
                {copy.viewReport}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
          {copy.previousPage}
        </Button>
        <Button type="button" variant="outline" disabled={!hasNextPage || loading} onClick={() => setPage((prev) => prev + 1)}>
          {copy.nextPage}
        </Button>
      </div>
    </div>
  );
}
