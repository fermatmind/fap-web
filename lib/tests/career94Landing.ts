import type { DisplayLocale } from "@/lib/i18n/locales";

type Text = readonly [zh: string, en: string, tw: string];
export const careerText = (locale: DisplayLocale, text: Text) => text[locale === "en" ? 1 : locale === "zh-TW" ? 2 : 0];

export const careerJobs = {
  geographers: ["地理学家", "Geographers", "地理學家"],
  astronomers: ["天文学家", "Astronomers", "天文學家"],
  "biochemists-and-biophysicists": ["生物化学家与生物物理学家", "Biochemists and biophysicists", "生物化學家與生物物理學家"],
  electricians: ["电工", "Electricians", "電工"],
  "aircraft-mechanics-and-service-technicians": ["飞机维修机械员与技术员", "Aircraft mechanics and service technicians", "飛機維修機械員與技術員"],
  "light-truck-drivers": ["轻型卡车司机", "Light truck drivers", "輕型卡車駕駛"],
  "data-scientists": ["数据科学家", "Data scientists", "資料科學家"],
  "graphic-designers": ["平面设计师", "Graphic designers", "平面設計師"],
  "educational-guidance-and-career-counselors-and-advisors": ["教育指导与职业顾问", "Educational and career counselors", "教育輔導與職涯顧問"],
  "insurance-sales-agents": ["保险销售人员", "Insurance sales agents", "保險業務人員"],
  "loan-interviewers-and-clerks": ["贷款受理与文书人员", "Loan interviewers and clerks", "貸款受理與文書人員"],
  "telephone-operators": ["电话接线员", "Telephone operators", "電話接線員"],
} as const satisfies Record<string, Text>;

type Job = keyof typeof careerJobs;
type Direction = { code: string; name: Text; drive: Text; energy: Text; friction: Text; jobs: readonly Job[] };
export const careerDirections: readonly Direction[] = [
  { code: "R", name: ["现实型", "Realistic", "實作型"], drive: ["动手，把眼前的问题做实", "Make something work in the real world", "動手解決眼前的問題"],
    energy: ["排查设备、装配实物或在现场处理变化。", "Troubleshooting equipment, assembling parts or solving problems on site.", "排查設備、組裝實物，或在現場處理變化。"],
    friction: ["整周只做文书，很少有机会接触实物。", "A week of paperwork with little hands-on work.", "整週都在處理文書，很少有機會動手。"],
    jobs: ["electricians", "aircraft-mechanics-and-service-technicians", "light-truck-drivers"] },
  { code: "I", name: ["研究型", "Investigative", "研究型"], drive: ["追问原因，找到能验证的解释", "Follow the evidence to an explanation", "追問原因，找出能驗證的解釋"],
    energy: ["清理数据、拆解机制，安静地验证一个猜想。", "Cleaning data, unpacking how things work and testing a hunch.", "整理資料、拆解機制，專心驗證一個猜想。"],
    friction: ["思路反复被打断，或需要在证据不足时拍板。", "Frequent interruptions or decisions before the evidence is in.", "思路一再被打斷，或得在證據不足時下決定。"],
    jobs: ["data-scientists"] },
  { code: "A", name: ["艺术型", "Artistic", "藝術型"], drive: ["把想法变成自己的表达", "Give an idea a distinctive form", "把想法變成自己的表達"],
    energy: ["探索视觉方向、试做不同方案，再根据反馈修改。", "Exploring visual directions, prototyping and revising from feedback.", "探索視覺方向、試做不同方案，再依回饋修改。"],
    friction: ["长期照模板重复，很少有机会决定怎么做。", "Repeating a fixed template with little room for judgment.", "長期照著版型重複，很少能決定怎麼做。"],
    jobs: ["graphic-designers"] },
  { code: "S", name: ["社会型", "Social", "社會型"], drive: ["帮人弄清下一步", "Help people find their next step", "幫人弄清楚下一步"],
    energy: ["一对一辅导、教学或帮团队成员克服具体困难。", "Guiding someone one-on-one, teaching or helping a teammate through a problem.", "一對一輔導、教學，或幫同事解決具體困難。"],
    friction: ["很少接触服务对象，也看不到帮助是否有效。", "Limited contact with the people you serve or the impact of your help.", "很少接觸服務對象，也看不到協助有沒有效果。"],
    jobs: ["educational-guidance-and-career-counselors-and-advisors"] },
  { code: "E", name: ["企业型", "Enterprising", "企業型"], drive: ["聚集资源，把事情往前推", "Bring people and resources together to move things forward", "串起資源，把事情往前推"],
    energy: ["沟通方案、谈判取舍、推动项目达成目标。", "Pitching a plan, negotiating trade-offs and carrying a project to its goal.", "溝通方案、協商取捨，推動專案達成目標。"],
    friction: ["负责结果，却很少能参与决策和协调资源。", "Owning an outcome with little say over decisions or resources.", "要負責成果，卻很少能參與決策或調度資源。"],
    jobs: ["insurance-sales-agents"] },
  { code: "C", name: ["常规型", "Conventional", "事務型"], drive: ["把复杂的事整理得清清楚楚", "Make complex work orderly and reliable", "把複雜的事整理清楚"],
    energy: ["核实资料、按流程交接、找到规则里遗漏的一步。", "Verifying records, managing handoffs and catching a missing step.", "核對資料、按流程交接，找出遺漏的步驟。"],
    friction: ["标准反复变动、职责模糊，整天临时救火。", "Shifting rules, unclear ownership and constant fire drills.", "標準反覆變動、分工模糊，整天臨時救火。"],
    jobs: ["loan-interviewers-and-clerks", "telephone-operators"] },
];

