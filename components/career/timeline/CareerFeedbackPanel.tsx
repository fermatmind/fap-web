"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { submitCareerRecommendationFeedback } from "@/lib/career/api/submitCareerRecommendationFeedback";
import type { CareerLifecycleFeedbackCheckinAdapter } from "@/lib/career/adapters/types";
import { CAREER_TRACKING_EVENTS, trackCareerAttributionEvent } from "@/lib/career/attribution";
import type { Locale } from "@/lib/i18n/locales";

type CareerFeedbackPanelProps = {
  locale: Locale;
  recommendationType: string;
  landingPath: string;
  feedback: CareerLifecycleFeedbackCheckinAdapter | null;
  testId?: string;
};

const SCALE_VALUES = [1, 2, 3, 4, 5] as const;

export function CareerFeedbackPanel({
  locale,
  recommendationType,
  landingPath,
  feedback,
  testId,
}: CareerFeedbackPanelProps) {
  const router = useRouter();
  const [burnoutCheckin, setBurnoutCheckin] = useState<number>(feedback?.burnoutCheckin ?? 3);
  const [careerSatisfaction, setCareerSatisfaction] = useState<number>(feedback?.careerSatisfaction ?? 3);
  const [switchUrgency, setSwitchUrgency] = useState<number>(feedback?.switchUrgency ?? 3);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(false);
    const response = await submitCareerRecommendationFeedback({
      locale,
      type: recommendationType,
      burnoutCheckin,
      careerSatisfaction,
      switchUrgency,
    });

    if (!response || response.ok !== true) {
      setError(true);
      setSaving(false);
      return;
    }

    trackCareerAttributionEvent(CAREER_TRACKING_EVENTS.feedbackSubmit, {
      locale,
      entrySurface: "career_recommendation_detail",
      sourcePageType: "career_recommendation_detail",
      targetAction: "submit_feedback",
      landingPath,
      routeFamily: "recommendation_detail",
      subjectKind: "recommendation_type",
      subjectKey: recommendationType,
      queryMode: "non_query",
    });

    setSaved(true);
    setSaving(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <section
      className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId ?? "career-feedback-panel"}
    >
      <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
        {locale === "zh" ? "反馈复盘" : "Feedback check-in"}
      </h3>
      <form className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
        <label className="text-sm text-[var(--fm-text-muted)]">
          {locale === "zh" ? "倦怠" : "Burnout"}
          <select
            className="mt-1 block w-full rounded-md border border-[var(--fm-border)] bg-white px-2 py-1"
            value={burnoutCheckin}
            onChange={(event) => setBurnoutCheckin(Number(event.target.value))}
          >
            {SCALE_VALUES.map((value) => (
              <option key={`burnout-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-[var(--fm-text-muted)]">
          {locale === "zh" ? "满意度" : "Satisfaction"}
          <select
            className="mt-1 block w-full rounded-md border border-[var(--fm-border)] bg-white px-2 py-1"
            value={careerSatisfaction}
            onChange={(event) => setCareerSatisfaction(Number(event.target.value))}
          >
            {SCALE_VALUES.map((value) => (
              <option key={`satisfaction-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-[var(--fm-text-muted)]">
          {locale === "zh" ? "转换紧迫度" : "Switch urgency"}
          <select
            className="mt-1 block w-full rounded-md border border-[var(--fm-border)] bg-white px-2 py-1"
            value={switchUrgency}
            onChange={(event) => setSwitchUrgency(Number(event.target.value))}
          >
            {SCALE_VALUES.map((value) => (
              <option key={`urgency-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-[var(--fm-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving
              ? locale === "zh"
                ? "提交中…"
                : "Submitting…"
              : locale === "zh"
                ? "提交反馈"
                : "Submit feedback"}
          </button>
          {saved ? (
            <p className="m-0 mt-2 text-xs text-emerald-700">{locale === "zh" ? "已更新" : "Updated"}</p>
          ) : null}
          {error ? (
            <p className="m-0 mt-2 text-xs text-rose-700">
              {locale === "zh" ? "提交失败，请稍后重试" : "Submit failed, please retry."}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
