import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { MiniVirtuesResult } from "@/lib/questionnaires/miniVirtues";
import type { Locale } from "@/lib/i18n/locales";
import { QuestionnaireMiniVirtuesRadar, miniVirtuesPosition } from "./QuestionnaireMiniVirtuesRadar";
import styles from "./MiniVirtuesResult.module.css";

const unique = (values: string[]) => [...new Set(values)];
function Reading({ profile, locale }: { profile: QuestionnaireProfile; locale: Locale }) {
  const seen = new Set([profile.headline[locale], profile.summary[locale]]);
  const once = (paragraphs: string[]) => paragraphs.filter(text => { if (seen.has(text)) return false; seen.add(text); return true; });
  const explanation = once([profile.scoreReading[locale]]);
  const sections = profile.sections.filter(section => !["limits", "edition"].includes(section.id)).map(section => ({ ...section, text: once(section.paragraphs.map(p => p[locale])) }));
  return <div className={styles.reading}>
    {explanation.map(text => <p className={styles.scoreReading} key={text}>{text}</p>)}
    {sections.map(section => <section key={section.id} id={`report-${profile.id}-${section.id}`}>
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
  return <div className={styles.report} data-mini-virtues-result>
    <div className={styles.overview}>
      <section className={styles.panel} aria-labelledby="mini-virtues-chart-title">
        <div className={styles.panelHeader}><h3 id="mini-virtues-chart-title">{zh ? "七宗罪与七美德测试" : "Seven Sins and Virtues"}</h3><span className={styles.legend}>{zh ? "粉色：本次作答" : "Pink: this attempt"}</span></div>
        <QuestionnaireMiniVirtuesRadar axes={parts.map(part => ({ id: part.id, title: part.direction.title[locale], rawSum: part.rawSum }))} locale={locale} />
      </section>
      <div className={styles.overviewSide}>
        <section className={styles.panel} aria-labelledby="mini-virtues-overview-title">
          <p className={styles.eyebrow}>{zh ? "结果概览" : "Your overview"}</p><h3 id="mini-virtues-overview-title" className={styles.overviewTitle}>{zh ? "各维度概览" : "All seven groups"}</h3>
          <ul className={styles.values}>{parts.map(part => <li key={part.id}><a href={`#mini-virtues-${part.id}`}><span>{part.direction.title[locale]}</span><strong data-mini-virtues-position={part.id}>{Math.round(miniVirtuesPosition(part.rawSum))}%</strong></a></li>)}</ul>
        </section>
        <section className={styles.intro} aria-labelledby="mini-virtues-intro-title"><p className={styles.eyebrow}>{zh ? "本次结果" : "This attempt"}</p><h3 id="mini-virtues-intro-title">{zh ? "七个日常观察角度" : "Seven everyday perspectives"}</h3><p>{zh ? "每组四道题，分别呈现你的原始总分与平均值。选择一组往下读，再结合具体情境理解。七组独立阅读，没有总分或道德排名。" : "Each four-item group has its own sum and mean. Pick a group to read, then consider a concrete situation. The seven groups remain separate, without an overall score or moral ranking."}</p></section>
      </div>
    </div>
    <div className={styles.parts}>
      {parts.map(part => <section key={part.id} className={styles.part} data-mini-virtues-part={part.id} data-virtues-result-reading={part.profileId} aria-labelledby={`mini-virtues-${part.id}`}>
        <h3 id={`mini-virtues-${part.id}`} className={styles.partTitle}>{part.direction.title[locale]}</h3>
        <p className={styles.score} data-mini-virtues-score={part.id}>{zh ? <>原始总分 <strong>{part.rawSum} / 20</strong><span> · </span>平均 <strong>{part.mean.toFixed(2)} / 5</strong></> : <>Sum <strong>{part.rawSum} / 20</strong><span> · </span>Mean <strong>{part.mean.toFixed(2)} / 5</strong></>}</p>
        <p className={styles.headline}>{part.profile.headline[locale]}</p><p className={styles.summary}>{part.profile.summary[locale]}</p>
        <details className={styles.details} data-mini-virtues-details={part.id}>
          <summary><span className={styles.closedText}>{zh ? "展开详细内容" : "Read the details"}</span><span className={styles.openText}>{zh ? "收起详细内容" : "Close the details"}</span><span className={styles.chevron} aria-hidden="true" /></summary>
          <Reading profile={part.profile} locale={locale} />
          <Link prefetch={false} className={styles.guide} href={questionnaireGuidePath(locale, quiz.slug, part.profileId)}>{zh ? "阅读这组公开完整指南" : "Read this group’s full public guide"}</Link>
        </details>
        <aside className={styles.limit} id={`report-${part.profileId}-limits`}><h4>{zh ? "结果不能说明什么" : "What this result cannot establish"}</h4>{unique(part.profile.sections.filter(section => section.id === "limits").flatMap(section => section.paragraphs.map(p => p[locale]))).map(text => <p key={text}>{text}</p>)}</aside>
      </section>)}
    </div>
    <details className={styles.common} data-mini-virtues-common>
      <summary>{zh ? "阅读边界、计分与版本说明" : "Reading limits, scoring and edition"}<span className={styles.chevron} aria-hidden="true" /></summary>
      <div className={styles.reading}><p>{zh ? "原始总分是四题回答数值之和，范围4—20；平均值是总分除以四，范围1—5。图表位置按（原始总分−4）÷16×100计算，只用于呈现本次作答。" : "Each sum adds four responses (range 4–20); its mean divides that sum by four (range 1–5). Chart position is (sum − 4) / 16 × 100 and describes this attempt only."}</p>
        {result.equalFactorGroups.length > 0 && <p data-mini-virtues-equal>{zh ? "有些组的原始和相同，只表示本次数字相同。各组题目不同，不能据此比较心理意义，也不表示罪与美德平衡、混合人格或同样严重。七组仍分别完整阅读，不打破相同数值。" : "Some groups have equal sums. That establishes equal numbers in this attempt only. Their statements differ, so equal sums do not establish equivalent meaning, a balance of sins and virtues, a mixed identity or equal seriousness. Read all seven separately; no equal score is broken."}</p>}
        <h4 id="mini-virtues-edition">{zh ? "版本、来源与验证范围" : "Edition, source and validation limits"}</h4>{editions.map(text => <p key={text}>{text}</p>)}
      </div>
    </details>
  </div>;
}

export function QuestionnaireMiniVirtuesNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className={styles.next}><h3>{zh ? "读到这里，下一步由你选择" : "Choose what comes next"}</h3><p>{zh ? "可以回看七份公开指南，也可以直接结束。是否记录观察或继续探索，由你决定。" : "Revisit the seven public guides or finish here. Recording an observation or continuing is your choice."}</p><div><Link prefetch={false} href={`/${locale}/tests/explore/seven-sins-virtues-test#questionnaire-results`}>{zh ? "回看七份完整指南" : "Read all seven guides"}</Link><Link prefetch={false} href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link></div></section>;
}
