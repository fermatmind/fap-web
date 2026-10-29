import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function IntimacyValuesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-intimacy-values-report className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "五项分别记录所列条件对你的重要程度。每项五条，至少四条数字才显示原始均值；3是中等重要，未评分保持缺失。五项可同时很高，不合总分、不排名或派型。同意与尊重保持为底线，不参与得分取舍。" : "Five separate parts record how important the stated conditions are to you. Each has five prompts and needs four numeric ratings for a raw mean. Three means moderately important; unscored responses stay missing. All five can be high, without a total, rank or assigned type. Consent and respect remain baseline conditions, not scored trade-offs."}</p>
    {quiz.directions.map(direction => {
      const part = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} data-intimacy-values-part={direction.id} aria-labelledby={`intimacy-title-${direction.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`intimacy-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-intimacy-values-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{part.mean === null
          ? (zh ? `资料不足：${part.rated}/5条有效，至少需4条；不显示个人均值。` : `Insufficient information: ${part.rated}/5 rated, at least 4 needed; no personal mean.`)
          : (zh ? `原始和 ${part.sum}，${part.rated}/5条有效，重要程度均值 ${part.mean.toFixed(1)} / 5` : `Raw sum ${part.sum}; ${part.rated}/5 rated; importance mean ${part.mean.toFixed(1)} / 5`)}</p>
        <p className="mb-4 leading-7">{part.mean === null
          ? (zh ? "以下是完整通用指南，不是本次个人偏好的结论。" : "The complete text below is a general guide, not a conclusion about your preferences in this attempt.")
          : (zh ? "较高只表示更重视本组条件；较低不解释原因，也不授权忽视任何人的边界。相同均值可能来自不同回答，请结合具体条件阅读。" : "A higher mean records more importance placed on this set. A lower mean explains no cause and never permits disregarding anyone’s boundaries. Different answers can yield the same mean; read the actual conditions in context.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`intimacy-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一主题的完整公开指南" : "Read this topic’s full public guide"}</Link>
      </section>;
    })}
    <p className="text-sm leading-7">{zh ? "题目与读法为费马原创，尚未建立信效度、常模或跨语言测量等价。不据此判断性取向、身份、私密行为、伴侣品质或关系未来；不要求披露私人经历。" : "FermatMind authored these prompts and readings; reliability, validity, norms and language equivalence have not been established. Results do not judge orientation, identity, private acts, partner quality or a relationship’s future, and no private history is requested."}</p>
  </div>;
}

export function IntimacyValuesNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-intimacy-values-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "澄清一项预期，或到这里结束" : "Clarify one expectation, or stop here"}</h3><p>{zh ? "可以回看一条条件，保留一个对自己有用的问题，无需分享答案或要求别人作答。若另外想比较关系中的角色偏好，可以独立完整作答关系价值观二选一；它是不同任务，不把本次隐私或信任均值换算成角色。也可以不再继续。" : "Revisit one condition and keep a question that helps you, without sharing answers or asking anyone else to complete the test. To compare relationship-role preferences separately, you can complete the distinct Relationship Values choices. That is a different task; these privacy or trust means do not convert into role counts. No further step is required."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnairePath(locale, "relationship-values")}>{zh ? "可选：了解不同的关系角色偏好测试" : "Optional: explore the distinct relationship-role test"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
