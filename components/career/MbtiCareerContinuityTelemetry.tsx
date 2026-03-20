"use client";

import { useEffect, useMemo, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";
import { buildMbtiContinuityTelemetryFields } from "@/lib/mbti/continuity";
import type { MbtiContinuityViewModel } from "@/lib/mbti/publicProjection";

export function MbtiCareerContinuityTelemetry({
  locale,
  continuity,
  typeCode,
}: {
  locale: Locale;
  continuity?: MbtiContinuityViewModel | null;
  typeCode: string;
}) {
  const impressionTrackedRef = useRef(false);
  const readDepthTrackedRef = useRef(false);
  const continuityTelemetry = useMemo(
    () => buildMbtiContinuityTelemetryFields(continuity),
    [continuity]
  );

  useEffect(() => {
    if (!continuity || impressionTrackedRef.current) {
      return;
    }

    impressionTrackedRef.current = true;
    trackEvent("ui_card_impression", {
      slug: "mbti-career-recommendation",
      scale_code: "MBTI",
      visual_kind: "career_continuity_entry",
      continueTarget: "career_recommendation",
      typeCode,
      ...continuityTelemetry,
      locale,
    });
  }, [continuity, continuityTelemetry, locale, typeCode]);

  useEffect(() => {
    if (
      !continuity ||
      readDepthTrackedRef.current ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      return;
    }

    const target = window.document.getElementById("recommended-roles");
    if (!target) {
      return;
    }

    const observer = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || readDepthTrackedRef.current) {
          continue;
        }

        readDepthTrackedRef.current = true;
        observer.disconnect();
        trackEvent("ui_card_interaction", {
          slug: "mbti-career-recommendation",
          scale_code: "MBTI",
          visual_kind: "career_continuity_entry",
          interaction: "continue_read_depth",
          sectionKey: "career.recommended_roles",
          continueTarget: "career_recommendation",
          typeCode,
          ...continuityTelemetry,
          locale,
        });
      }
    }, {
      threshold: 0.35,
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [continuity, continuityTelemetry, locale, typeCode]);

  return null;
}
