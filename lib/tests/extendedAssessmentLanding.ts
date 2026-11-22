import type { Profile, Sample } from "./trioLanding";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { loadFixedSample } from "@/lib/reports/fixedSamples";

export type ExtendedKind = "jung" | "disc" | "eq";

const discLanding = "/zh/tests/explore/disc";
const jungSample = "/zh/tests/jung-archetypes/sample";
const discSample = "/zh/reports/samples/disc";
const eqSample = "/zh/reports/samples/eq";
const eqGuide = "/zh/articles/eq60-score-and-results-guide";
const eqPractice = "/zh/articles/emotional-awareness-regulation-and-relationship-practice";

export const newSampleLinks = {jung: jungSample, disc: discSample, eq: eqSample};

export const extendedProfiles: Record<ExtendedKind, Profile> = {
  jung: {
    name:"荣格十二原型", subheading:"看见自己近期常用的角色",
    facts:[["现役题本","48 题"],["预计用时","约 10 分钟"],["免费结果","十二原型分布"]],
    hero:"同一件新任务，有人先弄清规律，有人想做出一个作品，也有人急着亲自去试。对照过去三个月的经历，看看哪些动机最近更常出现。",
    intro:"费马荣格十二原型测试有 48 道情境自评，约 10 分钟。免费作答并查看十二原型的基础分布。原型提供的是理解近期角色和动机的线索。",
    benefits:[["看全十二项","每个原型独立计分，先看全貌，再挑比较突出的几项。"],["比较接近的动机","较高的两项都可能有解释力。用同一段经历，分别检查它们能解释什么。"],["读一份完整示例","先用公开样张了解图表与角色解读，再看你自己的结果。",jungSample]],
    insight:["想把点子做出来，还是想走一条新路线？","刚接到开放任务时，查清缘由、动手构建和尝试新路都可能是好办法。把它们放进同一个情境，可以发现动作背后更在意的东西。"],
    explorer:[["智者","先弄清问题的来龙去脉，再判断哪种方案成立。","设一个停止搜集资料的时间，看看什么证据已足够行动。"],["创造者","想把暂时说不清的点子，先做成一个别人可以试用的版本。","第一次交出草稿时，你最希望收到哪类反馈？"],["探索者","想亲自试一条没走过的路线，看会遇到什么。","选一个可逆的小尝试，写下在哪种情况下会换回原方案。"]],
    matrix:["十二原型图鉴","同一个人可以在不同情境使用不同角色。把图鉴当作一组观察问题。"],
    cards:[
      ["01","英雄","迎接挑战，把困难拆成可以认真完成的一步。"],["02","智者","先追问证据，弄清变化如何发生。"],["03","探索者","走一段新路线，用亲身体验打开选择。"],["04","创造者","让想法有形，先拿出可以改动的草稿。"],
      ["05","统治者","建立让合作顺畅的规则，明确谁可以决定什么。"],["06","照顾者","听懂真正的需要，商量自己能够提供的支持。"],["07","魔术师","找到能带来转变的小杠杆，先验证它是否有效。"],["08","爱人","把时间留给珍视的联结，也愿意说清彼此的差异。"],
      ["09","小丑","让紧张的人松一口气，再回到要处理的问题。"],["10","平凡人","让每个人有机会参与，并听见不一样的意见。"],["11","天真者","在复杂局面里找一个简单、可开始的动作。"],["12","反叛者","指出规则造成的代价，提出值得试行的替代办法。"],
    ],
    scenarios:[["01","复盘一次主动选择","写下发生了什么、你做了什么，以及你当时最想达到什么。","#trio-insight"],["02","换一个角色试试看","如果一直在研究方案，下次先做个小样。记下什么改变了，以及什么没有改变。","#trio-exploration"],["03","近分时保留两个解释","挑两次相似经历，分别找支持和反例，过段时间再看。",jungSample]],
    faq:[["这是荣格八功能测试吗？","这里是荣格十二原型测试，关注近期自我描述里的角色和动机。认知功能和 MBTI 使用不同框架，不能从原型分数换算。"],["多少题、约多久？基础结果免费吗？","现役题本为 48 道五档情境自评，约 10 分钟。作答和十二原型基础分布免费。若结果页提供完整报告的付费选项，可按需单次解锁。"],["高分接近时怎么读？","先看这些原型在具体经历里分别何时出现。分布过于平坦时报告不强行给出主导原型。"],["所有分数加起来要等于 100 吗？","不用。每个原型各用四道题独立换算到 0–100，分数不表示在人群中的相对位置。"],["答题要想哪段经历？","以近三个月的真实情况为主。如果不同场景差别明显，选更符合你近期一般表现的答案。"],["结果能指导职业决定吗？","可以从高分角色提出观察问题，再用真实任务、岗位要求和试做验证。原型分数没有人群常模，也不用于诊断。"]],
    science:[["四题换算","正向题按 1–5，反向题用 6 − 原作答。一个原型四题总和为 S 时，量尺分 = 100 × (S − 4) ÷ 16；例如 S = 16，对应 75 分。"],["怎样判断接近","与最高相差不超过 6.25 分的原型可一起读。全图跨度不超过 6.25 分时不列主导；最高并列也不硬选一个。"],["框架来源","题本由费马原创，参考荣格原型概念和 Carol Pearson 的应用框架。原型用于整理经历和角色表达，没有采用人群常模。"]],
    link:["查看十二原型公开样张",jungSample],
  },
  disc: {
    name:"DISC 行为风格", subheading:"看见你通常怎样推进和协作",
    facts:[["题量","24 题"],["预计用时","约 5 分钟"],["作答方式","每题二选一"]],
    hero:"同样遇到项目卡住，你会先做决定、把人召集起来、稳定合作节奏，还是先核对事实？用二选一观察你在这些情境里较常采用的做法。",
    intro:"费马 DISC 测试含 24 道行为情境题，每题二选一，约 5 分钟。无需注册，作答与基础结果免费。结果显示 D、I、S、C 四个方向的原始获选次数。",
    benefits:[["四种做法各选过几次","先看完整分布。每次选择只为对应方向加一次，四项合计 24。"],["最高并列一起看","两个以上方向并列时，结果把它们共同列出。可以回想各自在哪类情境比较常用。"],["读结果之前先看例子","公开样张展示单项领先、双项并列等版式。你的结果基于真实作答。",discSample]],
    insight:["同一个问题，可以从哪里开始？","筹备活动时，有人先定时间，有人先邀讨论，也有人先照顾节奏或核对预算。做法可以随任务改变。"],
    explorer:[["先推进","把最难决定的事项定下来，并确认谁负责推进。","如果信息不足，你会先做一个小决定，还是先问清两项前提？"],["先沟通","让大家把担心和想法说出来，再确认谁愿意参与。","如果会议分歧很大，哪句话能帮你把讨论拉回问题？"],["先支持","先确认大家能否接住变动，再决定怎么分工。","哪些安排可以帮同伴跟上进度？"],["先核对","先查预算、标准与事实，再决定如何调整。","先列一项没有核实、却可能改变决定的信息。"]],
    matrix:["D、I、S、C 四个行为方向","每张卡说明一种常用做法；实际结果也可能是多个方向并列。"],
    cards:[["D","推进","目标不清时，倾向于定优先级、作决定并推进下一步。",discLanding+"/results/single-d"],["I","表达","需要调动参与时，倾向于主动表达、邀请讨论并争取支持。",discLanding+"/results/single-i"],["S","支持","合作变化很大时，倾向于照顾节奏、稳定关系并给出支持。",discLanding+"/results/single-s"],["C","核对","信息不足时，倾向于先确认事实、标准和步骤。",discLanding+"/results/single-c"]],
    scenarios:[["01","团队卡在决策","先写下你会采取的动作，请同伴补一个互补的步骤。","#trio-insight"],["02","看见双项并列","各回想一次自己用这两种做法处理问题，标出当时哪种条件最重要。",discSample+"?result=tied-d-i"],["03","换一个方式沟通","试着把意见说成两个可观察的行动，再比较哪种会让合作更顺畅。","#trio-exploration"]],
    faq:[["DISC 测的是什么？","这份费马自编问卷比较 D 推进、I 表达、S 支持和 C 核对四种行为方向，适合回顾沟通和协作时的常见做法。"],["24 道题要做多久，结果免费吗？","约 5 分钟，无需注册。作答与基础结果免费，完整报告可选单次付费解锁。"],["最高方向并列怎么办？","所有最高次数的方向都会保留。例如 D 与 I 都选了 8 次，其他两项各 4 次，结果呈现 D 与 I 并列。"],["次数少代表能力差吗？","次数反映二选一时较少选中某个方向。它不是能力分或人群百分位，不宜据此评价一个人的好坏。"],["答题可以中断或保存进度吗？","独立作答页不保存答题进度，刷新、离开或换语言后需重新开始。完成后由服务端核对计分并保存结果，答题选项不进入网址或分析事件。"],["能作为招聘或岗位筛选标准吗？","适合帮助表达协作偏好。岗位任职仍应看技能、工作样本和其他相关证据，这份自编问卷不作人员筛选。"]],
    science:[["原始次数","每题只为所选方向加 1，每种方向都参与 12 次比较。24 道题完成后，D + I + S + C = 24。例 8 + 5 + 4 + 7 = 24，D 的次数最高。"],["并列规则","同样的最高次数一起列出，四项可形成 15 种非空最高组合。分数不是人群常模或个人能力。"],["应用范围","D、I、S、C 作为描述行为的词汇。费马题本是自编问卷，未把商业 DISC 工具的报告规范当作本页证据。"]],
    link:["查看 DISC 报告样张",discSample],
  },
  eq: {
    name:"情商测试", subheading:"练习读懂情绪和关系",
    facts:[["现役题本","60 题"],["预计用时","约 10 分钟"],["免费结果","基础结果"]],
    hero:"察觉到自己心里不舒服，却来不及想怎么说？从四个维度回顾你怎样认出情绪、调节反应、理解他人和处理关系。",
    intro:"费马情商测试为 60 题五点自评，约 10 分钟。作答与基础结果免费。四个维度分别观察自我觉察、情绪调节、共情理解和关系管理。",
    benefits:[["先了解这次自我描述","选四个维度中最贴近日常困扰的一项，回忆一个确切发生的场景。"],["分开情绪、动作和关系","你可能察觉情绪很快，冷静下来较慢。把两步分开，更容易知道可以从哪里练。"],["用公开场景理解读数","到计分指南看看报告怎么区分量尺分、标准分和实际可见结果。",eqGuide]],
    insight:["收到一句「这段重写」，你会怎么回应？","先分辨情绪，再确认对方意图和范围，最后选一句可落实的回应。四维在一次交流中可以各自发挥作用。"],
    explorer:[["先觉察","你注意到心跳变快，可能是焦虑，也可能是觉得被轻视。","试着补完「我感到……，是因为我在意……」。"],["再调节","先停几秒，避免把第一反应变成一句让局面更紧张的话。","如果当下说不清，可以约定稍后回应的时间。"],["理解并回应","问对方需要改的是结论还是表达，再说清自己需要多少时间。","试说「你最想我先改哪一处？我下午给你一版」。"]],
    matrix:["情商自评的四个维度","自评分描述你怎样看待自己的行为，适合配合实际交流和反馈阅读。"],
    cards:[["SA","自我觉察","注意情绪和身体信号，分辨你在意的需求或界限。"],["ER","情绪调节","选择回应的时机和方式，在情绪升起时给自己调整空间。"],["EM","共情理解","区分推测与事实，通过提问核对对方的处境和需要。"],["RM","关系管理","表达边界、协商分歧，也留出修复关系的机会。"]],
    scenarios:[["01","压力来得快","写下触发、身体信号和你做的第一件事，找一个可调整环节。",eqPractice],["02","对方的意思不明确","先复述你听到的事实和猜测，问对方你的理解是否准确。","#trio-insight"],["03","一次谈话结束后","回想哪一步有效，并比较另一次相似谈话中发生了什么。",eqGuide]],
    faq:[["60 题情商测试测什么？","它用五点自评记录本次对情绪觉察、调节、共情和关系管理的自我描述。适合用来反思常见交流情境。"],["需要多久，什么免费？","现役 60 题约 10 分钟，作答与基础结果免费。完整报告以本次结果页为准；若显示付费选项，可按需单次解锁。"],["分数是人群百分位吗？","0–100 量尺分是把原始分换到统一范围，百分位则需要适用的人群参照。报告如果有标准分，按它声明的尺度阅读。"],["懂对方就一定要答应对方吗？","可以先理解对方，再把自己的边界说出来。两个人都能说清需要，通常比马上同意更容易找到可执行的约定。"],["情商分数低就表示我不善于交往吗？","分数是本次自我描述。可以对照近来的具体交流、本人状态及他人的反馈，再选一个情境练习。"],["它能用于诊断或筛选吗？","这份线上自评适合复盘和练习，不能替代专业评估，也不据此判断疾病、人格好坏、能力或任职资格。"]],
    science:[["维度量尺换算","每维 15 题，按计分方向汇总；反向题作答 x 换为 6 − x。维度量尺分 = (原始和 − 15) ÷ 60 × 100。原始和 45，对应 50 分。"],["总分与参照","总量尺分 = (总原始和 − 60) ÷ 240 × 100。标准分与参照状态另读，量尺上的 50 分并不表示超过一半的人。",eqGuide],["结果怎么用","找一个具体交流场景，按觉察、调节、核对对方想法、表达界限的顺序试一次。用重复观察判断练习是否有帮助。",eqPractice]],
    link:["查看情商计分与结果指南",eqGuide],
  },
};

