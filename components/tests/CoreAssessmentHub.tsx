import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { coreHubContent, coreHubOrder, coreHubPaths, hubCopy, type CoreHub } from "@/lib/tests/coreAssessmentHubs";
import { canonicalUrl } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildTestSoftwareAppJsonLd } from "@/lib/seo/generateSchema";

const section = "space-y-4 rounded-2xl border border-[var(--fm-border)] bg-white p-5 sm:p-7";
const link = "font-medium text-[var(--fm-accent)] underline underline-offset-4";

export function CoreAssessmentDefinition({ hub, locale }: { hub: CoreHub; locale: DisplayLocale }) {
  const copy = coreHubContent[hub];
  const t = (values: Parameters<typeof hubCopy>[1]) => hubCopy(locale, values);
  return <section className={section} aria-labelledby="assessment-definition">
    <h2 id="assessment-definition" className="text-xl font-semibold">{t(copy.label)}</h2>
    <p>{t(copy.dimensions)} {t(copy.result)}{locale === "en" ? "." : "。"}</p>
    {hub === "mbti" ? <p>{t([
      "荣格八维区分内倾与外倾的感觉（Si / Se）、直觉（Ni / Ne）、思考（Ti / Te）与情感（Fi / Fe）。费马题本按四组偏好计分，八维用于解释类型。",
      "榮格八維區分內傾與外傾的感覺（Si / Se）、直覺（Ni / Ne）、思考（Ti / Te）與情感（Fi / Fe）。費馬題本按四組偏好計分，八維用來解讀類型。",
      "The eight cognitive functions pair inward and outward sensing (Si / Se), intuition (Ni / Ne), thinking (Ti / Te) and feeling (Fi / Fe). The questionnaire scores the four preference pairs and uses functions to interpret types.",
    ])}</p> : null}
  </section>;
}

export function CoreAssessmentComparison({ hub, locale }: { hub: CoreHub; locale: DisplayLocale }) {
  const t = (values: Parameters<typeof hubCopy>[1]) => hubCopy(locale, values);
  return <section className={section} aria-labelledby="assessment-choice">
    <h2 id="assessment-choice" className="text-xl font-semibold">{t(["职业测试、霍兰德与 MBTI 怎么选？", "職涯測驗、霍蘭德與 MBTI 怎麼選？", "Career Assessment, Holland Code or MBTI?"])}</h2>
    <div className="overflow-x-auto" role="region" aria-labelledby="assessment-choice" tabIndex={0}>
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead><tr>{[
          t(["测评", "測驗", "Assessment"]), t(["回答什么问题", "回答什麼問題", "Question"]),
          t(["题量与耗时", "題數與時間", "Length"]), t(["评估维度", "評估面向", "Dimensions"]),
          t(["结果", "結果", "Results"]), t(["适合谁", "適合誰", "Who it helps"]), t(["入口", "入口", "Open"]),
        ].map(label => <th scope="col" key={label} className="border-b p-3">{label}</th>)}</tr></thead>
        <tbody>{coreHubOrder.map(key => {
          const copy = coreHubContent[key];
          return <tr key={key} className="border-b align-top">
            <th scope="row" className="p-3">{t(copy.label)}</th>
            {[copy.question, copy.timing, copy.dimensions, copy.result, copy.audience].map(value => <td className="p-3" key={value[2]}>{t(value)}</td>)}
            <td className="p-3">{key === hub ? t(["当前页面", "目前頁面", "Current page"])
              : <Link href={`/${locale}${coreHubPaths[key]}`} className={link}>{t(copy.label)}</Link>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </section>;
}

export function CoreAssessmentSchema({ hub, locale, name, description }: {
  hub: CoreHub; locale: DisplayLocale; name: string; description: string;
}) {
  const path = `/${locale}${coreHubPaths[hub]}`;
  const language = locale === "zh" ? "zh-CN" : locale;
  const url = canonicalUrl(path);
  return <>
    <JsonLd id="core-assessment-quiz" data={{
      "@context": "https://schema.org", "@type": "Quiz", "@id": `${url}#quiz`,
      url, name, description, inLanguage: language, isAccessibleForFree: true,
    }} />
    <JsonLd id="core-assessment-software" data={{
      ...buildTestSoftwareAppJsonLd({ path, name, description, locale: locale === "en" ? "en" : "zh" }),
      inLanguage: language,
      ...(locale === "zh" ? {
        offers: { "@type": "Offer", price: 0, priceCurrency: "CNY", url },
      } : {}),
    }} />
  </>;
}

export function AssessmentMethodLink({ locale }: { locale: DisplayLocale }) {
  return <Link className={link} href={`/${locale}/method-boundaries`}>
    {hubCopy(locale, ["测评科学说明与方法边界", "測驗科學與方法界線", "Assessment methods and interpretation limits"])}
  </Link>;
}
