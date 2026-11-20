"use client";

import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { shouldAllowBrowserAnalyticsRuntime } from "@/lib/tracking/internalTraffic";
import { trackClientEvent } from "@/lib/tracking/client";
import {
  gta6LandingPath, gta6Profile, gta6ResultPath, type Gta6Profile,
} from "@/lib/questionnaires/gta6CharacterQuiz";
import { gta6OccupationNotes, gta6ProfileReading, gta6ReadingFaq } from "@/lib/questionnaires/gta6ProfileReadings";
import { gta6CareerDimensions } from "@/lib/questionnaires/gta6CareerEditorial";
import styles from "./Gta6Quiz.module.css";

const assessments = [
  { slug: "mbti-personality-test-16-personality-types", path: "/tests/mbti-personality-test-16-personality-types", label: ["Explore MBTI and its versions", "了解 MBTI 与题本选择", "看看 MBTI 測驗版本"] },
  { slug: "holland-career-interest-test-riasec", path: "/tests/holland-career-interest-test-riasec", label: ["Explore Holland interests · 60 questions", "探索霍兰德职业兴趣 · 60 题", "探索霍蘭德職業興趣 · 60 題"] },
  { slug: "career-assessment", path: "/career/assessment", label: ["Explore work preferences · 94 questions", "梳理职业偏好 · 94 题", "整理工作偏好 · 94 題"] },
] as const;

function recordAssessmentClick(locale: DisplayLocale, destination: string, publicGuide: boolean) {
  if (!shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true" }).allowed) return;
  const path = gta6LandingPath(locale);
  // Use the quiz family only. The current URL can carry an invitation or refer to a personal attempt.
  void trackClientEvent({
    eventName: "start_click",
    anonymousId: "",
    path,
    payload: {
      locale,
      slug: destination,
      test_slug: destination,
      target_action: "open_assessment",
      entry_surface: "gta6_character_result",
      source_page_type: publicGuide ? "public_character_guide" : "entertainment_result",
      landing_path: path,
      current_path: path,
      referrer: "",
    },
  });
}

export function Gta6ResultReading({ locale, profile, publicGuide }: { locale: DisplayLocale; profile: Gta6Profile; publicGuide: boolean }) {
  const content = gta6ProfileReading(profile.id, locale);
  if (!content) return null;
  const { career, reading, index } = content;
  const comparisons = [reading.partner, ...reading.contrasts];
  return (
    <div className={styles.extendedReading}>
      <section aria-labelledby="gta6-scene-reading">
        <h2 id="gta6-scene-reading">{["Official character & the quiz scenario", "官方人物与派对情境", "官方人物設定與派對情境"][index]}</h2>
        <p>{reading.canon[index]}</p>
        <p><a href="https://www.rockstargames.com/VI/only-in-leonida">Rockstar Games · Only in Leonida</a></p>
        <p className={styles.scenarioNote}>{reading.scene[index]}</p>
        <div className={styles.readingGrid}>
          <div><h3>{["What helps the crew", "这种做法能帮团队什么", "對團隊有哪些幫助"][index]}</h3><ul>{reading.gains.map(gain => <li key={gain[0]}>{gain[index]}</li>)}</ul></div>
          <div><h3>{["Where it can get in the way", "这种做法的代价", "這樣做要留意什麼"][index]}</h3><ul>{reading.limits.map(limit => <li key={limit[0]}>{limit[index]}</li>)}</ul></div>
        </div>
      </section>
      <section aria-labelledby="gta6-workplace-reading">
        <h2 id="gta6-workplace-reading">{["Workplace activities to try", "从角色分工延伸到工作活动", "從角色分工想想你願意試的工作"][index]}</h2>
        <p>{reading.workplace[index]}</p>
        <ul className={styles.interestList}>{career.interests.map(letter => <li key={letter}><strong>{letter}</strong> · {gta6CareerDimensions[letter][index]}</li>)}</ul>
        <p>{["These are activities to explore. A separate assessment is needed for a personal MBTI or RIASEC result; job qualifications depend on skills, experience and local requirements.", "这些字母对应可尝试的工作活动。个人 MBTI 或霍兰德结果需要独立作答，岗位资格请核对技能、经验与当地要求。", "字母是可以試做的活動提示。你自己的 MBTI 或霍蘭德結果要另外作答；想入行，還要查技能、經驗和所在地的規定。"][index]}</p>
        <p><strong>{reading.reflection[index]}</strong></p>
        <nav className={styles.assessmentLinks} aria-label={["Separate assessments", "独立测评入口", "獨立測驗入口"][index]}>
          {assessments.map(({ slug, path, label }) => <Link key={slug} prefetch={false} href={`/${locale}${path}`} onClick={() => recordAssessmentClick(locale, slug, publicGuide)}>{label[index]} →</Link>)}
        </nav>
      </section>
      <section aria-labelledby="gta6-occupations">
        <h2 id="gta6-occupations">{["Two real occupations to compare", "两份真实职业档案", "兩份可以對照的職業指南"][index]}</h2>
        <div className={styles.readingGrid}>{career.jobs.map(([slug, ...names]) => (
          <div key={slug}>
            <h3><Link prefetch={false} href={`/${locale}/career/jobs/${slug}`}>{names[index]}</Link></h3>
            <p>{gta6OccupationNotes[slug][index]}</p>
          </div>
        ))}</div>
        <p><Link prefetch={false} href={`/${locale}/career/compare`}>{["Open the career comparison tool", "打开两职业对比工具", "開啟兩種職業的比較工具"][index]} →</Link></p>
      </section>
      <section aria-labelledby="gta6-comparisons">
        <h2 id="gta6-comparisons">{["One team-up and two ways to compare", "一组拍档与两种角色对照", "一組拍檔、兩種做法對照"][index]}</h2>
        <div className={styles.readingGrid}>{comparisons.map(([id, note], position) => (
          <div key={id}>
            <p className={styles.relationLabel}>{position === 0 ? ["Team-up example", "组队示例", "組隊範例"][index] : ["Decision contrast", "决策对照", "做法對照"][index]}</p>
            <h3><Link prefetch={false} href={gta6ResultPath(locale, id)}>{gta6Profile(id)?.name}</Link></h3>
            <p>{note[index]}</p>
          </div>
        ))}</div>
      </section>
      {publicGuide && <section aria-labelledby="gta6-reading-faq">
        <h2 id="gta6-reading-faq">{["Character guide FAQ", "角色指南常见问题", "角色指南常見問題"][index]}</h2>
        {gta6ReadingFaq(locale, profile.name, profile.id).map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}
      </section>}
    </div>
  );
}
