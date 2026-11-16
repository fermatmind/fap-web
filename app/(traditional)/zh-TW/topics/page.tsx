import { traditionalCollectionAlternates } from "@/lib/cms/traditional-index-alternates";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { buildTopicFrontendUrl, listTopics } from "@/lib/cms/topics";
import { isTraditionalTopicSlug } from "@/lib/i18n/traditionalTopicPaths";
import TopicsPage from "@/app/(localized)/[locale]/topics/page";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const languages = await traditionalCollectionAlternates("/topics");
  return {
    title: "主題總覽",
    description: "依測驗、人格與職涯主題閱讀費馬測試的繁體內容。",
    alternates: { canonical: "/zh-TW/topics", languages },
    robots: { index: Boolean(languages), follow: true },
  };
}


export default async function TraditionalTopicsPage() {
  const { items } = await listTopics({ locale: "zh-TW", perPage: 20 });
  const topics = items.filter((topic) => topic.isPublic && isTraditionalTopicSlug(topic.slug));
  if (topics.length === 0) notFound();
  const traditionalDirectory = (
    <section className="space-y-4 pt-8" aria-labelledby="traditional-topics-directory">
      <h2 id="traditional-topics-directory" className="font-serif text-2xl font-semibold">所有專題</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <li key={topic.slug} className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
            <h3 className="text-xl font-semibold"><Link href={buildTopicFrontendUrl("zh-TW", topic.slug)} className="underline">{topic.title}</Link></h3>
            {topic.excerpt ? <p className="mt-3 leading-7">{topic.excerpt}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
  return TopicsPage({ params: Promise.resolve({ locale: "zh-TW" }), traditionalDirectory });
}
