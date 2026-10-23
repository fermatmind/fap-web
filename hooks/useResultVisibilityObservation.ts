"use client";

import { useEffect, useRef } from "react";
import { observeAttemptResult } from "@/lib/api/v0_3";
import { getFmToken } from "@/lib/auth/fmToken";
import { hasAnalyticsConsent } from "@/lib/consent/store";

/** Private owner API only. No analytics URL, identifiers or third-party dispatch. */
export function useResultVisibilityObservation({
  attemptId, anonId, receipt, enabled,
}: { attemptId: string; anonId?: string; receipt?: string | null; enabled: boolean }): void {
  const accepted = useRef<string | null>(null);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
    if (!enabled || !receipt || accepted.current === receipt || !getFmToken()) return;
    const root = document.querySelector<HTMLElement>("[data-result-visible-root]");
    if (!root || typeof IntersectionObserver === "undefined") return;
    let disposed = false;
    // Observe actual result headings, not whitespace or recovery controls inside a large shell.
    const anchors = [...root.querySelectorAll<HTMLElement>("h1, h2")]
      .filter((node) => !node.closest('[data-testid="result-email-recovery-card"]'));
    if (anchors.length === 0) return;
    const visibleAnchors = new Set<Element>();
    let pending = false;
    let attempts = 0;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const eligible = () => !disposed && visibleAnchors.size > 0 && document.visibilityState === "visible"
      && hasAnalyticsConsent() && Boolean(getFmToken()) && accepted.current !== receipt;
    const send = async () => {
      if (!eligible() || pending || attempts >= 2) return;
      pending = true;
      attempts += 1;
      try {
        await observeAttemptResult({ attemptId, anonId, receipt });
        accepted.current = receipt;
      } catch (error) {
        // Keep the same receipt for bounded transient retries; never block the result.
        const status = (error as { status?: number }).status;
        if (attempts < 2 && (!status || status >= 500)) timer = setTimeout(schedule, 1000);
      } finally {
        pending = false;
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      if (eligible()) frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => { void send(); });
      });
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0) visibleAnchors.add(entry.target);
        else visibleAnchors.delete(entry.target);
      }
      schedule();
    });
    anchors.forEach((anchor) => observer.observe(anchor));
    document.addEventListener("visibilitychange", schedule);
    window.addEventListener("fm:analytics-consent-updated", schedule);
    return () => {
      disposed = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("fm:analytics-consent-updated", schedule);
    };
  }, [attemptId, anonId, receipt, enabled]);
}
