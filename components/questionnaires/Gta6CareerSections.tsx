import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { gta6CareerDimensions, gta6CareerRows, gta6CareerTopics } from "@/lib/questionnaires/gta6CareerEditorial";
import { gta6Profile, gta6ResultPath } from "@/lib/questionnaires/gta6CharacterQuiz";
import styles from "./Gta6Landing.module.css";

const copyIndex = { en: 0, zh: 1, "zh-TW": 2 } as const;


export const gta6CareerFaq = {
  en: ["How can I explore real careers from my GTA 6 character result?", "Start with a task that caught your attention. Lucia’s scene points to project handoffs, Jason and Brian’s to logistics and coordination, Cal’s to source verification, Raul’s to evaluating time-sensitive risks, and Boobie’s to negotiating terms. Dre’Quan and Real Dimez offer examples of production and audience engagement. Use the career guides to compare actual work. Take the separate Holland assessment for a personal RIASEC profile."],
  zh: ["GTA 6 角色测试的八组人物可以延伸了解哪些现实职业？", "可以从你想尝试的工作活动出发。Lucia 对照运营和项目推进，Jason 与 Brian 对照物流和后台调度，Cal 对照信息核查，Raul 对照应急与风险判断，Boobie 对照谈判和经营，Dre’Quan 与 Real Dimez 对照制作及传播。职业档案提供实际任务和入行条件，个人霍兰德兴趣需要另做测评。"],
  "zh-TW": ["測到 GTA 6 角色後，可以從哪個職業開始看？", "先挑一件你會想試的事。露西婭的例子可以接到營運和專案，傑森及布萊恩可以看物流與調度，卡爾可以看查證，勞爾可以看應變與風險，布比可以看談判和經營，德雷・泉和 Real Dimez 則可以看製作及傳播。想知道自己的六類職業興趣，要另外做霍蘭德測驗。"],
} satisfies Record<DisplayLocale, [string, string]>;

const tools = [
  {
    title: ["Holland Career Interest Test · 60 questions", "霍兰德职业兴趣测试（60 题）", "霍蘭德職業興趣測驗（60 題）"],
    body: ["Take the 60-question form to review six interest areas and your three-letter result, then decide which work activities to try.", "选择 60 题版本，查看六维兴趣、分数差距和三字代码，找几项愿意尝试的工作活动。", "選 60 題版，先看六類興趣和分數差距，再挑幾種工作活動親手試試。"],
    links: [["/tests/holland-career-interest-test-riasec", "Open the Holland test", "打开 60 题霍兰德测试入口", "開啟 60 題霍蘭德測驗入口"]],
  },
  {
    title: ["FermatMind Career Assessment · 94 questions", "费马职业测试（94 题）", "費馬職業測驗（94 題）"],
    body: ["Review interest, work style and work environment together to build a shortlist of careers to explore.", "结合职业兴趣、工作风格和环境偏好，整理一份值得继续调研的职业清单。", "把職業興趣、工作方式和環境偏好放在一起看，整理下一步想研究的幾項工作。"],
    links: [["/career/assessment", "Open the 94-question assessment", "打开 94 题费马职业测试", "開啟 94 題費馬職業測驗"]],
  },
  {
    title: ["Compare two careers and record your next step", "两职业对比与探索工作表", "比較兩種職業，記下下一步"],
    body: ["Compare actual tasks and entry requirements, or use the worksheet to record what you want to check next.", "并排比较岗位任务与入行条件，用工作表记下待核对的条件和下一步。", "把兩種工作的日常和入行條件排在一起看，用工作表記下接著想查什麼。"],
    links: [
      ["/career/compare", "Compare two careers", "打开两职业对比工具", "比較兩種職業"],
      ["/holland-test/pdf-download", "Get the exploration worksheet", "获取职业探索工作表", "取得職涯探索工作表"],
      ["/career", "Browse the career directory", "浏览职业库", "瀏覽職業資料庫"],
    ],
  },
] as const;

