import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getTestBySlug } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  createScaleRolloutEnvSnapshot,
  resolveScaleRollout,
  type SupportedScaleCode,
} from "@/lib/rollout/scaleRollout";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import Big5TakeClient from "./Big5TakeClient";
import ClinicalTakeClient from "./ClinicalTakeClient";
import QuizTakeClient from "./QuizTakeClient";

async function fetchLookupCapabilities(slug: string, locale: "en" | "zh"): Promise<Record<string, unknown> | null> {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!apiBase) return null;

  try {
    const response = await fetch(
      `${apiBase}/api/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${locale}`,
      {
        headers: {
          Accept: "application/json",
          "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) return null;

    const payload = (await response.json()) as Record<string, unknown>;
    if (payload.ok === false) return null;
    return (payload.capabilities as Record<string, unknown> | null | undefined) ?? null;
  } catch {
    return null;
  }
}

async function resolveRequestAnonId(): Promise<string | undefined> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const fromCookie = cookieStore.get("fap_anonymous_id_v1")?.value?.trim();
  if (fromCookie) return fromCookie;

  const fromHeader = headerStore.get("x-anon-id")?.trim() ?? "";
  return fromHeader || undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const test = getTestBySlug(slug);

  return {
    title: test ? (locale === "zh" ? `开始测试 - ${test.title}` : `Start test - ${test.title}`) : `Start test - ${slug}`,
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath(`/tests/${slug}`, locale),
    },
  };
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const test = getTestBySlug(slug);

  if (!test) return notFound();

  if (!test.scale_code) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
        <p className="mt-3 text-slate-600">
          {locale === "zh" ? "此测试暂未接入题库，请先选择其它已接入测试。" : "This test is not connected yet. Please choose another available test."}
        </p>
        <Link
          href={withLocale("/tests")}
          className="mt-5 inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
        >
          {locale === "zh" ? "返回测试列表" : dict.header.tests}
        </Link>
      </main>
    );
  }

  const capabilities = await fetchLookupCapabilities(slug, locale);
  const rollout = resolveScaleRollout({
    scaleCode: test.scale_code as SupportedScaleCode,
    capabilities,
    anonId: await resolveRequestAnonId(),
    envSnapshot: createScaleRolloutEnvSnapshot(),
  });
  if (!rollout.assessmentEnabled) {
    redirect(withLocale(`/tests/${slug}?maintenance=1`));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {locale === "zh" ? "人格测试" : "Personality Test"}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {locale === "zh" ? "开始测试：" : "Start:"} {test.title}
          </h1>
        </div>
        <Link href={withLocale(`/tests/${slug}`)} className="text-sm font-medium text-sky-700 hover:text-sky-800">
          {locale === "zh" ? "返回详情" : "Back to landing"}
        </Link>
      </div>

      {test.scale_code === "BIG5_OCEAN" ? (
        <Big5TakeClient slug={slug} />
      ) : test.scale_code === "SDS_20" || test.scale_code === "CLINICAL_COMBO_68" ? (
        <ClinicalTakeClient slug={slug} scaleCode={test.scale_code} />
      ) : (
        <QuizTakeClient slug={slug} testTitle={test.title} scaleCode={test.scale_code} />
      )}
    </main>
  );
}
