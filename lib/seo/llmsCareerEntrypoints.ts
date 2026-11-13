import type { Locale } from "@/lib/i18n/locales";

const locales = ["zh", "en"] as const;

type CareerEntrypoint = {
  locale: Locale;
  path: string;
  title: string;
  type: string;
};

function entries(path: string, zh: string, en: string, type: string): CareerEntrypoint[] {
  return locales.map((locale) => ({
    locale,
    path: `/${locale}${path}`,
    title: locale === "zh" ? zh : en,
    type,
  }));
}

export const LLMS_CAREER_INTRO =
  "免费探索职业兴趣，查职业职责及其来源。 Explore career interests for free and find sourced job duties.";

const careerAssessmentChoices = entries("/career/tests", "职业测试怎么选", "Choose a career assessment", "career assessment guide");
const careerMethods = entries("/datasets/occupations/method", "职业数据库方法说明", "Occupations dataset method", "career evidence methodology");

export const LLMS_CAREER_STABLE_ENTRIES = [...careerAssessmentChoices, ...careerMethods];

export const LLMS_CAREER_GROUPS = [
  {
    title: "免费霍兰德测评 / Free Holland Code assessment",
    entries: entries("/tests/holland-career-interest-test-riasec", "霍兰德职业兴趣测试", "Holland Code Career Interest Test", "test"),
  },
  {
    title: "职业测试怎么选 / Choose a career assessment",
    entries: careerAssessmentChoices,
  },
  {
    title: "职业库与职责 / Career library and job duties",
    entries: [
      ...entries("/career", "中文职业库", "Career Library", "career_index"),
      ...entries("/career/jobs/accountants-and-auditors", "会计与审计人员", "Accountants and Auditors", "career_job"),
    ],
  },
  {
    title: "方法与使用边界 / Methods and limits",
    entries: [
      ...careerMethods,
      ...entries("/method-boundaries", "测评方法与使用边界", "Assessment Methods and Usage Boundaries", "method"),
    ],
  },
];

export function isLlmsCareerFeaturedPath(path: string): boolean {
  return LLMS_CAREER_GROUPS.some((group) => group.entries.some((entry) => entry.path === path));
}
