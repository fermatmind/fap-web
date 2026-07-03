"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import { canDownloadReportPdf, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { trackEvent } from "@/lib/analytics";
import { fetchAttemptReportPdfWithMeta, fetchAttemptResultPagePdfWithMeta } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

function triggerBrowserDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

function isAllowedPdfUrl(value: string): boolean {
  if (value.startsWith("//")) {
    return false;
  }

  try {
    const baseOrigin = window.location.origin;
    const url = new URL(value, baseOrigin);
    const isSameOrigin = url.origin === baseOrigin;
    const isFirstPartyWeb = url.origin === "https://fermatmind.com" || url.origin === "https://www.fermatmind.com";
    const isPdfPath = /^\/(?:api\/v0\.3\/)?attempts\/[^/?#]+\/(?:report|result-page)\.pdf$/.test(url.pathname);

    return (isSameOrigin || isFirstPartyWeb) && isPdfPath;
  } catch {
    return false;
  }
}

function extractAttemptIdFromPdfUrl(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  if (!normalized) return null;
  if (!isAllowedPdfUrl(normalized)) return null;

  const match = normalized.match(/\/attempts\/([^/?#]+)\/(?:report|result-page)\.pdf(?:[?#].*)?$/);
  if (!match?.[1]) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

type AttemptPdfDownloadButtonProps = {
  attemptId?: string | null;
  locale: Locale;
  label: string;
  loadingLabel: string;
  errorMessage: string;
  filenamePrefix?: string;
  pdfVariant: string;
  accessProjection?: AttemptReportAccessView | null;
  pdfUrl?: string | null;
  fallbackUrl?: string | null;
  exportSurface?: "report" | "result_page";
  buttonVariant?: ButtonProps["variant"];
  buttonClassName?: string;
  className?: string;
  testId?: string;
};

export function AttemptPdfDownloadButton({
  attemptId,
  locale,
  label,
  loadingLabel,
  errorMessage,
  filenamePrefix = "report",
  pdfVariant,
  accessProjection,
  pdfUrl,
  fallbackUrl,
  exportSurface = "report",
  buttonVariant = "outline",
  buttonClassName,
  className,
  testId,
}: AttemptPdfDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedPdfUrl = accessProjection?.actions.pdfHref ?? pdfUrl ?? null;
  const resolvedAttemptId =
    accessProjection?.attemptId
    ?? attemptId
    ?? extractAttemptIdFromPdfUrl(resolvedPdfUrl)
    ?? extractAttemptIdFromPdfUrl(fallbackUrl);
  const downloadEnabled = accessProjection ? canDownloadReportPdf(accessProjection) && Boolean(resolvedAttemptId) : Boolean(resolvedAttemptId);

  const handleDownload = async () => {
    if (!downloadEnabled || isDownloading) return;

    setIsDownloading(true);
    setError(null);

    trackEvent("pdf_download", {
      pdf_variant: pdfVariant,
      locale,
      ...(resolvedAttemptId ? { attempt_id: resolvedAttemptId } : {}),
    });

    try {
      if (!resolvedAttemptId) {
        throw new Error("Missing attempt id.");
      }

      const response = exportSurface === "result_page"
        ? await fetchAttemptResultPagePdfWithMeta({ attemptId: resolvedAttemptId })
        : await fetchAttemptReportPdfWithMeta({ attemptId: resolvedAttemptId });
      const blob = response.blob;
      if (blob.size <= 0) {
        throw new Error("Empty pdf blob.");
      }

      triggerBrowserDownload(blob, response.filenameHint?.trim() || `${filenamePrefix}-${resolvedAttemptId}.pdf`);
    } catch {
      setError(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant={buttonVariant}
        className={buttonClassName}
        disabled={isDownloading || !downloadEnabled || !resolvedAttemptId}
        onClick={() => void handleDownload()}
        data-testid={testId}
      >
        {isDownloading ? loadingLabel : label}
      </Button>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
