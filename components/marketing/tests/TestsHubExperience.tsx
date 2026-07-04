import Link from "next/link";
import { ArrowRight, Brain, Compass, Eye, Gift, HeartPulse, Network, ShieldCheck, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import type { Locale } from "@/lib/i18n/locales";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { getFreeTestPrimaryLabel } from "@/lib/marketing/testsHubContent";
import type { HubTestCardItem, TestsHubContent } from "@/lib/marketing/testsHubContent";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { cn } from "@/lib/utils";

const CORE_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
  ["enneagram-personality-test-nine-types"],
  ["iq-test-intelligence-quotient-assessment"],
  ["eq-test-emotional-intelligence-assessment"],
] as const;

type CardAccent = {
  icon: LucideIcon;
  ring: string;
  iconBg: string;
  iconColor: string;
  tag: string;
  button: string;
  buttonHover: string;
};

const TEST_CARD_ACCENTS: CardAccent[] = [
  {
    icon: Brain,
    ring: "border-violet-200/80",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    tag: "border-violet-100 bg-violet-50 text-violet-700",
    button: "bg-violet-600",
    buttonHover: "hover:bg-violet-700",
  },
  {
    icon: Network,
    ring: "border-sky-200/80",
    iconBg: "bg-sky-50",
    iconColor: "text-sky-700",
    tag: "border-sky-100 bg-sky-50 text-sky-700",
    button: "bg-sky-600",
    buttonHover: "hover:bg-sky-700",
  },
  {
    icon: Compass,
    ring: "border-emerald-200/80",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    tag: "border-emerald-100 bg-emerald-50 text-emerald-700",
    button: "bg-emerald-600",
    buttonHover: "hover:bg-emerald-700",
  },
  {
    icon: UserRound,
    ring: "border-orange-200/80",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-700",
    tag: "border-orange-100 bg-orange-50 text-orange-700",
    button: "bg-orange-600",
    buttonHover: "hover:bg-orange-700",
  },
  {
    icon: Eye,
    ring: "border-indigo-200/80",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-700",
    tag: "border-indigo-100 bg-indigo-50 text-indigo-700",
    button: "bg-indigo-600",
    buttonHover: "hover:bg-indigo-700",
  },
  {
    icon: HeartPulse,
    ring: "border-rose-200/80",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    tag: "border-rose-100 bg-rose-50 text-rose-700",
    button: "bg-rose-600",
    buttonHover: "hover:bg-rose-700",
  },
];

const HUB_FEATURES = [
  {
    icon: Gift,
    titleZh: "免费测试，免费结果",
    bodyZh: "所有测试均可免费完成并查看结果。",
    titleEn: "Free tests and results",
    bodyEn: "Complete each assessment and view results for free.",
  },
  {
    icon: ShieldCheck,
    titleZh: "科学方法，可靠专业",
    bodyZh: "基于心理学与测量学的科学模型。",
    titleEn: "Research-led methods",
    bodyEn: "Built around psychology and assessment models.",
  },
  {
    icon: UserRound,
    titleZh: "适合自我探索与职业方向思考",
    bodyZh: "帮助你更好地认识自己与规划未来。",
    titleEn: "For self and career exploration",
    bodyEn: "Use results to reflect on yourself and next steps.",
  },
] as const;

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getCoreIndex(item: { href?: string | null; detailsHref?: string | null; key?: string | null }): number {
  const raw = `${item.key ?? ""} ${item.href ?? ""} ${item.detailsHref ?? ""}`.toLowerCase();
  const index = CORE_TEST_SLUG_GROUPS.findIndex((aliases) => aliases.some((slug) => raw.includes(slug)));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function listTests(items: HubTestCardItem[][]): HubTestCardItem[] {
  const seen = new Set<string>();
  const ordered: HubTestCardItem[] = [];

  for (const group of items) {
    for (const item of group) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      ordered.push(item);
    }
  }

  return filterVisiblePublicTestEntries(ordered);
}

function listCoreTests(items: HubTestCardItem[]): HubTestCardItem[] {
  const seenCoreIndexes = new Set<number>();

  return items
    .filter((item) => {
      const index = getCoreIndex(item);
      if (index === Number.POSITIVE_INFINITY || seenCoreIndexes.has(index)) return false;
      seenCoreIndexes.add(index);
      return true;
    })
    .sort((a, b) => getCoreIndex(a) - getCoreIndex(b));
}

function getPrimaryAction(item: HubTestCardItem, locale: Locale): { href: string; label: string } | null {
  const primaryHref = item.detailsHref ?? item.href;

  if (!hasText(primaryHref)) {
    return null;
  }

  return { href: primaryHref, label: locale === "zh" ? getFreeTestPrimaryLabel(item, locale) : "Start the free test" };
}

function getTestDisplayTitle(item: HubTestCardItem, locale: Locale): string {
  if (locale !== "zh") return item.title;
  return getCoreIndex(item) === 4 ? "智商测试" : item.title;
}

function getCardAccent(item: HubTestCardItem): CardAccent {
  const index = getCoreIndex(item);
  return TEST_CARD_ACCENTS[index] ?? TEST_CARD_ACCENTS[0];
}

