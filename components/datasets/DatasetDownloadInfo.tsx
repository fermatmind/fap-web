import Link from "next/link";

type DatasetDownloadInfoProps = {
  publisherName: string;
  publisherUrl: string;
  licenseName: string;
  licenseUrl: string;
  usageSummary: string;
  downloadUrl: string;
  formats: string[];
};

export function DatasetDownloadInfo({ publisherName, publisherUrl, licenseName, licenseUrl, usageSummary, downloadUrl, formats }: DatasetDownloadInfoProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="dataset-download-info">
      <div className="space-y-2">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">Download and usage</h2>
        <p className="m-0 text-sm leading-6 text-slate-500">{usageSummary}</p>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Info label="Publisher" href={publisherUrl} value={publisherName} />
        <Info label="License" href={licenseUrl} value={licenseName} />
        <Info label="Formats" value={formats.length > 0 ? formats.join(", ").toUpperCase() : "N/A"} />
      </div>
      <Link href={downloadUrl} className="mt-5 inline-flex min-h-[42px] items-center rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
        Download dataset
      </Link>
    </section>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      {href ? (
        <Link href={href} className="mt-2 inline-flex text-sm font-medium text-slate-950 hover:text-orange-600">
          {value}
        </Link>
      ) : (
        <p className="m-0 mt-2 text-sm font-medium text-slate-950">{value}</p>
      )}
    </div>
  );
}
