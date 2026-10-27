import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { HoldingBack35Questionnaire, HoldingBack35Result } from "@/lib/questionnaires/holdingBack35";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireHoldingBack35Report({ quiz, result, locale }: {
  quiz: Omit<HoldingBack35Questionnaire, "kind">;
  result: Extract<HoldingBack35Result, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-holding-back35-result className="mt-6 space-y-9">
    <p className="leading-8 text-slate-700">{zh
      ? "以下七项按固定主题顺序分别呈现，回看过去四周的具体情境。每项五题数值齐全才给1—5均分，显示一位小数。数值只概括本网站原创情境的频率，不分档、不比较谁更严重，也不生成总分或主导类型。"
      : "The seven topics appear separately in a fixed order, reflecting situations from the past four weeks. Each requires five numeric responses for a 1–5 mean shown to one decimal. The numbers summarize frequency in these original website scenarios, without bands, severity comparisons, an overall score or a dominant type."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {result.holdingBack35.domains.map(part => <section data-holding-back35-part={part.domainId} key={part.domainId}
        aria-labelledby={`holding-back35-part-${part.domainId}`} className="rounded-lg border border-slate-200 p-4 sm:p-5">
        <h3 id={`holding-back35-part-${part.domainId}`} className="text-xl font-semibold">{quiz.directions.find(d => d.id === part.domainId)!.title[locale]}</h3>
        <p data-holding-back35-mean className="mt-3 leading-7">{part.mean === null
          ? (zh ? `资料不足：${part.numericCount}/5题有数值回答，暂不给本项均分。` : `Insufficient information: ${part.numericCount}/5 items rated. No mean for this topic.`)
          : (zh ? `${part.mean.toFixed(1)} / 5（5/5题有数值回答）` : `${part.mean.toFixed(1)} / 5 (5/5 items rated)`)}</p>
      </section>)}
    </div>
    <p className="leading-8 text-slate-700">{zh
      ? "不计分不当作零、从不或猜测答案；一项资料不足不影响其他完整项。即使全部不计分，本次也已结束，七份指南仍完整开放。“想象占用当下”仅观察日常神游与实际活动的错位，比原研究构念更窄；本观察不是IPRS量表，也不继承其验证。"
      : "Unscored choices are never zero, Never or imputed answers. An unavailable mean does not affect complete topics. Even with all choices unscored, this attempt is finished and all seven guides remain available. Imagined scenarios covers everyday absorption displacing an intended activity, a narrower scope than the research construct. This is not the IPRS instrument and does not inherit its validation."}</p>
    {quiz.profiles.map(profile => <section data-holding-back35-guide={profile.id} key={profile.id}
      aria-labelledby={`holding-back35-guide-${profile.id}`}>
      <h3 id={`holding-back35-guide-${profile.id}`} className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`holding-back35-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
        href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这份公开完整指南" : "Read this complete public guide"}</Link>
    </section>)}
    <aside data-holding-back35-source className="space-y-3 text-sm leading-7">
      {quiz.guide.find(s => s.id === "source")?.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}
      {quiz.references?.map(reference => <p key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></p>)}
    </aside>
  </div>;
}

export function QuestionnaireHoldingBack35NextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-holding-back35-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可以回看七份完整指南，或私下选一个熟悉、低风险的情境，分开记下事件、自己的感受与实际行动。没有资料时无需勉强补答，也不用把一个数字当作成因。若持续困难让你担心或干扰生活，可以依据真实经历选择支持，不必等网页阈值。你也可以在这里结束。"
      : "Review any of the seven complete guides or privately choose one familiar, low-stakes situation and separate the event, your feelings and the action taken. You do not need to force an answer when information is absent or treat a number as a cause. If a persistent difficulty concerns you or disrupts daily life, choose support based on that experience rather than a website cutoff. You can also finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline"
      href={`/${locale}/tests/explore/holding-yourself-back#questionnaire-results`}>{zh ? "回看七份完整指南" : "Review all seven complete guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline"
      href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
