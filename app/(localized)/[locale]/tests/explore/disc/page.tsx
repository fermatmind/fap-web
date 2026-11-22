import { LocalizedAssessmentLanding } from "@/components/tests/LocalizedAssessmentLanding";
import { getLocalizedLanding } from "@/lib/tests/localized-landings";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { loadQuestionnaire } from "@/lib/questionnaires/loaders";
import { isDirectionalConfigurationValid } from "@/lib/questionnaires/basicScoring";
import Link from "next/link";
import { TrioLanding } from "@/components/tests/trio/TrioLanding";
import { trioProfiles } from "@/lib/tests/trioLanding";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
async function entry(params: Props["params"]) {
  const { locale: rawLocale } = await params;
  const locale: DisplayLocale = rawLocale === "zh-TW" ? rawLocale : resolveLocale(rawLocale);
  const quiz = locale === "zh-TW"
    ? (await (await import("@/lib/i18n/zh-TW/directionalQuestionnaires")).loadTraditionalDirectional("disc"))?.quiz
    : await loadQuestionnaire("disc");
  if (!quiz || !isDirectionalConfigurationValid(quiz)) notFound();
  return { locale, quiz };
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, quiz } = await entry(params);
  const profile = locale === "zh" ? null : getLocalizedLanding(locale, "disc");
  const path = questionnairePath(locale, quiz.slug);
  const metadata = buildPageMetadata({
    locale: locale === "zh-TW" ? "zh" : locale, pathname: path,
    title: profile?.seoTitle ?? quiz.seoTitle.zh, description: profile?.seoDescription ?? quiz.description.zh,
    imagePath: `/og/fun/${quiz.slug}?locale=${locale}&v=${quiz.version}`,
    alternatesByLocale: {en: questionnairePath("en", quiz.slug), zh: questionnairePath("zh", quiz.slug), xDefault: questionnairePath("en", quiz.slug)},
  });
  return locale === "zh-TW" ? traditionalSearchMetadata(path, {
    ...metadata, alternates: {...metadata.alternates, canonical: path},
    openGraph: {...metadata.openGraph, locale: "zh_TW", url: path},
    robots: {index: false, follow: true},
  }) : metadata;
}
export default async function Page({ params }: Props) {
  const { locale, quiz } = await entry(params);
  if (locale === "zh") {
    const path = questionnairePath(locale, quiz.slug);
    const title = quiz.title[locale];
    const faq = trioProfiles.disc.faq.map(([q,a])=>({q,a}));
    return <main>
      <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([
        {name:"费马测试",path:"/zh"}, {name:"测试",path:"/zh/tests"}, {name:title,path},
      ])} />
      <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({path,title,description:quiz.description[locale],locale})} />
      <JsonLd id="questionnaire-faq" data={buildFAQPageJsonLd(faq.map(({q,a})=>({question:q,answer:a})))} />
      <TrioLanding kind="disc" title={title} faq={faq}
        entries={[{href:`${path}/take?start=1`,label:"开始 DISC 测试",testId:"disc-entry",nativeGet:true}]}
        additional={<div className="mt-6 space-y-4">
          <details className="rounded-lg border border-slate-200 bg-white p-3">
            <summary className="min-h-11 cursor-pointer content-center font-semibold">查看全部 15 种结果指南</summary>
            <ul className="grid gap-2 text-sm sm:grid-cols-3">{quiz.profiles.map(profile=><li key={profile.id}>
              <Link className="inline-flex min-h-11 items-center underline" prefetch={false} href={questionnaireGuidePath(locale,quiz.slug,profile.id)}>{profile.title[locale]}</Link>
            </li>)}</ul>
          </details>
          <h3>参考资料</h3>
          <ol className="space-y-2 text-sm">{(quiz.references ?? []).map((reference,index)=>
            ["jobcannon.io","idrlabs.com"].includes(new URL(reference.url).hostname.replace(/^www\./,"")) ? null :
              <li key={reference.url} id={`disc-reference-${index+1}`}><a className="underline" href={reference.url}>{reference.title[locale] ?? reference.title.zh}</a></li>)}</ol>
        </div>}
      />
    </main>;
  }
  const path = questionnairePath(locale, quiz.slug);
  const english = locale === "en";
  const copyLocale = english ? "en" : "zh";
  return <main>
    <LocalizedAssessmentLanding kind="disc" locale={locale} entries={[{
      href: `${path}/take?start=1`, label: english ? "Start the free DISC test" : "開始免費 DISC 測驗", testId: "disc-entry", nativeGet:true,
    }]}>
      <div className="mt-6 space-y-4">
        <details className="rounded-lg border border-slate-200 bg-white p-3">
          <summary className="min-h-11 cursor-pointer content-center font-semibold">{english ? "Browse all 15 result guides" : "瀏覽全部 15 種結果指南"}</summary>
          <ul className="grid gap-2 text-sm sm:grid-cols-3">{quiz.profiles.map(profile => <li key={profile.id}>
            <Link className="inline-flex min-h-11 items-center underline" prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[copyLocale]}</Link>
          </li>)}</ul>
        </details>
        <h3>{english ? "References" : "參考資料"}</h3>
        <ol className="space-y-2 text-sm">{(quiz.references ?? []).map((reference,index) =>
          ["jobcannon.io","idrlabs.com"].includes(new URL(reference.url).hostname.replace(/^www\./,"")) ? null :
            <li key={reference.url} id={`disc-reference-${index+1}`}><a className="underline" href={reference.url}>{reference.title[copyLocale]}</a></li>)}</ol>
      </div>
    </LocalizedAssessmentLanding>
  </main>;
}
