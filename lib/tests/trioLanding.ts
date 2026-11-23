import { DISC_LANDING_PATH } from "@/lib/questionnaires/discRoutes";
import { SCALE_CANONICAL_SLUG_MAP as slugs } from "@/lib/assessmentSlugMap";
import { loadFixedSample } from "@/lib/reports/fixedSamples";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { extendedProfiles, loadExtendedSamples, type ExtendedKind } from "./extendedAssessmentLanding";

export type TrioKind = "big5" | "iq" | "enneagram" | ExtendedKind;
type Detail = [title: string, body: string, href?: string];
type Card = [code: string, ...Detail];
type PercentileRow = {key: string; percentile: number | null};
type Fact = [label: string, value: string];
type Scenario = [label: string, ...Detail];
export type Sample = { label: string; caption: string; note: string; rows: { key: string; name: string; value: number; limit?: number }[]; artwork?: string; url?: string; count?: [number, number] };
export type Profile = {
  name: string; subheading: string; facts: Fact[];
  hero: string; intro: string; benefits: Detail[]; insight: Detail;
  explorer: [string, string, string][]; matrix: [string, string]; cards: Card[];
  scenarios: Scenario[]; faq: [string, string][]; science: Detail[]; link: [string, string];
};

export function findTrioKind(slug: string): TrioKind | null {
  switch (slug) {
    case slugs.BIG5_OCEAN: return "big5";
    case slugs.IQ_RAVEN: return "iq";
    case slugs.ENNEAGRAM: return "enneagram";
    case slugs.EQ_60: return "eq";
    default: return null;
  }
}

export const trioRoutes = {big5: "/zh/tests/" + slugs.BIG5_OCEAN, iq: "/zh/tests/" + slugs.IQ_RAVEN, enneagram: "/zh/tests/" + slugs.ENNEAGRAM,
  jung: "/zh/tests/jung-test", disc: `/zh${DISC_LANDING_PATH}`, eq: "/zh/tests/" + slugs.EQ_60};
const big5Hub = "/zh/personality/big-five";
const enneagramHub = "/zh/personality/enneagram";

