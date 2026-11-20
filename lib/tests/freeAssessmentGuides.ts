import type { DisplayLocale } from "@/lib/i18n/locales";

type Text = readonly [zh: string, traditional: string, en: string];
type Row = readonly [label: Text, interpretation: Text, example: Text];

const archetypes: readonly Row[] = [
  [["英雄", "英雄", "Hero"], ["迎接挑战", "迎接挑戰", "Overcome a challenge"], ["愿意接手困难任务，也要识别什么时候应当求助。", "願意接手困難任務，也要辨識何時該求助。", "Take on a hard task and decide when to ask for help."]],
  [["智者", "智者", "Sage"], ["理解缘由", "理解緣由", "Understand why"], ["查清判断的依据，并设一个停止搜集资料的时间。", "查清判斷的依據，並設定停止蒐集資料的時間。", "Check the evidence and set a point at which to stop researching."]],
  [["探索者", "探索者", "Explorer"], ["亲自发现", "親自發現", "Discover firsthand"], ["在一个任务里试试新路线，记录它和旧路线的差别。", "在一項任務中嘗試新路線，記下它和舊路線的差異。", "Try a different route on one task and note what changes."]],
  [["创造者", "創造者", "Creator"], ["赋予想法具体形式", "賦予想法具體形式", "Give an idea form"], ["拿出可讨论的初稿，再决定哪些细节值得打磨。", "提出可討論的初稿，再決定哪些細節值得推敲。", "Share a workable draft before polishing details."]],
  [["统治者", "統治者", "Ruler"], ["建立秩序", "建立秩序", "Make coordination work"], ["明确由谁决定、由谁交接，并为执行者留出空间。", "釐清由誰決定、由誰交接，並給執行者留空間。", "Clarify decision rights and handoffs while leaving room for autonomy."]],
  [["照顾者", "照顧者", "Caregiver"], ["回应实际需要", "回應實際需求", "Respond to practical needs"], ["先问对方需要什么，再商定你能帮到哪里。", "先問對方需要什麼，再說清楚你能幫到哪裡。", "Ask what help is wanted before agreeing on what you can offer."]],
  [["魔术师", "魔術師", "Magician"], ["促成转变", "促成轉變", "Make change possible"], ["先验证一个新组合能否改善小环节，再决定要不要扩大。", "先確認一個新組合能否改善小環節，再決定是否擴大。", "Try a new combination on one part of a process before expanding it."]],
  [["情人", "情人", "Lover"], ["维系珍视的联结", "維繫珍視的連結", "Sustain a valued connection"], ["给彼此专注的时间，也把重要分歧说清。", "給彼此專注的時間，也把重要分歧說清楚。", "Give a relationship attention and make room for disagreement."]],
  [["弄臣", "弄臣", "Jester"], ["为日常留一点玩趣", "為日常留一點趣味", "Make room for play"], ["缓和紧张气氛后，回到团队要解决的问题。", "緩和緊張氣氛後，回到團隊要解決的問題。", "Lighten the mood, then return to the problem at hand."]],
  [["凡人", "凡人", "Everyperson"], ["重视参与和归属", "重視參與與歸屬", "Value participation and belonging"], ["让大家都能参与，也留下听取少数意见的机会。", "讓大家都能參與，也保留聽取少數意見的機會。", "Make participation easy and leave space for minority views."]],
  [["天真者", "天真者", "Innocent"], ["保留简单与希望", "保有簡單與希望", "Keep things simple and hopeful"], ["找一个能开始的步骤，同时列出仍未解开的困难。", "找一個能開始的步驟，同時列出仍未解決的困難。", "Find a manageable first step and name the problems that remain."]],
  [["反叛者", "反叛者", "Rebel"], ["挑战多余的约束", "挑戰多餘的約束", "Challenge needless constraints"], ["指出旧规则造成的具体代价，拿出可试的替代方案。", "指出舊規則造成的具體代價，提出可試的替代做法。", "Name the cost of an outdated rule and propose an alternative."]],
];

