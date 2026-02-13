import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/content";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import QuizTakeClient from "./QuizTakeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  return {
    title: test ? `Start test - ${test.title}` : `Start test - ${slug}`,
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: `/tests/${slug}`,
    },
  };
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  if (!test) return notFound();

  if (!test.scale_code) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
        <p className="mt-3 text-slate-600">此测试暂未接入题库，请先选择其它已接入测试。</p>
        <Link
          href="/tests"
          className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
        >
          返回 Tests
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Personality Test</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">Start: {test.title}</h1>
        </div>
        <Link href={`/tests/${slug}`} className="text-sm font-medium text-sky-700 hover:text-sky-800">
          Back to landing
        </Link>
      </div>

      <QuizTakeClient slug={slug} testTitle={test.title} scaleCode={test.scale_code} />
    </main>
  );
}
