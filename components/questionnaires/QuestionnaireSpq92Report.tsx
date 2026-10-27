import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import type { Spq92Result } from "@/lib/questionnaires/spq92";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireSpq92Report({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<Spq92Result, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh", score = result.spq92;
  return <div data-spq92-result className="mt-6 space-y-8">
    <section aria-labelledby="spq92-total-heading" className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id="spq92-total-heading" className="text-2xl font-semibold">{zh ? "SPQ92项原始总分" : "Your SPQ 92-item raw total"}</h3>
      <p data-spq92-total className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{score.total === null
        ? (zh ? `资料不足：${score.rated}/92题有数值回答；${score.skipped}题不计分，暂不计算总分。` : `Insufficient information: ${score.rated}/92 items rated; ${score.skipped} unscored. No total is calculated.`)
        : (zh ? `${score.total}（0到276；92/92题有效）` : `${score.total} (0 to 276; 92/92 items rated)`)}</p>
      <p className="leading-8 text-slate-700">{zh
        ? "英文采用2014年发表表4全部92项，按现行官方92项键反向其中44项后相加。按此键较低表示自报更敏感，不是实测感官阈值、智力、个人价值或任何诊断。这里没有高低档位、感觉类型、百分位或五个另造的独立分量表。"
        : "English follows all 92 statements in the published 2014 Table 4. The current official 92-item key reverses 44 items before summation. Lower totals reflect more self-reported sensitivity under this key, not an observed sensory threshold, intelligence, personal worth or a diagnosis. No bands, sensory types, percentiles or five invented independent subscales are supplied."}</p>
      <p className="mt-4 leading-8 text-slate-700">{zh
        ? "0、1、2、3分别对应非常同意、同意、不同意、非常不同意；指定反向项以3减原值。现行键含第6、53题，与印刷表42条斜体标记有区别，本版明确采用44条键，不推测差异原因。全部选同意的136分只是运算例子，不是人群平均或中间档。"
        : "Raw values 0, 1, 2 and 3 mean Strongly Agree, Agree, Disagree and Strongly Disagree. A reversed item uses 3 minus its raw value. The current key includes items 6 and 53, differing from the printed table’s 42 italic markings. This edition explicitly uses 44, without speculating about the difference. The all-Agree total of 136 is an arithmetic example, not a population average or middle band."}</p>
      <p className="mt-4 leading-8 text-slate-700">{zh
        ? "任一不计分会暂不给整体总分，不当作零或估算回答；全部不计分仍可结束并阅读完整指南。严格92题齐全是网站政策，不是验证过的缺失阈值。依据已有经验回答，不为题目实际尝试危险或不舒适的刺激。中文是费马新工作译文，尚未建立心理测量验证或跨语言等价性。"
        : "Any unscored choice withholds the total rather than becoming zero or an imputed response. All unscored choices still finish and leave the full guide available. Requiring all 92 numeric responses is a website policy, not a validated missing-data threshold. Answer from existing experience without trying risky or uncomfortable stimuli. Chinese is a new FermatMind working translation without established psychometric validation or language equivalence."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`spq92-guide-${profile.id}`}>
      <h3 id={`spq92-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`spq92-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份公开完整指南" : "Read this complete public guide"}</Link>
    </section>)}
    <aside data-spq92-source className="space-y-3 text-sm leading-7">{quiz.guide.find(section => section.id === "source")?.paragraphs.map((paragraph, i) => <p key={i}>{paragraph[locale]}</p>)}{quiz.references?.map(reference => <p key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></p>)}</aside>
  </div>;
}

export function QuestionnaireSpq92NextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-spq92-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "完整指南始终可读，包括资料不足时。可以在自己的私人记录中选一个熟悉情境，记下当时的环境和舒适需要；不必为了获得总分去尝试陌生刺激，也不由数字选择神经类型、关系或职业。你可以回看指南、返回全部测试，或在这里结束。"
      : "The full guide remains available even with insufficient information. If useful, privately note one familiar situation, its context and your comfort needs. You do not need to try unfamiliar stimuli to obtain a total, and the number does not choose a neurotype, relationship or career. Review the guide, return to all tests or finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/sensory-processing-test#questionnaire-results`}>{zh ? "回看完整指南" : "Review the full guide"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
