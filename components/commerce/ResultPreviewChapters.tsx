import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, LockKeyhole } from "lucide-react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import release from "@/lib/career/interestRelease.json";
import taiwan from "@/lib/career/interestRelease.zh-TW.json";
import styles from "@/components/career/unlock-report-experience.module.css";

const profileExamples = {
  disc: {
    slugs: ["general-and-operations-managers", "sales-managers", "construction-managers"],
    intro: ["比较这些岗位如何确定优先级、协调人员和推进任务。", "比較這些職位如何安排優先順序、協調人員及推進任務。", "Compare how these roles set priorities, coordinate people, and move tasks forward."],
  },
  enneagram: {
    slugs: ["social-science-research-assistants", "market-research-analysts", "operations-research-analysts"],
    intro: ["在真实岗位里，看看收集证据、分析问题和解释结论分别是什么样。", "在真實職位裡，看看蒐集證據、分析問題和解釋結論分別是什麼樣。", "See how different jobs gather evidence, analyze problems, and explain conclusions."],
  },
  eq: {
    slugs: ["training-and-development-specialists", "public-relations-specialists", "general-and-operations-managers"],
    intro: ["从培训、公共沟通和团队协作中看看关系管理如何体现在日常任务里。", "從培訓、公共溝通和團隊協作中看看關係管理如何體現在日常任務裡。", "Explore how relationships are managed in training, public communication, and team coordination."],
  },
} as const;
const exampleSlugs = ["market-research-analysts", "industrial-designers", "editors", "social-science-research-assistants"] as const;

export function ResultPreviewChapters({ locale, offerId, insights, jobs = [], showJobExamples = false, showProgress = true, insightTitle, careerProfile }: {
  locale: DisplayLocale;
  offerId: string;
  insights: string[];
  showJobExamples?: boolean;
  showProgress?: boolean;
  insightTitle?: string;
  careerProfile?: keyof typeof profileExamples;
  jobs?: { slug: string; name: string }[];
}) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const ranked = jobs.length > 0;
  const example = careerProfile ? profileExamples[careerProfile] : undefined;
  const careers = ranked ? jobs : showJobExamples ? (example?.slugs ?? exampleSlugs).map(slug => ({
    slug, name: locale === "zh-TW" ? taiwan[slug].name : release.careers[slug].copy[locale].name,
  })) : [];
  return <div className={styles.previewChapters}>
    {showProgress && <section id="report-progress" className={styles.previewProgress}>
      <h2>{t("你的报告阅读进度", "你的報告閱讀進度", "Your report progress")}</h2>
      <div className={styles.previewProgressTrack} aria-hidden="true"><span/><span/></div>
      <div className={styles.previewProgressFooter}>
        <ol><li aria-current="step">{t("基础结果已显示", "基礎結果已顯示", "Basic results shown")}</li><li>{t("完整报告待解锁", "完整報告待解鎖", "Full report locked")}</li></ol>
        <a href={`#${offerId}`}>{t("查看解锁选项", "查看解鎖選項", "See unlock options")} <ArrowRight size={16} /></a>
      </div>
    </section>}
    <section id="career-preview" data-career-profile={careerProfile} className={careerProfile ? `${styles.previewPanel} ${styles.discCareer}` : styles.previewPanel}>
      <h2><BriefcaseBusiness size={21} /> {t("职业探索线索", "職涯探索線索", "Career exploration")}</h2>
      {careers.length > 0 ? <>
        <p>{ranked
          ? t("按活动兴趣轮廓的相似度排序，点开了解日常工作。", "依活動興趣輪廓的相似度排序，點開了解日常工作。", "Ordered by similarity of activity interests. Open a profile to see day-to-day work.")
          : example ? t(example.intro[0], example.intro[1], example.intro[2])
          : t("来自费马职业库的工作示例，可比较日常任务。这些示例没有按你的分数排名。", "來自費馬職涯資料庫的工作示例，可比較日常任務。這些示例沒有依你的分數排名。", "Work examples from the career library for comparing daily tasks. These examples are not ranked by your scores.")}</p>
        <ul className={styles.previewCareerRows}>{careers.map((job, index) => (
          <li key={job.slug}><Link href={displayNavigationPath(`/career/jobs/${job.slug}`, locale)}>
            {ranked && <span>{index + 1}</span>}{job.name}<ArrowRight size={16} />
          </Link></li>
        ))}</ul>
        {careerProfile && careerProfile !== "disc" && <Link className={styles.profileCareerLink} href={displayNavigationPath("/career", locale)}>{t("浏览费马职业库", "瀏覽費馬職涯資料庫", "Browse the career library")} <ArrowRight size={15} /></Link>}
      </> : <>
        <p>{t("用职业库比较真实任务、工作环境和入行要求。这个题本未提供岗位匹配。", "用職涯資料庫比較真實任務、工作環境和入行要求。這個題本未提供職位配對。", "Compare daily tasks, work settings and entry requirements. This assessment does not provide job matches.")}</p>
        <Link href={displayNavigationPath("/career", locale)}>{t("打开职业库", "開啟職涯資料庫", "Explore the career library")} →</Link>
      </>}
    </section>
    <section id="insight-preview" className={styles.previewPanel}>
      <h2>{insightTitle ?? t("把结果放回日常", "把結果放回日常", "What to look for in everyday life")}</h2>
      <ul className={styles.previewRows}>{insights.map(insight => <li key={insight}>{insight}</li>)}</ul>
      <a className={styles.previewLock} href={`#${offerId}`}><LockKeyhole size={16} />{t("查看完整解读包含哪些内容", "查看完整解讀包含哪些內容", "See what the full report covers")} <ArrowRight size={16} /></a>
    </section>
  </div>;
}
