"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { fetchAttemptReportPdf } from "@/lib/api/v0_3";

async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function PdfDownloadButton({
  attemptId,
  locked,
  onDownloaded,
}: {
  attemptId: string;
  locked: boolean;
  onDownloaded?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (locked) return;

    setLoading(true);
    setError(null);

    try {
      let blob: Blob | null = null;

      for (let i = 0; i < 6; i += 1) {
        try {
          blob = await fetchAttemptReportPdf({ attemptId });
          if (blob.size > 0) break;
        } catch (cause) {
          if (i >= 5) throw cause;
        }
        await wait(3000);
      }

      if (!blob || blob.size === 0) {
        throw new Error("PDF is still generating.");
      }

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `big5-report-${attemptId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      onDownloaded?.();
    } catch {
      setError("Failed to generate/download PDF. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" disabled={locked || loading} onClick={handleDownload}>
        {locked ? "Unlock to download PDF" : loading ? "Generating PDF..." : "Download PDF"}
      </Button>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