type Sample = { name: Text; code: string; tie: string; scores: readonly [number, number, number, number, number, number]; jobs: readonly Job[] };
export const careerSamples: readonly Sample[] = [
  { name: ["研创探索型", "Research & discovery", "研創探索型"], code: "IRA", tie: "A/C", scores: [75, 100, 50, 25, 25, 50], jobs: ["geographers", "astronomers", "biochemists-and-biophysicists"] },
  { name: ["组织赋能型", "People & coordination", "組織協作型"], code: "SEC", tie: "E/C", scores: [25, 50, 50, 100, 75, 75], jobs: ["educational-guidance-and-career-counselors-and-advisors", "insurance-sales-agents", "loan-interviewers-and-clerks"] },
  { name: ["工程造物型", "Engineering & making", "工程實作型"], code: "RIC", tie: "I/C", scores: [100, 75, 25, 25, 50, 75], jobs: ["electricians", "aircraft-mechanics-and-service-technicians", "light-truck-drivers"] },
];

export const careerLayers = [
  { count: 42, title: ["职业兴趣", "Interests", "職涯興趣"], lead: ["你愿意反复做什么？", "Which activities would you gladly do again?", "你願意反覆做哪些事？"],
    axes: careerDirections.map(direction => direction.name) },
  { count: 20, title: ["工作方式", "Work style", "工作方式"], lead: ["同一项任务，你更喜欢怎么做？", "How would you prefer to do the same task?", "同一件事，你比較喜歡怎麼做？"],
    axes: [["协作", "Coordination", "協作"], ["方法自主", "Independence in methods", "方法自主"], ["任务切换", "Task switching", "任務切換"], ["对外接触", "External contact", "對外接觸"], ["身体活动", "Physical activity", "身體活動"]] },
  { count: 24, title: ["工作条件", "Job conditions", "工作條件"], lead: ["哪些条件值得提前问清？", "What would you need to check before saying yes?", "哪些條件值得先問清楚？"],
    axes: [["可预测工时", "Predictable hours", "可預期工時"], ["学习支持", "Learning support", "學習資源"], ["稳定收入", "Stable income", "穩定收入"], ["可见成效", "Visible impact", "可見成效"], ["晋升路径", "Advancement path", "升遷路徑"], ["地点灵活性", "Location flexibility", "地點彈性"]] },
  { count: 8, title: ["当前处境", "Current situation", "目前處境"], lead: ["现阶段有哪些门槛或限制？", "What constraints matter at this stage?", "現階段有哪些門檻或限制？"],
    axes: [["职业阶段", "Career stage", "職涯階段"], ["经验", "Experience", "經驗"], ["教育", "Education", "學歷"], ["探索目标", "Exploration goal", "探索目標"], ["学习预算", "Training budget", "學習預算"], ["已有经验领域", "Experience areas", "既有經驗領域"], ["夜班", "Night shifts", "夜班"], ["出差", "Travel", "出差"]] },
] as const satisfies ReadonlyArray<{ count: number; title: Text; lead: Text; axes: readonly Text[] }>;

