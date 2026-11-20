import type { DisplayLocale } from "@/lib/i18n/locales";

type LocaleText = readonly [zh: string, traditional: string, en: string];
type Section = readonly [heading: LocaleText, body: LocaleText];

const assessments = {
  career: {
    path: "/career/assessment",
    artwork: "career",
    title: ["免费职业测试：看清偏好，让职业选择更有方向", "免費職業測驗：看清偏好，讓職涯選擇更有方向", "Free Career Test: Get Clearer on What You Want from Work"],
    intro: [
      "不知道从哪类工作开始，或正在几个方向之间犹豫？用约 12–15 分钟，梳理你喜欢的工作活动、偏好的做事方式和在意的条件，为下一步了解、比较和尝试工作建立依据。",
      "不知道從哪類工作開始，或正在幾個方向之間猶豫？用約 12–15 分鐘，整理你喜歡的工作活動、偏好的做事方式和在意的條件，為下一步了解、比較和嘗試工作建立依據。",
      "Considering a career change or weighing a few options? Spend about 12–15 minutes exploring the activities you enjoy, how you prefer to work and the conditions that matter—then use those clues to compare real roles.",
    ],
    sections: [
      [
        ["结果会告诉你什么？", "結果會告訴你什麼？", "What does the career test show?"],
        ["兴趣关心你喜欢做什么，工作方式关心你喜欢怎样做，工作条件关心你希望雇主提供什么。比如你喜欢研究问题，也希望工时稳定。比较职位时，就把研究任务与实际工时分开核对。", "興趣看你喜歡做什麼，工作方式看你偏好怎麼做，工作條件看你希望雇主提供什麼。比方說，你喜歡研究問題，也重視工時穩定。比較職缺時，可把研究任務與實際工時分開確認。", "Interests describe the activities you enjoy, work style describes how you prefer to do them, and working conditions describe what matters to you in a work environment. If you enjoy investigating problems and value predictable hours, check the research duties and actual work schedule separately."],
      ],
      [
        ["94 题职业测试怎么计分？", "94 題職業測驗如何計分？", "How are the 94 questions scored?"],
        ["兴趣、方式和条件分别给出各维度的分数，并显示有效作答数。可以选「不确定／没体验过」，这类回答不计入平均分。当前情况题用于记录背景，不进入这三类分数。", "興趣、工作方式與條件各自呈現分數，並顯示有效作答題數。你可以選「不確定／沒有經驗」，這類作答不列入平均分。現況題用來記錄背景，不納入這三類分數。", "Interests, work style and working conditions have separate scores and answer counts. An unsure or no-experience response is excluded from the average. Current-circumstance questions record context and do not contribute to those scores."],
      ],
      [
        ["如何把结果用到选职业？", "如何用結果探索職涯？", "How can I use the results to explore careers?"],
        ["先挑两个正在考虑的岗位，分别找出实际任务、协作方式和工时、培训等条件。看到分数靠近时，优先用真实经历和试做来判断。结果描述的是你的自评偏好，不能预测录取、绩效或薪资。", "先挑兩個正在考慮的職缺，分別查清楚實際任務、合作方式、工時和培訓條件。分數接近時，回想具體經驗，或試做一項工作任務。結果呈現自評偏好，無法預測錄取、表現或薪資。", "Choose two roles and check their actual tasks, collaboration patterns, schedule and training. When scores are close, use a concrete experience or try a representative task. The scores describe self-reported preferences and do not predict job offers, performance or pay."],
      ],
    ],
    faq: [
      [["做完这份职业测试，能帮我什么？", "完成這份職涯測驗，能幫助我什麼？", "How can this career test help me?"], ["把喜欢的工作活动、偏好的做事方式和在意的工作条件分开梳理，形成比较职业方向的依据。你可以据此查岗位任务、询问协作和工时安排，或试做一项任务，再判断哪些方向值得继续了解。它不会替你决定唯一职业。", "分別整理喜歡的工作活動、偏好的做事方式和在意的工作條件，作為比較職涯方向的依據。你可以據此了解職務內容、詢問協作與工時安排，或試做一項任務，再判斷哪些方向值得繼續探索。測驗不會替你決定唯一職業。", "Clarify the activities you enjoy, how you prefer to work and the working conditions that matter to you. Use those clues to research tasks, ask about team routines and schedules, or try a representative task. The assessment supports exploration rather than choosing one career for you."]],
      [["测试和分数免费吗？", "測驗與分數免費嗎？", "Is the career test free?"], ["答题、六维职业兴趣概览与初步职业候选免费，无需注册。完整深度报告为单次可选付费，付款前会显示价格与包含内容。", "作答、六維職涯興趣概覽與初步職涯選項免費，無須註冊。完整深度報告為單次選購，付款前會顯示價格及內容。", "The test, six-interest overview and initial career suggestions are free, with no signup. The deep report is an optional one-time purchase; review the price and contents before paying."]],
      [["职业测试和霍兰德测试有什么区别？", "職涯測驗與霍蘭德測驗有何不同？", "How does this differ from the Holland Code test?"], ["60 题霍兰德测试聚焦 RIASEC 六类活动兴趣。94 题职业测试同时查看兴趣、做事方式和工作条件。", "60 題霍蘭德測驗聚焦 RIASEC 六類活動興趣。94 題職涯測驗同時涵蓋興趣、做事方式與工作條件。", "The 60-question Holland Code test focuses on six RIASEC interests. This 94-question assessment also covers work style and working conditions."]],
      [["这是职业能力测验吗？", "這是職業能力測驗嗎？", "Is this a career aptitude test?"], ["这是一份兴趣与偏好自评，不测认知能力或专业技能，也不判断任职资格。0–100 分不是能力分、职业适配百分比或录用概率；探索岗位时，还需要另外核实技能、资格和实际工作条件。", "這是一份興趣與偏好自評，不測認知能力或專業技能，也不判斷任職資格。0–100 分不是能力分數、職位適配百分比或錄取機率；探索職缺時，仍須另行確認技能、資格與實際工作條件。", "This is a self-report assessment of interests, work style and working conditions, not a test of cognitive ability or technical skills. Scores are not ability ratings, job-match percentages or hiring probabilities. Check skills and qualifications separately when exploring a role."]],
    ],
  },
  archetypes: {
    path: "/tests/jung-archetypes",
    artwork: "archetypes",
    title: ["免费荣格十二原型测试（48 题）", "免費榮格十二原型測驗（48 題）", "Free Jungian Archetype Test: 12 Archetypes, 48 Questions"],
    intro: [
      "48 道情境自评，约 10 分钟。查看十二原型的得分分布，了解哪些内在动机和角色表达与你近期的经历更吻合。作答与基础结果免费，完整报告可选单次付费解锁。",
      "48 道情境自評，約 10 分鐘。查看十二原型分數，了解哪些內在動機與角色表達更貼近你的近期經驗。作答與基礎結果免費，完整報告可選單次付費解鎖。",
      "Rate 48 scenarios in about 10 minutes and get a free basic score profile across 12 archetypes. See which motivations and ways of taking on roles best describe your recent experiences.",
    ],
    sections: [
      [
        ["怎样读十二原型结果？", "如何閱讀十二原型結果？", "How should I read the 12 archetype scores?"],
        ["先看全部十二项，再看较高原型的核心渴望、团队协作方式和过度使用时可能遇到的困难。比如创造者和探索者都高，可以回想你更想把点子做成作品，还是更想试走新的路线。", "先看完整的十二項分數，再讀較高原型的核心渴望、團隊合作方式，以及過度使用時可能遇到的困難。若創造者和探索者都高，回想你更想把點子做成作品，還是更想走一條新路。", "Start with all 12 scores, then read the motivations, teamwork patterns and potential blind spots of the higher ones. If Creator and Explorer both score high, recall whether you wanted to turn an idea into something tangible or try a new path."],
      ],
      [
        ["原型分数是怎么计算的？", "原型分數如何計算？", "How are archetype scores calculated?"],
        ["回想过去三个月，按五档判断情境描述与你的符合程度。每个原型有四题，计分后独立换算为 0–100。遇到接近或并列的高分时，报告会提示你一起对照。", "回想過去三個月，依五個等級評估情境描述與自己的符合程度。每個原型有四題，計分後各自換算為 0–100。高分接近或並列時，報告會提示你一併比較。", "Rate how well each scenario fits your experience over the past three months. Each archetype has four items and is scaled independently to 0–100. The report flags close and tied scores for comparison."],
      ],
      [
        ["题本来源和使用边界", "題本來源與使用界線", "Sources and limits"],
        ["费马原创题本参考荣格的原型概念与 Carol Pearson 的十二原型应用框架。结果用于自我反思，分数尚未使用人群常模校准，也不用于诊断。", "費馬原創題本參考榮格的原型概念與 Carol Pearson 的十二原型應用架構。結果供自我反思，分數尚未以人群常模校準，也不供診斷使用。", "FermatMind’s original questions draw on Jung’s archetype concept and Carol Pearson’s applied framework. Scores support self-reflection, have no population norms and are not intended for diagnosis."],
      ],
    ],
    faq: [
      [["我只有一个原型吗？", "我只有一種原型嗎？", "Do I have only one archetype?"], ["报告呈现全部十二项。高分相近时，可以比较不同动机在生活和工作中分别何时出现。", "報告呈現全部十二項。高分相近時，可比較不同動機在生活或工作中何時出現。", "The report shows all 12. If two scores are close, compare when each motivation comes up in your life and work."]],
      [["完整原型报告免费吗？", "完整原型報告免費嗎？", "Are the full archetype results free?"], ["作答与基础原型分布免费，完整报告可选单次付费解锁。", "作答與基礎原型分布免費，完整報告可選單次付費解鎖。", "The test and basic archetype profile are free. The full report is an optional one-time purchase."]],
    ],
    source: ["Carol Pearson 的十二原型系统", "Carol Pearson 的十二原型系統", "Carol Pearson’s Twelve Archetype System"],
    sourceUrl: "https://carolspearson.com/about/the-pearson-12-archetype-system-human-development-and-evolution",
  },
  functions: {
    path: "/tests/jung-cognitive-functions",
    artwork: "functions",
    title: ["免费荣格八维认知功能测试（64 题）", "免費榮格八維認知功能測驗（64 題）", "Free Jung Cognitive Functions Test: 8 Functions, 64 Questions"],
    intro: [
      "64 道生活与工作情境题，约 13 分钟。免费查看 Ni、Ne、Si、Se、Ti、Te、Fi、Fe 八维分布；完整报告可选单次付费解锁。",
      "64 道生活與工作情境題，約 13 分鐘。免費查看 Ni、Ne、Si、Se、Ti、Te、Fi、Fe 八維分數；完整報告可選單次付費解鎖。",
      "Rate 64 everyday and work scenarios in about 13 minutes. Get free scores for Ni, Ne, Si, Se, Ti, Te, Fi and Fe. The full report is an optional one-time purchase.",
    ],
    sections: [
      [
        ["八维结果怎么看？", "如何閱讀八維結果？", "How should I read the eight function scores?"],
        ["先比较八维分布，再读 Ni／Se、Ne／Si、Ti／Fe、Te／Fi 四组分差。某组分差很小时，可以对照两个做决定的经历，看看你在什么条件下采用哪种做法。", "先比較八維分布，再看 Ni／Se、Ne／Si、Ti／Fe、Te／Fi 四組分差。若某組分差很小，回想兩次具體決定，比較自己在什麼條件下採用哪種做法。", "Read the full profile before comparing Ni/Se, Ne/Si, Ti/Fe and Te/Fi. If an axis is close, recall two decisions and look at the circumstances in which you used each approach."],
      ],
      [
        ["功能轴和类型候选怎么算？", "功能軸與類型候選如何計算？", "How are the axes and type candidates calculated?"],
        ["回想过去三个月类似情境，每种功能用八题独立换算为 0–100。四组功能轴显示两维分差。费马以功能栈的配对关系对候选排序；分布接近时，结果会提示摇摆或资料不足。", "回想過去三個月的類似情境，每項功能以八題獨立換算為 0–100。四組功能軸呈現兩個分數的差距。費馬依功能堆疊的配對關係排序；分布接近時，會提示結果容易變動或資訊不足。", "Rate similar experiences from the past three months. Eight items are scaled independently to 0–100 for each function. The four axes show score differences, and a function-stack matching rule ranks possible types. Close profiles can produce unstable or insufficient evidence."],
      ],
      [
        ["它和 MBTI 四组偏好有什么区别？", "它與 MBTI 四組偏好有何不同？", "How does this differ from an MBTI-style assessment?"],
        ["八维题本比较你自评使用八种做法的频率。MBTI 风格题本按四组偏好解释结果。可以对照具体经历理解两份报告，类型候选只代表本题本与模型下的匹配，分数也没有人群常模。", "八維題本比較你自評使用八種做法的頻率。MBTI 風格題本則依四組偏好解讀。可以用具體經驗對照兩份報告；候選類型只表示在本題本與模型中的配對，分數也還沒有人群常模。", "This questionnaire compares how often you report using eight approaches. An MBTI-style questionnaire describes four preference pairs. Compare the two reports against real examples. Candidate types are matches under this model and the scores have no population norms."],
      ],
    ],
    faq: [
      [["八维结果一定会给出一个类型吗？", "八維結果一定會給出一種類型嗎？", "Will the test always assign a type?"], ["各功能分数太接近时，报告会提示候选容易变化，或显示本次分布不足以给出候选。", "各功能分數太接近時，報告會提示候選容易變動，或顯示這次分布不足以提供候選。", "When scores are very close, the report can flag unstable candidates or withhold the candidate list."]],
      [["八维测试和报告免费吗？", "八維測驗與報告免費嗎？", "Is the full cognitive functions report free?"], ["64题作答与基础八维分数免费，完整报告可选单次付费解锁。", "64題作答與基礎八維分數免費，完整報告可選單次付費解鎖。", "All 64 questions and basic function scores are free. The full report is an optional one-time purchase."]],
    ],
    source: ["荣格《心理类型》", "榮格《心理類型》", "Jung’s Psychological Types"],
    sourceUrl: "https://press.princeton.edu/books/hardcover/9780691097701/collected-works-of-c-g-jung-volume-6",
  },
} as const satisfies Record<string, {
  path: string; artwork: "career" | "archetypes" | "functions";
  title: LocaleText; intro: LocaleText; sections: readonly Section[]; faq: readonly Section[];
  source?: LocaleText; sourceUrl?: string;
}>;