export const trioProfiles: Record<TrioKind, Profile> = {
  ...extendedProfiles,
  big5: {
    name: "大五人格", subheading: "看懂性格中的五种倾向",
    facts: [["现役题本", "90 题"], ["预计用时", "约 11 分钟"], ["免费结果", "五维概览"]],
    hero: "喜欢和熟人聊天，却不爱热闹？愿意承担责任，却总在最后一刻动手？大五把这些看似矛盾的部分分开看。",
    intro: "费马大五人格测试以 90 道自评题观察开放性、尽责性、外向性、宜人性和神经质五个连续维度，约 11 分钟。作答和五维基础结果免费。先读维度，再用相关面向与具体经历解释差异。",
    benefits: [["先看五维的位置","五个维度各自有程度。比较整体轮廓，找出最想了解的一两个维度。"],["同一维度，可以有不同表现","外向性涉及合群、表达、活力等不同面向。把一个总分拆开看，往往更容易理解自己。"],["把结果放回生活里","同一人在熟人聚会和陌生会议里的表现可以不同。选一个场景回想，核对分数是否说得通。",big5Hub]],
    insight: ["喜欢聊天，却不爱热闹？","有人愿意组织小组讨论，却不喜欢嘈杂的聚会。把你在熟悉小组、公开发言和大型活动里的表现分开，外向性的几个面向就更容易读懂。"],
    explorer: [["合群","你更喜欢独处，还是和熟人一起做事？","回想同一周里一次主动邀约和一次想独处的时刻，看看差别来自谁在场。"],["表达","你会主动说出意见，即使别人看法不同吗？","比较熟悉话题和陌生话题里的表现，分开考虑熟悉程度与开口意愿。"],["刺激偏好","你更愿意去热闹的现场，还是找安静的地方聊天？","两个人都爱聊天，也可能对人群密度、声音和活动节奏有不同偏好。"]],
    matrix: ["OCEAN 五维人格图鉴","每个维度都是连续谱。左右两端都可以有适用的场合。"],
    cards: [
      ["O","开放性","面对陌生事物，你更常主动尝试，还是先用熟悉的方法把事情做稳？",big5Hub+"/openness"],
      ["C","尽责性","任务很多时，你会先排计划，还是做到关键处再决定下一步？",big5Hub+"/conscientiousness"],
      ["E","外向性","在表达、社交和活动节奏上，你更常在哪些场合主动靠近人群？",big5Hub+"/extraversion"],
      ["A","宜人性","出现分歧时，你会优先维护关系，还是先把不同意见放到桌面上？",big5Hub+"/agreeableness"],
      ["N","神经质","碰到不确定的消息，你的情绪反应有多快？多长时间能回到原有节奏？",big5Hub+"/neuroticism"],
    ],
    scenarios: [["01","了解自己的反差","选一个你认同的表现，再找一次例外。比较两次的场景、人物和任务。",big5Hub],["02","调整做事习惯","如果你不容易启动任务，试着把第一步缩到十分钟。一周后比较在哪些任务上有帮助。",big5Hub+"/conscientiousness"],["03","说清相处偏好","用一句具体请求替代性格标签，例如「讨论前给我十分钟整理思路」。",big5Hub+"/extraversion"]],
    faq: [["大五人格测试测什么？","它用 OCEAN 五个连续维度描述日常倾向，适合比较你在探索、做事、互动、协作和应对压力时的常见表现。"],["多少题，要做多久？结果免费吗？","当前公开题本为 90 题，约 11 分钟。作答与五维基础结果免费。深入内容按结果页显示的报告权益提供。"],["分数越高越好吗？","每个维度的两个方向都有适用情境。比如喜欢结构可以帮助安排多项任务，喜欢临场调整则可能在不确定环境里更自在。"],["百分位和百分制有什么区别？","量尺分描述题本内的位置。百分位表示在指定比较样本中的相对位置，只有报告明确有适用参照时才能按百分位读。"],["大五和 MBTI 有什么区别？","大五展示五组连续倾向。MBTI 从四组偏好帮助理解类型。结果可以各自帮助观察经历，不能互相换算。"],["能用大五决定适合什么职业吗？","可以用结果提出问题，例如自己偏好怎样的协作或计划节奏。岗位能力、兴趣、条件和实际经历需要分别验证。"]],
    science: [["从作答到五维","正向题按原值计入，反向题按 6 − x 换算。先算面向均分，再平均该维度的六个面向。缺可用参照时，默认量尺换算为 25 × (维度均分 − 1)。例如均分 4.2 对应 80/100。"],["如何读面向","大五五维之下可以用面向辅助阅读。单个面向提供具体观察角度，报告能展示哪些面向，以所选题本和实际输出为准。"],["比较样本与边界","分数反映本次自评。参考样本、版本和可比较性要对应报告声明。页面不按总分给出人格好坏、临床判断或职业能力。",big5Hub+"/methodology"]],
    link: ["浏览大五人格百科",big5Hub],
  },
  iq: {
    name: "智商测试", subheading: "从规律识别开始练习推理",
    facts: [["原创图形题", "30 题"], ["30 题预计", "约 20 分钟"], ["还可选", "综合 40 题"]],
    hero: "找出图形之间怎样变化，推断缺失的一格。原创 30 题聚焦图形矩阵，综合 40 题还包含数字和文字推理。",
    intro: "费马免费智商测试提供原创图形矩阵 30 题和综合推理 40 题。30 题预计约 20 分钟。交卷后先读答对题数、正确率和本次题组表现。",
    benefits: [["知道这次答对多少","正确题数和正确率描述这一次作答。先确认题量，再读比例，避免把正确率当成人群排名。"],["看见哪类规律需要多练","在报告有相应题组数据时，可以比较图形、空间或其他推理题组，不凭一个总分给自己贴标签。"],["先看公开报告怎么解释","用固定样张熟悉读数，再读自己的结果。某个参考指标没有足够数据时，以实际报告为准。","/zh/reports/samples/iq30"]],
    insight: ["空格该填什么？先找两条线索","下面是独立创作的教学演示，和正式题本无关。先看同一行形状，再从左到右数有几个，最后用另一行验一遍。"],
    explorer: [],
    matrix: ["图形推理常用的四种观察","把复杂画面分成可以检查的变化。下列是解题思路，不代表报告额外测量四项能力。"],
    cards: [["01","数量","先数元素个数或黑白数量，看它们是否按行或按列递增。"],["02","位置","试着只看一个元素，跟踪它横移、纵移或绕中心转动的轨迹。"],["03","方向","将图形与前一格叠在脑中，检查是旋转、镜像，还是改变了图形本身。"],["04","组合","比较两格共有和各自独有的元素，检查第三格是相加、合并还是消去。"]],
    scenarios: [["01","第一次做矩阵题","先做上面的教学题，确认自己能复述规则，再进入原创 30 题。","#trio-insight"],["02","想试多种题型","如果还想看数字和文字推理，在上方版本选择里进入综合 40 题。","#choose-version"],["03","看懂自己的成绩","先把答对题数、正确率与报告中的参考指标分开。", "/zh/articles/iq-test-score-and-limits-explained"]],
    faq: [["原创 30 题和综合 40 题有什么区别？","30 题聚焦图形矩阵，40 题包含图形、数字和文字推理。两份题本的题目不同，正确率不能直接当作同一尺度比较。"],["预计约 20 分钟是什么意思？","这是原创 30 题的预计用时，用来安排作答。题目操作及当次时间提示以作答页为准。"],["做完能免费看到什么？","作答和基础结果免费，基础结果可查看答对题数、正确率等读数。个人报告访问以该次作答的访问权限为准。"],["正确率就是 IQ 或百分位吗？","正确率只回答这份题里答对了多少。报告如显示 Beta 参考分或模型参考百分位，应按设计参考解释，不能当成人群百分位或正式 IQ。"],["练熟这种题就表示智力提高了吗？","熟悉规律后，重新做同类题更顺手很常见。题型熟练度、练习记忆和一般能力变化是不同的判断。"],["能用结果作筛选或专业评估吗？","这是一份线上推理练习，适合了解本次题组表现。临床、学校安置或职业选拔应采用有合适标准和规范流程的专业评估。"]],
    science: [["正确率","正确率 = 答对题数 ÷ 题目总数 × 100%。例如 8 ÷ 30 × 100% ≈ 26.7%。题数不同要用各自分母。"],["模型参考分","有合格数据时，报告可显示基于特定设计模型的 Beta 参考分。该数字依赖题本与参考模型，不用于推断人口排名。"],["结果怎么用","先回看本次观察规则和作答过程。正式智力测评需要适用的常模与标准化施测，不能从单题或网页结果推断。","/zh/method-boundaries"]],
    link: ["查看完整原创 30 题报告样张","/zh/reports/samples/iq30"],
  },
  enneagram: {
    name: "九型人格", subheading: "理解行为背后的不同动机",
    facts: [["现役题本", "105 题"], ["预计用时", "约 12 分钟"], ["免费结果", "九型分布"]],
    hero: "同样是把事情反复检查，有人想把细节做好，有人想确认风险。用九型分布和接近的候选，回看你更常出于哪种动机。",
    intro: "费马九型人格测试为 105 题五点自评，约 12 分钟。可免费作答并查看九型分布与候选分数。先读前几项，再对照当时在意什么和你具体做了什么。",
    benefits: [["看全九型如何分布","从九项同时看起，找出值得对照的候选。分数反映本次作答与描述的相符程度。"],["再比较接近的候选","看前两项各自最在意什么。分数贴得近，可以暂时保留两种理解。"],["用事例分辨动机","回想自己在哪些情境反复这样做，也留意不符合的一次，再到百科读更具体的区分。",enneagramHub]],
    insight: ["同样反复检查，是在追求什么？","出发前，有人反复检查标准，有人想确认备用方案，还有人想让同行的人安心。相同的外在动作可以来自不同考虑。"],
    explorer: [["把事情做好","我想确认事情符合自己认可的标准。","如果没人在意，自己还会检查到同样细吗？"],["先确认风险","我担心有没预料到的状况，想知道出了问题怎么办。","准备好备用方案后，是否更容易安心停止检查？"],["照顾同行的人","我想确保同伴有需要时能得到帮助。","如果这次自己独行，还会检查这些细节吗？"]],
    matrix: ["九型人格动机图鉴","每张卡给的是一个观察方向。先读最有共鸣和最难区分的两项。"],
    cards: [
      ["1","一号 · 改进","留意标准和错误，想把事情做得更妥当。"],
      ["2","二号 · 支持","容易留意别人需要什么，愿意投入关系。"],
      ["3","三号 · 达成","看重进展和成效，经常围绕目标安排精力。"],
      ["4","四号 · 真实","重视感受的独特性，想让选择符合自己。"],
      ["5","五号 · 理解","倾向先独立观察并理清，保留思考空间。"],
      ["6","六号 · 确认","关注风险、承诺和可以依靠的支持。"],
      ["7","七号 · 选择","喜欢打开新的选项，给生活留出活动空间。"],
      ["8","八号 · 自主","重视边界与决断，愿意直接面对冲突。"],
      ["9","九号 · 和谐","留意彼此能否相处舒服，愿意缓和紧张。"],
    ],
    scenarios: [["01","候选只差一点","各找一个支持案例和一个不符合的例子，比较做同一件事时你的顾虑是什么。",enneagramHub],["02","和人产生误会","先问对方想保护什么，再说清自己的在意之处。别只用候选类型替人作答。",enneagramHub],["03","隔一段时间再比较","先记下今天依据的经历。换了情境或近期状态变化时，再看看哪些动机仍然经常出现。","#trio-method"]],
    faq: [["九型人格测试测什么？","它用九类动机描述帮助你比较本次自我观察。重点是行为背后反复出现的考虑，而非用单个行为决定类型。"],["多少题、约多久？结果免费吗？","现役页面提供 105 题五点自评，约 12 分钟。九型分布与候选分数免费，完整报告获取方式以本次结果页提示为准。"],["105 题和以前的 144 题有什么区别？","105 题逐项选择符合程度，是现役公开入口。历史 144 题是成对二选一，量尺和解释口径不同，不能直接横比。"],["最高两项接近怎么读？","先把两项当候选。分别回想最近几次做同一类决定时的顾虑，并保留无法区分的情况。图表上的显示值可能经过舍入。"],["侧翼能靠第二名直接确定吗？","不能直接把第二名当侧翼。传统解释里侧翼是主型相邻类型，仍需结合报告条件和具体经历。"],["能用九型判断他人的人格吗？","可以用框架提出更好的问题。别人做同一件事可能有与你不同的动机，宜让对方自己描述当时的考虑。"]],
    science: [["105 题怎样计分","定向五点作答为 −2 到 2。示意原量尺 R = Σ(x × w) ÷ Σ|w|，展示值 P = round[25 × (R + 2)]。例如 R = 0.8 → P = 70。"],["分差在说什么","比较同一次答卷中候选描述的相对突出程度。整数显示接近不代表底层同分，也不等于两种动机的固定比例。"],["使用边界","候选用于回顾动机和情境。九型相关研究的信效度证据并不一致，页面不据此作人格障碍、临床或人员筛选判断。",enneagramHub]],
    link: ["浏览九型人格百科",enneagramHub],
  },
};

