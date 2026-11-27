import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { archetypeCorePath } from "@/lib/questionnaires/archetypeResultCard";
import { archetypeResultCopy } from "@/lib/questionnaires/archetypeResultShare";
import styles from "./ArchetypeHonorCard.module.css";

export function ResultCoreBridge({ locale, target, archiveExercise }: { locale: DisplayLocale; target: Parameters<typeof archetypeCorePath>[1]; archiveExercise?: boolean }) {
  const copy = archetypeResultCopy[locale];
  const [label, context] = copy.targets[target];
  const exerciseContext = {
    zh: "好奇自己喜欢什么样的工作活动？可以另做一次职业兴趣探索，本轮读数和练习成绩不会带入。",
    "zh-TW": "好奇自己喜歡哪一類工作活動？可以另外探索職業興趣，這輪的讀數與練習成績不會帶入。",
    en: "Curious which work activities you enjoy? Explore your interests in a separate assessment. Your results here do not carry over.",
  };
  return <section className={styles.bridge} data-archetype-core-assessment={target}>
    <h3>{copy.next}</h3><p>{archiveExercise && target === "RIASEC" ? exerciseContext[locale] : context}</p>
    <Link prefetch={false} referrerPolicy="no-referrer" href={archetypeCorePath(locale, target)}>{label} →</Link>
  </section>;
}
