import type {
  CareerExplainabilityStrainRadarAdapter,
  CareerExplainabilityStrainRadarAxisKey,
} from "@/lib/career/adapters/types";
import type { DisplayLocale } from "@/lib/i18n/locales";

type CareerStrainRadarProps = {
  locale: DisplayLocale;
  radar: CareerExplainabilityStrainRadarAdapter;
  testId?: string;
};

type AxisDefinition = {
  key: CareerExplainabilityStrainRadarAxisKey;
  label: {
    en: string;
    zh: string;
    "zh-TW": string;
  };
};

const AXES: AxisDefinition[] = [
  { key: "peopleFriction", label: { en: "People friction", zh: "协作摩擦", "zh-TW": "協作阻力" } },
  { key: "contextSwitchLoad", label: { en: "Context switch load", zh: "切换负荷", "zh-TW": "任務切換負荷" } },
  { key: "politicalLoad", label: { en: "Political load", zh: "政治负荷", "zh-TW": "組織政治負荷" } },
  { key: "uncertaintyLoad", label: { en: "Uncertainty load", zh: "不确定性负荷", "zh-TW": "不確定性負荷" } },
  { key: "lowAutonomyTrap", label: { en: "Low autonomy trap", zh: "低自主陷阱", "zh-TW": "自主空間受限" } },
  { key: "repetitionMismatch", label: { en: "Repetition mismatch", zh: "重复错配", "zh-TW": "重複任務與偏好不符" } },
];

function formatNullable(value: number | null): string {
  return value === null ? "—" : value.toFixed(4).replace(/\.?0+$/, "");
}

function clampPercent(value: number | null): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

export function CareerStrainRadar({ locale, radar, testId }: CareerStrainRadarProps) {
  return (
    <section
      className="space-y-4 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
      data-testid={testId}
    >
      <div className="space-y-1">
        <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{locale === "zh-TW" ? "工作負荷雷達圖" : "Strain radar"}</h3>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh-TW" ? "顯示評分模型提供的六項工作負荷指標。" : locale === "zh"
            ? "只渲染 backend 已提供的六轴结构化值，不在前端扩写为建议、排序或解释。"
            : "Renders only the six-axis structure already provided by the backend, without frontend advice, ranking, or interpretation."}
        </p>
      </div>

      <div className="grid gap-2 text-xs text-[var(--fm-text-muted)] md:grid-cols-2 xl:grid-cols-4">
        <p className="m-0 font-mono">integrity_state: {radar.integrityState ?? "—"}</p>
        <p className="m-0 font-mono">confidence_cap: {formatNullable(radar.confidenceCap)}</p>
        <p className="m-0 font-mono">degradation_factor: {formatNullable(radar.degradationFactor)}</p>
        <p className="m-0 font-mono">formula_version: {radar.formulaVersion ?? "—"}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {AXES.map((axis) => {
          const axisValue = radar.axes[axis.key]?.value ?? null;
          const fillWidth = clampPercent(axisValue);

          return (
            <article
              key={axis.key}
              className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-3"
              data-axis-key={axis.key}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--fm-text-muted)]">
                  {axis.label[locale]}
                </p>
                <p className="m-0 font-mono text-xs text-[var(--fm-text)]">{formatNullable(axisValue)}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-border)]/60">
                <div
                  className="h-full rounded-full bg-[var(--fm-accent)]"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
