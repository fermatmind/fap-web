import { cn } from "@/lib/utils";

type HeroAnimatedVisualProps = {
  chips: string[];
  localeLabel: "zh" | "en";
  className?: string;
};

const workspaceMetrics = {
  zh: [
    { label: "人格结构", value: 88, trend: "+12%" },
    { label: "职业匹配度", value: 76, trend: "+8%" },
    { label: "沟通信心", value: 92, trend: "+15%" },
  ],
  en: [
    { label: "Personality structure", value: 88, trend: "+12%" },
    { label: "Career fit", value: 76, trend: "+8%" },
    { label: "Decision confidence", value: 92, trend: "+15%" },
  ],
};

const insightCards = {
  zh: ["角色适配", "任务偏好", "沟通特征"],
  en: ["Role fit", "Task preference", "Communication"],
};

const focusCards = {
  zh: [
    {
      title: "人格",
      detail: "关键维度分布、优势和风险位。",
    },
    {
      title: "职业",
      detail: "情境化建议、优先级与发展轨迹。",
    },
    {
      title: "能力",
      detail: "结构化洞察转为可执行决策。",
    },
  ],
  en: [
    {
      title: "Personality",
      detail: "Core traits, strengths, and risk positions.",
    },
    {
      title: "Career",
      detail: "Contextual recommendations with priorities.",
    },
    {
      title: "Capability",
      detail: "Transformed into decision-ready actions.",
    },
  ],
};

export function HeroAnimatedVisual({ chips, localeLabel, className }: HeroAnimatedVisualProps) {
  const metrics = workspaceMetrics[localeLabel];
  const details = focusCards[localeLabel];
  const summaryLabel = localeLabel === "zh" ? "结构化结果工作台" : "Structured report workspace";

  return (
    <div
      className={cn("fm-home-hero-workspace fm-home-enter-up fm-home-enter-up-delay-2", className)}
    >
      <div className="fm-home-hero-workspace-overlay" aria-hidden />

      <div className="fm-home-hero-workspace-shell">
        <header className="fm-home-hero-workspace-head">
          <p className="fm-home-hero-workspace-kicker">{summaryLabel}</p>
          <p className="fm-home-hero-workspace-subtle">
            {localeLabel === "zh" ? "可复核 · 可解释 · 可行动" : "Auditable · Interpretable · Action-ready"}
          </p>
        </header>

        <div className="fm-home-hero-workspace-grid">
          <section className="fm-home-hero-workspace-panel">
            <p className="fm-home-hero-workspace-meta">
              {localeLabel === "zh" ? "结构化报告摘要" : "Structured report summary"}
            </p>
            <h3 className="fm-home-hero-workspace-title">
              {localeLabel === "zh" ? "职业与人格决策入口" : "Career and personality decision board"}
            </h3>
            <p className="fm-home-hero-workspace-copy">
              {localeLabel === "zh"
                ? "先看结构，再落地行动，评估结果可直接进入讨论与决策。"
                : "Review the structure first, then turn results into the next decision."}
            </p>

            <div className="fm-home-hero-workspace-metrics">
              {metrics.map((metric) => (
                <div key={metric.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--fm-text-muted)]">
                    <span>{metric.label}</span>
                    <span className="font-medium text-[var(--fm-text)]">
                      {metric.value}% <span className="text-[var(--fm-trust-blue)]">{metric.trend}</span>
                    </span>
                  </div>
                  <div className="fm-home-hero-workspace-track">
                    <div className="fm-home-hero-workspace-fill" style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-2.5">
            <article className="fm-home-hero-workspace-mini">
              <p className="fm-home-hero-workspace-mini-kicker">
                {localeLabel === "zh" ? "结构化指标" : "Structured indicators"}
              </p>
              <p className="fm-home-hero-workspace-mini-title">
                {localeLabel === "zh" ? "六个维度并行可视化" : "Six dimensions in parallel"}
              </p>
              <p className="fm-home-hero-workspace-mini-copy">
                {localeLabel === "zh"
                  ? "在单一工作区完成“分项解读 + 决策建议”。"
                  : "One workspace combines interpretation and decision suggestions."}
              </p>
            </article>

            <div className="grid gap-2 sm:grid-cols-3">
              {insightCards[localeLabel].map((insight, index) => (
                <article key={`insight-${index}`} className="fm-home-hero-workspace-insight">
                  <span className="fm-home-hero-workspace-insight-label">
                    {localeLabel === "zh" ? "洞察模块" : "Insight"}
                  </span>
                  <span className="fm-home-hero-workspace-insight-title">
                    {localeLabel === "zh" ? `模块 ${index + 1}` : `Signal ${index + 1}`}
                  </span>
                  <span className="fm-home-hero-workspace-insight-copy">{insight}</span>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-auto space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {details.map((item) => (
              <article key={item.title} className="fm-home-hero-workspace-tag">
                <p className="fm-home-hero-workspace-tag-title">{item.title}</p>
                <p className="fm-home-hero-workspace-tag-copy">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="fm-home-hero-workspace-chips">
            {chips
              .slice(0, 3)
              .filter((chip) => chip.trim().length > 0)
              .map((chip, index) => (
                <span key={`${chip}-${index}`} className="fm-home-chip">
                  {chip}
                </span>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
