"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initAnalytics } from "@/lib/analytics";
import {
  getOrCreateAnonId,
  readPendingAnonLinkAttempts,
  removePendingAnonLinkAttempts,
} from "@/lib/anon";
import { getFmToken } from "@/lib/auth/fmToken";
import { linkAnonAttempts } from "@/lib/api/v0_3";
import { ApiError } from "@/lib/api-client";
import { initSentry } from "@/lib/observability/sentry";

export function Providers({ children }: { children: ReactNode }) {
  const linkInFlightRef = useRef(false);
  const linkEndpointUnsupportedRef = useRef(false);

  useEffect(() => {
    initSentry();
    initAnalytics();
  }, []);

  useEffect(() => {
    let active = true;

    const runLinkPass = async () => {
      if (!active) return;
      if (linkInFlightRef.current || linkEndpointUnsupportedRef.current) return;

      const token = getFmToken();
      if (!token) return;

      const anonId = getOrCreateAnonId();
      if (!anonId) return;

      const pendingAttemptIds = readPendingAnonLinkAttempts();
      if (pendingAttemptIds.length === 0) return;

      linkInFlightRef.current = true;
      try {
        const response = await linkAnonAttempts({
          anonId,
          attemptIds: pendingAttemptIds,
        });

        if (!active) return;
        const handledAttemptIds = Array.from(
          new Set([
            ...(Array.isArray(response.linked_attempt_ids) ? response.linked_attempt_ids : []),
            ...(Array.isArray(response.skipped_attempt_ids) ? response.skipped_attempt_ids : []),
          ])
        );

        if (handledAttemptIds.length > 0) {
          removePendingAnonLinkAttempts(handledAttemptIds);
        } else if (response.ok !== false) {
          removePendingAnonLinkAttempts(pendingAttemptIds);
        }
      } catch (error) {
        if (error instanceof ApiError && (error.status === 404 || error.status === 501)) {
          linkEndpointUnsupportedRef.current = true;
        }
      } finally {
        linkInFlightRef.current = false;
      }
    };

    void runLinkPass();
    const timer = window.setInterval(() => {
      void runLinkPass();
    }, 12000);
    const handleStorage = () => {
      void runLinkPass();
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return <>{children}</>;
}
