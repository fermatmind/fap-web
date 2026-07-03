import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Block = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  desc?: string;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
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

const INTERNAL_DEBUG_PATTERNS = [
  /\bAttemptReadController\b/gi,
  /\bBig Five Report Engine v\d+(?:\s+registry)?\b/gi,
  /\bReport Engine v\d+\b/gi,
  /\bPR(?:1|2|3A|3B)\b/g,
  /\bfacet glossary\b/gi,
  /\bprecision anomaly rules\b/gi,
  /\bsentence-level modifier\b/gi,
  /\bscenario action rule\b/gi,
  /\bN-only\b/gi,
  /\bpayload\b/gi,
  /\bregistry\b/gi,
  /\bproduction\s+(?:已接入|接入)/gi,
];

function stripInternalDebugText(value: unknown): string {
  if (typeof value !== "string") return "";

  let text = value.trim();
  for (const pattern of INTERNAL_DEBUG_PATTERNS) {
    text = text.replace(pattern, "");
  }

  const cleaned = text.replace(/\s{2,}/g, " ").replace(/^[\s:;|,-]+|[\s:;|,-]+$/g, "").trim();
  return /^[.]+$/.test(cleaned) ? "" : cleaned;
}

function localizeBigFiveZhRendererText(value: string): string {
  return value
    .replace(/\bfacet 百分位\b/gi, "细分维度百分位")
    .replace(/\bfacets\b/gi, "细分维度")
    .replace(/\bfacet\b/gi, "细分维度")
    .replace(/\bPercentile\b/g, "百分位")
    .replace(/([\u3400-\u9fff])\s+(细分维度|百分位)/gu, "$1$2")
    .replace(/(细分维度|百分位)\s+([\u3400-\u9fff])/gu, "$1$2");
}

function sanitizeVisibleText(value: unknown, locale: "en" | "zh"): string {
  const stripped = stripInternalDebugText(value);
  return locale === "zh" ? localizeBigFiveZhRendererText(stripped) : stripped;
}

function safeStringList(value: unknown, locale: "en" | "zh"): string[] {
  return Array.isArray(value)
    ? value.map((item) => sanitizeVisibleText(item, locale)).filter((item) => item.length > 0)
    : [];
}

function isBrokenBigFiveTemplateText(...values: string[]): boolean {
  const text = values.filter(Boolean).join(" ");
  return /本\s+由\s+生成/u.test(text)
    || /不代表生产\s+已接入/u.test(text)
    || /已覆盖\s+\d+\s+条.*(?:细分维度|facet)/iu.test(text);
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
    <span className="inline-flex rounded-full border border-slate-300 px-[var(--fm-pad-badge-x)] py-[var(--fm-pad-badge-y)] text-xs uppercase tracking-wide text-slate-600">
      {bucket}
    </span>
  );
}

function TagBadges({ tags }: { tags: string[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BlockRenderer({
  block,
  sectionKey,
  normsStatus,
  locale = "en",
}: {
  block: Block;
  sectionKey: string;
  normsStatus?: string;
  locale?: "en" | "zh";
}) {
  const title = sanitizeVisibleText(block.title, locale);
  const body = sanitizeVisibleText(block.body, locale) || sanitizeVisibleText(block.desc, locale);
  const bullets = safeStringList(block.bullets, locale);
  const tips = safeStringList(block.tips, locale);
  const tags = safeStringList(block.tags, locale);
  const kind = inferKind(block, sectionKey);

  if (locale === "zh" && isBrokenBigFiveTemplateText(title, body, bullets.join(" "), tips.join(" "), tags.join(" "))) {
    return null;
  }

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
            <p className="m-0 text-xs text-slate-600">{locale === "zh" ? "百分位" : "Percentile"}</p>
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
        {bullets.length > 0 ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {tips.length > 0 ? (
          <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <p className="m-0 font-semibold text-slate-700">Tips</p>
            <ul className="mb-0 mt-2 list-disc space-y-1 pl-4">
              {tips.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <TagBadges tags={tags} />
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
          <p className="text-xs text-slate-500">
            {locale === "zh" ? "当前常模状态下暂不显示百分位。" : "Percentile unavailable in current norms status."}
          </p>
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
          <p className="m-0 font-medium text-slate-900">{title || block.metric_code || (locale === "zh" ? "细分维度" : "Facet")}</p>
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
      <p className="m-0 font-semibold text-slate-900">{locale === "zh" ? "暂不支持的模块" : "Unsupported block"}</p>
      <p className="m-0 mt-1">{title || body || "This section uses a new block type."}</p>
      <p className="m-0 mt-1 text-xs text-slate-500">kind: {kind} · section: {sectionKey}</p>
    </div>
  );
}
