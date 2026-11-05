import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import styles from "./PortraitFacetLead.module.css";

type Lead = {
  style: "dialogue" | "rhythm" | "playlist" | "patterns" | "study" | "pace" | "pairs" | "symbol";
  title: Text;
  lede: Text;
};

const leads: Record<string, Lead> = {
  "communication-style": { style: "dialogue", title: { zh: "四种回应方式", en: "Four ways of responding" }, lede: { zh: "选择一种方式，看看它在一段对话里怎样出现。", en: "Choose a response pattern to see how it can show up in a conversation." } },
  "humor-style-test": { style: "rhythm", title: { zh: "你的幽默表达记录", en: "Your humor expression notes" }, lede: { zh: "六种表达可以同时出现。点一种，先看场合和例子。", en: "The six expressions can coexist. Open one to start with its context and an example." } },
  "music-taste-test": { style: "playlist", title: { zh: "八类声音偏好", en: "Eight sound preferences" }, lede: { zh: "按想听的声音浏览，从读数接到收听情境。", en: "Browse by sound, then see the listening situations behind the readings." } },
  "difficult-person-test": { style: "patterns", title: { zh: "七种可能引起摩擦的行为", en: "Seven behaviors that can create friction" }, lede: { zh: "各组读数独立。可以先看一项你想了解的行为，结合具体情境阅读。", en: "Each group stands on its own. Pick a behavior you want to understand and read it in context." } },
  "procrastinator-type-test": { style: "pace", title: { zh: "拖延可能出现的六种情境", en: "Six situations in which delay can show up" }, lede: { zh: "选择一个熟悉的场景，再找能试跑的小步骤。", en: "Choose a familiar situation, then look for a small step you can try." } },
  "learning-style": { style: "study", title: { zh: "四种学习形式的当前偏好", en: "Current preferences for four learning formats" }, lede: { zh: "点选一种形式，先看适合试用的任务与例子。", en: "Open a format to see a task and example for trying it out." } },
  "type-ab": { style: "pace", title: { zh: "四种日常节奏观察", en: "Four observations about everyday pace" }, lede: { zh: "分开读时间紧迫感、竞争、等待和停下来的情境。", en: "Read the situations involving urgency, competition, waiting and stopping separately." } },
  "sdt-motivation": { style: "pairs", title: { zh: "三类需要，各看两种体验", en: "Three needs, two experiences each" }, lede: { zh: "满足与受阻分开计分。同一类需要的两项都可以打开阅读。", en: "Satisfaction and frustration are scored separately. Open either experience within a need." } },
  chakra: { style: "symbol", title: { zh: "七组日常自述", en: "Seven everyday reflections" }, lede: { zh: "各组读数对应日常行为。点选主题，结合文化意象阅读。", en: "Each reading comes from everyday behavior. Choose a topic to read it through its cultural metaphor." } },
};

const needs = [
  { id: "autonomy", title: { zh: "自主", en: "Autonomy" } },
  { id: "competence", title: { zh: "胜任", en: "Competence" } },
  { id: "relatedness", title: { zh: "联结", en: "Relatedness" } },
] as const;

export function PortraitFacetLead({ quiz, result, locale, anchorPrefix }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
  anchorPrefix: string;
}) {
  const lead = Object.hasOwn(leads, quiz.slug) ? leads[quiz.slug] : undefined;
  if (!lead) return null;
  const zh = locale === "zh";
  const entries = quiz.profiles.flatMap(profile => {
    const direction = quiz.directions.find(item => item.id === profile.directionIds[0]);
    if (!direction) return [];
    const facet = result.facets[direction.id];
    return [{ id: direction.id, anchor: `#${anchorPrefix}${profile.id}`, name: direction.title[locale], mean: facet.mean }];
  });
  const groups = lead.style === "pairs"
    ? needs.map(need => ({ id: need.id, title: need.title[locale], entries: entries.filter(item => item.id.startsWith(`${need.id}-`)) }))
    : [{ id: "all", title: null, entries }];
  return <section className={styles.lead} data-portrait-facet-lead={lead.style} aria-labelledby={`${quiz.slug}-quick-reading`}>
    <h3 id={`${quiz.slug}-quick-reading`}>{lead.title[locale]}</h3>
    <p>{lead.lede[locale]}</p>
    <div className={styles.groups}>{groups.map(group => <div className={styles.group} key={group.id}>
      {group.title && <h4>{group.title}</h4>}
      <dl>{group.entries.map(item => <div key={item.id}>
        <dt><a href={item.anchor}>{item.name}</a></dt>
        <dd>{item.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${item.mean.toFixed(1)} / 5`}</dd>
      </div>)}</dl>
    </div>)}</div>
  </section>;
}
