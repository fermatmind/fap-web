import { FeaturedCareerCard } from "@/components/personality/FeaturedCareerCard";
import type { CareerPreviewCard } from "@/lib/mbti/personalityHub.types";

export function CareerIntelligencePreview({
  locale,
  cards,
}: {
  locale: "en" | "zh";
  cards: CareerPreviewCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      className="space-y-5 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-hub-shell-bg)] p-6 shadow-[var(--fm-shadow-md)]"
      data-testid="personality-career-preview"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">
          {locale === "zh" ? "职业预览" : "Career Intelligence Preview"}
        </p>
        <h2 className="m-0 font-serif text-[length:var(--fm-hub-heading-section)] text-[var(--fm-hub-navy-strong)]">
          {locale === "zh" ? "人格不是终点，职业结构判断才是下一步" : "Personality is not the endpoint. Career structure is the next decision."}
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这一层只展示费马现在能给出的职业判断深度预览：哪些角色更顺手，哪些结构会开始消耗，以及为什么建议继续进入 recommendation 深页。"
            : "This layer shows only the career judgment depth Fermat can explain today: which roles feel structurally aligned, where friction starts to climb, and why the recommendation detail route is the next step."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <FeaturedCareerCard key={card.key} locale={locale} card={card} />
        ))}
      </div>
    </section>
  );
}
