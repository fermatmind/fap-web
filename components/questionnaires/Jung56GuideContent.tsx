import type { Jung56ResultReading } from "@/lib/questionnaires/result-content/jung56-reading-types";
import type { Locale } from "@/lib/i18n/locales";
import type { Jung56Card } from "@/lib/questionnaires/jung56";

export function Jung56GuideContent({ card, reading, locale, copy = text => text, idPrefix = "jung56-guide", headingLevel = 4 }: { card: Jung56Card; reading?: Jung56ResultReading; locale: Locale; copy?: (text: string) => string; idPrefix?: string; headingLevel?: 3 | 4 }) {
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
  const accepted = reading?.quizSlug === "cognitive-functions-test" && reading.edition === "fm_jung56_eight_public_cards_working_en_v1" && reading.profileId === card.id ? reading : undefined;
  const composed = sections.map(s => { const extra = accepted?.sections.find(x => x.id === s.key)?.paragraphs ?? []; return { ...s, paragraphs: s.key === "balance_practices" ? [...extra, ...s.paragraphs] : [...s.paragraphs, ...extra] }; });
  return <div data-jung56-full={card.id} data-jung56-reading={accepted ? card.id : undefined} className="space-y-6 leading-8 [overflow-wrap:anywhere]">{accepted && <details className="rounded-lg border border-slate-200 p-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("本方向目录") : "Contents for this direction"}</summary><nav aria-label={zh ? copy("本方向目录") : "Contents for this direction"}><ul className="list-disc pl-5">{composed.map(s => <li key={s.key}><a className="inline-block min-h-11 py-2 underline" href={`#${idPrefix}-${card.id}-${s.key}`}>{zh ? copy(s.zh) : s.en}</a></li>)}</ul></nav></details>}{composed.map(s => <section id={`${idPrefix}-${card.id}-${s.key}`} key={s.key} className="scroll-mt-24">
    <Heading className="mb-3 text-lg font-semibold">{zh ? copy(s.zh) : s.en}</Heading>{s.paragraphs.length > 1 ? <ul className="list-disc space-y-3 pl-5">{s.paragraphs.map((p, i) => <li key={i}>{p[locale]}</li>)}</ul> : <p>{s.paragraphs[0][locale]}</p>}
  </section>)}</div>;
}
