import type { Locale } from "@/lib/i18n/locales";
import { isFscrs22ConfigurationValid, type Fscrs22Questionnaire } from "@/lib/questionnaires/fscrs22";

export function QuestionnaireFscrs22Support({ support, locale }: {
  support: Fscrs22Questionnaire["fscrs22"]["support"]; locale: Locale;
}) {
  return <aside data-fscrs22-support className="my-6 space-y-3 rounded-lg border border-slate-300 bg-slate-50 p-4 leading-8" aria-labelledby="fscrs22-support-title">
    <h2 id="fscrs22-support-title" className="text-xl font-semibold">{locale === "zh" ? "需要支持时，不必等待分数" : "Support does not need a score"}</h2>
    <p>{support.urgent[locale]}</p><p>{support.nonUrgent[locale]}</p>
  </aside>;
}

export function QuestionnaireFscrs22Attribution({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isFscrs22ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "来源说明暂不可用。" : "Source information is unavailable."}</p>;
  return <aside data-fscrs22-attribution className="my-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600">
    <p>Halamová, J., Kanovský, M., Gilbert, P., et al. (2019). <em>Journal of Rational-Emotive &amp; Cognitive-Behavior Therapy, 37</em>, 411–444. doi:10.1007/s10942-019-00319-1.</p>
    <p>{quiz.fscrs22.attribution[locale]}</p>
    <ul className="flex flex-wrap gap-x-5 gap-y-2">{quiz.references?.map(reference => <li key={reference.url}><a className="underline" href={reference.url}>{reference.title[locale]}</a></li>)}</ul>
  </aside>;
}
