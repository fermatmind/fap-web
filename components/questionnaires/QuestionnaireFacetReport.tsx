import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import Link from "next/link";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./QuestionnaireResultPresentation.module.css";

const batteryGroups = [
  { id: "load", title: { zh: "哪些互动更费力", en: "What took effort" }, description: { zh: "把交谈本身和组织安排分开看。", en: "Separate the effort of talking from the effort of coordinating." }, directions: ["interaction-load", "coordination-load"] },
  { id: "recovery", title: { zh: "哪些相处方式带来恢复", en: "What helped you recover" }, description: { zh: "独处和轻松的陪伴都可能让人恢复。", en: "Both quiet time and easy company can feel restorative." }, directions: ["quiet-recovery", "easy-company"] },
];

export function QuestionnaireFacetReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const battery = quiz.slug === "social-battery-test";
  const readings = quiz.directions.map(direction => {
    const score = result.facets[direction.id];
    return { id: direction.id, label: direction.title[locale], href: `#facet-title-${direction.id}`,
      value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
      note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
  });
  const chapters = quiz.directions.map(direction => {
    const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
    return { id: direction.id, section: <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`facet-title-${direction.id}`}>
      <h3 id={`facet-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
      <p data-facet-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
        ? (zh ? `资料不足：${score.rated}/${score.total}题有频率回答，本版至少需要${quiz.minimumRatedItems}题；不计算个人均分。` : `Insufficient information: ${score.rated}/${score.total} items rated; this edition needs at least ${quiz.minimumRatedItems}. No personal mean is calculated.`)
        : (zh ? `计分后均分：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}题有效）` : `Scored mean: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} items rated)`)}</p>
      {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "以下为这一部分的通用读法，不能当作对你本次状态的解释。" : "The following is a general reading guide, not an interpretation of your state in this attempt."}</p>}
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading", "example", "experiment"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section> };
  });

  return <ResultPage variant="dimensions" className="mt-6 space-y-10">
    {battery ? <div className={styles.batteryFlow} data-battery-reading-flow>
      <p>{zh ? "回看过去两周，负担和恢复可以同时出现。四组分别阅读，每项均分要结合有效题数。" : "Look back at the last two weeks. Social demands and recovery can coexist. Read each mean alongside its rated-item count."}</p>
      <div className={styles.batterySummary}>
        {batteryGroups.map(group => <div key={group.id} className={styles.batteryGroup} data-battery-group={group.id}>
          <ResultOverview title={group.title[locale]} description={group.description[locale]} items={readings.filter(reading => group.directions.includes(reading.id))} />
        </div>)}
      </div>
      {batteryGroups.map(group => <div key={group.id} className={styles.batteryGroup} data-battery-group={group.id}>
        <p className={styles.batteryChapterLabel}>{group.title[locale]}</p>
        <div className={styles.batteryChapters}>{chapters.filter(chapter => group.directions.includes(chapter.id)).map(chapter => chapter.section)}</div>
      </div>)}
    </div> : chapters.map(chapter => chapter.section)}
    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{battery
        ? (zh ? "查看计分与读数说明" : "View scoring and reading notes")
        : (zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes")}</summary>
      {!battery && <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
        description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
        items={readings} />}
      <p className="leading-8 text-slate-700">{zh ? `${quiz.directions.length}部分分别描述这次自报经验，不相加，也不排出更好的人格类型。较高的负担与较高的恢复感可以同时存在；没有哪一部分等于剩余电量百分比。` : `These ${quiz.directions.length} parts describe separate self-reported experiences. They are not added together or ranked as better personality types. Higher reported demands and stronger recovery can coexist; none is a percentage of battery remaining.`}</p>
    </details>
  </ResultPage>;
}
