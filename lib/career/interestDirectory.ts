import type { Locale } from "@/lib/i18n/locales";
import data from "./interestDirectory.json";
import type { getReleasedCareerInterest } from "./interestRelease";

const JOB_ZONE_BANDS = [2, 3, 4, 5] as const;
export type JobZoneBand = (typeof JOB_ZONE_BANDS)[number];

export type InterestDirectoryCard = {
  slug: string;
  name: string;
  interest: string;
  onet: string;
  task: string;
  officialTaskId: number;
  jobZone: JobZoneBand;
};

const evidence: Readonly<Partial<Record<string, { zh: string; en: string; officialTaskId: number; jobZone: number }>>> = data.careers;

const overview = {
  ric: {
    zh: "RIC 依次是现实型、研究型和常规型。你可以先看哪些工作需要操作设备、排查问题并记录结果，再按准备度筛选。比较不同岗位时，留意你更想动手解决什么问题，以及怎样确认工作已经做完。",
    en: "RIC stands for Realistic, Investigative, and Conventional, in that order. Start with jobs that involve working with equipment, diagnosing problems, or documenting results. Filter by preparation, then compare what you would work on and how you would know the job was done.",
  },
  icr: {
    zh: "ICR 依次是研究型、常规型和现实型。先看哪些岗位需要分析证据、按标准核对结果，再比较它们实际处理的对象，例如研究数据、交通方案或生产流程。下方可按入行准备度缩小范围。",
    en: "ICR stands for Investigative, Conventional, and Realistic, in that order. Explore work that involves analyzing evidence and checking results against standards. Compare what people work with, from research data and transportation proposals to production processes.",
  },
} as const;

export function getInterestDirectory(code: string, locale: Locale, topic: NonNullable<ReturnType<typeof getReleasedCareerInterest>>) {
  function readCards(jobs: typeof topic.exact) {
    return jobs.flatMap(({ slug, interest, onet, copy }): InterestDirectoryCard[] => {
      const row = evidence[slug];
      if (!row || !isJobZoneBand(row.jobZone)) return [];
      return [{
        slug, interest, onet, name: copy[locale].name, task: row[locale],
        officialTaskId: row.officialTaskId, jobZone: row.jobZone,
      }];
    }).sort((left, right) => left.name.localeCompare(right.name, locale === "zh" ? "zh-CN" : "en") || left.slug.localeCompare(right.slug));
  }

  const exact = readCards(topic.exact);
  const related = readCards(topic.related);
  const groups = Map.groupBy(related, (job) => job.interest);
  const intro = code === "ric" || code === "icr" ? overview[code][locale] : locale === "zh"
    ? `${topic.code} 依次是${topic.label}。先按准备度筛选，再看各岗位处理的工作对象、完成的任务和交付的成果。`
    : `${topic.code} stands for ${topic.label}, in that order. Filter by preparation and compare what people work on and what they produce.`;
  return {
    intro,
    exact,
    relatedGroups: [...groups].map(([interest, jobs]) => ({ interest, jobs }))
      .sort((left, right) => right.jobs.length - left.jobs.length || left.interest.localeCompare(right.interest)),
    other: [...topic.exact, ...topic.related].filter(({ slug }) => !evidence[slug]),
  };
}

function isJobZoneBand(value: number): value is JobZoneBand {
  return JOB_ZONE_BANDS.some((band) => band === value);
}
