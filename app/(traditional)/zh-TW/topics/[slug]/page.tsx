import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiScenarioDeepDiveSection } from "@/components/content/MbtiScenarioDeepDiveSection";
import { renderTopicEntryGroups, renderTopicSections } from "@/lib/cms/topic-sections";
import { buildTopicFrontendUrl, getTopicBySlug } from "@/lib/cms/topics";
import { isTraditionalTopicSlug } from "@/lib/i18n/traditionalTopicPaths";
import { buildMbtiTopicScenarioDeepModules } from "@/lib/mbti/sceneDeepContent";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const loadTopic = cache(async (slug: string) => {
  if (!isTraditionalTopicSlug(slug)) notFound();
  const topic = await getTopicBySlug(slug, "zh-TW");
  if (!topic || topic.slug !== slug || topic.orgId !== 0 || !topic.isPublic || topic.status !== "published") notFound();
  return topic;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = await loadTopic((await params).slug);
  const canonical = buildTopicFrontendUrl("zh-TW", topic.slug);
  const title = topic.seoMeta?.seoTitle || topic.title;
  const description = topic.seoMeta?.seoDescription || topic.excerpt || topic.subtitle;
  return {
    title, description, alternates: { canonical }, robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", url: canonical, type: "article" },
  };
}

export default async function TraditionalTopicPage({ params }: Props) {
  const topic = await loadTopic((await params).slug);
  const iqEq = topic.slug === "iq-eq";
  const suppressCompare = iqEq || topic.slug === "england-post16-options";
  const answer = suppressCompare && topic.answerSurface
    ? { ...topic.answerSurface, compareBlocks: [], summaryBlocks: iqEq ? [] : topic.answerSurface.summaryBlocks }
    : topic.answerSurface;
  const visibleSummary = iqEq ? [] : (topic.landingSurface?.summaryBlocks ?? []).slice(0, 2);
  const ctas = topic.landingSurface?.ctaBundle ?? [];
  const mbtiScenes = topic.slug === "mbti" ? await loadMbtiScenes() : [];
  return <div className="space-y-6">
    <nav aria-label="頁面導覽" className="flex flex-wrap gap-4 text-sm">
      <Link href="/zh-TW/topics" className="min-h-11 py-2 underline">主題總覽</Link>
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href={buildTopicFrontendUrl("zh", topic.slug)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={buildTopicFrontendUrl("en", topic.slug)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <section className="space-y-4 rounded-xl border border-slate-200 p-5">
      {topic.heroKicker ? <p className="text-sm font-semibold">{topic.heroKicker}</p> : null}
      <h1 className="text-3xl font-bold sm:text-4xl">{topic.title}</h1>
      {topic.subtitle ? <p className="text-lg leading-8">{topic.subtitle}</p> : null}
      {topic.excerpt && topic.excerpt !== topic.subtitle ? <p className="leading-8">{topic.excerpt}</p> : null}
      {topic.heroQuote ? <blockquote className="rounded-lg bg-slate-50 p-4">{topic.heroQuote}</blockquote> : null}
      {visibleSummary.map((block) => <div key={block.key} className="space-y-2">
        {block.title !== topic.title && block.title ? <h2 className="text-lg font-semibold">{block.title}</h2> : null}
        {block.body && block.body !== topic.excerpt && block.body !== topic.subtitle ? <p className="leading-8">{block.body}</p> : null}
      </div>)}
    </section>
    {renderTopicSections(topic.sections, "zh", { scrollableTables: iqEq })}
    <AnswerSurfaceSection surface={answer} locale="zh" displayLocale="zh-TW" pageFamily="topic_detail" />
    <MbtiScenarioDeepDiveSection
      locale="zh"
      displayLocale="zh-TW"
      modules={mbtiScenes}
      sourcePageType="topic_detail"
      sourcePath={buildTopicFrontendUrl("zh-TW", topic.slug)}
      heading="MBTI 的日常應用情境"
      subtitle="先釐清職涯、協作、科系與成長問題，再用具體任務、興趣、能力證據和實際經驗檢驗線索。"
    />
    {renderTopicEntryGroups(topic.entryGroups, "zh-TW")}
    {ctas.length > 0 ? <section className="space-y-3 rounded-xl border border-slate-200 p-5">
      <h2 className="text-xl font-semibold">延伸閱讀</h2>
      <div className="flex flex-wrap gap-4">{ctas.map((cta) => <Link key={cta.key} href={cta.href} className="min-h-11 py-2 underline">
        {cta.label}{cta.href.startsWith("/zh/") ? "（簡體中文）" : null}
      </Link>)}</div>
    </section> : null}
  </div>;
}

async function loadMbtiScenes() {
  const copy = await loadTraditionalAssessmentText();
  return buildMbtiTopicScenarioDeepModules("zh").map((scene) => ({
    ...scene,
    title: copy(scene.title),
    summary: copy(scene.summary),
    whyTypeRelevant: copy(scene.whyTypeRelevant),
    links: scene.links.map((link) => ({
      ...link,
      label: copy(link.label),
      href: link.href === "/zh/topics/mbti" ? "/zh-TW/topics/mbti" : link.href,
    })),
  }));
}