const bigNames: Record<string,string> = {O:"开放性", C:"尽责性", E:"外向性", A:"宜人性", N:"神经质", E2:"合群", E3:"自信主张", E5:"刺激追求", C2:"条理性", C3:"责任感", C5:"自律"};
const enneaNames = ["一号","二号","三号","四号","五号","六号","七号","八号","九号"];
const makeRows = (keys: readonly string[], names: Record<string,string>, values: number[]) =>
  keys.map((key, i) => ({key, name:names[key] ?? key, value:values[i]}));

export async function loadTrioSamples(kind: TrioKind, locale: DisplayLocale = "zh"): Promise<Sample[]> {
  if (kind === "jung" || kind === "disc" || kind === "eq") return loadExtendedSamples(kind, locale);
  const reportLocale = locale === "en" ? "en" : "zh";
  if (kind === "big5") {
    const report = await loadFixedSample("big5", reportLocale);
    const projection = report?.big5_public_projection_v1 as {
      trait_vector?: PercentileRow[];
      facet_vector?: PercentileRow[];
    } | undefined;
    const rows = (source: PercentileRow[] | undefined, keys: string[]) => keys.flatMap(key => {
      const value = source?.find(row => row.key === key)?.percentile;
      return typeof value === "number" && Number.isFinite(value) ? [{key, name:bigNames[key] ?? key, value}] : [];
    });
    const views: [string,string,PercentileRow[] | undefined,string[]][] = [
      ["五维概览","五个连续维度",projection?.trait_vector,["O","C","E","A","N"]],
      ["细看外向性","同一维度的不同面向",projection?.facet_vector,["E2","E3","E5"]],
      ["细看尽责性","条理性与自律可以不同",projection?.facet_vector,["C2","C3","C5"]],
    ];
    return views.map(([label, caption, source, keys]) => ({
      label, caption, rows:rows(source,keys), url:"/zh/reports/samples/big5", note:"固定公开样张。数值为该样张的参考百分位，详见样张中的比较口径。",
    }));
  }
  if (kind === "enneagram") {
    const report = await loadFixedSample("enneagram", reportLocale);
    const vector = (report?.enneagram_public_projection_v2 as {scores?:{all9_profile?:{type:string;score_norm:number}[]}} | undefined)?.scores?.all9_profile;
    const keys = enneaNames.map((_,i)=>String(i+1));
    const names = Object.fromEntries(keys.map((key,i)=>[key,enneaNames[i]]));
    const sampleRows = (vector ?? []).map(({type,score_norm})=>({key:type,name:names[type],value:score_norm}));
    const candidates = [...sampleRows].sort((a,b)=>b.value-a.value).slice(0,3);
    return [
      {label:"固定公开样张", caption:"先对照领先候选", note:candidates.length === 3
        ? `样张候选依次为${candidates.map(row=>row.name).join("、")}，前两项相差 ${(candidates[0].value-candidates[1].value).toFixed(2)} 分。`
        : "打开公开报告查看候选说明。",url:"/zh/reports/samples/enneagram",rows:sampleRows},
      {label:"单项突出", caption:"二号明显高于其他项", note:"教学演示数据。可先探索二号描述，再找一次不符合的经历。",rows:makeRows(keys,names,[54,85,48,39,56,50,42,46,58])},
      {label:"多项接近", caption:"几个候选差别很小", note:"教学演示数据。保留几条线索，别用细微分差急着定型。",rows:makeRows(keys,names,[63,62,60,62,61,59,60,61,60])},
    ];
  }
  const reports = await Promise.all([loadFixedSample("iq30", reportLocale), loadFixedSample("iq40", reportLocale)]);
  const fixed = reports.flatMap((payload,i) => {
    const result = payload?.result as {breakdown_json?:{score_result?:{correct_count?:number;expected_item_count?:number}}} | undefined;
    const score = result?.breakdown_json?.score_result;
    const correct = score?.correct_count;
    const total = score?.expected_item_count;
    if (typeof correct !== "number" || typeof total !== "number" || total <= 0) return [];
    return [{label:i === 0 ? "原创 30 题" : "综合 40 题", caption:"固定公开报告", note:"这是公开样张的答题正确率。两份题本的读数分别看，不能用于人群排名。", rows:[],url:i === 0 ? "/zh/reports/samples/iq30" : "/zh/reports/samples/iq40",count:[correct,total] as [number,number]}];
  });
  return [{label:"成绩怎么读",caption:"教学示例 · 30 题",note:"8 ÷ 30 × 100% ≈ 26.7%，只表示答对题目所占比例。", rows:[],count:[8,30]}, ...fixed];
}
