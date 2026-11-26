import { SevenSinsExploreLink } from "@/components/questionnaires/SevenSinsExploreLink";
import { sevenSinsLandingSeo } from "@/lib/questionnaires/sevenSinsLandingCopy";
import { SevenSinsLanding } from "@/components/questionnaires/SevenSinsLanding";
import { sevenSinsChineseGuideProfile } from "@/lib/questionnaires/sevenSinsChineseSeo";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { notFound } from "next/navigation";
import { traditionalSevenSins as quiz } from "@/lib/i18n/zh-TW/sevenSins";
import { sevenSinsDisplay } from "@/lib/i18n/zh-TW/sevenSinsUi";
import { SITE_URL } from "@/lib/site";
import { SevenSinsReading } from "./SevenSinsReading";
import { SevenSinsTake } from "./SevenSinsTake";

const entry = "/zh-TW/tests/explore/seven-sins-virtues-test";
export function sevenSinsTraditionalMetadata(path: string): Metadata {
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  const take = path === `${entry}/take`, canonical = take ? entry : path;
  const display = profile && sevenSinsChineseGuideProfile(quiz.slug, "zh", profile);
  const landing = path === entry ? sevenSinsLandingSeo["zh-TW"] : undefined;
  const title = landing?.title ?? (display ? sevenSinsDisplay(display.seo!.title.zh, "zh-TW") : quiz.seoTitle["zh-TW"]);
  const description = landing?.description ?? (display ? sevenSinsDisplay(display.seo!.description.zh, "zh-TW") : quiz.description["zh-TW"]);
  return { title: landing ? { absolute: title } : title, description, alternates: { canonical: `${SITE_URL}${canonical}`, languages: take ? undefined : {
    "zh-TW": `${SITE_URL}${path}`, "zh-CN": `${SITE_URL}${path.replace("/zh-TW", "/zh")}`, en: `${SITE_URL}${path.replace("/zh-TW", "/en")}`, "x-default": `${SITE_URL}${path.replace("/zh-TW", "/en")}`,
  } }, robots: take ? { index: false, follow: false, noarchive: true } : undefined,
  openGraph: { title, description: landing?.ogDescription ?? description, locale: "zh_TW", type: "website", url: `${SITE_URL}${canonical}`, images: [`${SITE_URL}/images/test-covers/seven-sins-virtues-test.webp`] } };
}
function Languages({ path }: { path: string }) {
  const suffix = path.replace("/zh-TW", "");
  return <nav aria-label="測評語言" className="mb-8 flex flex-wrap gap-5 text-sm"><span aria-current="page" className="min-h-11 py-2">繁體中文</span><Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link><Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link></nav>;
}
export function SevenSinsTraditionalPage({ path }: { path: string }) {
  if (path === `${entry}/take`) return <SevenSinsTake />;
  const profile = quiz.profiles.find(profile => path === `${entry}/results/${profile.id}`);
  if (profile) return <Container as="main" className="space-y-6 py-10"><Languages path={path} /><p>公開閱讀指南，不含任何人的作答或分數。</p><SevenSinsReading profile={profile} level={1} afterIntro={<SevenSinsExploreLink locale="zh-TW" />} /><SevenSinsExploreLink locale="zh-TW" /><div className="flex flex-wrap gap-5"><Link href={entry} className="min-h-11 py-2 underline">返回測試介紹</Link><Link href={`${entry}#questionnaire-results`} className="min-h-11 py-2 underline">比較全部七組</Link><Link href={`${entry}/take`} className="min-h-11 py-2 underline">開始免費測試</Link></div></Container>;
  if (path !== entry) notFound();
  return <SevenSinsLanding quiz={quiz} locale="zh-TW" />;
}
