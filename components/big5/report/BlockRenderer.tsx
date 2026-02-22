import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Block = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  metric_level?: string;
  metric_code?: string;
  bucket?: string;
  [key: string]: unknown;
};

function parsePercentile(text: string): number | null {
  const matched = text.match(/(?:percentile|百分位)\s*([0-9]{1,3})/i);
  if (!matched) return null;
  const value = Number(matched[1]);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

function splitBullets(text: string): string[] {
  return text
    .split(/[\n•]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function inferKind(block: Block, sectionKey: string): string {
  if (typeof block.kind === "string" && block.kind.trim().length > 0) {
    return block.kind.trim().toLowerCase();
  }

  if (sectionKey === "facet_table") return "table_row";
  if (sectionKey === "top_facets") return "metric_card";
  if (sectionKey === "domains_overview") return "chart";
  if (sectionKey === "action_plan") return "bullets";
  return "paragraph";
}

function BucketBadge({ bucket }: { bucket?: string }) {
  if (!bucket) return null;
  return (
    <span className="inline-flex rounded-full border border-slate-300 px-2 py-0.5 text-xs uppercase tracking-wide text-slate-600">
      {bucket}
    </span>
  );
}

export function BlockRenderer({
  block,
  sectionKey,
  normsStatus,
}: {
  block: Block;
  sectionKey: string;
  normsStatus?: string;
}) {
  const title = block.title ?? "";
  const body = block.body ?? "";
  const kind = inferKind(block, sectionKey);

  if (kind === "callout") {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        <p className="m-0 font-semibold">{title || "Notice"}</p>
        <p className="m-0 mt-1">{body}</p>
      </div>
    );
  }

  if (kind === "bullets") {
    const bullets = splitBullets(body);
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title || "Highlights"}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {bullets.length > 0 ? bullets.map((item) => <li key={item}>{item}</li>) : <li>{body || "No details"}</li>}
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (kind === "metric_card" || kind === "card") {
    const percentile = parsePercentile(body);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="m-0 text-sm font-semibold text-slate-900">{title || block.metric_code || "Metric"}</p>
          <BucketBadge bucket={block.bucket} />
        </div>
        {percentile !== null && normsStatus !== "MISSING" ? (
          <div className="space-y-1">
            <p className="m-0 text-xs text-slate-600">Percentile</p>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-slate-900" style={{ width: `${percentile}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>10</span>
              <span>30</span>
              <span>70</span>
              <span>90</span>
            </div>
          </div>
        ) : null}
        <p className="mt-2 text-sm text-slate-700">{body}</p>
      </div>
    );
  }

  if (kind === "chart") {
    const percentile = parsePercentile(body);
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="m-0 text-sm font-semibold text-slate-900">{title || block.metric_code || "Domain"}</p>
          <BucketBadge bucket={block.bucket} />
        </div>

        {normsStatus === "MISSING" ? (
          <p className="text-xs text-slate-500">Percentile unavailable in current norms status.</p>
        ) : (
          <div className="space-y-1">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-sky-700" style={{ width: `${Math.max(0, Math.min(100, percentile ?? 0))}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>0</span>
              <span>100</span>
            </div>
          </div>
        )}

        <p className="mt-2 text-sm text-slate-700">{body}</p>
      </div>
    );
  }

  if (kind === "table_row") {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2 border-b border-slate-100 py-2 text-sm">
        <div>
          <p className="m-0 font-medium text-slate-900">{title || block.metric_code || "Facet"}</p>
          <p className="m-0 text-slate-600">{body}</p>
        </div>
        <div className="text-right text-slate-500">{block.bucket ?? ""}</div>
      </div>
    );
  }

  if (kind === "rich_text" || kind === "markdown" || kind === "paragraph") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {title ? <p className="m-0 mb-1 font-semibold text-slate-900">{title}</p> : null}
        <p className="m-0 whitespace-pre-wrap">{body}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600">
      <p className="m-0 font-semibold text-slate-900">Unsupported block</p>
      <p className="m-0 mt-1">{title || body || "This section uses a new block type."}</p>
      <p className="m-0 mt-1 text-xs text-slate-500">kind: {kind} · section: {sectionKey}</p>
    </div>
  );
}
