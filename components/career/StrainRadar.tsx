import type { CareerWhiteBoxStrainRadarAxisKey } from "@/lib/career/adapters/types";
import type { Locale } from "@/lib/i18n/locales";

type StrainRadarProps = {
  locale: Locale;
  dimensions: Record<CareerWhiteBoxStrainRadarAxisKey, number | null>;
  testId?: string;
};

type AxisDefinition = {
  key: CareerWhiteBoxStrainRadarAxisKey;
  label: {
    en: string;
    zh: string;
  };
  helper: {
    en: string;
    zh: string;
  };
};

const AXES: AxisDefinition[] = [
  {
    key: "people_friction",
    label: { en: "People friction", zh: "协作摩擦" },
    helper: { en: "Coordination drag and interpersonal load.", zh: "协作阻力与沟通负荷。" },
  },
  {
    key: "context_switch_load",
    label: { en: "Context switch load", zh: "切换负荷" },
    helper: { en: "Frequency and cost of switching tasks.", zh: "任务切换频率与认知成本。" },
  },
  {
    key: "political_load",
    label: { en: "Political load", zh: "政治负荷" },
    helper: { en: "Influence overhead and org-navigation pressure.", zh: "组织博弈与影响成本。" },
  },
  {
    key: "uncertainty_load",
    label: { en: "Uncertainty load", zh: "不确定性负荷" },
    helper: { en: "Ambiguity and unstable decision context.", zh: "模糊目标与不稳定决策环境。" },
  },
  {
    key: "low_autonomy_trap",
    label: { en: "Low autonomy trap", zh: "低自主陷阱" },
    helper: { en: "Constraint from limited ownership latitude.", zh: "自主空间受限带来的压力。" },
  },
  {
    key: "repetition_mismatch",
    label: { en: "Repetition mismatch", zh: "重复错配" },
    helper: { en: "Mismatch between repeated tasks and preference.", zh: "重复任务与偏好的不匹配。" },
  },
];

function clamp01(value: number | null): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function formatValue(value: number | null): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(3).replace(/\.?0+$/, "");
}

export function StrainRadar({ locale, dimensions, testId }: StrainRadarProps) {
  const language = locale === "zh" ? "zh" : "en";

  return (
    <section
      className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid={testId}
    >
      <div className="space-y-1">
        <h3 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
          {language === "zh" ? "Strain 六轴雷达" : "Strain six-axis radar"}
        </h3>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {language === "zh"
            ? "固定六轴，直接消费 backend white-box strain 维度，不在前端推导新增维度。"
            : "Fixed six-axis view from backend white-box strain dimensions only, with no frontend-derived extra axes."}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {AXES.map((axis) => {
          const value = dimensions[axis.key];
          const percent = Math.round(clamp01(value) * 100);

          return (
            <article
              key={axis.key}
              className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-3"
              data-axis-key={axis.key}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--fm-text)]">
                  {axis.label[language]}
                </p>
                <p className="m-0 font-mono text-xs text-[var(--fm-text-muted)]">{formatValue(value)}</p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--fm-border)]/70">
                <div className="h-full rounded-full bg-[var(--fm-accent)]" style={{ width: `${percent}%` }} />
              </div>
            </article>
          );
        })}
      </div>

      <dl className="grid gap-2 text-xs text-[var(--fm-text-muted)] md:grid-cols-2">
        {AXES.map((axis) => (
          <div key={`legend-${axis.key}`} className="space-y-1">
            <dt className="font-semibold text-[var(--fm-text)]">{axis.label[language]}</dt>
            <dd className="m-0">{axis.helper[language]}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