const holland = "/tests/holland-career-interest-test-riasec";
const mbti = "/tests/mbti-personality-test-16-personality-types";
const c2 = "/holland-test/pdf-download";
export const careerComparison = [
  { name: ["费马职业测试", "FermatMind Career94", "費馬職業測驗"], goal: ["同时梳理兴趣、工作方式、工作条件和当前处境。", "Explore interests, work style, job conditions and current constraints.", "一起整理興趣、工作方式、工作條件與目前處境。"], time: ["94 题 · 约 12–15 分钟", "94 questions · About 12–15 min", "94 題 · 約 12–15 分鐘"], audience: ["要选专业、求职或转行，还想比较真实工作条件。", "Choosing a major, a first job or a career change with practical constraints.", "想選科系、求職或轉職，也想比較實際工作條件。"], href: null },
  { name: ["霍兰德职业兴趣测试", "Holland Code Career Interest Test", "霍蘭德職業興趣測驗"], goal: ["快速看六维活动兴趣和三字兴趣代码。", "Identify your six activity interests and three-letter Holland Code.", "快速了解六類活動興趣與三字代碼。"], time: ["60 题 · 约 8 分钟", "60 questions · About 8 min", "60 題 · 約 8 分鐘"], audience: ["想先知道愿意尝试哪类活动。", "Anyone looking for a quick starting point on activity interests.", "想先知道自己願意嘗試哪些活動。"], href: holland },
  { name: ["MBTI 人格测试", "MBTI-style personality test", "MBTI 人格測驗"], goal: ["理解精力、信息、决策与安排的四组偏好。", "Explore four preferences for energy, information, decisions and structure.", "了解精力、資訊、決策和安排的四組偏好。"], time: ["93 题约 10 分钟 · 144 题约 15 分钟", "93 questions ≈ 10 min · 144 questions ≈ 15 min", "93 題約 10 分鐘 · 144 題約 15 分鐘"], audience: ["想理解沟通习惯和协作差异。", "Anyone reflecting on communication and collaboration.", "想理解溝通習慣與協作差異。"], href: mbti },
] as const satisfies ReadonlyArray<{ name: Text; goal: Text; time: Text; audience: Text; href: string | null }>;

export const careerScenarios = [
  { title: ["选专业或转专业", "Choose a major", "選科系或轉系"], text: ["挑两个方向，比较三门核心课、实践比重和毕业去向。先看自己愿不愿意做那些作业和项目。", "Compare three core courses, the balance of practical work and typical graduate paths. Would you want to do those projects?", "挑兩個方向，比較三門核心課、實作比重與畢業出路。先想想你願不願意做那些作業和專題。"], links: [["/career/guides/how-to-choose-college-major", ["选专业指南", "Guide to choosing a major", "選系指南"]], ["/career/compare", ["比较两个职业", "Compare two careers", "比較兩個職業"]]] },
  { title: ["找第一份工作", "Find a first job", "找第一份工作"], text: ["拿两份同城、同级的招聘说明，逐项核对日常任务、工时、带教方式和新人需要具备的技能。", "Compare two entry-level listings in the same area. Check daily tasks, hours, onboarding support and entry requirements.", "找兩份同地區、同職級的職缺，核對日常任務、工時、新人培訓與入職要求。"], links: [["/career/guides/how-to-find-right-career-direction", ["找到职业方向", "Find a direction", "找到職涯方向"]], [c2, ["填写探索工作表", "Use the exploration worksheet", "填寫探索工作表"]]] },
  { title: ["想转行，先试一小步", "Test a career change", "想轉職，先試一小步"], text: ["先分清让你耗尽的是工作内容还是工时、支持或晋升条件。兴趣接近时，各试做一个小任务再决定。", "Separate the work itself from hours, support and growth prospects. If interests are close, try a small task from each option.", "先釐清消耗你的是工作內容，還是工時、支援或升遷條件。興趣接近時，各安排一次小型試做。"], links: [["/career/guides/career-transition-playbook", ["职业转型行动手册", "Career transition playbook", "轉職行動手冊"]], ["/career/guides/build-portfolio-for-career-switch", ["做一份转岗作品", "Build a transition portfolio", "準備轉職作品集"]], [c2 + "#result-examples", ["近分结果示例", "Read close-score examples", "查看近分範例"]]] },
] as const satisfies ReadonlyArray<{ title: Text; text: Text; links: readonly (readonly [string, Text])[] }>;