export type FreeAssessment = keyof typeof assessments;

export function jungAssessmentForSlug(slug: string): FreeAssessment | null {
  if (slug === "jung-archetypes") return "archetypes";
  if (slug === "jung-cognitive-functions") return "functions";
  return null;
}

export function freeAssessmentCopy(key: FreeAssessment, locale: DisplayLocale) {
  const entry = assessments[key];
  const index = locale === "zh" ? 0 : locale === "zh-TW" ? 1 : 2;
  return {
    ...entry,
    title: entry.title[index],
    searchTitle: key === "career" ? ["免费职业测试（94题）｜RIASEC职业兴趣、工作方式与职业探索", "免費職業測驗（94題）｜RIASEC職涯興趣與工作偏好", "Free Career Test (94 Questions) | RIASEC Interests & Work Preferences"][index] : entry.title[index],
    intro: entry.intro[index],
    sections: entry.sections.map(([heading, body]) => ({ heading: heading[index], body: body[index] })),
    faq: entry.faq.map(([question, answer]) => ({ question: question[index], answer: answer[index] })),
    source: "source" in entry ? { label: entry.source[index], href: entry.sourceUrl } : null,
  };
}

export const JUNG_TEST_SLUG = "jung-test";
export const JUNG_TEST_PATH = "/tests/jung-test";
export const JUNG_FORMS = ["archetypes", "functions"] as const;

