import type { MethodologyBlock } from "@/lib/mbti/personalityHub.types";

export function PersonalityMethodology({
  locale,
  blocks,
}: {
  locale: "en" | "zh";
  blocks: MethodologyBlock[];
}) {
  if (blocks.length === 0) {
    return null;
  }

  return (
    <section
      id="personality-methodology"
      className="space-y-5 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-md)]"
      data-testid="personality-methodology"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">
          {locale === "zh" ? "Methodology" : "Methodology"}
        </p>
        <h2 className="m-0 font-serif text-[length:var(--fm-hub-heading-section)] text-[var(--fm-hub-navy-strong)]">
          {locale === "zh"
            ? "这页不是人格科普页，而是一个先缩小方向再继续验证的方法入口"
            : "This page is not personality trivia. It is a method surface for narrowing direction before deeper validation."}
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "先用人格框架缩小范围，再用结构损耗和 recommendation 深页做第二层判断，这样比直接追逐标签或岗位列表更稳。"
            : "Use the personality framework to narrow the field first, then bring in structural strain and recommendation detail as the second decision layer. That is more stable than chasing labels or job lists directly."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {blocks.map((block, index) => (
          <article
            key={block.key}
            className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {locale === "zh" ? `步骤 ${index + 1}` : `Step ${index + 1}`}
            </p>
            <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{block.title}</h3>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p>
          </article>
        ))}
      </div>

      <p className="m-0 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-shell-bg)] px-4 py-3 text-sm leading-7 text-[var(--fm-text-muted)]">
        <span className="font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "收束判断：" : "Decision rule:"}
        </span>{" "}
        {locale === "zh"
          ? "如果一个人格方向看起来吸引人，但结构损耗和职业预览已经开始冲突，就不要急着把它当成最终答案。"
          : "If a personality direction feels attractive while structural strain and career preview already start to conflict, do not treat it as a final answer yet."}
      </p>
    </section>
  );
}
