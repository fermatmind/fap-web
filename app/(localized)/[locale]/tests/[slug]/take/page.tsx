import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { buildApiUrl } from "@/lib/api-base";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import { isBig5ScaleCode, normalizeBig5FormCode, resolveBig5FormMeta } from "@/lib/big5/forms";
import { isEnneagramScaleCode, normalizeEnneagramFormCode, resolveEnneagramFormMeta } from "@/lib/enneagram/forms";
import { getTestBySlug, resolveTestTitleByLocale } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getIqBankDisplayModel, getIqDefaultBankDisplayModel } from "@/lib/iq/bankDisplay";
import { isIqScaleCode } from "@/lib/iq/constants";
import { isMbtiScaleCode, normalizeMbtiFormCode, resolveMbtiFormMeta } from "@/lib/mbti/forms";
import { isRiasecScaleCode, normalizeRiasecFormCode, resolveRiasecFormMeta } from "@/lib/riasec/forms";
import {
  createScaleRolloutEnvSnapshot,
  resolveScaleRollout,
  type SupportedScaleCode,
} from "@/lib/rollout/scaleRollout";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { getFreeTestStartLabel } from "@/lib/tests/freeTestLabels";
import Big5TakeClient from "./Big5TakeClient";
import ClinicalTakeClient from "./ClinicalTakeClient";
import EnneagramTakeClient from "./EnneagramTakeClient";
import EqSjtTakeClient from "./EqSjtTakeClient";
import QuizTakeClient from "./QuizTakeClient";