function TestListCard({ item, locale }: { item: HubTestCardItem; locale: Locale }) {
  const primaryAction = getPrimaryAction(item, locale);
  const title = getTestDisplayTitle(item, locale);
  const shouldPreserveIqAccessiblePrefix = locale === "zh" && getCoreIndex(item) === 4;
  const accent = getCardAccent(item);
  const Icon = accent.icon;

  return (
    <article
      className={cn(
        "group relative grid min-h-[14rem] grid-cols-[3.25rem_1fr] gap-4 rounded-lg border bg-white/92 p-5 text-slate-950 shadow-[0_18px_48px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]",
        accent.ring
      )}
    >
      <div
        aria-hidden
        className={cn(
          "flex size-12 items-center justify-center rounded-lg border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
          accent.iconBg,
          accent.iconColor
        )}
      >
        <Icon className="size-6" strokeWidth={2.1} />
      </div>
      <div className="min-w-0">
        <h2 className="m-0 text-[1.05rem] font-semibold leading-tight tracking-normal text-slate-950">
          {shouldPreserveIqAccessiblePrefix ? <span className="sr-only">IQ </span> : null}
          {title}
        </h2>

        <p className="m-0 mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.description}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">{item.questionsLabel}</span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">{item.durationLabel}</span>
          <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", accent.tag)}>{item.outputLabel}</span>
        </div>

        <CmsMediaAuthorityShell
          media={item.media ?? null}
          locale={locale}
          surface="tests_hub_card"
          visible={item.key === IQ_PUBLIC_SLUG}
        />

        <div className="mt-5 flex flex-wrap gap-3">
          {primaryAction ? (
            <Link
              href={primaryAction.href}
              prefetch={false}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white shadow-sm transition",
                accent.button,
                accent.buttonHover
              )}
            >
              <span>{primaryAction.label}</span>
              <ArrowRight aria-hidden className="size-4 transition group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function TestsHubExperience({ content, locale }: { content: TestsHubContent; locale: Locale }) {
  const tests = listTests((content.families.items ?? []).map((family) => family.tests));
  const coreTests = listCoreTests(tests);

  return (
    <section
      className="overflow-hidden bg-[linear-gradient(180deg,#fbfaff_0%,#ffffff_52%,#f8fbff_100%)] py-14 text-slate-950 md:py-16"
      aria-labelledby="tests-hub-title"
    >
      <Container className="max-w-[82rem] px-5 md:px-8">
        <div className="relative rounded-none border border-violet-100/80 bg-[linear-gradient(135deg,#fbf8ff_0%,#f5f9ff_44%,#ffffff_100%)] px-5 py-10 shadow-[0_24px_80px_rgba(88,80,160,0.10)] md:px-8 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_23rem]">
            <div className="space-y-6">
              <div className="max-w-3xl">
                <h1 id="tests-hub-title" className="m-0 text-4xl font-semibold tracking-normal text-slate-950 md:text-5xl">
                  {locale === "zh" ? "免费测试" : "Free assessments"}
                </h1>
                <p className="m-0 mt-3 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  {locale === "zh"
                    ? "选择合适的测试，了解你的性格特质、兴趣倾向与能力潜能。"
                    : "Choose an assessment to understand personality traits, interests, and practical strengths."}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {HUB_FEATURES.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div key={feature.titleEn} className="flex min-h-20 items-center gap-3 rounded-lg border border-white/80 bg-white/88 px-4 py-3 shadow-sm">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                        <Icon aria-hidden className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-sm font-semibold leading-5 text-slate-950">
                          {locale === "zh" ? feature.titleZh : feature.titleEn}
                        </strong>
                        <span className="mt-1 block text-xs leading-5 text-slate-600">
                          {locale === "zh" ? feature.bodyZh : feature.bodyEn}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div aria-hidden className="relative hidden h-56 lg:block">
              <div className="absolute right-9 top-2 h-36 w-36 rounded-full border-[2.1rem] border-violet-200/75 shadow-[0_24px_70px_rgba(109,93,210,0.20)]" />
              <div className="absolute right-3 top-24 h-16 w-28 rounded-t-3xl bg-violet-100/70" />
              <div className="absolute bottom-2 right-24 h-20 w-5 rounded-t-lg bg-violet-200/80" />
              <div className="absolute bottom-2 right-16 h-28 w-5 rounded-t-lg bg-violet-300/70" />
              <div className="absolute bottom-2 right-8 h-14 w-5 rounded-t-lg bg-violet-200/70" />
              <div className="absolute right-48 top-16 h-px w-28 rotate-[-18deg] bg-violet-200" />
              <div className="absolute right-52 top-24 h-px w-28 rotate-[22deg] bg-violet-100" />
            </div>
          </div>
        </div>

        <div className="-mt-1 rounded-none border-x border-b border-slate-200/70 bg-white/96 px-5 py-7 shadow-[0_22px_70px_rgba(15,23,42,0.06)] md:px-8 lg:px-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {coreTests.map((item) => (
              <TestListCard key={item.key} item={item} locale={locale} />
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-violet-100 bg-[linear-gradient(135deg,#ffffff_0%,#fbfaff_100%)] p-5">
            <h2 className="m-0 text-center text-lg font-semibold tracking-normal text-slate-950">
              {locale === "zh" ? "为什么选择我们的测试" : "Why choose these assessments"}
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {HUB_FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div key={`summary-${feature.titleEn}`} className="flex min-h-20 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700">
                      <Icon aria-hidden className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-sm font-semibold leading-5 text-slate-950">
                        {locale === "zh" ? feature.titleZh : feature.titleEn}
                      </strong>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {locale === "zh" ? feature.bodyZh : feature.bodyEn}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
