"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { fetchAttemptReportPdf } from "@/lib/api/v0_3";
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

type AttemptPdfDownloadButtonProps = {
  attemptId: string;
  locale: Locale;
  label: string;
  loadingLabel: string;
  errorMessage: string;
  filenamePrefix?: string;
  pdfVariant: string;
  fallbackUrl?: string | null;
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
  fallbackUrl,
  buttonVariant = "outline",
  buttonClassName,
  className,
  testId,
}: AttemptPdfDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!attemptId || isDownloading) return;

    setIsDownloading(true);
    setError(null);

    trackEvent("pdf_download", {
      attempt_id: attemptId,
      pdf_variant: pdfVariant,
      locale,
    });

    try {
      const blob = await fetchAttemptReportPdf({ attemptId });
      if (blob.size <= 0) {
        throw new Error("Empty pdf blob.");
      }

      triggerBrowserDownload(blob, `${filenamePrefix}-${attemptId}.pdf`);
    } catch {
      if (fallbackUrl) {
        window.open(fallbackUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(errorMessage);
      }
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
        disabled={isDownloading || !attemptId}
        onClick={() => void handleDownload()}
        data-testid={testId}
      >
        {isDownloading ? loadingLabel : label}
      </Button>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
