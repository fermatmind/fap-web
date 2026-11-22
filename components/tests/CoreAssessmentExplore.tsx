import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { hubCopy, type CoreHub } from "@/lib/tests/coreAssessmentHubs";

type Copy = Parameters<typeof hubCopy>[1];
type Entry = readonly [slug: string, title: Copy, task: Copy];

const personalities: { group: Copy; entries: Entry[] }[] = [
  { group: ["分析家 · NT", "分析家 · NT", "Analysts · NT"], entries: [
    ["intj", ["建筑师", "架構師", "Architect"], ["建立长期路线图", "建立長期路線圖", "Plan a long-term roadmap"]],
    ["intp", ["逻辑学家", "邏輯學家", "Logician"], ["拆解问题并验证模型", "拆解問題並驗證模型", "Break down a problem and test a model"]],
    ["entj", ["指挥官", "指揮官", "Commander"], ["组织跨团队项目", "組織跨團隊專案", "Coordinate a cross-team project"]],
    ["entp", ["辩论家", "辯論家", "Debater"], ["比较不同产品假设", "比較不同產品假設", "Compare competing product hypotheses"]],
  ] },
  { group: ["外交家 · NF", "外交家 · NF", "Diplomats · NF"], entries: [
    ["infj", ["提倡者", "提倡者", "Advocate"], ["访谈并梳理需求", "訪談並整理需求", "Interview people and synthesize needs"]],
    ["infp", ["调停者", "調停者", "Mediator"], ["写出能传达价值观的故事", "寫出能傳達價值觀的故事", "Write a story that expresses a set of values"]],
    ["enfj", ["主人公", "主角", "Protagonist"], ["带领小组学习", "帶領小組學習", "Facilitate group learning"]],
    ["enfp", ["竞选者", "競選者", "Campaigner"], ["提出并试做创意活动", "提出並試做創意活動", "Design and pilot a creative event"]],
  ] },
  { group: ["守护者 · SJ", "守護者 · SJ", "Sentinels · SJ"], entries: [
    ["istj", ["物流师", "物流師", "Logistician"], ["核验流程记录", "核對流程紀錄", "Verify process records"]],
    ["isfj", ["守卫者", "守衛者", "Defender"], ["跟进服务对象的需求", "追蹤服務對象的需求", "Follow up on a client’s needs"]],
    ["estj", ["总经理", "總經理", "Executive"], ["安排资源和交付节点", "安排資源與交付時程", "Set resources and delivery milestones"]],
    ["esfj", ["执政官", "執政官", "Consul"], ["协调团队服务分工", "協調團隊服務分工", "Coordinate a service team"]],
  ] },
  { group: ["探险家 · SP", "探險家 · SP", "Explorers · SP"], entries: [
    ["istp", ["鉴赏家", "鑑賞家", "Virtuoso"], ["排查设备故障", "排查設備故障", "Troubleshoot equipment"]],
    ["isfp", ["探险家", "探險家", "Adventurer"], ["试做视觉设计方案", "試做視覺設計方案", "Prototype a visual design"]],
    ["estp", ["企业家", "企業家", "Entrepreneur"], ["现场测试并调整执行", "現場測試並調整執行", "Test and adjust a plan on site"]],
    ["esfp", ["表演者", "表演者", "Entertainer"], ["组织现场体验与互动", "組織現場體驗與互動", "Host a live experience"]],
  ] },
];

type Job = readonly [slug: string, label: Copy];
export const hollandJobs: { code: string; title: Copy; jobs: Job[] }[] = [
  { code: "R", title: ["现实型", "實作型", "Realistic"], jobs: [
    ["electricians", ["电工", "電工", "Electricians"]],
    ["carpenters", ["木工", "木工", "Carpenters"]],
    ["industrial-machinery-mechanics", ["工业机械维修人员", "工業機械維修人員", "Industrial machinery mechanics"]],
  ] },
  { code: "I", title: ["研究型", "研究型", "Investigative"], jobs: [
    ["data-scientists", ["数据科学家", "資料科學家", "Data scientists"]],
    ["statisticians", ["统计学家", "統計學家", "Statisticians"]],
    ["chemists", ["化学家", "化學家", "Chemists"]],
  ] },
  { code: "A", title: ["艺术型", "藝術型", "Artistic"], jobs: [
    ["graphic-designers", ["平面设计师", "平面設計師", "Graphic designers"]],
    ["writers-and-authors", ["作家与撰稿人", "作家與撰稿人", "Writers and authors"]],
    ["interior-designers", ["室内设计师", "室內設計師", "Interior designers"]],
  ] },
  { code: "S", title: ["社会型", "社會型", "Social"], jobs: [
    ["registered-nurses", ["注册护士", "註冊護理師", "Registered nurses"]],
    ["educational-guidance-and-career-counselors-and-advisors", ["教育与职业顾问", "教育與職涯顧問", "Education and career counselors"]],
    ["social-and-community-service-managers", ["社区服务管理人员", "社區服務管理人員", "Community service managers"]],
  ] },
  { code: "E", title: ["企业型", "企業型", "Enterprising"], jobs: [
    ["sales-managers", ["销售经理", "業務經理", "Sales managers"]],
    ["marketing-managers", ["营销经理", "行銷經理", "Marketing managers"]],
    ["general-and-operations-managers", ["综合运营经理", "綜合營運經理", "General and operations managers"]],
  ] },
  { code: "C", title: ["常规型", "常規型", "Conventional"], jobs: [
    ["accountants-and-auditors", ["会计师与审计师", "會計師與審計人員", "Accountants and auditors"]],
    ["bookkeeping-accounting-and-auditing-clerks", ["簿记与会计文员", "簿記與會計人員", "Bookkeeping and accounting clerks"]],
    ["payroll-and-timekeeping-clerks", ["工资与工时记录员", "薪資與工時紀錄人員", "Payroll and timekeeping clerks"]],
  ] },
];

