"use client";

import { useState } from "react";
import { BookOpen, Wrench, Palette, MessagesSquare, HandHeart, Network, ListChecks, Compass, MessageCircle, Check } from "lucide-react";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./RiasecReadingReport.module.css";

// User-authored exploration choices, never inferred scores or backend result claims.
const groups = [
  { title: ["投入方式", "How you engage"], items: [
    { id: "focus", label: ["独立钻研", "Independent focus"], description: ["围绕一个问题，独立查资料、比较证据。", "Research a question independently and compare evidence."] },
    { id: "make", label: ["动手尝试", "Hands-on discovery"], description: ["通过操作工具、制作小样来验证想法。", "Test ideas by using tools and building prototypes."] },
    { id: "express", label: ["自由表达", "Room to express"], description: ["用文字、图像或作品表达自己的想法。", "Express ideas through writing, visuals or creative work."] },
  ] },
  { title: ["协作方式", "How you collaborate"], items: [
    { id: "together", label: ["共同讨论", "Thinking together"], description: ["交换不同观点，一起梳理问题和方案。", "Exchange perspectives and work through problems together."] },
    { id: "support", label: ["支持他人", "Supporting others"], description: ["理解具体需求，提供解释、协助或指导。", "Understand needs and offer explanations, assistance or guidance."] },
    { id: "lead", label: ["协调推进", "Coordinating progress"], description: ["组织分工、沟通进度，让任务向前推进。", "Coordinate responsibilities and progress to move work forward."] },
  ] },
  { title: ["工作节奏", "Your working rhythm"], items: [
    { id: "structure", label: ["清晰安排", "Clear structure"], description: ["按明确步骤、时间安排和完成标准工作。", "Work with clear steps, schedules and completion criteria."] },
    { id: "variety", label: ["变化探索", "Variety and exploration"], description: ["接触不同任务，尝试新的方法与思路。", "Explore different tasks and try new approaches."] },
    { id: "feedback", label: ["及时反馈", "Timely feedback"], description: ["及时了解结果，根据反馈调整工作。", "See results promptly and adjust your work using feedback."] },
  ] },
];
const preferenceIcons = [BookOpen, Wrench, Palette, MessagesSquare, HandHeart, Network, ListChecks, Compass, MessageCircle];
const choices = groups.flatMap((group) => group.items);

export function RiasecExploration({ locale, showPreferences }: {
  locale: Locale;
  showPreferences: boolean;
}) {
  const language = locale === "zh" ? 0 : 1;
  const t = (zh: string, en: string) => language === 0 ? zh : en;
  const [selected, setSelected] = useState<string[]>([]);
  const [focused, setFocused] = useState(choices[0].id);
  const toggle = (id: string) => {
    setFocused(id);
    setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);
  };
  return <>
    {showPreferences ? <section id="riasec-context" className={styles.chapter}>
      <h2>{t("工作偏好探索", "Explore your work preferences")}</h2>
      <p className={styles.explorationLead}>{t("同一种活动，换一种工作方式，感受可能不同。选出你想在下一次尝试中观察的条件。", "The same activity can feel different in a different setting. Choose the conditions you want to explore next.")}</p>
      <div className={styles.preferenceLayout}>
        <div>{groups.map((group) => <section className={styles.preferenceGroup} key={group.title[1]} data-group={groups.indexOf(group)}>
          <h3>{group.title[language]}</h3>
          <div className={styles.preferenceOptions}>{group.items.map((item) => <button type="button" key={item.id} data-current={focused === item.id} aria-pressed={selected.includes(item.id)} aria-label={item.label[language]} aria-describedby={`riasec-preference-description-${item.id}`} onClick={() => toggle(item.id)}>
            <span aria-hidden="true" className={styles.preferenceDot}>{(() => { const Icon = preferenceIcons[choices.indexOf(item)]; return <Icon size={17} strokeWidth={2} />; })()}</span>
            <span className={styles.preferenceCopy}><span>{item.label[language]}</span><span id={`riasec-preference-description-${item.id}`} className={styles.preferenceDescription}>{item.description[language]}</span></span>
            {selected.includes(item.id) ? <Check aria-hidden="true" className={styles.preferenceSelected} size={12} /> : null}
          </button>)}</div>
        </section>)}</div>

      </div>
    </section> : null}
  </>;
}