const jungTitle: LocaleText = ["荣格测试", "榮格測驗", "Jung Test"];
const jungSearchTitle: LocaleText = [
  "免费荣格测试：十二原型 48 题与八维认知功能 64 题",
  "免費榮格測驗：十二原型 48 題與八維認知功能 64 題",
  "Free Jung Test: 12 Archetypes & 8 Cognitive Functions",
];
const jungIntro: LocaleText = [
  "想了解什么在驱动你，选 48 题十二原型测试。想比较自己如何获取信息和做决定，选 64 题八维认知功能测试。两套题独立作答，基础结果免费，完整报告可选单次付费解锁。",
  "想知道什麼在驅動你，可選 48 題十二原型測驗。想比較自己如何取得資訊與做決定，可選 64 題八維認知功能測驗。兩套題可分開作答，基礎結果免費，完整報告可選單次付費解鎖。",
  "Choose the 48-question archetype test to explore your motives, or the 64-question cognitive functions test to compare how you take in information and make decisions. Both tests and basic results are free; full reports are optional one-time purchases.",
];
export function jungLandingCopy(locale: DisplayLocale) {
  const index = locale === "zh" ? 0 : locale === "zh-TW" ? 1 : 2;
  return { path: JUNG_TEST_PATH, title: jungTitle[index], searchTitle: jungSearchTitle[index], intro: jungIntro[index] };
}
