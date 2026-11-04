"use client";

import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireProfile, Text } from "@/lib/questionnaires/types";
import type { MiniVirtuesResult } from "@/lib/questionnaires/miniVirtues";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireMiniVirtuesRadar } from "./QuestionnaireMiniVirtuesRadar";
import styles from "./MiniVirtuesResult.module.css";

const unique = (values: string[]) => [...new Set(values)];

/** Plain-language presentation, grounded in each source profile; never selected by score. */
const everydayReadings: Record<string, { context: Text; choice: Text; boundary?: Text }> = {
  "recognition-reading": {
    context: { zh: "比如，会前准备的资料被同事用到了，会上却没人提起。贡献已经完成，明确的认可却没有发生；在意反馈，不等于这份投入没有价值。", en: "Imagine that colleagues use the notes you prepared, but nobody mentions them in the meeting. The contribution was made; explicit recognition did not happen. Wanting feedback does not make that contribution less valuable." },
    choice: { zh: "记下一项已经完成的事实，再决定是否询问对方：哪里有用，哪里还需要改进？", en: "Note one thing you completed, then decide whether to ask which parts were useful and which could be improved." },
  },
  "resources-reading": {
    context: { zh: "朋友想借相机，但你自己的项目也要用。考虑归还日期和备用安排，既是在保护自己的计划，也可以是在认真考虑怎样帮忙。", en: "A friend wants to borrow your camera, but you also need it for a project. Checking the return date and a backup plan can protect your own plans while you consider how to help." },
    choice: { zh: "先说清可以借到哪天，以及计划提前时如何取回；不方便借出，也可以拒绝。", en: "Explain when you need it back and what happens if your project starts earlier. You can also decline to lend it." },
  },
  "desire-boundaries-reading": {
    context: { zh: "新的合作很吸引你，时间和作品能否公开却还没谈清。被吸引、想参与、同意某项安排是不同的事，可以先问清楚再决定。", en: "A new collaboration interests you, but the schedule and permission to share the work are unclear. Feeling drawn to it, wanting to join and agreeing to a particular arrangement are different things. You can ask before deciding." },
    choice: { zh: "先确认下一步需要哪些明确同意，也给自己和对方保留拒绝或不参与的空间。", en: "Check what explicit agreement the next step needs, leaving everyone free to decline or not take part." },
    boundary: { zh: "吸引不等于同意；同意必须针对具体安排，也可以不行动。", en: "Attraction is not consent. Agreement concerns a specific arrangement, and taking no action remains an option." },
  },
  "comparison-reading": {
    context: { zh: "同伴得到你也想争取的机会，你既欣赏对方的作品，也觉得失落。两种感受可以同时存在，不必强迫自己二选一。", en: "A peer receives an opportunity you also wanted. You can appreciate their work and feel disappointed at the same time, without forcing one feeling to cancel the other." },
    choice: { zh: "从这次比较中找一个想学习的具体做法，同时允许自己记录失落。", en: "Identify one specific approach you might learn from, while allowing yourself to note the disappointment." },
  },
  "rewards-reading": {
    context: { zh: "做完费力的任务，你想刷一会儿短视频休息。想得到眼前的轻松，与决定什么时候停下来，是两个可以分别观察的选择。", en: "After a demanding task, you might watch short videos to unwind. Wanting immediate relief and deciding when to stop are two choices you can look at separately." },
    choice: { zh: "如果愿意，可以暂停一下，辨认此刻想要什么，再决定下一步；也可以不做这项观察。", en: "If you wish, pause to identify what you want at that moment, then decide what comes next. You can skip this observation." },
    boundary: { zh: "只谈普通日常选择；不用于酒精、药物、赌博、自伤、进食问题或戒断管理。", en: "This concerns ordinary daily choices only, not alcohol, drugs, gambling, self-harm, eating problems or withdrawal management." },
  },
  "anger-reading": {
    context: { zh: "计划被打断时，你可能注意到身体变紧，也还想把话说完。先分清身体信号和想表达的事情，再决定什么时候、怎样回应。", en: "When someone interrupts your explanation, you might notice tension and still want to finish your point. Distinguish the physical signal from what you want to say, then consider when and how to respond." },
    choice: { zh: "需要时先暂停，稍后再表达；可以先想清这次希望说明什么。", en: "Pause if needed and return to the conversation later. First consider what you want to communicate." },
    boundary: { zh: "愤怒不等于暴力，耐心也不要求忍受伤害。", en: "Anger is not violence, and patience does not require enduring harm." },
  },
  "starting-rest-reading": {
    context: { zh: "忙碌一周后，“把文件夹全部整理好”可能显得没有头绪。打开一份文件、先问清整理目的，或先休息，是不同的可选做法。", en: "After a busy week, “organize the whole folder” may offer no clear starting point. Opening one file, clarifying what the folder is for, or resting first are different options." },
    choice: { zh: "把下一步缩小到一个能开始的动作；确实需要休息时，就先允许自己休息。", en: "Make the next step small enough to begin. When you need rest, allow yourself to rest first." },
  },
};

