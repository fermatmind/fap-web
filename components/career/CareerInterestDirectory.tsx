"use client";

import { useState } from "react";
import Link from "next/link";
import type { InterestDirectoryCard, JobZoneBand } from "@/lib/career/interestDirectory";
import type { Locale } from "@/lib/i18n/locales";

const preparation = {
  2: { zh: "1–2 档 · 基础准备", en: "1–2 · Little to some preparation" },
  3: { zh: "3 档 · 职业实训或相关经验", en: "3 · Medium preparation" },
  4: { zh: "4 档 · 较多专业准备", en: "4 · Considerable preparation" },
  5: { zh: "5 档 · 长期专业训练", en: "5 · Extensive preparation" },
} as const;

const preparationBands = [2, 3, 4, 5] as const satisfies readonly JobZoneBand[];

function Cards({ jobs, locale, heading: Heading }: { jobs: InterestDirectoryCard[]; locale: Locale; heading: "h3" | "h4" }) {
  return (
    <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2">
      {jobs.map(({ slug, name, interest, jobZone, task, onet, officialTaskId }) => (
        <li key={slug} className="min-w-0 space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
          <Heading className="text-base font-semibold">
            <Link className="underline underline-offset-4" prefetch={false} href={`/${locale}/career/jobs/${slug}`}>{name}</Link>
          </Heading>
          <p className="text-sm leading-6 text-slate-700">{task}</p>
          <p className="text-sm text-slate-700">{interest} · {preparation[jobZone][locale]}</p>
          <a className="text-sm text-slate-600 underline underline-offset-4" href={`https://www.onetonline.org/link/details/${onet}#Tasks`}>
            {locale === "zh" ? "O*NET 任务" : "O*NET task"} #{officialTaskId}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function CareerInterestDirectory({ code, locale, exact, relatedGroups }: {
  code: string;
  locale: Locale;
  exact: InterestDirectoryCard[];
  relatedGroups: { interest: string; jobs: InterestDirectoryCard[] }[];
}) {
  const [zone, setZone] = useState<JobZoneBand | null>(null);
  const zh = locale === "zh";
  const visible = (jobs: InterestDirectoryCard[]) => zone === null ? jobs : jobs.filter((job) => job.jobZone === zone);
  const exactMatches = visible(exact);
  const related = relatedGroups.map(({ interest, jobs }) => ({ interest, total: jobs.length, matches: visible(jobs) }));
  const relatedCount = related.reduce((sum, group) => sum + group.matches.length, 0);
  const relatedTotal = related.reduce((sum, group) => sum + group.total, 0);
  const count = (matches: number, total: number) => zone === null ? String(total) : `${matches} / ${total}`;
  const empty = zh ? "当前准备度下没有职业。" : "No occupations at this preparation level.";

  return (
    <>
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="career-job-zone" className="font-semibold">{zh ? "入行准备度" : "Job preparation"}</label>
          <select
            id="career-job-zone"
            className="min-h-11 max-w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900"
            value={zone ?? ""}
            aria-describedby="career-job-zone-source"
            onChange={(event) => {
              const value = Number(event.currentTarget.value);
              setZone(preparationBands.find((band) => band === value) ?? null);
            }}
          >
            <option value="">{zh ? "全部准备度" : "All preparation levels"}</option>
            {preparationBands.map((band) => <option key={band} value={band}>{preparation[band][locale]}</option>)}
          </select>
        </div>
        <p id="career-job-zone-source" className="text-sm leading-6 text-slate-700">
          {zh
            ? "准备度参考美国 O*NET 31.0 的教育、工作经验和在岗培训分级。国内岗位的具体要求请查阅当地招聘和执业规定。"
            : "Preparation bands reflect education, related experience, and on-the-job training in U.S. O*NET 31.0."}{" "}
          <a className="underline underline-offset-4" href="https://www.onetonline.org/help/online/zones">Job Zones</a>
        </p>
        <p role="status" className="text-sm text-slate-700">
          {zh ? `精确 ${count(exactMatches.length, exact.length)} 岗，近似 ${count(relatedCount, relatedTotal)} 岗`
            : `${count(exactMatches.length, exact.length)} exact, ${count(relatedCount, relatedTotal)} related`}
        </p>
      </div>

      <section aria-labelledby="interest-directory-exact" className="space-y-3">
        <h2 id="interest-directory-exact" className="text-xl font-semibold">
          {zh ? `精确匹配 ${code}（${count(exactMatches.length, exact.length)}）` : `Exact ${code} matches (${count(exactMatches.length, exact.length)})`}
        </h2>
        <p className="text-sm text-slate-700">{zh ? "职业兴趣代码的三个字母与顺序一致。" : "All three letters appear in the same order."}</p>
        {exactMatches.length > 0 ? <Cards jobs={exactMatches} locale={locale} heading="h3" /> : <p>{empty}</p>}
      </section>

      <section aria-labelledby="interest-directory-related" className="space-y-5">
        <div className="space-y-2">
          <h2 id="interest-directory-related" className="text-xl font-semibold">
            {zh ? `近似代码（${count(relatedCount, relatedTotal)}）` : `Related codes (${count(relatedCount, relatedTotal)})`}
          </h2>
          <p className="text-sm leading-6 text-slate-700">
            {zh
              ? "这些代码包含同样的三个字母，顺序不同。例如 IRC 把研究放在首位，RCI 则先看实操、再看流程。可对照卡片里的核心任务。"
              : "These codes share the same three letters in a different order. IRC places investigation first, while RCI starts with hands-on work and puts procedures second. Use the core tasks to see how that plays out."}
          </p>
        </div>
        {relatedCount === 0 ? <p>{empty}</p> : related.filter(({ matches }) => matches.length > 0).map(({ interest, total, matches }) => (
          <section key={interest} aria-labelledby={`interest-directory-${interest}`} className="space-y-3">
            <h3 id={`interest-directory-${interest}`} className="text-lg font-semibold">{interest} ({count(matches.length, total)})</h3>
            <Cards jobs={matches} locale={locale} heading="h4" />
          </section>
        ))}
      </section>
      <p className="text-sm leading-6 text-slate-600">
        {zh ? "资料来自美国劳工部就业与培训管理局的 " : "Source: the "}
        <a className="underline underline-offset-4" href="https://www.onetcenter.org/database.html">O*NET® 31.0 {zh ? "数据库" : "Database"}</a>
        {zh ? "，依 " : " by the U.S. Department of Labor, Employment and Training Administration. "}
        <a className="underline underline-offset-4" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>
        {zh ? " 使用。任务由费马测试节译改写，未经原机构认可。" : ". FermatMind condensed the tasks. The source agency has not endorsed these adaptations."}
      </p>
    </>
  );
}
