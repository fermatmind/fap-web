import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { displayNavigationPath } from "@/lib/i18n/traditionalRoutes";
import type { AssessmentLandingChoice } from "./AssessmentLandingIntro";
import styles from "./career-assessment-intro.module.css";

type Props = {
  locale: DisplayLocale;
  choice: AssessmentLandingChoice;
  faq: { question: string; answer: string }[];
  rows: { label: string; interpretation: string; example: string }[];
};

export function CareerAssessmentContent({ locale, choice, faq, rows }: Props) {
  const t = (zh: string, tw: string, en: string) => locale === "en" ? en : locale === "zh-TW" ? tw : zh;
  const readingLocale = locale === "zh-TW" ? "zh" : locale;
  const navigationPath = (path: string) => displayNavigationPath(path, locale);
  const benefits = [
    {
      title: t("找到让你愿意投入的事", "找到讓你願意投入的事", "Find the work you want to spend time on"),
      body: t("从具体活动出发，发现哪些任务更能吸引你，把宽泛的“感兴趣”变成值得继续了解的线索。", "從具體活動出發，發現哪些任務更能吸引你，把籠統的「感興趣」變成值得繼續了解的線索。", "Look beyond job titles. Notice which activities draw you in and use them to focus your search."),
      prompt: t("我愿意把时间花在哪些任务上？", "我願意把時間花在哪些任務上？", "Which tasks would I want more of?"),
    },
    {
      title: t("比较工作，有自己的依据", "比較工作，有自己的依據", "Compare roles on what matters to you"),
      body: t("把做事方式和工作条件也放进考虑。相似的职位名称，可能对应很不一样的日常。", "把做事方式和工作條件也納入考量。相似的職稱，可能對應很不一樣的日常。", "Consider how you like to work and the conditions you value. Similar titles can mean very different days."),
      prompt: t("除了喜欢，我还在意什么？", "除了喜歡，我還在意什麼？", "What else do I need from a role?"),
    },
    {
      title: t("让下一步更具体", "讓下一步更具體", "Give your next step a clearer focus"),
      body: t("带着偏好线索去读岗位介绍、与从业者交流，或尝试一项真实任务，逐步判断哪些方向值得继续。", "帶著偏好線索閱讀職缺介紹、與從業者交流，或嘗試一項實際任務，逐步判斷哪些方向值得繼續。", "Use your preferences to guide role research, conversations and a small practical trial before making a bigger decision."),
      prompt: t("接下来查什么、问什么、试什么？", "接下來查什麼、問什麼、試什麼？", "What should I research, ask or try next?"),
    },
  ];
  const situations = [
    [t("还没有明确方向", "還沒有明確方向", "You are unsure where to start"), t("先从愿意做的活动入手，找出值得了解的工作内容，再逐步接触具体职业。", "先從願意做的活動入手，找出值得了解的工作內容，再逐步接觸具體職業。", "Start with activities that appeal to you, then explore the roles in which those activities show up.")],
    [t("在几个选择之间犹豫", "在幾個選擇之間猶豫", "You have a few options in mind"), t("把兴趣、协作方式、工时和学习支持等分开考虑，看清还需要核实哪些差别。", "把興趣、合作方式、工時和學習支持等分開考慮，看清還需要確認哪些差別。", "Compare tasks, collaboration, schedules and learning support separately to see what you still need to find out.")],
    [t("想换工作，却说不清想换什么", "想換工作，卻說不清想換什麼", "You want a change, but cannot yet name it"), t("回想消耗你的是工作内容、做事方式，还是工作条件，为下一次选择梳理重点。", "回想消耗你的是工作內容、做事方式，還是工作條件，為下一次選擇整理重點。", "Reflect on whether the friction comes from the tasks, the way work is organized or the conditions around it.")],
  ];
  const steps = [
    [t("认识偏好", "認識偏好", "Notice a preference"), t("假设你喜欢分析资料，也偏好专注处理任务，并重视可预期的工时。", "假設你喜歡分析資料，也偏好專注處理任務，並重視可預期的工時。", "Suppose you enjoy analyzing information, prefer focused work and value predictable hours.")],
    [t("比较真实工作", "比較實際工作", "Look beyond the title"), t("两份职位都写着“分析”。在这个情境中，一份以持续研究为主，另一份需要频繁响应临时需求。", "兩份職缺都寫著「分析」。在這個情境中，一份以持續研究為主，另一份需要頻繁回應臨時需求。", "Both postings mention analysis. In this example, one involves sustained research; the other includes frequent ad hoc requests.")],
    [t("带着问题去核实", "帶著問題去確認", "Ask a more useful question"), t("分别问：每周有多少独立分析时间？临时任务有多频繁？忙季工时如何安排？再决定要不要深入了解。", "分別問：每週有多少獨立分析時間？臨時任務有多頻繁？旺季工時如何安排？再決定是否深入了解。", "Ask each team about focused analysis time, ad hoc requests and busy-period schedules before deciding what to explore further.")],
  ];

  return <div className={styles.body}>
    <section className={styles.section} aria-labelledby="career-benefits-title">
      <p className={styles.kicker}>{t("为什么值得花这十几分钟", "為什麼值得花這十幾分鐘", "WHY MAKE THE TIME")}</p>
      <h2 id="career-benefits-title">{t("把“我想做什么”，变成可以继续探索的问题", "把「我想做什麼」，變成可以繼續探索的問題", "Make your career questions easier to act on")}</h2>
      <div className={styles.benefitColumns}>
        {benefits.map((item, index) => <article key={item.title}>
          <span className={styles.number} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3><p>{item.body}</p><p className={styles.question}>{item.prompt}</p>
        </article>)}
      </div>
    </section>

    <section className={styles.softSection} aria-labelledby="career-situations-title">
      <div className={styles.section}>
        <div className={styles.editorialSplit}>
          <div><p className={styles.kicker}>{t("从你的选择时刻出发", "從你的選擇時刻出發", "START WITH YOUR SITUATION")}</p>
            <h2 id="career-situations-title">{t("你现在，卡在哪一步？", "你現在，卡在哪一步？", "Where are you getting stuck?")}</h2>
            <p>{t("选专业、找第一份工作或考虑转行，都可以先梳理自己的偏好，再把它们放回真实的工作情境中比较。", "選科系、找第一份工作或考慮轉職，都可以先整理自己的偏好，再放回實際工作情境中比較。", "Whether you are exploring your first role or considering a change, understanding your preferences gives you a starting point for research.")}</p>
          </div>
          <div className={styles.situations}>{situations.map(([heading, body]) => <article key={heading}><h3>{heading}</h3><p>{body}</p></article>)}</div>
        </div>
        <p className={styles.experienceNote}>{t("没有工作经验也可以开始。遇到没体验过的活动，可以如实选“不确定／没体验过”，不用猜一个答案。", "沒有工作經驗也可以開始。遇到沒體驗過的活動，可以如實選「不確定／沒體驗過」，不用猜答案。", "No work experience? You can still start. Choose “unsure / no experience” for unfamiliar activities instead of guessing.")}</p>
      </div>
    </section>

    <section className={styles.section} aria-labelledby="career-example-title">
      <p className={styles.kicker}>{t("从了解自己，到了解工作", "從了解自己，到了解工作", "FROM SELF-REFLECTION TO ROLE RESEARCH")}</p>
      <h2 id="career-example-title">{t("同样叫“分析”，每天做的事可能不同", "同樣叫「分析」，每天做的事可能不同", "Two roles can share a title and feel very different")}</h2>
      <p className={styles.exampleNote}>{t("以下为虚构探索情境，用来说明如何使用偏好线索；不是用户评价，也不代表某类岗位都有相同安排。", "以下為虛構探索情境，說明如何使用偏好線索；並非使用者評價，也不代表某類職位都有相同安排。", "An illustrative scenario, not a customer story. The working arrangements below are fictional and do not describe every role with these titles.")}</p>
      <ol className={styles.steps}>{steps.map(([heading, body], index) => <li key={heading}><span aria-hidden>{String(index + 1).padStart(2, "0")}</span><div><h3>{heading}</h3><p>{body}</p></div></li>)}</ol>
      <p className={styles.takeaway}>{t("你要带走的，是比较工作的依据，以及下一步值得问的问题。选择仍由你结合经历和实际机会来判断。", "你要帶走的，是比較工作的依據，以及下一步值得問的問題。選擇仍由你結合經驗與實際機會判斷。", "The aim is to build your own criteria and better questions. Your experience and the opportunities available still shape the decision.")}</p>
      <Link className={styles.textLink} href={`/${readingLocale}/reports/samples/career94`} prefetch={false}>{t("在独立页面查看报告示例", "在獨立頁面查看報告範例（簡體中文）", "Explore the sample on its own page")} <ArrowRight size={16} aria-hidden /></Link>
    </section>

    <section className={styles.methodSection} id="career-method" aria-labelledby="career-method-title">
      <div className={styles.section}>
        <div className={styles.methodHeading}><div><p className={styles.kicker}>{t("方法与依据", "方法與依據", "WHAT IS BEHIND THE QUESTIONS")}</p>
          <h2 id="career-method-title">{t("94 题，分别梳理三类偏好", "94 題，分別整理三類偏好", "94 questions. Three distinct areas of reflection.")}</h2></div>
          <p>{t("费马职业测试将职业兴趣、工作方式和工作条件分开评估，另用背景题记录当前情况。兴趣部分采用霍兰德 RIASEC 六维框架。", "費馬職涯測驗將職涯興趣、工作方式與工作條件分開評估，另以背景題記錄現況。興趣部分採用霍蘭德 RIASEC 六維架構。", "FermatMind’s career assessment considers interests, work style and working conditions separately, with context questions about your current situation. The interest section uses the six RIASEC dimensions.")}</p>
        </div>
        <dl className={styles.questionnaire}>{rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.interpretation}</dd></div>)}</dl>
        <div className={styles.boundary}>
          <h3>{t("怎样理解分数", "如何理解分數", "How to interpret the scores")}</h3>
          <p>{t("0–100 分描述本次自评的兴趣或偏好，不是能力分、职业适配百分比或人群百分位。分数接近时，可以保留多个方向，用经历与实际任务继续比较。", "0–100 分描述這次自評的興趣或偏好，不是能力分數、職位適配百分比或人群百分位。分數接近時，可以保留多個方向，以經驗與實際任務繼續比較。", "Scores from 0 to 100 describe self-reported interests or preferences. They are not ability scores, match percentages or population percentiles. Keep close-scoring directions open and compare them through experience and practical tasks.")}</p>
          <p>{t("理论参考：", "理論參考：", "Framework reference: ")}<a href="https://www.onetcenter.org/reports/IP_Manual.html">O*NET Interest Profiler Manual</a>{t("。该手册的研究针对 O*NET 量表，不代表费马 94 题题本已获得同等验证。", "。該手冊的研究針對 O*NET 量表，不代表費馬 94 題題本已獲同等驗證。", ". Research on the O*NET instrument does not establish equivalent validation for FermatMind’s 94-question questionnaire.")}</p>
          <div className={styles.methodLinks}>
            <Link href={navigationPath("/method-boundaries")}>{t("方法与边界", "方法與界線", "Methods and limits")} ↗</Link>
            <Link href={navigationPath("/item-design-notes")}>{t("题目设计说明", "題目設計說明", "Question design")} ↗</Link>
          </div>
        </div>
      </div>
    </section>

    <section className={styles.section} id="assessment-faq" aria-labelledby="career-faq-title">
      <div className={styles.editorialSplit}><div><p className={styles.kicker}>{t("开始前，你可能想知道", "開始前，你可能想知道", "BEFORE YOU START")}</p>
        <h2 id="career-faq-title">{t("关于这份职业测试", "關於這份職涯測驗", "A few practical questions")}</h2></div>
        <div className={styles.faqList}>{faq.map(({ question, answer }) => <details key={question}><summary>{question}<Plus size={18} aria-hidden /></summary><p>{answer}</p></details>)}</div>
      </div>
    </section>

    <section className={styles.closing} aria-labelledby="career-closing-title">
      <div className={styles.section}>
        <p className={styles.kicker}>{t("先走出一个具体的小步骤", "先走出一個具體的小步驟", "YOUR NEXT STEP CAN START HERE")}</p>
        <h2 id="career-closing-title">{t("先看清自己的偏好，再去了解值得探索的工作", "先看清自己的偏好，再了解值得探索的工作", "Get clearer on your preferences. Then explore what comes next.")}</h2>
        <p>{t("留出约 12–15 分钟，按真实想法作答。你不需要现在就决定未来的职业。", "留出約 12–15 分鐘，依真實想法作答。你不需要現在就決定未來的職業。", "Set aside about 12–15 minutes and answer honestly. You do not need to decide your whole career today.")}</p>
        <TrackedEntryCtaLink href={choice.href!} prefetch={false} eventProperties={choice.eventProperties ?? {}} className={styles.cta} data-testid="free-assessment-start-closing">{choice.label}<ArrowRight size={19} aria-hidden /></TrackedEntryCtaLink>
        <p className={styles.note}>{t("无需注册 · 兴趣概览免费 · 深度报告可选付费", "無須註冊 · 興趣概覽免費 · 深度報告可選購", "No signup · Free interest overview · Optional paid deep report")}</p>
        <nav className={styles.related} aria-label={t("继续探索", "繼續探索", "Continue exploring")}>
          <Link href={navigationPath("/tests/holland-career-interest-test-riasec")}>{t("只想先了解兴趣？做 60 题霍兰德测试", "想先了解興趣？做 60 題霍蘭德測驗", "Just exploring interests? Try the 60-question Holland test")} ↗</Link>
          <Link href={navigationPath("/career/tests")}>{t("不确定选哪种测试？比较职业测试", "不確定選哪種測驗？比較職涯測驗", "Not sure which assessment to take? Compare career tests")} ↗</Link>
          <Link href={navigationPath("/career")}>{t("想先看看真实工作？浏览职业库", "想先看看實際工作？瀏覽職涯資料庫", "Want to research real work first? Browse careers")} ↗</Link>
        </nav>
      </div>
    </section>
  </div>;
}
