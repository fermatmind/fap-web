import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const { items } = await listTopics({ locale: "zh-TW", perPage: 20 });
  const topics = items.filter((topic) => topic.isPublic && isTraditionalTopicSlug(topic.slug));
  if (topics.length === 0) notFound();
  return <div className="space-y-6">
    <h1 className="text-3xl font-bold sm:text-4xl">主題總覽</h1>
    <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/topics" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/topics" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <ul className="grid gap-4 sm:grid-cols-2">
      {topics.map((topic) => <li key={topic.slug} className="rounded-xl border border-slate-200 p-5">
        <h2 className="text-xl font-semibold">
          <Link href={buildTopicFrontendUrl("zh-TW", topic.slug)} className="underline">{topic.title}</Link>
        </h2>
        {topic.excerpt ? <p className="mt-3 leading-7">{topic.excerpt}</p> : null}
      </li>)}
    </ul>
  </div>;
}
