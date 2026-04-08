import type { FaqBlock } from "@/lib/mbti/personalityHub.types";

export function PersonalityFaq({
  locale,
  items,
}: {
  locale: "en" | "zh";
  items: FaqBlock[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="personality-faq"
      className="space-y-4 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-md)]"
      data-testid="personality-faq"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">
          {locale === "zh" ? "FAQ" : "FAQ"}
        </p>
        <h2 className="m-0 font-serif text-[length:var(--fm-hub-heading-section)] text-[var(--fm-hub-navy-strong)]">
          {locale === "zh" ? "在继续往下点之前，先把这几件事看清楚" : "Before you click deeper, clarify these points first"}
        </h2>
      </div>

      <dl className="m-0 space-y-4">
        {items.map((item) => (
          <div
            key={item.question}
            className="space-y-2 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <dt className="text-base font-semibold text-[var(--fm-text)]">{item.question}</dt>
            <dd className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
