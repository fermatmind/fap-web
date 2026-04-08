import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { PERSONALITY_HUB_TOKENS } from "@/lib/design/personalityHubTokens";
import type { ScenarioMatrixCard } from "@/lib/mbti/personalityHub.types";

export function ScenarioIntelligenceMatrix({
  locale,
  cards,
}: {
  locale: "en" | "zh";
  cards: ScenarioMatrixCard[];
}) {
  return (
    <section
      className="space-y-4 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-hub-matrix-bg)] p-6 shadow-[var(--fm-shadow-md)]"
      data-testid="personality-index-scene-entry"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">
          {locale === "zh" ? "场景矩阵" : "Scenario Intelligence Matrix"}
        </p>
        <h2 className="m-0 font-serif text-[length:var(--fm-hub-heading-section)] text-[var(--fm-hub-navy-strong)]">
          {locale === "zh" ? "按决策场景选择入口" : "Choose the entry by decision scenario"}
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这一层不做伪趋势，只把当前可解释的场景线索、稳定覆盖和推荐入口放到同一个矩阵里。"
            : "This layer avoids fake trend data and keeps only explainable scenario signals, stable coverage, and real continuation routes in one matrix."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.key}
            className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-bg)] p-4 shadow-[var(--fm-shadow-sm)] sm:p-5"
          >
            <div className="space-y-2">
              <h3 className="m-0 font-serif text-xl text-[var(--fm-hub-navy-strong)]">{card.title}</h3>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{card.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-decision-green)]">
                  {card.primaryMetric.label}
                </p>
                <p className="mb-0 mt-2 text-sm font-medium text-[var(--fm-text)]">{card.primaryMetric.value}</p>
              </div>
              {card.secondaryMetric ? (
                <div className="hidden rounded-xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4 sm:block">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-friction-rose)]">
                    {card.secondaryMetric.label}
                  </p>
                  <p className="mb-0 mt-2 text-sm font-medium text-[var(--fm-text)]">{card.secondaryMetric.value}</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                {locale === "zh" ? "优先查看类型" : "Prioritize these types"}
              </p>
              <div className="hidden flex-wrap gap-2 sm:flex">
                {card.topTypeCodes.map((typeCode) => (
                  <span
                    key={`${card.key}-${typeCode}`}
                    className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)]"
                  >
                    {typeCode}
                  </span>
                ))}
              </div>
              <p className="m-0 text-xs text-[var(--fm-text-muted)] sm:hidden">
                {card.topTypeCodes.join(" / ")}
              </p>
              <p className="hidden text-xs text-[var(--fm-text-muted)] sm:block">
                {locale === "zh" ? "Family hints：" : "Family hints: "}
                {card.familyHints.join(" / ")}
              </p>
              <p className="m-0 text-xs text-[var(--fm-text-muted)] sm:hidden">
                {card.familyHints.join(" / ")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={card.primaryCta.href} className={buttonVariants({ size: "sm" })}>
                {card.primaryCta.label}
              </Link>
              {card.secondaryCta ? (
                <Link href={card.secondaryCta.href} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  {card.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
