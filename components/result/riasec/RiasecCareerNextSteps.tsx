"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchCareerInterestComparisonRole } from "@/lib/career/api/fetchCareerInterestComparisonRole";
import { normalizeCareerPage, validateCareerPageAuthority } from "@/lib/career/careerPage";
import { rankRiasecCareers, RIASEC_CAREER_POOL_SIZE } from "@/lib/career/riasecProfileMatch";
import type { RiasecDimension } from "@/lib/riasec/resultAssembler";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import styles from "./RiasecReadingReport.module.css";
import { RiasecTrialRecord } from "./RiasecTrialRecord";

const examples: Record<string, [string, string, string]> = {
  R: ["搭建、维修或操作设备", "Build, repair or operate equipment", "搭建、維修或操作設備"],
  I: ["搜集证据、分析数据或验证假设", "Gather evidence, analyze data or test a hypothesis", "蒐集證據、分析資料或驗證假設"],
  A: ["设计版面、写作或制作视觉作品", "Design a layout, write or create visuals", "設計版面、寫作或製作視覺作品"],
  S: ["教学、解释操作或协助他人解决问题", "Teach, explain a process or help someone solve a problem", "教學、解說操作或協助他人解決問題"],
  E: ["提案、谈判或推进团队目标", "Pitch a proposal, negotiate or lead a team toward a goal", "提案、談判或推進團隊目標"],
  C: ["核对记录、整理数据或维护流程", "Check records, organize data or maintain a process", "核對紀錄、整理資料或維護流程"],
};

type CareerEvidence = { tasks: string[]; environment: string; preparation: string };
const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : [];

async function readEvidence(locale: DisplayLocale, slug: string): Promise<CareerEvidence | null> {
  const raw = await fetchCareerInterestComparisonRole({ locale, slug, sameOrigin: true });
  const page = normalizeCareerPage(raw?.career_page, locale, slug);
  if (!raw || !page) return null;
  validateCareerPageAuthority(raw, page, locale, slug);
  const items = page.content.blocks.filter(block => block.renderable).flatMap(block => block.items)
    .filter(item => item.availability === "available" && item.sourceRefs.length > 0);
  const item = (key: string) => items.find(entry => entry.copyKey === `career.item.${key}`);
  const path = item("entry-role-comparison");
  const row = Array.isArray(path?.data.rows) ? path.data.rows[0] : null;
  const columns = strings(path?.data.column_keys);
  const preparationIndex = columns.findIndex(key => ["employer_evidence", "career.column.evidence"].includes(key));
  const roleIndex = columns.findIndex(key => ["role", "career.column.stage"].includes(key));
  return {
    tasks: strings(item("responsibilities-block")?.data.entries).slice(0, 2),
    environment: strings(item("work-context-block")?.data.paragraphs)[0]?.split("\n").slice(0, 2).join(" · ") ?? "",
    preparation: preparationIndex >= 0 && Array.isArray(row) && typeof row[preparationIndex] === "string"
      ? [row[roleIndex], row[preparationIndex]].filter(Boolean).join(" · ") : "",
  };
}