const career: readonly Row[] = [
  [["职业兴趣 · 42 题", "職涯興趣 · 42 題", "Interests · 42 items"], ["六类 RIASEC 活动偏好，每类七题。", "六類 RIASEC 活動偏好，每類七題。", "Seven items for each of the six RIASEC activity interests."], ["喜欢调查和解释证据，可以核对职位是否真的包含分析任务。", "喜歡調查與解釋證據，可確認職缺是否真的包含分析任務。", "If investigating evidence appeals to you, check that the role involves analysis."]],
  [["工作方式 · 20 题", "工作方式 · 20 題", "Work style · 20 items"], ["五个维度，每维四题，覆盖协作、自主、切换、对外沟通和走动。", "五個面向，每個四題，涵蓋合作、自主、切換、對外溝通及走動。", "Five four-item dimensions cover coordination, discretion, task switching, external contact and physical activity."], ["都叫分析师，一个团队每天开协调会，另一个主要独立写报告。", "同樣是分析師，一個團隊天天開協調會，另一個主要獨立寫報告。", "Two analyst roles can differ in how much of the day is spent coordinating or writing independently."]],
  [["工作条件 · 24 题", "工作條件 · 24 題", "Working conditions · 24 items"], ["六个维度，每维四题，涵盖工时、学习支持、收入、贡献、晋升和地点。", "六個面向，每個四題，涵蓋工時、學習支持、收入、貢獻、升遷與地點。", "Six four-item dimensions cover schedules, learning support, income stability, visible contribution, advancement and location flexibility."], ["重视可预期工时，就在面试中问排班提前多久公布。", "重視工時可預期，就在面試時問排班會提前多久公布。", "If predictable hours matter, ask how far in advance schedules are posted."]],
  [["当前情况 · 8 题", "目前情況 · 8 題", "Current circumstances · 8 items"], ["记录职业阶段、经历和探索目标，也记录夜班或出差等限制。", "記錄職涯階段、經歷與探索目標，也記錄夜班或出差等限制。", "Records context such as career stage, experience and goals, including constraints on night shifts or travel."], ["如果目前不能夜班，先核对职位是否要求夜班，再比较其余偏好。", "如果目前不能上夜班，先確認職缺是否有此要求，再比較其他偏好。", "Check any night-shift requirement before comparing preferences if you cannot currently work nights."]],
];

function localizeRows(rows: readonly Row[], i: 0 | 1 | 2) {
  return rows.map(([label, interpretation, example]) => ({ label: label[i], interpretation: interpretation[i], example: example[i] }));
}

const readings = {
  archetypes: {
    title: ["十二原型各代表什么？", "十二原型各代表什麼？", "What do the twelve archetypes represent?"],
    exampleTitle: ["原型报告示例", "原型報告示例", "Worked example: reading an archetype report"],
    example: [
      "假设创造者 75、探索者 68.75、照顾者 50。创造者领先一个最小刻度，探索者同时落在近高分区间。这时可回想两个实例：你主动推进的是产出一件作品，还是打开一个新方向？如果十二项最高和最低只差 6.25 分或更少，报告不会指定主导原型。这个例子是演示分数。",
      "假設創造者 75、探索者 68.75、照顧者 50。創造者領先一個最小刻度，探索者同時位於接近最高分的範圍。試著回想兩個例子：你主動想完成一件作品，還是開出新的方向？若十二項最高與最低只差 6.25 分或更少，報告不會指定主導原型。以上是示範分數。",
      "Suppose Creator scores 75, Explorer 68.75 and Caregiver 50. Creator leads by one scoring step, and Explorer is still flagged as close to the lead. Compare two concrete episodes: were you motivated to finish a piece of work or to open up a new direction? If the highest and lowest of all 12 scores are within 6.25 points, the report withholds a primary archetype. These scores are illustrative.",
    ],
    rows: archetypes,
  },
  career: {
    title: ["94 题测什么？", "94 題測什麼？", "What the 94 questions cover"],
    exampleTitle: ["职业报告示例：如何比较两个机会", "職涯報告示例：如何比較兩個機會", "Worked example: comparing two job opportunities"],
    example: [
      "假设你正在选研究助理和客户分析岗位。研究兴趣高，先向双方确认分析工作占一周多少时间。偏好独立安排方法，就问谁制定流程、谁有决定权。若还重视稳定工时，去问旺季要不要加班。这三条各自记录。职位名称相似也可能对应不同任务与条件。",
      "假設你正在選研究助理或客戶分析職缺。若研究興趣高，先確認雙方每週有多少時間用來分析。若偏好自行安排方法，可問誰制定流程、誰有決定權。如果也重視工時穩定，就問旺季是否加班。把這三項分別記下來，因為相似的職稱也可能有不同任務與條件。",
      "Say you are choosing between research assistant and client analyst roles. If investigative interest is high, ask each employer how many hours go to analysis. If you prefer discretion, ask who sets the method and controls decisions. If predictable hours matter, ask about busy-season overtime. Record the three answers separately; job titles can hide differences in duties and conditions.",
    ],
    rows: career,
  },
} as const;

export function freeAssessmentGuide(key: keyof typeof readings, locale: DisplayLocale) {
  const i = locale === "zh" ? 0 : locale === "zh-TW" ? 1 : 2;
  const entry = readings[key];
  return { title: entry.title[i], rows: localizeRows(entry.rows, i), exampleTitle: entry.exampleTitle[i], example: entry.example[i] };
}
