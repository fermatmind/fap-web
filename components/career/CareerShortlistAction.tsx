"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchCareerShortlistState } from "@/lib/career/api/fetchCareerShortlistState";
import { submitCareerShortlistAdd } from "@/lib/career/api/submitCareerShortlistAdd";
import { CAREER_TRACKING_EVENTS, trackCareerAttributionEvent } from "@/lib/career/attribution";
import type { Locale } from "@/lib/i18n/locales";

type CareerShortlistActionProps = {
  locale: Locale;
  subjectSlug: string;
  sourcePageType: "career_job_detail" | "career_recommendation_detail";
  entrySurface: "career_job_detail" | "career_recommendation_detail";
  routeFamily: "job_detail" | "recommendation_detail";
  landingPath: string;
  testId?: string;
};

const VISITOR_KEY_STORAGE = "fm_career_shortlist_visitor_key";

function resolveVisitorKey(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(VISITOR_KEY_STORAGE);
  if (existing && existing.trim()) {
    return existing;
  }

  const generated =
    typeof window.crypto !== "undefined" && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  window.localStorage.setItem(VISITOR_KEY_STORAGE, generated);
  return generated;
}

export function CareerShortlistAction({
  locale,
  subjectSlug,
  sourcePageType,
  entrySurface,
  routeFamily,
  landingPath,
  testId,
}: CareerShortlistActionProps) {
  const normalizedSlug = useMemo(() => String(subjectSlug ?? "").trim().toLowerCase(), [subjectSlug]);
  const [visitorKey] = useState<string>(() => resolveVisitorKey());
  const [shortlisted, setShortlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      if (!visitorKey || !normalizedSlug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await fetchCareerShortlistState({
        locale,
        visitorKey,
        subjectKind: "job_slug",
        subjectSlug: normalizedSlug,
        sourcePageType,
      });

      if (cancelled) {
        return;
      }

      setShortlisted(response?.data && typeof response.data === "object" ? (response.data as { is_shortlisted?: boolean }).is_shortlisted === true : false);
      setLoading(false);
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [locale, visitorKey, normalizedSlug, sourcePageType]);

  const onAdd = async () => {
    if (!visitorKey || !normalizedSlug || shortlisted || saving) {
      return;
    }

    setSaving(true);
    setError(null);

    const response = await submitCareerShortlistAdd({
      locale,
      visitorKey,
      subjectKind: "job_slug",
      subjectSlug: normalizedSlug,
      sourcePageType,
    });

    if (!response || response.ok !== true) {
      setError(locale === "zh" ? "加入候选清单失败，请稍后重试。" : "Failed to add shortlist item. Please retry.");
      setSaving(false);
      return;
    }

    setShortlisted(true);
    setSaving(false);

    trackCareerAttributionEvent(CAREER_TRACKING_EVENTS.shortlistAdd, {
      locale,
      entrySurface,
      sourcePageType,
      targetAction: "add_shortlist",
      landingPath,
      routeFamily,
      subjectKind: "job_slug",
      subjectKey: normalizedSlug,
      queryMode: "non_query",
    });
  };

  return (
    <section
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4"
      data-testid={testId ?? "career-shortlist-action"}
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={loading || saving || shortlisted}
          onClick={onAdd}
          className="rounded-md bg-[var(--fm-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading
            ? locale === "zh"
              ? "读取中…"
              : "Loading…"
            : shortlisted
              ? locale === "zh"
                ? "已加入 Shortlist"
                : "Added to shortlist"
              : saving
                ? locale === "zh"
                  ? "提交中…"
                  : "Adding…"
                : locale === "zh"
                  ? "加入 Shortlist"
                  : "Add to shortlist"}
        </button>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "Shortlist 为真实持久化动作，仅在后端写入成功后触发 attribution 事件。"
            : "Shortlist is a persisted action. Attribution is emitted only after backend write succeeds."}
        </p>
      </div>
      {error ? <p className="m-0 mt-2 text-xs text-rose-700">{error}</p> : null}
    </section>
  );
}