// These are editorial browsing examples, separate from scored careers and official occupation titles.
export const mainlandCareerExamples: Readonly<Record<string, { roles: string; study: string }>> = {
  R: { roles: "新能源设备研发、智能制造工程、工业设备运维", study: "工学：机械、电气、材料。先看实验、实训与设备操作。"},
  I: { roles: "算法工程师、数据分析师、研发实验人员", study: "理学或工学：统计、数学、计算机。先看建模、编程和实验任务。"},
  A: { roles: "交互设计、品牌视觉、内容策划", study: "艺术学或文学：设计、传播。先看工作室项目、写作与作品集。"},
  S: { roles: "临床医师、中小学教师、职业咨询", study: "医学或教育学：临床医学、师范方向。课程、实习及从业资格分别核对。"},
  E: { roles: "产品经理、用户运营、渠道销售", study: "管理学或经济学：工商管理、市场营销、经济学。先看调研、协作和方案落地。"},
  C: { roles: "供应链运营、财务审计、法务合规", study: "管理学、经济学或法学：物流管理、会计、金融、法学。先看流程、证据与资格要求。"},
};

export const mainlandMajorExamples = [
  ["理学 / 工学", "比较统计建模、机械设计或新能源实验的课程与项目。"],
  ["经济学 / 管理学", "比较数据分析、成本核算和供应链案例，看看自己更想解决哪类问题。"],
  ["文学 / 法学 / 艺术学", "对照写作、案例论证、视觉作品等产出，以及课程里的实践要求。"],
  ["医学 / 教育学", "分别核对临床见习、教学实习和毕业后的资格路径。"],
] as const;