function everydayReading(profile: QuestionnaireProfile, locale: Locale) {
  const reading = everydayReadings[profile.id];
  return {
    context: reading?.context[locale] ?? profile.sections.find(section => section.id === "context")?.paragraphs[0]?.[locale],
    choice: reading?.choice[locale] ?? profile.sections.find(section => section.id === "choice")?.paragraphs[0]?.[locale],
    boundary: reading?.boundary?.[locale],
  };
}

function Reading({ profile, locale, visible }: { profile: QuestionnaireProfile; locale: Locale; visible: string[] }) {
  const seen = new Set(visible);
  const sections = profile.sections.filter(section => section.id !== "edition").map(section => ({
    ...section,
    text: section.paragraphs.map(paragraph => paragraph[locale]).filter(text => {
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    }),
  })).filter(section => section.text.length);
  return <div className={styles.reading}>
    <p className={styles.headline}>{profile.headline[locale]}</p>
    {sections.map(section => <section key={section.id} id={`report-${profile.id}-${section.id}${["context", "choice"].includes(section.id) ? "-more" : ""}`}>
      <h4>{section.title[locale]}</h4>
      {section.text.map(text => <p key={text}>{text}</p>)}
    </section>)}
  </div>;
}

export function QuestionnaireMiniVirtuesReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<MiniVirtuesResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  const parts = result.miniVirtues.map(part => ({ ...part, direction: quiz.directions.find(d => d.id === part.id)!, profile: quiz.profiles.find(p => p.id === part.profileId)! }));
  const editions = unique(parts.flatMap(part => part.profile.sections.filter(section => section.id === "edition").flatMap(section => section.paragraphs.map(p => p[locale]))));
  const scoreReadings = unique(parts.map(part => part.profile.scoreReading[locale]));
  return <div className={styles.report} data-mini-virtues-result>
    <header className={styles.intro}>
      <p>{zh ? "从被看见、分享、比较到休息，看看七组回答各自在谈什么。" : "Explore what your seven groups of answers cover, from recognition and sharing to comparison and rest."}</p>
      <p className={styles.boundary}>{zh ? "1—5表示对本组四句话的符合程度；不是罪、美德或人品评分。七组分开读。" : "The 1–5 mean describes agreement with four statements, not a sin, virtue or character rating. Read each group separately."}</p>
    </header>
    <label className={styles.chooser} id="mini-virtues-choose">
      <span>{zh ? "想先了解哪个角度？" : "Which perspective would you like to explore?"}</span>
      <select defaultValue={parts[0].id} onChange={event => {
        const target = document.getElementById(`mini-virtues-${event.target.value}`);
        if (!target) return;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "start", behavior: "instant" });
      }}>
        {parts.map(part => <option key={part.id} value={part.id}>{part.direction.title[locale]} · {part.mean.toFixed(2)} / 5</option>)}
      </select>
    </label>
    <div className={styles.parts}>
      {parts.map(part => {
        const reading = everydayReading(part.profile, locale);
        return <section key={part.id} className={styles.part} data-mini-virtues-part={part.id} data-virtues-result-reading={part.profileId} aria-labelledby={`mini-virtues-${part.id}`}>
          <div className={styles.partHeader}>
            <h3 id={`mini-virtues-${part.id}`} tabIndex={-1} className={styles.partTitle}>{part.direction.title[locale]}</h3>
            <p className={styles.score} data-mini-virtues-score={part.id}>
              <span>{zh ? "本次均值" : "Your mean"}</span> <strong>{part.mean.toFixed(2)} / 5</strong>
              <small>{zh ? `四题原始和 ${part.rawSum} / 20` : `Four-item sum ${part.rawSum} / 20`}</small>
            </p>
          </div>
          <p className={styles.summary}>{part.profile.summary[locale]}</p>
          {reading.context && <section className={styles.everyday} id={`report-${part.profileId}-context`} data-mini-virtues-everyday={part.id}>
            <h4>{zh ? "放进一件生活小事里看" : "Picture an everyday situation"}</h4>
            <p>{reading.context}</p>
          </section>}
          {reading.choice && <section className={styles.action} id={`report-${part.profileId}-choice`} data-mini-virtues-action={part.id}>
            <h4>{zh ? "如果愿意，可以这样试试" : "Something you may choose to try"}</h4>
            <p>{reading.choice}</p>
          </section>}
          {reading.boundary && <p className={styles.localBoundary}>{reading.boundary}</p>}
          <details className={styles.details} data-mini-virtues-details={part.id}>
            <summary>{zh ? "更多情境、计分与这组读数的边界" : "More situations, scoring and the limits of this reading"}<span className={styles.chevron} aria-hidden="true" /></summary>
            <Reading profile={part.profile} locale={locale} visible={[part.profile.summary[locale], ...scoreReadings, reading.context, reading.choice].filter((text): text is string => Boolean(text))} />
            <Link prefetch={false} className={styles.guide} href={questionnaireGuidePath(locale, quiz.slug, part.profileId)}>{zh ? "单独阅读这组完整指南" : "Read this group’s full guide separately"}</Link>
          </details>
          <a className={styles.back} href="#mini-virtues-choose">{zh ? "选择其他角度" : "Choose another perspective"}</a>
        </section>;
      })}
    </div>
    <details className={styles.chart} data-mini-virtues-chart>
      <summary>{zh ? "查看七组作答位置图（可选）" : "View the seven-group response-position chart (optional)"}<span className={styles.chevron} aria-hidden="true" /></summary>
      <QuestionnaireMiniVirtuesRadar axes={parts.map(part => ({ id: part.id, title: part.direction.title[locale], rawSum: part.rawSum }))} locale={locale} />
    </details>
    <details className={styles.common} data-mini-virtues-common>
      <summary>{zh ? "计分方式、版本与完整依据" : "Scoring, edition and full background"}<span className={styles.chevron} aria-hidden="true" /></summary>
      <div className={styles.reading}>
        {scoreReadings.map(text => <p key={text}>{text}</p>)}
        <p>{zh ? "每组四题原始和范围4—20，除以四得到1—5均值。图中的位置按（原始和−4）÷16×100计算，不能当作罪、美德或人群百分比。" : "Each four-item sum ranges from 4–20; dividing by four gives a 1–5 mean. The chart uses (sum − 4) / 16 × 100 for position, never a sin, virtue or population percentage."}</p>
        {result.equalFactorGroups.length > 0 && <p data-mini-virtues-equal>{zh ? "有些组的原始和相同，只表示本次数字相同。各组题目不同，不能据此比较心理意义，也不表示罪与美德平衡、混合人格或同样严重。七组仍分别完整阅读，不打破相同数值。" : "Some groups have equal sums. That establishes equal numbers in this attempt only. Their statements differ, so equal sums do not establish equivalent meaning, a balance of sins and virtues, a mixed identity or equal seriousness. Read all seven separately; no equal score is broken."}</p>}
        <h4 id="mini-virtues-edition">{zh ? "版本、来源与验证范围" : "Edition, source and validation limits"}</h4>
        {editions.map(text => <p key={text}>{text}</p>)}
      </div>
    </details>
  </div>;
}

export function QuestionnaireMiniVirtuesNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className={styles.next}><h3>{zh ? "读到这里，下一步由你选择" : "Choose what comes next"}</h3><p>{zh ? "可以回看七份公开指南，也可以直接结束。是否记录观察或继续探索，由你决定。" : "Revisit the seven public guides or finish here. Recording an observation or continuing is your choice."}</p><div><Link prefetch={false} href={`/${locale}/tests/explore/seven-sins-virtues-test#questionnaire-results`}>{zh ? "回看七份完整指南" : "Read all seven guides"}</Link><Link prefetch={false} href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link></div></section>;
}
