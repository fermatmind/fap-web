import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DatasetDownloadInfoProps = {
  publisherName: string;
  publisherUrl: string;
  licenseName: string;
  licenseUrl: string;
  usageSummary: string;
  downloadUrl: string;
  formats: string[];
};

export function DatasetDownloadInfo({
  publisherName,
  publisherUrl,
  licenseName,
  licenseUrl,
  usageSummary,
  downloadUrl,
  formats,
}: DatasetDownloadInfoProps) {
  return (
    <Card data-testid="dataset-download-info">
      <CardHeader>
        <CardTitle className="text-lg">Publication metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
        <p className="m-0">
          Publisher:{" "}
          <Link href={publisherUrl} className="font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
            {publisherName}
          </Link>
        </p>
        <p className="m-0">
          License:{" "}
          <Link href={licenseUrl} className="font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
            {licenseName}
          </Link>
        </p>
        <p className="m-0">Usage: {usageSummary}</p>
        <p className="m-0">Formats: {formats.length > 0 ? formats.join(", ").toUpperCase() : "N/A"}</p>
        <Link href={downloadUrl} className="inline-flex font-semibold text-[var(--fm-accent)] underline-offset-2 hover:underline">
          Download dataset
        </Link>
      </CardContent>
    </Card>
  );
}