export function career94Faq(locale: DisplayLocale) {
  const rows = [
    [["94 题和霍兰德 60 题有什么区别？", "How does Career94 differ from the Holland Code test or Truity?", "94 題與霍蘭德 60 題有什麼差別？"], ["霍兰德 60 题只看六类活动兴趣。费马 94 题将 42 题兴趣、20 题工作方式、24 题工作条件和 8 题当前处境合在一份问卷中。即使两个版本题量相同，也应先看量表测了什么。", "The 60-question Holland Code test focuses on activity interests. Career94 adds work style, job conditions and current circumstances to its interest questions. Truity’s 94-question profiler combines Holland interests with Big Five personality. Career94 asks directly about conditions such as predictable hours, stable income, learning support and location flexibility.", "霍蘭德 60 題聚焦六類活動興趣。費馬 94 題包含 42 題興趣、20 題工作方式、24 題工作條件及 8 題目前處境。選擇測驗時，可以先看題本涵蓋哪些面向。"]],
    [["测试免费吗？做完能看到什么？", "What is free, and do I need to sign up?", "測驗免費嗎？做完能看到什麼？"], ["免注册完成全部 94 题。有效作答足够时，免费查看六维兴趣图谱、三字代码、并列或近分提示及初步职业候选。完整深度报告可单次选购，选购前可查看内容和价格。", "All 94 questions are free to answer with no signup. With enough usable responses, you can see your six interest scores, three-letter code, tie or close-score notes and initial career suggestions. The full in-depth report is an optional one-time purchase, with terms shown before payment.", "94 題皆可免費作答，無須註冊。有效作答足夠時，可免費查看六維興趣圖譜、三字代碼、並列或近分提示與初步職涯選項。完整深度報告可單次選購，付款前可查看內容與價格。"]],
    [["前三项接近或并列，怎么读？", "What if my top interest scores are close or tied?", "前三項分數接近或並列，要怎麼看？"], ["样张的 A 与 C 同为 50，报告标为 IRA（并列：A/C），可以一起探索 A 和 C。在结果符合解释条件、且没有优先处理的精确并列时，前三相邻分差小于 5 分会提示近分。用双职业对比和探索工作表验证两条路线。", "In the sample, A and C both score 50, so the report displays IRA with an A/C tie. Where the profile is eligible and no exact tie takes precedence, an adjacent gap of less than five points among the top three prompts a close-score note. Use the comparison tool and worksheet to explore both directions.", "範例中 A 與 C 同為 50，報告會標示 IRA（並列：A/C）。結果符合解讀條件且無優先處理的精確並列時，前三項的相鄰分差小於 5 分會提示近分。可以用雙職業比較和探索工作表驗證兩條路線。"]],
    [["743 个候选职业和 1,046 个档案有什么关系？", "Why do the matching pool and career library have different counts?", "743 個候選職業和 1,046 份檔案有何不同？"], ["743 个职业具有六维兴趣向量，用于排序候选。1,046 是可浏览的职业档案和双职业对比的可选全集。兴趣相似程度只用于找探索方向。", "The 743 roles have six-dimensional interest profiles used to order suggestions. The 1,046 profiles form the browsable career library and the comparison tool’s full selection. Interest similarity is an exploration aid.", "743 個職業具備六維興趣向量，用於候選排序。1,046 份是可瀏覽的職業檔案，也是雙職業比較的可選全集。興趣相似程度只用來找探索方向。"]],
    [["可以用分数直接决定录用或选专业吗？", "Can the score decide on a major or hiring decision?", "可以用分數直接決定錄取或選系嗎？"], ["0–100 分描述你在本题本上的自评偏好。选专业时去看课程和实践任务；求职时核对岗位要求、资格，再用访谈或试做验证。录取、任职和能力需要其他证据。", "The 0–100 scale describes your self-reported preferences. Check coursework and practical tasks when choosing a major. Check credentials and actual responsibilities for a job. Interviews and small trials can help validate your choices.", "0–100 分呈現你在這份題本的自評偏好。選科系要看課程與實作；求職要核對任務、資格與要求，再用訪談或試做驗證。"]],
    [["当前处境的 8 题会拉低分数吗？", "Do the eight background questions lower my scores?", "目前處境的 8 題會影響分數嗎？"], ["这 8 题不参与维度分。夜班与频繁过夜出差只有在你明确无法接受、且岗位有相关要求证据时，才形成条件冲突；资料不明时留待核对。", "The eight background questions do not enter the dimension scores. A night-shift or overnight-travel conflict requires both an explicit personal constraint and evidence that the role requires it. Unverified conditions need checking.", "這 8 題不計入面向分數。只有你明確無法接受夜班或頻繁過夜出差，且該職位有相關要求的證據時，才會標示條件衝突。資料不明時仍需核對。"]],
  ] as const;
  if (locale === "zh") {
    const baseline = rows.map(([question, answer]) => ({ question: question[0], answer: answer[0] }));
    return [
      {
        question: "免费职业测试哪个最准？94题全景版适合什么人？",
        answer: "选哪种测评要看你想解决什么问题。只想快速梳理活动偏好，可做霍兰德 60 题。要一并考虑工作方式、工时、学习支持或目前处境，可做费马 94 题。94 题免注册免费作答，免费结果含六维兴趣、三字代码、近分或并列提示和初步职业候选，完整深度报告可选购。题量和价格本身无法证明准确性。",
      },
      {
        question: "高考选专业或大学生转专业，怎么做职业测试更有用？",
        answer: "选出两个专业方向，去目标院校各找三门核心课、一项必做项目和实际毕业去向。比如同时喜欢数据和动手，可以对照统计建模与工科实训，再试做一次。转专业还要核对学校的名额、先修和学分规则，最后用经历和培养方案做决定。",
      },
      {
        question: "工作几年想跨行转岗，职业测试能帮我避开哪些坑？",
        answer: "先分清拖累你的是日常任务，还是工时、带教或晋升条件。比如想从运营转产品，可以找两份同城岗位说明，对照各自最常做的任务，试做一次需求访谈或分析，再问一位从业者真实的一周怎么过。把培训预算和过渡时间写下来，再决定要不要行动。",
      },
      baseline[0],
      baseline[2],
      baseline[3],
      {
        question: "当前处境的 8 题会拉低分数吗？可以用总分决定选专业或录用吗？",
        answer: "8 道背景题不计入任何维度，页面也不提供录用总分。明确无法接受夜班或频繁过夜出差，且岗位有相关要求证据时，可以提示冲突。0–100 分反映本题本内的自评偏好，选专业和任职仍要核实培养方案、岗位任务及资格。",
      },
    ];
  }
  return rows.map(([question, answer]) => ({ question: careerText(locale, question), answer: careerText(locale, answer) }));
}
