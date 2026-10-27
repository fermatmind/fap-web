import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Adexi14Result } from "@/lib/questionnaires/adexi14";
import { formatAdexi14Mean } from "@/lib/questionnaires/adexi14";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireAdexi14Report({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<Adexi14Result, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh", score = result.adexi14;
  return <div data-adexi14-result className="mt-6 space-y-8">
    <section className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby="adexi14-overall-heading">
      <h3 id="adexi14-overall-heading" className="text-2xl font-semibold">{zh ? "ADEXI整体原始合计" : "Your ADEXI overall raw sum"}</h3>
      <p data-adexi14-overall className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{score.overallSum === null
        ? (zh ? `资料不足：${score.rated}/14题有量表回答；${score.skipped}题跳过，不计算整体合计。` : `Insufficient information: ${score.rated}/14 scale responses; ${score.skipped} skipped. No overall sum.`)
        : (zh ? `${score.overallSum}（14到70；14/14题有效）` : `${score.overallSum} (14 to 70; 14/14 scale responses)`)}</p>
      <p className="leading-8 text-slate-700">{zh ? "按官方彩色自评题本把14项数值直接相加，不反向，也不平均两个分项均分。较大表示更认同所用的困难陈述，不表示执行功能更强，也不衡量智商、个人价值或任何诊断。" : "The adopted colour-coded self-report form adds all fourteen numeric values directly, without reversal or averaging the two part means. Larger means more endorsement of the difficulty statements, not stronger executive function, IQ, personal worth or a diagnosis."}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{zh ? "英文及Angela Siu简体中文来自作者官网提供的现有自评版本，保留题序与措辞。本网站尚未建立自己的心理测量验证或跨语言等值证据，不套临床阈值、神经类型组合或人群百分位。" : "English and Angela Siu simplified Chinese are the existing self-report versions supplied by the authors' website, with item order and wording retained. This website has not established its own psychometric validation or cross-language equivalence. No clinical thresholds, neurotype mapping or population percentiles are applied."}</p>
    </section>
    <section aria-labelledby="adexi14-parts-heading">
      <h3 id="adexi14-parts-heading" className="mb-4 text-2xl font-semibold">{zh ? "两个部分：原始合计与标明的均分" : "Two parts: raw sums and labelled means"}</h3>
      <div className="space-y-4">{quiz.directions.map(direction => {
        const part = score.parts[direction.id as keyof typeof score.parts];
        return <section key={direction.id} data-adexi14-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h4 className="text-lg font-semibold">{direction.title[locale]}</h4>
          <div data-adexi14-part-score className="mt-3 space-y-2 leading-8">{part.sum === null
            ? <p>{zh ? `资料不足：${part.rated}/${part.total}题有量表回答；本部分暂不计算合计或均分。` : `Insufficient information: ${part.rated}/${part.total} scale responses. No sum or mean for this part.`}</p>
            : <><p>{zh ? `原始合计：${part.sum}（${part.total}到${part.total * 5}）` : `Raw sum: ${part.sum} (${part.total} to ${part.total * 5})`}</p>
              <p>{zh ? `分项均分：${formatAdexi14Mean(part.sum, part.total)}（1到5；合计除以${part.total}）` : `Part mean: ${formatAdexi14Mean(part.sum, part.total)} (1 to 5; sum divided by ${part.total})`}</p>
              <p className="text-sm text-slate-600">{zh ? `完整度：${part.rated}/${part.total}题；较大表示报告更多困难。` : `Completeness: ${part.rated}/${part.total} items. Larger reflects more reported difficulty.`}</p></>}</div>
        </section>;
      })}</div>
      <p className="mt-4 leading-8 text-slate-700">{zh ? "原始分项题数不同，不按数字大小选最强或最弱能力；均分相等也不表示两种能力相同。官方彩色题本标合计，另一份官方分量表文件标均分，本版清楚区分。整体合计需要14题全有效，各分项也需本组全有效；一题跳过仅使所在分项与整体暂不可用，其他完整分项保留。缺答不是零，不估算；这是网站完整度规则，不是经验证的缺失阈值。" : "The raw parts have different item counts and do not rank a strongest or weakest capacity; equal means do not establish equivalent capacities. The colour-coded source labels sums, while the separate official subscale file labels means. Their labels stay distinct. The overall sum needs all fourteen numeric answers and each part needs its own complete set. A skip withholds its part and the overall, leaving a complete other part available. Missing is never zero or imputed. This is a website completeness policy, not a validated missing-data threshold."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`adexi14-guide-${profile.id}`}>
      <h3 id={`adexi14-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`adexi14-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份公开完整指南" : "Read this complete public guide"}</Link>
    </section>)}
  </div>;
}