export function Gta6CareerSections({ locale }: { locale: DisplayLocale }) {
  const index = copyIndex[locale];
  const title = ["GTA 6 workplace-style and career examples", "GTA 6 八大角色职场特质与现实职业映射参考", "GTA 6 八組角色的職場做法與職業參考"][index];
  const headers = [
    ["Character", "Workplace lens", "Decisions & collaboration", "RIASEC activity prompts", "Career guides"],
    ["角色名称", "核心职场标签", "高压决策与协作", "霍兰德工作活动参考", "现实职业档案"],
    ["角色", "職場觀察重點", "壓力下的決策與合作", "霍蘭德活動參考", "職業指南"],
  ][index];
  return (
    <>
      <section id="career-mapping">
        <h2 id="gta6-careers-heading">{title}</h2>
        <p>{[
          "Use the scene to notice a kind of work you might want to try. The Holland letters describe work activities to explore. They are neither character scores nor your interest profile. Open a career guide to check daily tasks, skills and local entry requirements.",
          "把派对里的分工当作寻找工作活动的线索。霍兰德字母提示可探索的活动，角色结果无法得出个人兴趣代码、胜任力或岗位推荐。请读职业档案的日常任务、技能和当地入行条件。",
          "先想想哪個做法你會想在現實試一次。表裡的霍蘭德字母只是活動線索，沒有替角色或你打興趣分數。點開職業指南看工作日常，再查自己所在地的技能和入行條件。",
        ][index]}</p>
        <div className={styles.tableScroll} role="region" aria-labelledby="gta6-careers-heading" tabIndex={0}>
          <table className={styles.careerTable} aria-labelledby="gta6-careers-heading">
            <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
            <tbody>{gta6CareerRows.map(row => {
              const person = gta6Profile(row.role);
              return <tr key={row.role}>
                <th scope="row"><Link prefetch={false} href={gta6ResultPath(locale, row.role)}>{person?.name}</Link><small>{person?.title[locale]}</small></th>
                <td>{row.tag[index]}</td><td>{row.behavior[index]}</td>
                <td><ul>{row.interests.map(letter => <li key={letter}><strong>{letter}</strong> · {gta6CareerDimensions[letter][index]}</li>)}</ul></td>
                <td><ul>{row.jobs.map(([slug, ...labels]) => <li key={slug}><Link prefetch={false} href={`/${locale}/career/jobs/${slug}`}>{labels[index]}</Link></li>)}</ul></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </section>

      <section id="career-tools">
        <h2>{["Explore your real-world career interests", "想进一步了解自己的职业兴趣？", "想更了解自己的職涯興趣？"][index]}</h2>
        <p>{["Pick a tool for the question you want to answer. Each assessment starts separately from the character quiz.", "根据你要弄清的问题选择工具。专业测评需要独立作答，使用职业档案和对比工具也不需要先做娱乐测试。", "先想清楚你要問哪件事，再選工具。職業測驗要另外作答；只想查工作，也可以直接看職業指南。"][index]}</p>
        <div className={styles.toolGrid}>
          {tools.map(tool => <article key={tool.title[0]}><h3>{tool.title[index]}</h3><p>{tool.body[index]}</p><ul>{tool.links.map(([path, ...labels]) => <li key={path}><Link prefetch={false} href={`/${locale}${path}`}>{labels[index]} →</Link></li>)}</ul></article>)}
        </div>
      </section>

      <section id="career-topics">
        <h2>{["GTA 6 character career deep dives", "GTA 6 角色职业发展与职场分工专题", "GTA 6 角色職涯與工作分工專題"][index]}</h2>
        <p>{["Four short reading notes on decisions, handoffs and trade-offs. Each links to the two character guides for more context.", "四条专题导读，从角色之间的取舍看现实工作任务。每条都可继续阅读两份公开角色指南。", "四則專題導讀，聊聊工作中的選擇與交接。想了解更多，可以接著讀兩位角色的公開指南。"][index]}</p>
        <div className={styles.examples}>{gta6CareerTopics.map(topic => (
          <div key={topic.roles[0]}>
            <h3>{topic.title[index]}</h3><p>{topic.summary[index]}</p>
            <div className={styles.topicLinks}>
              {topic.roles.map(id => <Link prefetch={false} key={id} href={gta6ResultPath(locale, id)}>{gta6Profile(id)?.name} →</Link>)}
            </div>
          </div>
        ))}</div>
      </section>
    </>
  );
}
