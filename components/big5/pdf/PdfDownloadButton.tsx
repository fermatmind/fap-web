"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { canDownloadReportPdf, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { fetchAttemptReportPdfWithMeta } from "@/lib/api/v0_3";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function PdfDownloadButton({
  attemptId,
  locked,
  accessProjection,
  onDownloaded,
  locale = "en",
  filenamePrefix = "big5-report",
  filenameHint,
  downloadLabel,
  safetyDisabled,
  safetyDisabledLabel,
  safetyDisabledReason,
}: {
  attemptId: string;
  locked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  onDownloaded?: () => void;
  locale?: "en" | "zh";
  filenamePrefix?: string;
  filenameHint?: string | null;
  downloadLabel?: string | null;
  safetyDisabled?: boolean;
  safetyDisabledLabel?: string | null;
  safetyDisabledReason?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resolvedAttemptId = accessProjection?.attemptId ?? attemptId;
  const pdfLocked = accessProjection ? !canDownloadReportPdf(accessProjection) : locked;
  const copy = {
    locked: locale === "zh" ? "解锁后下载 PDF" : "Unlock to download PDF",
    loading: locale === "zh" ? "PDF 生成中..." : "Generating PDF...",
    ready: locale === "zh" ? "下载 PDF" : "Download PDF",
    safetyDisabled: locale === "zh" ? "PDF 下载暂不可用" : "PDF download unavailable",
    pendingError:
      locale === "zh" ? "PDF 仍在生成中，请稍后重试。" : "PDF is still generating. Please retry.",
    failure:
      locale === "zh" ? "PDF 下载失败，请稍后重试。" : "Failed to generate/download PDF. Please retry.",
  };

  const handleDownload = async () => {
    if (safetyDisabled) return;
    if (pdfLocked) return;

    setLoading(true);
    setError(null);

    try {
      let blob: Blob | null = null;
      let resolvedFilenameHint = filenameHint?.trim() || null;

      for (let i = 0; i < 6; i += 1) {
        try {
          const response = await fetchAttemptReportPdfWithMeta({ attemptId: resolvedAttemptId });
          blob = response.blob;
          resolvedFilenameHint = response.filenameHint?.trim() || resolvedFilenameHint;
          if (blob.size > 0) break;
        } catch (cause) {
          if (i >= 5) throw cause;
        }
        await wait(3000);
      }

      if (!blob || blob.size === 0) {
        throw new Error(copy.pendingError);
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = resolvedFilenameHint || `${filenamePrefix}-${resolvedAttemptId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      onDownloaded?.();
    } catch {
      setError(copy.failure);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" disabled={Boolean(safetyDisabled) || pdfLocked || loading} onClick={handleDownload}>
        {safetyDisabled
          ? (safetyDisabledLabel?.trim() || copy.safetyDisabled)
          : pdfLocked
            ? copy.locked
            : loading
              ? copy.loading
              : resolvedButtonLabel(copy.ready, downloadLabel)}
      </Button>
      {safetyDisabled && safetyDisabledReason ? (
        <p className="m-0 text-xs leading-5 text-slate-500">{safetyDisabledReason}</p>
      ) : null}
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}

function resolvedButtonLabel(defaultLabel: string, formLabel?: string | null): string {
  const normalized = String(formLabel ?? "").trim();
  return normalized ? `${defaultLabel} · ${normalized}` : defaultLabel;
}
