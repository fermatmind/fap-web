import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { MiniOrientationQuestionnaire, OrientationRecord } from "@/lib/questionnaires/miniOrientation";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireOrientationReport({ quiz, result, locale }: { quiz: MiniOrientationQuestionnaire; result: OrientationRecord; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-orientation-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "这里只整理自我观察回答，不判定取向、身份或概率，不能确定、证明或改变取向，也不推断吸引对象。无须公开、解释或证明自己。" : "This records self-observation responses, not orientation, identity or probability. It cannot determine, prove or change orientation, or infer whom you are attracted to. No disclosure, explanation or proof is required."}</p>
    {result.state === "ALL_SKIPPED" ? <section data-orientation-all-skipped role="status" className="rounded-lg border border-slate-200 p-4 leading-8">
      <h3 className="text-xl font-semibold">{zh ? "本次全部选择不回答" : "Every statement was explicitly skipped"}</h3>
      <p className="mt-3">{zh ? "这是合法选择，无须理由。不生成个人领域卡或解释，不推断回避、压抑、准备程度、取向或身份；可以直接退出。" : "This is a valid choice without any explanation required. No personal domain cards or interpretations are generated, and no avoidance, suppression, readiness, orientation or identity is inferred. You may exit directly."}</p>
    </section> : <>
      <p className="leading-8">{zh ? "五主题分开看。数字回答含1—5，暂不确定是其中选3的子集，跳过单列。不相加、不求均值、不排名或评能力。以下通用指南人人相同，不是根据次数生成的个人解释。" : "Read five topics separately. Numeric responses include 1–5; uncertain choices are the subset at 3, with skips separate. There is no score, mean, ranking or ability grade. The guides below are general, identical for everyone, and not personal interpretations of these counts."}</p>
      {quiz.directions.map(direction => {
        const record = result.domains[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
        const options = quiz.questions.find(q => q.options[0].directionId === direction.id)!.options;
        return <section key={direction.id} data-orientation-domain={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`orientation-${direction.id}`}>
          <h3 id={`orientation-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
          <p data-orientation-counts className="my-4 leading-8">{zh ? `4条陈述：${record.numeric}个数字回答（其中${record.uncertain}个暂不确定），${record.skipped}个明确跳过。` : `4 statements: ${record.numeric} numeric responses (including ${record.uncertain} uncertain); ${record.skipped} explicitly skipped.`}</p>
          <dl data-orientation-distribution className="space-y-3 rounded-lg bg-slate-50 p-4">{options.map(option => <div key={option.id} className="flex items-start justify-between gap-4"><dt className="leading-7">{option.id === "na" ? "" : `${option.id} — `}{option.label[locale]}</dt><dd className="shrink-0 leading-7">{zh ? `${record.choices[option.id]}次` : `${record.choices[option.id]}`}</dd></div>)}</dl>
          {record.skipped === 4 && <p data-orientation-domain-skipped className="mt-4 leading-8">{zh ? "本主题四题均跳过，保留此选择，不推断原因；下方只是通用指南，不是对你的解释。" : "All four statements in this topic were skipped. The choices remain without inferred reasons; the text below is general guidance, not an interpretation of you."}</p>}
          <div className="mt-6"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`orientation-report-${profile.id}`} /></div>
          <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本主题通用全文（不含个人记录）" : "Read this topic’s general full guide separately (no personal record)"}</Link>
        </section>;
      })}
    </>}
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8">
      <p>{zh ? "回答和记录只在当前页面内存，不存草稿或结果、不上传逐题选择、不接分析、不分享个人结果。刷新、换语、离开、浏览器返回恢复或重测即清除；不承诺清除浏览历史、系统截屏或截图。" : "Responses and records stay in current-page memory: no saved draft or result, choice uploads, analytics or personal-result sharing. Reloading, changing language, leaving, browser back restoration or retaking clears them; this does not erase browser history, operating-system captures or screenshots."}</p>
      <p className="mt-3">{zh ? "观察均可不做，无须关系经历、接触、公开或证明。现实有暴力、威胁、胁迫、被迫公开或紧迫安全问题时，优先保护自己并寻求适当支持，无须等待记录；本页面不能认证现实环境安全。" : "Every observation is optional: no relationship experience, contact, disclosure or proof is required. For actual violence, threats, coercion, forced disclosure or urgent safety concerns, prioritize protection and suitable support without waiting for a record. This page cannot certify a real-world setting as safe."}</p>
    </aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