export async function loadExtendedSamples(kind: ExtendedKind, locale: DisplayLocale = "zh"): Promise<Sample[]> {
  if (kind === "jung") {
    const {archetypeAssets, jungSampleScores, makePreviewScores, readJungArchetypeScores} = await import("@/components/result/jung/jungReportAssets");
    const report = locale === "en" ? await loadFixedSample("archetypes", "en") : null;
    const publicScores = locale === "en" ? readJungArchetypeScores(report?.report?.jung) : jungSampleScores;
    const sampleSets = [
      {label:"公开样张",caption:"较突出的原型",scores:publicScores ?? {},note:"同一份公开固定样张，显示最高四项。点击完整样张可查看全部十二项。"},
      {label:"并列示意",caption:"两种动机可以同时突出",scores:makePreviewScores("sage","tied"),note:"教学演示。用两段相似经历分别检验这两个原型。"},
      {label:"平坦示意",caption:"全图接近时放下主导标签",scores:makePreviewScores("sage","flat"),note:"教学演示。全图跨度小，先回想具体任务，报告不列主导。"},
    ];
    return sampleSets.map(({scores,...sample},index) => ({
      ...sample,url:index === 0 ? jungSample : undefined,
      rows:Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([key,value],index)=>({
        key:locale === "zh" ? String(index+1) : key,name:archetypeAssets.find(asset=>asset.id===key)?.name ?? key,value,
      })),
    }));
  }
  if (kind === "disc") {
    const {findDiscPreviewProfile} = await import("@/components/result/disc/discPreviewProfiles");
    const directionNames = ["推进","表达","支持","核对"];
    return [
      ["single-d","单项领先","推进方向最高","每选一项记一次，四项合计 24。"],
      ["tied-d-i","双项并列","推进与表达共同最高","并列方向同时列出，可以比较你在哪类情境用哪一种。"],
      ["tied-d-i-s-c","四项并列","四个方向次数相同","四项均为 6 次，无须指定一个最高方向。"],
    ].flatMap(([id,label,caption,note])=>{
      const profile=findDiscPreviewProfile(id);
      if (!profile) return [];
      return [{label,caption,note:"公开教学样张。"+note,url:`${discSample}?result=${id}`,artwork:profile.artwork,rows:["D","I","S","C"].map((key,i)=>({
        key,name:directionNames[i],value:profile.counts[i],limit:12,
      }))}];
    });
  }
  const keys = ["SA","ER","EM","RM"];
  const names = ["自我觉察","情绪调节","共情理解","关系管理"];
  const makeSample = (label:string,caption:string,raws:number[],note:string,publicSample = false): Sample => ({
    label,caption,note,url:publicSample ? eqSample : undefined,
    rows:keys.map((key,i)=>({key,name:names[i],value:Number(((raws[i]-15)/60*100).toFixed(2))})),
  });
  const {loadEqResultSample} = await import("@/lib/eq/loadResultSample");
  const page = await loadEqResultSample().catch(()=>null);
  const copy = page?.copy[locale === "zh" ? "zh-CN" : locale];
  const fixed = copy && "dimensions" in copy ? keys.map(key=>copy.dimensions.find(row=>row.code===key)?.raw) : [];
  return [
    ...(fixed.length === 4 && fixed.every((raw):raw is number=>typeof raw==="number") ? [makeSample(
      "公开固定样张","觉察与调节可能不同",fixed,"四条为同一份公开样张换算的 0–100 量尺分。完整样张另有标准分，两种读数不同。",true,
    )] : [makeSample("觉察示意","先觉察，再找调节的方法",[56,42,50,46],"教学演示，0–100 量尺分，不是人群百分位。")]),
    makeSample("沟通练习示意","理解对方与说清自己",[50,52,63,45],"教学演示。理解对方之后，可以练习把自己的需求说清。"),
    makeSample("各项接近示意","场景有时比小分差更有信息",[50,51,49,52],"教学演示。四项按同一量尺显示，细小差别用具体经历复核。"),
  ];
}
