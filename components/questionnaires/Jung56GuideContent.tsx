import type { Locale } from "@/lib/i18n/locales";
import type { Jung56Card } from "@/lib/questionnaires/jung56";

export function Jung56GuideContent({ card, locale, idPrefix = "jung56-guide", headingLevel = 4 }: { card: Jung56Card; locale: Locale; idPrefix?: string; headingLevel?: 3 | 4 }) {
  const zh = locale === "zh", Heading = headingLevel === 3 ? "h3" : "h4";
  const sections = [
    { key: "construct_definition", en: "What this direction describes", zh: "这个方向描述什么", paragraphs: [card.construct_definition] },
    { key: "attention_focus", en: "Where attention may begin", zh: "注意可能先从哪里开始", paragraphs: [card.attention_focus] },
    { key: "processing_pattern", en: "How the approach may unfold", zh: "这种方式怎样展开", paragraphs: [card.processing_pattern] },
    { key: "observable_tendencies", en: "Situations to observe", zh: "可以观察的情境", paragraphs: card.observable_tendencies },
    { key: "possible_contributions", en: "Possible contributions", zh: "可能的贡献", paragraphs: card.possible_contributions },
    { key: "possible_blind_spots", en: "Trade-offs to consider", zh: "需要留意的取舍", paragraphs: card.possible_blind_spots },
    { key: "balance_practices", en: "Ways to try another approach", zh: "尝试其他方式的练习", paragraphs: card.balance_practices },
    { key: "reflection_questions", en: "Questions for reflection", zh: "反思问题", paragraphs: card.reflection_questions },
    { key: "does_not_mean", en: "What this does not mean", zh: "这不代表什么", paragraphs: card.does_not_mean },
    { key: "interpretation_boundary", en: "Reading boundaries", zh: "阅读边界", paragraphs: [card.interpretation_boundary] },
  ];
  return <div data-jung56-full={card.id} className="space-y-6 leading-8 [overflow-wrap:anywhere]">{sections.map(s => <section id={`${idPrefix}-${card.id}-${s.key}`} key={s.key} className="scroll-mt-24">
    <Heading className="mb-3 text-lg font-semibold">{zh ? s.zh : s.en}</Heading>{s.paragraphs.length > 1 ? <ul className="list-disc space-y-3 pl-5">{s.paragraphs.map((p, i) => <li key={i}>{p[locale]}</li>)}</ul> : <p>{s.paragraphs[0][locale]}</p>}
  </section>)}</div>;
}
