"use client";

import { useState, useTransition } from "react";
import {
  approveCareerCrosswalkPatch,
  createCareerCrosswalkPatch,
  rejectCareerCrosswalkPatch,
} from "@/lib/career/api/fetchCareerCrosswalkOps";
import type { Locale } from "@/lib/i18n/locales";

type CrosswalkPatchFormProps = {
  locale: Locale;
  subjectSlug: string;
  defaultTargetKind?: "occupation" | "family";
  defaultTargetSlug?: string;
  latestPatchKey?: string | null;
};

export function CrosswalkPatchForm({
  locale,
  subjectSlug,
  defaultTargetKind = "occupation",
  defaultTargetSlug,
  latestPatchKey,
}: CrosswalkPatchFormProps) {
  const [targetKind, setTargetKind] = useState<"occupation" | "family">(defaultTargetKind);
  const [targetSlug, setTargetSlug] = useState(defaultTargetSlug ?? subjectSlug);
  const [overrideMode, setOverrideMode] = useState("exact");
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runCreatePatch() {
    startTransition(async () => {
      const result = await createCareerCrosswalkPatch({
        locale,
        payload: {
          subject_kind: "career_job_detail",
          subject_slug: subjectSlug,
          target_kind: targetKind,
          target_slug: targetSlug,
          crosswalk_mode_override: overrideMode,
          review_notes: reviewNotes,
        },
      });
      setStatusText(result?.status === "ok" ? "Patch submitted." : "Patch submit failed.");
    });
  }

  function runApproveReject(action: "approve" | "reject") {
    if (!latestPatchKey) {
      setStatusText("No latest patch available for review action.");
      return;
    }

    startTransition(async () => {
      const result =
        action === "approve"
          ? await approveCareerCrosswalkPatch({ locale, patchKey: latestPatchKey, reviewNotes })
          : await rejectCareerCrosswalkPatch({ locale, patchKey: latestPatchKey, reviewNotes });

      setStatusText(result?.status === "ok" ? `Patch ${action}d.` : `Patch ${action} failed.`);
    });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4" data-testid="crosswalk-patch-form">
      <h2 className="text-base font-semibold text-slate-900">Submit override patch</h2>
      <p className="mt-1 text-xs text-slate-600">subject: {subjectSlug}</p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">target_kind</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={targetKind}
            onChange={(event) => setTargetKind(event.target.value as "occupation" | "family")}
          >
            <option value="occupation">occupation</option>
            <option value="family">family</option>
          </select>
        </label>
        <label className="text-sm text-slate-700">
          <span className="mb-1 block text-xs text-slate-500">target_slug</span>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={targetSlug}
            onChange={(event) => setTargetSlug(event.target.value)}
          />
        </label>
        <label className="text-sm text-slate-700 sm:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">crosswalk_mode_override</span>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1"
            value={overrideMode}
            onChange={(event) => setOverrideMode(event.target.value)}
          />
        </label>
        <label className="text-sm text-slate-700 sm:col-span-2">
          <span className="mb-1 block text-xs text-slate-500">review_notes</span>
          <textarea
            className="w-full rounded border border-slate-300 px-2 py-1"
            rows={3}
            value={reviewNotes}
            onChange={(event) => setReviewNotes(event.target.value)}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
          onClick={runCreatePatch}
          disabled={isPending}
        >
          Submit patch
        </button>
        <button
          type="button"
          className="rounded border border-emerald-300 px-3 py-1.5 text-sm text-emerald-700 disabled:opacity-50"
          onClick={() => runApproveReject("approve")}
          disabled={isPending || !latestPatchKey}
        >
          Approve latest
        </button>
        <button
          type="button"
          className="rounded border border-rose-300 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-50"
          onClick={() => runApproveReject("reject")}
          disabled={isPending || !latestPatchKey}
        >
          Reject latest
        </button>
      </div>

      {statusText ? <p className="mt-2 text-xs text-slate-600">{statusText}</p> : null}
    </section>
  );
}