export function RiasecCareerNextSteps({ locale, displayLocale = locale, scores, tieDimensions = [], structured = false, careerLens }: {
  locale: Locale;
  displayLocale?: DisplayLocale;
  scores?: RiasecDimension[];
  tieDimensions?: string[];
  structured?: boolean;
  careerLens?: string;
}) {
  const language = displayLocale === "zh-TW" ? 2 : locale === "en" ? 1 : 0;
  const t = (...values: [string, string, string]) => values[language];
  const matches = useMemo(() => scores ? rankRiasecCareers(scores, displayLocale) : null, [scores, displayLocale]);
  const jobs = matches?.jobs;
  const [evidence, setEvidence] = useState<Record<string, CareerEvidence | null>>({});
  const [comparison, setComparison] = useState<string[]>([]);
  const [trial, setTrial] = useState("");
  const [task, setTask] = useState("");
  useEffect(() => {
    let current = true;
    for (const job of jobs ?? []) {
      void readEvidence(displayLocale, job.slug).catch(() => null).then(data => {
        if (current) setEvidence(previous => ({ ...previous, [`${displayLocale}/${job.slug}`]: data }));
      });
    }
    return () => { current = false; };
  }, [jobs, displayLocale]);

  const tied = [...new Set(tieDimensions)].filter(code => examples[code]);
  const selectedJobs = jobs?.filter(job => comparison.includes(job.slug)) ?? [];
  const trialJob = jobs?.find(job => job.slug === trial);
  const unavailable = t("资料暂缺，请查看职业档案。", "Details unavailable. Check the career profile.", "資料暫缺，請查看職涯檔案。");
  const fields = (slug: string) => {
    const details = evidence[`${displayLocale}/${slug}`];
    const fallback = details === undefined ? t("正在读取职业资料…", "Loading career details…", "正在讀取職涯資料…") : unavailable;
    return [
      [t("日常任务", "Daily tasks", "日常任務"), details?.tasks.length ? <ul className="list-disc pl-5">{details.tasks.map((value, i) => <li key={i}>{value}</li>)}</ul> : fallback],
      [t("工作环境", "Work setting", "工作環境"), details?.environment || fallback],
      [t("入行准备参考", "Entry preparation", "入行準備參考"), details?.preparation || fallback],
    ] as const;
  };

  return <div className="space-y-4" data-testid="riasec-career-next-steps">
    {tied.length > 1 ? <div className={structured ? styles.careerTie : "rounded-lg bg-emerald-50 p-4"}>
      <h3 className="font-semibold">{t("接近的兴趣可以一起探索", "Explore close interests together", "相近的興趣可以一起探索")}</h3>
      <ul className="list-disc pl-5">{tied.map(code => <li key={code}><Link className="underline underline-offset-4" href={`/${locale}/career/interests/${code.toLowerCase()}`}>{code} · {examples[code][language]}</Link></li>)}</ul>
    </div> : null}
    {jobs?.length ? <>
      {!structured ? (
        <p>{t("候选来自与你六维兴趣轮廓相近的美国 O*NET 职业。入行条件请结合所在地和雇主核实。", "These U.S. O*NET occupations have interest profiles similar to yours. Check entry requirements for your location and employer.", "候選來自與你六向度興趣輪廓相近的美國 O*NET 職業。入行條件請結合所在地和雇主核實。")}</p>
      ) : null}
      {structured ? <div className={styles.careerShortlist}>
        <h3>职业兴趣相似度一览</h3>
        <p>从美国 O*NET 的 {RIASEC_CAREER_POOL_SIZE} 种职业中，列出兴趣分布与你最接近的 {jobs.length} 种。条越长，六维兴趣分布越接近。</p>
        {careerLens ? <p>{careerLens}</p> : null}
        <ol>{jobs.map(job => <li key={job.slug}>
          <a href={`#career-${job.slug}`}>
            <span>{job.name}</span>
            <span className={styles.careerSimilarity}>相似度 {(job.similarity / 1e6).toFixed(3)}</span>
          </a>
          <span className={styles.careerTrack} aria-hidden="true">
            <span style={{ width: `${job.similarity / 1e4}%` }} />
          </span>
        </li>)}</ol>
        <p className={styles.careerSelection}>点职业名看详情。勾选两项可并排比较。入行要求因地区和雇主而异。</p>
        {selectedJobs.length === 2 ? <a className={styles.careerCompareLink} href="#riasec-career-comparison">查看这两个职业的对比</a> : null}
      </div> : null}
      <div className={structured ? styles.careerEntries : "grid gap-4 md:grid-cols-2"} data-testid="riasec-profile-careers">
        {jobs.map((job, index) => {
          const checked = comparison.includes(job.slug);
          const details = evidence[`${displayLocale}/${job.slug}`];
          const taskName = details?.tasks[0]?.split(/[：:]/)[0];
          const label = structured ? "与你相近的兴趣" : t("共同突出兴趣", "Shared leading interests", "共同突出的興趣");
          const jobFields = fields(job.slug);
          const evidenceList = <dl className="space-y-2 text-sm">{jobFields.map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd>{value}</dd></div>)}</dl>;
          const shared = job.sharedInterests.map(code => ({ code, label: scores?.find(score => score.code === code)?.label ?? code }));
          return <article key={job.slug} id={structured ? `career-${job.slug}` : undefined}
            tabIndex={structured ? -1 : undefined}
            className={structured ? styles.careerEntry : "min-w-0 space-y-3 rounded-xl border border-emerald-100 bg-white p-5"}>
            {structured ? <header className={styles.careerCardHeader}>
              <span className={styles.careerRank} aria-hidden="true">{index + 1}</span>
              <h3>{job.name}</h3>
            </header> : <h3 className="font-semibold">{job.name}</h3>}
            <p className={structured ? styles.careerSummary : "text-sm"}>{job.summary}</p>
            {structured && details?.tasks[0] ? <div className={styles.careerTask}>
              <strong>日常任务举例</strong>
              <p>{details.tasks[0]}</p>
            </div> : null}
            {job.sharedInterests.length ? (structured ? <div className={styles.careerInterests}>
              <span>{label}</span>
              <ul>{shared.map(interest => <li key={interest.code}>{interest.label}</li>)}</ul>
            </div> : <p className="text-sm">{label} · {shared.map(interest => interest.label).join(" / ")}</p>) : null}
            {structured ? <details className={styles.careerDetails}>
              <summary>日常任务、环境和入行准备</summary>
              {evidenceList}
            </details> : evidenceList}
            {!structured ? <p className="text-sm">{taskName && taskName.length <= 32
              ? t(`值得问：新人多久会参与「${taskName}」这项工作？`, `Ask: How soon do new hires take on this task? “${taskName}”`, `值得問：新人多久會參與「${taskName}」這項工作？`)
              : t("值得问：这个岗位新人每周花最多时间做什么？", "Ask: What takes up most of a new hire’s week in this role?", "值得問：這個職位的新人每週花最多時間做什麼？")}</p> : null}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link className="underline underline-offset-4" href={`/${displayLocale}/career/jobs/${job.slug}`}>{t("查看职业档案", "View career profile", "查看職涯檔案")}</Link>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={checked} disabled={!checked && selectedJobs.length >= 2}
                  aria-label={structured ? `加入比较：${job.name}` : undefined}
                  onChange={() => setComparison(selected => checked ? selected.filter(slug => slug !== job.slug) : [...selected.filter(slug => jobs.some(candidate => candidate.slug === slug)).slice(0, 1), job.slug])} />
                {t("加入比较", "Compare", "加入比較")}
              </label>
              <button type="button" aria-expanded={trial === job.slug} className="underline underline-offset-4" onClick={() => setTrial(trial === job.slug ? "" : job.slug)}>{t("记录试做", "Plan a trial", "記錄試作")}</button>
            </div>
          </article>;
        })}
      </div>
      <p className="text-sm" role="status">{t(`选择两个职业并排比较（已选 ${selectedJobs.length}/2）`, `Select two careers to compare (${selectedJobs.length}/2 selected)`, `選擇兩個職業並排比較（已選 ${selectedJobs.length}/2）`)}</p>
      {selectedJobs.length === 2 ? <section id="riasec-career-comparison" aria-label={t("职业比较", "Career comparison", "職業比較")} className={structured ? styles.careerUtility : "overflow-hidden rounded-xl border bg-white"}>
        <table className="w-full table-fixed text-left text-sm [overflow-wrap:anywhere]">
          <thead><tr className="bg-emerald-50">
            <th scope="col" className="w-20 p-2">{t("比较项目", "Compare", "比較項目")}</th>
            {selectedJobs.map(job => <th key={job.slug} scope="col" className="p-2">{job.name}</th>)}
          </tr></thead>
          <tbody>
            {structured ? <tr className="border-t align-top">
              <th scope="row" className="p-2">工作重心</th>
              {selectedJobs.map(job => <td key={job.slug} className="p-2">{job.summary}</td>)}
            </tr> : null}
            {fields(selectedJobs[0].slug).map(([label, value], index) => <tr key={label} className="border-t align-top">
              <th scope="row" className="p-2">{label}</th>
              <td className="p-2">{value}</td>
              <td className="p-2">{fields(selectedJobs[1].slug)[index][1]}</td>
            </tr>)}
          </tbody>
        </table>
      </section> : null}
      {trialJob ? <div className={structured ? styles.careerUtility : undefined}>
        <RiasecTrialRecord key={trialJob.slug} locale={locale} activities={evidence[`${displayLocale}/${trialJob.slug}`]?.tasks ?? []} careerName={trialJob.name} />
      </div> : null}
      {structured ? (
        <Link className="font-semibold underline underline-offset-4" href={`/${displayLocale}/career`}>浏览完整职业目录 →</Link>
      ) : null}
    </> : <>
      <p>{matches?.state === "flat"
        ? t("你的六维分数比较接近。先选一类你愿意反复做的任务。", "Your six scores are close. Start with a task you would enjoy repeating.", "你的六向度分數較接近。先選一類你願意反覆做的任務。")
        : t("本次暂未提供职业排序。可以先浏览职业档案。", "A ranked list is unavailable for this result. You can browse career profiles.", "本次暫未提供職業排序。可以先瀏覽職涯檔案。")}</p>
      {matches?.state === "flat" ? <label className={structured ? styles.careerDirection : "block"}>
        {t("想先了解哪类任务？", "Which tasks would you like to explore?", "想先了解哪類任務？")}
        <select className="ml-2 max-w-full rounded border bg-white p-2" value={task} onChange={event => setTask(event.target.value)}>
          <option value="">{t("选择任务方向", "Choose a task direction", "選擇任務方向")}</option>
          {Object.entries(examples).map(([code, names]) => <option key={code} value={code}>{names[language]}</option>)}
        </select>
      </label> : null}
      {task && matches?.state === "flat" ? <p className="text-sm">{t("打开职业中心，用这类任务核对你感兴趣的岗位日常。", "Use this task to check the daily work of roles in the career directory.", "開啟職涯中心，用這類任務核對你感興趣的職位日常。")}</p> : null}
      <Link className="underline underline-offset-4" href={task && matches?.state === "flat" ? `/${locale}/career/interests/${task.toLowerCase()}` : `/${displayLocale}/career`}>{task && matches?.state === "flat" ? t("查看这类职业", "Explore careers in this area", "查看這類職涯") : t("浏览职业中心", "Browse careers", "瀏覽職涯中心")}</Link>
    </>}
  </div>;
}
