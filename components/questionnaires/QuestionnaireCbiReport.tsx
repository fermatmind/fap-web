import Link from "next/link";
import { QuestionnaireCbiAttribution } from "./QuestionnaireCbiAttribution";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { CbiResult, CbiDomain } from "@/lib/questionnaires/cbi";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCbiReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<CbiResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "分别呈现CBI个人与工作相关耗竭，个人六题至少三项有效、工作七题至少四项有效才有所属均分。缺失不补0，两个模块不合成总分，也不划风险档位或作诊断。无论资料是否充分，两份完整指南均可阅读。" : "Personal and work-related CBI exhaustion are presented separately. Personal needs at least three of six valid ratings, and work needs four of seven, for its own mean. Missing responses are not zero. The modules have no combined total, risk band or diagnosis. Both full guides remain available regardless of sufficiency."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "个人六题与工作后四题使用频率，工作前三题使用程度，五档编码100、75、50、25、0。只有工作最后一条精力题按100减原编码反向。用调整后总和除以实际有效题数，未舍入均分显示两位小数。分数点不是未来风险百分比；两个均分之差不能分配成因。工作不适用可选NA，中译与呈现没有建立本地效度。" : "Personal items and the last four work items use frequency; the first three work items use degree. Both formats code 100, 75, 50, 25 and 0. Only the last work-energy item reverses to 100 minus its response code. Divide the adjusted sum by the actual valid count; the unrounded mean displays two decimals. Score points are not future-risk percentages. Differences between means cannot allocate causes. Work items may be NA when inapplicable; the working translation and presentation lack established local validity."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => {
        const score = result.cbiDomains[direction.id as CbiDomain], scored = score.mean !== null;
        return <section key={direction.id} data-cbi-domain={direction.id} aria-labelledby={`cbi-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`cbi-title-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
          <dl className="my-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "有效题调整后总和" : "Adjusted sum of rated items"}</dt><dd data-cbi-sum>{scored ? score.sum : missing}</dd></div>
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "CBI均分（0—100分数点）" : "CBI mean (0–100 score points)"}</dt><dd data-cbi-mean>{scored ? `${score.mean!.toFixed(2)} / 100` : missing}</dd></div>
            <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效回答数与最低要求" : "Valid ratings and minimum"}</dt><dd data-cbi-rated>{zh ? `${score.rated} / ${score.total}项有效；至少${score.minimum}项` : `${score.rated} / ${score.total} rated; minimum ${score.minimum}`}</dd></div>
          </dl>
          {!scored && <p data-cbi-insufficient className="leading-7">{zh ? "本模块有效回答未达源最低题数，未生成个人调整后总和或均分；不把缺失当作低分。另一模块可独立阅读，下方完整指南是通用说明。" : "This module has fewer valid responses than the source minimum, so no personal adjusted sum or mean was generated. Missing information is not a low score. The other module can be read separately; full guides below are general information."}</p>}
        </section>;
      })}
    </div>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`cbi-guide-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`cbi-guide-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <div data-cbi-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本模块完整公开说明" : "Read this module’s full public guide"}</Link>
    </section>)}
    <QuestionnaireCbiAttribution locale={locale} />
  </div>;
}

export function QuestionnaireCbiNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-cbi-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "描述困难，选择合适支持，或在这里结束" : "Describe the difficulty, consider support, or finish here"}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh ? "持续、无法解释或影响生活的疲倦，可与合格健康专业人员讨论，无需先达到某个分数。工作相关困难也可能需要讨论工作量、控制与支持等条件，以及合适的组织调整。可先回看两份指南、寻找适用支持，或在这里结束；不要求继续其他测评。" : "Persistent, unexplained or disruptive tiredness can be discussed with a qualified health professional without waiting for a particular score. Work concerns may also require discussion of workload, control, support and appropriate organizational changes. Review both guides, seek relevant support or stop here; no further assessment is required."}</p>
    <ul className="list-disc pl-5 leading-8">
      <li><a className="underline" href="https://www.nhs.uk/symptoms/tiredness-and-fatigue/">{zh ? "NHS：何时就疲倦寻求医疗建议" : "NHS: when to seek advice about tiredness"}</a></li>
      <li><a className="underline" href="https://www.who.int/news-room/fact-sheets/detail/mental-health-at-work">{zh ? "WHO：工作条件与心理健康支持" : "WHO: working conditions and mental-health support"}</a></li>
    </ul>
    <Link prefetch={false} className="mt-3 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