function appendQuery(path: string, query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          params.append(key, String(item));
        }
      }
      continue;
    }
    if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function firstNonEmptyQueryValue(...values: Array<string | string[] | undefined>): string {
  for (const value of values) {
    const normalized = firstQueryValue(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

async function readRolloutIdentitySeed(): Promise<string | null> {
  const value = (await headers()).get("x-anon-id")?.trim();
  return value || null;
}

async function fetchLookupCapabilities(slug: string, locale: "en" | "zh"): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      buildApiUrl(`/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${locale}`),
      {
        headers: {
          Accept: "application/json",
          "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en",
        },
        ...PUBLIC_API_CACHE_OPTIONS,
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);
  const test = await getTestBySlug(slug, locale);
  const localizedTestTitle = test ? resolveTestTitleByLocale(test, locale) : slug;
  const startTitle = test
    ? getFreeTestStartLabel({
        locale,
        scaleCode: test.scale_code,
        slug: test.slug,
        title: localizedTestTitle,
        fallback: locale === "zh" ? "开始测试" : "Start test",
      })
    : locale === "zh" ? "开始测试" : "Start test";

  return {
    title: test ? `${startTitle} - ${localizedTestTitle}` : `Start test - ${slug}`,
    robots: NOINDEX_ROBOTS,
    alternates: {
      canonical: localizedPath(`/tests/${slug}`, locale),
    },
  };
}

export default async function TakePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const query = await searchParams;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const slug = resolveCanonicalSlug(requestedSlug);
  if (slug !== requestedSlug) {
    permanentRedirect(appendQuery(withLocale(`/tests/${slug}/take`), query));
  }
  const test = await getTestBySlug(slug, locale);

  if (!test) return notFound();
  const localizedTestTitle = resolveTestTitleByLocale(test, locale);
  const mbtiFormCode = isMbtiScaleCode(test.scale_code)
    ? normalizeMbtiFormCode(firstNonEmptyQueryValue(query.form, query.form_code))
    : null;
  const mbtiFormMeta = mbtiFormCode ? resolveMbtiFormMeta(mbtiFormCode) : null;
  const big5FormCode = isBig5ScaleCode(test.scale_code)
    ? normalizeBig5FormCode(firstNonEmptyQueryValue(query.form, query.form_code))
    : null;
  const big5FormMeta = big5FormCode ? resolveBig5FormMeta(big5FormCode) : null;
  const enneagramFormCode = isEnneagramScaleCode(test.scale_code)
    ? normalizeEnneagramFormCode(firstNonEmptyQueryValue(query.form, query.form_code))
    : null;
  const enneagramFormMeta = enneagramFormCode ? resolveEnneagramFormMeta(enneagramFormCode) : null;
  const riasecFormCode = isRiasecScaleCode(test.scale_code)
    ? normalizeRiasecFormCode(firstNonEmptyQueryValue(query.form, query.form_code))
    : null;
  const riasecFormMeta = riasecFormCode ? resolveRiasecFormMeta(riasecFormCode) : null;
  const iqRequestedBank = isIqScaleCode(test.scale_code)
    ? firstNonEmptyQueryValue(query.form, query.form_code, query.bank, query.bank_id)
    : "";
  const iqBankModel = isIqScaleCode(test.scale_code)
    ? iqRequestedBank
      ? getIqBankDisplayModel(iqRequestedBank)
      : getIqDefaultBankDisplayModel()
    : null;

  if (isIqScaleCode(test.scale_code) && iqRequestedBank && iqBankModel?.isTakeEnabled !== true) {
    redirect(withLocale(`/tests/${slug}?bank_unavailable=1`));
  }

  if (!test.scale_code) {
    return (
      <main className="mx-auto w-full max-w-3xl px-[var(--fm-container-gutter)] py-[var(--fm-space-8)]">
        <h1 className="text-2xl font-bold text-slate-900">{localizedTestTitle}</h1>
        <p className="mt-[var(--fm-space-3)] text-slate-600">
          {locale === "zh" ? "此测试当前暂不可用，请稍后再试或选择其他测评。" : "This assessment is temporarily unavailable. Please try again later or choose another test."}
        </p>
        <Link
          href={withLocale("/tests")}
          className="mt-[var(--fm-space-5)] inline-flex rounded-full border border-slate-300 px-[var(--fm-pad-btn-sm-x)] py-[var(--fm-pad-btn-sm-y)] text-sm font-semibold text-slate-700 transition hover:border-slate-500"
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
    identitySeed: await readRolloutIdentitySeed(),
    envSnapshot: createScaleRolloutEnvSnapshot(),
  });
  if (!rollout.assessmentEnabled) {
    redirect(withLocale(`/tests/${slug}?maintenance=1`));
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-[var(--fm-container-gutter)] py-[var(--fm-space-4)]">
      {test.scale_code === "BIG5_OCEAN" ? (
        <Big5TakeClient
          slug={slug}
          formCode={big5FormCode ?? undefined}
          estimatedMinutes={big5FormMeta?.estimatedMinutes}
        />
      ) : test.scale_code === "ENNEAGRAM" ? (
        <EnneagramTakeClient
          slug={slug}
          formCode={enneagramFormCode ?? undefined}
          estimatedMinutes={enneagramFormMeta?.estimatedMinutes}
        />
      ) : test.scale_code === "RIASEC" ? (
        <QuizTakeClient
          slug={slug}
          testTitle={localizedTestTitle}
          scaleCode={test.scale_code}
          formCode={riasecFormCode ?? undefined}
          estimatedMinutes={riasecFormMeta?.estimatedMinutes}
          questionCount={riasecFormMeta?.questionCount ?? test.questions_count}
        />
      ) : test.scale_code === "EQ_SJT_16" ? (
        <EqSjtTakeClient
          slug={slug}
          testTitle={localizedTestTitle}
          estimatedMinutes={test.time_minutes}
          questionCount={test.questions_count}
        />
      ) : test.scale_code === "SDS_20" || test.scale_code === "CLINICAL_COMBO_68" ? (
        <ClinicalTakeClient slug={slug} scaleCode={test.scale_code} />
      ) : (
        <QuizTakeClient
          slug={slug}
          testTitle={localizedTestTitle}
          scaleCode={test.scale_code}
          formCode={iqBankModel?.formCode ?? mbtiFormCode ?? undefined}
          estimatedMinutes={mbtiFormMeta?.estimatedMinutes ?? test.time_minutes}
          questionCount={iqBankModel?.itemCount ?? mbtiFormMeta?.questionCount ?? test.questions_count}
        />
      )}
    </main>
  );
}
