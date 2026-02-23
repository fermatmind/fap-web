type SdsFactorKey = "psycho_affective" | "somatic" | "psychomotor" | "cognitive";

type FactorConfig = {
  key: SdsFactorKey;
  labelEn: string;
  labelZh: string;
};

const FACTORS: FactorConfig[] = [
  { key: "psycho_affective", labelEn: "Psycho-affective", labelZh: "心理情感因子" },
  { key: "somatic", labelEn: "Somatic", labelZh: "躯体因子" },
  { key: "psychomotor", labelEn: "Psychomotor", labelZh: "精神运动因子" },
  { key: "cognitive", labelEn: "Cognitive", labelZh: "认知因子" },
];

type FactorMetric = {
  key: SdsFactorKey;
  label: string;
  value: number;
  max: number;
  normalized: number;
  invalid: boolean;
};

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function resolveFactorMetric({
  locale,
  node,
  config,
}: {
  locale: "en" | "zh";
  node: unknown;
  config: FactorConfig;
}): FactorMetric {
  const label = locale === "zh" ? config.labelZh : config.labelEn;

  if (typeof node === "number" && Number.isFinite(node)) {
    const bounded = Math.max(0, node);
    const normalized = Math.min(100, bounded);
    return {
      key: config.key,
      label,
      value: bounded,
      max: 100,
      normalized,
      invalid: false,
    };
  }

  if (!node || typeof node !== "object" || Array.isArray(node)) {
    return {
      key: config.key,
      label,
      value: 0,
      max: 100,
      normalized: 0,
      invalid: true,
    };
  }

  const record = node as Record<string, unknown>;
  const value = toFiniteNumber(record.value ?? record.score ?? record.raw ?? record.current);
  const max = toFiniteNumber(record.max ?? record.total ?? record.ceiling ?? 100);

  if (value === null || max === null || max <= 0) {
    return {
      key: config.key,
      label,
      value: 0,
      max: 100,
      normalized: 0,
      invalid: true,
    };
  }

  const safeValue = Math.max(0, Math.min(value, max));
  const safeMax = Math.max(1, max);
  const normalized = Math.max(0, Math.min(100, (safeValue / safeMax) * 100));

  return {
    key: config.key,
    label,
    value: safeValue,
    max: safeMax,
    normalized,
    invalid: false,
  };
}

export function SdsFactorPanel({
  locale,
  factors,
}: {
  locale: "en" | "zh";
  factors: unknown;
}) {
  const record =
    factors && typeof factors === "object" && !Array.isArray(factors)
      ? (factors as Record<string, unknown>)
      : {};
  const metrics = FACTORS.map((config) =>
    resolveFactorMetric({
      locale,
      node: record[config.key],
      config,
    })
  );
  const hasInvalid = metrics.some((item) => item.invalid);
  const isZh = locale === "zh";

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="m-0 text-lg font-semibold text-slate-900">
        {isZh ? "SDS 因子结构" : "SDS factor breakdown"}
      </h3>

      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="m-0 text-sm font-semibold text-slate-900">{metric.label}</p>
              <p className="m-0 text-xs text-slate-600">
                {metric.value.toFixed(1)}/{metric.max.toFixed(1)}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-sky-700 transition-all"
                style={{ width: `${metric.normalized}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {hasInvalid ? (
        <p className="m-0 text-xs text-amber-700">
          {isZh
            ? "部分因子值异常，已按 0 进行兜底展示。"
            : "Some factor values were invalid and were safely rendered as 0."}
        </p>
      ) : null}
    </section>
  );
}
