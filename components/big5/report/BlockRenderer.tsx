import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Block = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
  metric_code?: string;
  bucket?: string;
  percentile?: number | string | null;
  [key: string]: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

function percentile(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}

function BucketBadge({ bucket }: { bucket: string }) {
  return bucket ? <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600">{bucket}</span> : null;
}

export function BlockRenderer({
  block,
  normsStatus,
}: {
  block: Block;
  sectionKey: string;
  normsStatus?: string;
  locale?: "en" | "zh";
}) {
  const kind = text(block.kind).toLowerCase();
  const title = text(block.title);
  const body = text(block.body);
  const bullets = list(block.bullets);
  const tips = list(block.tips);
  const tags = list(block.tags);
  const metricPercentile = percentile(block.percentile);
  if (!title && !body && bullets.length === 0) return null;

  if (kind === "callout") {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        {title ? <p className="m-0 font-semibold">{title}</p> : null}
        {body ? <p className="m-0 mt-1 whitespace-pre-wrap">{body}</p> : null}
        {bullets.length > 0 ? <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </div>
    );
  }

  if (kind === "bullets") {
    return (
      <Card>
        {title ? <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader> : null}
        <CardContent>
          {body ? <p className="m-0 mb-2 text-sm text-slate-700">{body}</p> : null}
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{bullets.map((item) => <li key={item}>{item}</li>)}</ul>
        </CardContent>
      </Card>
    );
  }

  if (kind === "metric_card" || kind === "chart") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-2">
          {title || text(block.metric_code) ? <p className="m-0 text-sm font-semibold text-slate-900">{title || text(block.metric_code)}</p> : null}
          <BucketBadge bucket={text(block.bucket)} />
        </div>
        {metricPercentile !== null && normsStatus !== "MISSING" ? (
          <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={metricPercentile} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-sky-700" style={{ width: `${metricPercentile}%` }} />
          </div>
        ) : null}
        {body ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{body}</p> : null}
        {bullets.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        {tips.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">{tips.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        {tags.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-600">{tag}</span>)}</div> : null}
      </div>
    );
  }

  if (kind === "table_row") {
    return (
      <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2 border-b border-slate-100 py-2 text-sm">
        <div>
          {title || text(block.metric_code) ? <p className="m-0 font-medium text-slate-900">{title || text(block.metric_code)}</p> : null}
          {body ? <p className="m-0 whitespace-pre-wrap text-slate-600">{body}</p> : null}
          {bullets.length > 0 ? <ul className="mb-0 mt-1 list-disc pl-5 text-slate-600">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
        </div>
        <div className="text-right text-slate-500">{text(block.bucket)}</div>
      </div>
    );
  }

  if (kind === "paragraph") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
        {title ? <p className="m-0 mb-1 font-semibold text-slate-900">{title}</p> : null}
        {body ? <p className="m-0 whitespace-pre-wrap">{body}</p> : null}
        {bullets.length > 0 ? <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}
      </div>
    );
  }

  return null;
}
