import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { notFound } from "next/navigation";
import { SelfUnderstandingResources } from "@/components/topics/SelfUnderstandingResources";
import { getCmsArticlesWithLastKnownGood } from "@/lib/cms/articles";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { buildTopicFrontendUrl, listTopics } from "@/lib/cms/topics";
import { isTraditionalTopicSlug } from "@/lib/i18n/traditionalTopicPaths";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "主題總覽",
  description: "依測驗、人格與職涯主題閱讀費馬測試的繁體內容。",
  alternates: { canonical: "/zh-TW/topics" },
  robots: { index: false, follow: true },
};

export default async function TraditionalTopicsPage() {
  const [{ items }, articles, copy] = await Promise.all([
    listTopics({ locale: "zh-TW", perPage: 20 }),
    getCmsArticlesWithLastKnownGood({ locale: "zh-TW", page: 1, perPage: 100, allowLocalFallback: false, usePublicCache: true }).catch(() => null),
    loadTraditionalAssessmentText(),
  ]);
  const topics = items.filter((topic) => topic.isPublic && isTraditionalTopicSlug(topic.slug));
  if (topics.length === 0) notFound();
  return <Container as="main" className="max-w-[1240px] space-y-6 pb-24 pt-6 md:pt-8">
    <Breadcrumb items={[{ label: "首頁", href: "/zh-TW" }, { label: "認識自己" }]} />
    <SelfUnderstandingResources locale="zh-TW" traditionalCopy={copy} traditionalArticles={new Set(articles?.value.items.map(article => article.slug))} />
    <h2 className="font-serif text-2xl font-semibold text-[var(--fm-text)]">所有專題</h2>
    <ul className="grid gap-4 sm:grid-cols-2">
      {topics.map((topic) => <li key={topic.slug} className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h3 className="text-xl font-semibold">
          <Link href={buildTopicFrontendUrl("zh-TW", topic.slug)} className="underline">{topic.title}</Link>
        </h3>
        {topic.excerpt ? <p className="mt-3 leading-7">{topic.excerpt}</p> : null}
      </li>)}
    </ul>
  </Container>;
}
