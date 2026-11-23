"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { observeAttemptResult, type ReportPurchaseInteraction } from "@/lib/api/v0_3";
import { hasAnalyticsConsent } from "@/lib/consent/store";

export function useReportPurchaseObservation(root: RefObject<HTMLDivElement | null>, attemptId: string, receipt?: string | null) {
  const sent = useRef(new Map<ReportPurchaseInteraction, string>());
  const observe = useCallback((interaction: ReportPurchaseInteraction) => {
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true" || !receipt
      || !hasAnalyticsConsent() || sent.current.has(interaction)) return;
    sent.current.set(interaction, receipt);
    void observeAttemptResult({ attemptId, receipt, interaction }).catch(() => {
      if (sent.current.get(interaction) === receipt) sent.current.delete(interaction);
    });
  }, [attemptId, receipt]);

  useEffect(() => {
    if (!receipt || !root.current || typeof IntersectionObserver === "undefined") return;
    const targets = root.current.querySelectorAll<HTMLElement>("[data-report-purchase-entry], #unlock-payment-options button");
    const visible = new Set<Element>();
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const clear = (target: Element) => {
      clearTimeout(timers.get(target));
      timers.delete(target);
    };
    const schedule = (target: Element) => {
      clear(target);
      if (!visible.has(target) || document.visibilityState !== "visible" || !hasAnalyticsConsent()) return;
      timers.set(target, setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const viewport = window.visualViewport;
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const hit = document.elementFromPoint(x, y);
        if (document.visibilityState === "visible" && hit && target.contains(hit)
          && (!viewport || (y >= viewport.offsetTop && y < viewport.offsetTop + viewport.height))) {
          observe(target.hasAttribute("data-report-purchase-entry") ? "entry_visible" : "payment_visible");
        }
      }, 1000));
    };
    const observer = new IntersectionObserver(entries => {
      for (const { target, intersectionRatio } of entries) {
        if (intersectionRatio >= .5) visible.add(target);
        else visible.delete(target);
        schedule(target);
      }
    }, { threshold: .5 });
    const refresh = () => targets.forEach(schedule);
    targets.forEach(target => observer.observe(target));
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("fm:analytics-consent-updated", refresh);
    return () => {
      observer.disconnect();
      targets.forEach(clear);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("fm:analytics-consent-updated", refresh);
    };
  }, [observe, receipt, root]);

  return observe;
}
