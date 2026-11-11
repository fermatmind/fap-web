import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CareerMatchPage } from "@/components/questionnaires/CareerMatchPage";
import { loadTraditionalCareerMatch } from "@/lib/i18n/zh-TW/officeCareerTools";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const entry = "/zh-TW/tests/explore/career-match";

export async function traditionalCareerMatchMetadata(): Promise<Metadata> {
  const item = await loadTraditionalCareerMatch();
  if (!item) notFound();
  return {
    title: item.quiz.seoTitle.zh,
    description: item.quiz.description.zh,
    alternates: { canonical: entry },
    robots: { index: false, follow: true },
    openGraph: { locale: "zh_TW", url: entry, images: ["/og/fun/career-match?locale=zh-TW"] },
  };
}

export async function TraditionalCareerMatchPage() {
  const [item, copy] = await Promise.all([loadTraditionalCareerMatch(), loadTraditionalAssessmentText()]);
  if (!item) notFound();
  return <>
    <nav aria-label="測驗語言" className="mx-auto flex max-w-3xl gap-5 py-3 text-sm">
      <Link className="underline" lang="zh-CN" href="/zh/tests/explore/career-match">简体中文</Link>
      <Link className="underline" lang="en" href="/en/tests/explore/career-match">English</Link>
    </nav>
    <CareerMatchPage quiz={item.quiz} locale="zh" traditionalCopy={copy} editorial={item.editorial} readings={item.readings} />
  </>;
}
