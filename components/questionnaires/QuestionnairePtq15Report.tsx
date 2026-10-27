import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Ptq15Result } from "@/lib/questionnaires/ptq15";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnairePtq15Report({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<Ptq15Result, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh", data = result.ptq15;
  return <div className="my-6 space-y-8" data-ptq15-result>
    <p className="leading-8">{zh
      ? "以下保留原PTQ总分和三个分量表原始和。题目询问通常的思考方式，没有指定近期时间窗。不划严重程度档、不作人群或职业排名，也不诊断。简体中文是尚未验证的费马工作译文。"
      : "These are the original PTQ total and three raw subscale sums. Items concern typical thinking without a fixed recent time window. No severity bands, population or career rankings, or diagnosis are produced. Simplified Chinese is a new, unvalidated FermatMind working translation."}</p>
    {[{ id: "total-reading", title: zh ? "十五项总分" : "Fifteen-item total", sum: data.overallSum, rated: data.rated, total: 15, maximum: 60 },
      ...quiz.directions.map(direction => ({ id: `${direction.id}-reading`, title: direction.title[locale], ...data.parts[direction.id as keyof typeof data.parts] }))].map(row => {
      const profile = quiz.profiles.find(p => p.id === row.id)!;
      return <section key={row.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-ptq15-part={row.id} aria-labelledby={`ptq15-${row.id}`}>
        <h3 id={`ptq15-${row.id}`} className="text-xl font-semibold">{row.title}</h3>
        <p data-ptq15-score={row.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{row.sum === null
          ? (zh ? `资料不足：${row.rated}/${row.total}项有数值回答；需要完整，不计算本项原始和。` : `Insufficient information: ${row.rated}/${row.total} items rated; all are needed. No raw sum is calculated.`)
          : (zh ? `原始和：${row.sum}（可取范围0—${row.maximum}；${row.rated}/${row.total}项有效）` : `Raw sum: ${row.sum} (possible range 0–${row.maximum}; ${row.rated}/${row.total} items rated)`)}</p>
        {row.sum === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "不计分不补零、不按比例估算，也不表示症状缺乏或严重；其他完整部分分别保留。以下指南为通用读法。"
          : "Unscored answers are not zero-filled, prorated or interpreted as absence or severity. Other complete parts remain separate. The guide below is general reading."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`ptq15-report-${row.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本项完整公开指南" : "Read this part’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "三个分量表题量不同，不能按原始和比较强弱。分数不决定诊断、治疗、资格或职业适配。反复思考令人困扰或影响日常时，可以无论分数多少都考虑合格专业支持，无需提交私密想法。"
      : "The subscales have different item counts; do not rank them by raw sums. Scores do not decide diagnosis, treatment, qualifications or career fit. If repetitive thinking is distressing or affecting daily life, qualified professional support can be considered regardless of the score, without submitting private thoughts."}</p>
  </div>;
}

export function QuestionnairePtq15NextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" data-ptq15-next-steps>
    <h2 className="text-xl font-semibold">{zh ? "下一步由你的实际需要决定" : "Choose a next step for your actual needs"}</h2>
    <p className="mt-3 leading-8">{zh
      ? "可以回看一个实例：何时发生、是否出现新信息、是否影响正在做的事；无需公开内容。观察加重困扰时可以停止。若体验持续、令人难受或妨碍生活，可以与合格心理健康专业人士讨论，不必先达到某个分数。这里不按分数推荐人格测试、职业或治疗方案。"
      : "You may revisit one example: when it happened, whether new information appeared and whether it interrupted an activity, without sharing the content. Stop if observation increases distress. If the experience persists, is upsetting or disrupts daily life, consider discussing it with a qualified mental-health professional without waiting for a particular score. This page does not recommend personality tests, careers or treatments based on the result."}</p>
  </section>;
}