export const hollandCodeExamples: [string, Copy][] = [
  ["IAS", ["研究用户需求，再把发现转成教学或设计方案", "研究使用者需求，再把發現轉成教學或設計方案", "Research user needs and turn the findings into a lesson or design"]],
  ["RIA", ["动手制作原型、测量表现，并迭代设计", "動手製作原型、量測表現並反覆設計", "Build a prototype, measure performance and refine the design"]],
  ["SEC", ["组织培训、协调参与者，并维护活动记录", "組織訓練、協調參與者並維護活動紀錄", "Organize training, coordinate participants and maintain records"]],
  ["EIC", ["提出业务方案，用数据验证并跟进流程", "提出業務方案、用資料驗證並追蹤流程", "Propose a business plan, test it with data and track its execution"]],
];

const sectors: { category: string; title: Copy; example: Job }[] = [
  { category: "computer-and-information-technology", title: ["科技研发", "科技研發", "Technology and research"], example: hollandJobs[1].jobs[0] },
  { category: "business-and-financial", title: ["商业分析", "商業分析", "Business analysis"], example: hollandJobs[5].jobs[0] },
  { category: "arts-and-design", title: ["创意设计", "創意設計", "Creative design"], example: hollandJobs[2].jobs[0] },
  { category: "education-training-and-library", title: ["教育咨询", "教育諮詢", "Education and counseling"], example: hollandJobs[3].jobs[1] },
  { category: "management", title: ["组织运营", "組織營運", "Operations and management"], example: hollandJobs[4].jobs[2] },
  { category: "installation-maintenance-and-repair", title: ["工程实作", "工程實作", "Hands-on engineering"], example: hollandJobs[0].jobs[2] },
];

const card = "rounded-xl border border-[var(--fm-border)] p-4";
const textLink = "font-medium text-[var(--fm-accent)] underline underline-offset-4";

export function CoreAssessmentExplore({ hub, locale }: { hub: CoreHub; locale: DisplayLocale }) {
  const t = (copy: Copy) => hubCopy(locale, copy);
  const heading = {
    mbti: t(["16 型人格分类与工作情境", "16 型人格分類與工作情境", "Explore all 16 personality types"]),
    holland: t(["RIASEC 六维代表职业与三字代码示例", "RIASEC 六類代表職涯與三字代碼範例", "RIASEC careers and three-letter code examples"]),
    career: t(["从六类工作开始探索", "從六類工作開始探索", "Explore six areas of work"]),
  }[hub];
  return <section className="space-y-5 rounded-2xl border border-[var(--fm-border)] bg-white p-5 sm:p-7" aria-labelledby="assessment-explore-title">
    <h2 id="assessment-explore-title" className="text-xl font-semibold">{heading}</h2>
    {hub === "mbti" ? <>
      <p>{t(["点击类型读四组偏好。卡片里的工作任务用于观察偏好在实践中的表现。", "點選類型閱讀四組偏好。卡片的工作任務用於觀察偏好在實務中的表現。", "Open a type to read about its preferences. Use the sample tasks to see how preferences may show up at work."])}</p>
      {personalities.map(({ group, entries }) => <div className="space-y-2" key={group[2]}>
        <h3 className="font-semibold">{t(group)}</h3>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{entries.map(([slug, title, task]) => <li key={slug} className={card}>
          <Link className={textLink} href={`/${locale}/personality/${slug}`}>{slug.toUpperCase()} · {t(title)}</Link>
          <p className="mt-2 text-sm">{t(task)}</p>
        </li>)}</ul>
      </div>)}
    </> : hub === "holland" ? <>
      <p>{t(["从高分维度选一件工作任务试做。职业档案提供实际职责和数据来源。", "從高分面向選一項工作任務試做。職涯檔案提供工作職責和資料來源。", "Try a task from one of your higher-scoring interests. The profiles describe duties and their sources."])}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{hollandJobs.map(({ code, title, jobs }) => <div key={code} className={card}>
        <h3 className="font-semibold">{code} · {t(title)}</h3>
        <ul className="mt-2 space-y-2">{jobs.map(([slug, label]) => <li key={slug}><Link className={textLink} href={`/${locale}/career/jobs/${slug}`}>{t(label)}</Link></li>)}</ul>
      </div>)}</div>
      <h3 className="font-semibold">{t(["三字代码怎么用？", "三字代碼怎麼用？", "How to use a three-letter code"])}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">{hollandCodeExamples.map(([code, example]) => <div key={code} className={card}>
        <dt className="font-semibold">{code}</dt><dd className="mt-1">{t(example)}</dd>
      </div>)}</dl>
    </> : <>
      <p>{t(["从一个代表岗位了解日常任务与入行条件，再挑两个职业并排比较。", "從一個代表職務了解日常工作與入行條件，再選兩個職務並排比較。", "Start with a representative occupation, then compare two roles side by side."])}</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sectors.map(({ category, title, example: [slug, label] }) => <li key={category} className={card}>
        <Link className={textLink} href={`/${locale}/career/industries/${category}`}>{t(title)}</Link>
        <p className="mt-2 text-sm"><Link className="underline underline-offset-4" href={`/${locale}/career/jobs/${slug}`}>{t(label)}</Link></p>
      </li>)}</ul>
      <Link className={textLink} href={`/${locale}/career/compare`}>{t(["打开双职业对比工具", "開啟雙職涯比較工具", "Open the occupation comparison tool"])}</Link>
    </>}
  </section>;
}
