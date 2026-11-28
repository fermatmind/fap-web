import type { ModularComparisonSpec } from "../modularComparison";

const sources = {
  waiting: {
    label: "卫健委三级公立医院绩效监测手册",
    href: "https://www.nhc.gov.cn/yzygj/c100068/202506/6a97e937c58b413d8a0ffdcc23d325d4/files/%E3%80%8A%E5%9B%BD%E5%AE%B6%E4%B8%89%E7%BA%A7%E5%85%AC%E7%AB%8B%E5%8C%BB%E9%99%A2%E7%BB%A9%E6%95%88%E7%9B%91%E6%B5%8B%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C%EF%BC%882025%E7%89%88%EF%BC%89%E3%80%8B-20250626185206294.pdf",
    note: "2025 版印刷页 68、指标 23。核定义、公式及爽约处理。",
  },
  bioJob: {
    label: "北京大学医学部｜生物统计部统计师与助理统计师招聘",
    href: "https://rsc.bjmu.edu.cn/rczp/jfxz/6c5c5732e63a41e2a31d44b01ad35d41.htm",
    note: "2026-11-03，北京。核岗位职责与应聘条件：方案统计部分、SAP、统计报告、结果复核与两级学历分工。",
  },
  shanghaiJob: {
    label: "上海临床研究中心｜统计分析师招聘",
    href: "https://clinic.shanghaitech.edu.cn/jobs/83",
    note: "上海，职位页 83 未见单独发布日期。核岗位职责与入选标准：统计分析计划及统计协作，列明硕士研究生及以上。",
  },
  generalJob: {
    label: "对外经贸大学就业平台｜扬腾集团校招",
    href: "https://career.uibe.edu.cn/front/zwxx.jspa?xqzwId=2031982504138776577&zpxxId=2031985824978968577",
    note: "2026 届，福州。第 12 岗是人力资源部数据分析校招生；核数据校验、外部调研、年度预算支持及本科条件。仅为统计技能相邻岗位。",
  },
  localStatistics: {
    label: "广州越秀区建设街道｜专职统计员招聘",
    href: "https://www.yuexiu.gov.cn/zwgk/rsxx/gkzkzp/zpgg/content/post_10535190.html",
    note: "2025-11-11，广州。岗位职责涵盖名录维护、采集、审核、汇总、上报与催报。仅证明该基层统计岗位。",
  },
  process: {
    label: "国家统计局｜统计业务工作的基本流程",
    href: "https://www.stats.gov.cn/zs/tjws/tjzn/202301/t20230101_1903361.html",
    note: "政府统计业务示例。核调查设计、数据采集与处理、审核评估、公布和统计分析环节。",
  },
  sampling: {
    label: "国家统计局｜规模以下工业抽样调查设计",
    href: "https://www.stats.gov.cn/zs/tjws/jbtjzswd/tjdc/202504/t20250427_1959488.html",
    note: "2025-04-27。核分层随机与整群抽样、基础权数和无回答调整。适用规下工业示例。",
  },
  wages: {
    label: "国家统计局｜2025 年城镇单位就业人员年平均工资",
    href: "https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html",
    note: "2026-05-15 发布。表 6–8 是规模以上企业按大类岗位的税前年平均数，单位元，无法拆出两岗。",
  },
  cert: {
    label: "国家统计局、人力资源社会保障部｜统计专业技术资格新规",
    href: "https://www.stats.gov.cn/gk/tjfg/gfxwj/202504/t20250427_1959484.html",
    note: "国统字〔2025〕30 号，附件一《统计专业技术资格规定》、附件二《统计专业技术资格考试实施办法》。",
  },
  certGuide: {
    label: "国家统计局｜统计专业技术资格政策解读",
    href: "https://www.stats.gov.cn/zt_18555/tjfz/tjfzjs/fzjsdt/202504/t20250427_1959487.html",
    note: "取得初、中级资格分别对应助理统计师、统计师；高级考试合格还须通过相应职称评审。",
  },
  trialRule: {
    label: "辽宁省药监局转载｜药物临床试验质量管理规范（2026 年修订）",
    href: "https://ypjg.ln.gov.cn/ypjg/ztzl/ypyfcxxxfw/zcfgzq/flfg/2026071921180223928/index.shtml",
    note: "2026-09-01 施行。第四十八条（四）及第五十一条（五）涉及统计计划和数据确认；第五十条涉及申办者提交报告；第二十二、二十五条明确伦理批准与医学决定主体。",
  },
  rManual: {
    label: "R 项目｜统计包参考手册",
    href: "https://stat.ethz.ch/R-manual/R-devel/library/stats/html/aggregate.html",
    note: "aggregate 文档描述按组执行统计函数，只用于核工具能力。",
  },
  ichE9: {
    label: "ICH｜E9 临床试验的统计学原则",
    href: "https://database.ich.org/sites/default/files/E9_Guideline.pdf",
    note: "第 2.1.1、5.1 和第 7 节：试验目标与阶段、统计分析计划和报告。适用药物临床试验。",
  },
  nmpaE9: {
    label: "国家药监局｜适用 ICH E9 等技术指导原则",
    href: "https://english.nmpa.gov.cn/2019-12/19/c_435306.htm",
    note: "2019 年第 88 号公告英文发布页，附件目录核 E9 在中国大陆适用。",
  },
  ichE8: {
    label: "ICH｜E8(R1) 临床研究一般考虑",
    href: "https://database.ich.org/sites/default/files/E8-R1_Guideline_Step4_2021_1006.pdf",
    note: "第 4 节、表 1：药物开发研究目标与阶段可以交叠，I 期早期、II 期探索、III 期验证并非机械对应。",
  },
  deviceRule: {
    label: "海南省药品查验中心转载｜医疗器械临床试验质量管理规范",
    href: "https://amr.hainan.gov.cn/himpa/yprz/zcfg/ylqx/202407/t20240728_3705206.html",
    note: "2022 年第 28 号公告原文及附件；第七条与第四章，器械申办者质量责任和方案管理。",
  },
  sdtm: {
    label: "CDISC｜SDTM 概念模型",
    href: "https://www.cdisc.org/standards/foundational/sdtm/sdtm-v2-0",
    note: "Version 2.0 页面 Overview。组织临床试验和非临床数据的标准化模型。",
  },
  adam: {
    label: "CDISC｜ADaM 分析数据模型",
    href: "https://www.cdisc.org/standards/foundational/adam",
    note: "Overview：分析数据与元数据、分析复现、回溯至 SDTM。",
  },
  ars: {
    label: "CDISC｜Analysis Results Standard",
    href: "https://www.cdisc.org/standards/foundational/analysis-results-standard",
    note: "Overview：从研究方案、SAP 与 ADaM 建立结果追溯链。标准不是岗位准入。",
  },
  cdiscTlf: {
    label: "CDISC｜Electronic Tables, Figures and Listings",
    href: "https://www.cdisc.org/kb/etfl",
    note: "官方知识库项目说明，描述表、图、列表作为一类结果输出。",
  },
  sas: {
    label: "SAS｜PROC FREQ 官方文档",
    href: "https://documentation.sas.com/api/collections/statcdc/14.2/docsets/statug/content/freq.pdf",
    note: "SAS/STAT 14.2 的 Overview 与 TABLES 小节，可核频数表与交叉表。",
  },
  pandas: {
    label: "pandas｜Group by 用户指南",
    href: "https://pandas.pydata.org/docs/user_guide/groupby.html",
    note: "Aggregation 小节解释 Python pandas 对分组输入做合计、计数等统计。",
  },
  hospitalJob: {
    label: "四川大学华西医院｜临床流行病学与循证医学中心招聘",
    href: "https://wchscu.cn/public/notice/recruit/87395.html",
    note: "成都，岗位职责和招聘条件。项目涉及临床研究设计、数据库治理与统计分析，列 Python、R、SAS、STATA。",
  },
  riskJob: {
    label: "重庆市国资委发布｜市属机构风险计量岗位招聘",
    href: "https://gzw.cq.gov.cn/gqzp/202604/t20260424_15636103_wap.html",
    note: "2026-04-24，重庆。核数学或统计背景、精算或风控定价经验、Python/SAS/R/SQL 及岗位职责。仅为金融相邻岗位。",
  },
  croJob: {
    label: "德达医药｜CRO 岗位职责",
    href: "https://www.dedamedcro.com/career/",
    note: "雇主自有招聘页，统计编程岗职责包含按 CDISC 用 SAS 生成 SDTM 和 ADaM；页面无发布日期，非市场比例。",
  },
  pharmaJob: {
    label: "华中科技大学就业网｜恒瑞医药 2027 届校园招聘",
    href: "https://job.hust.edu.cn/sxjob/2438358.htm",
    note: "恒瑞医药 2027 届校招计划临床类别，列上海高级生物统计师（博士）；同页前一张表另外列生物统计师管培及统计编程管培，按各表可见范围解读。",
  },
  pharmaCRO: {
    label: "华中科技大学就业网｜昆翎 2027 校园招聘",
    href: "https://job.hust.edu.cn/extxjh/171791792111075.do",
    note: "昆翎提交的招聘公告，武汉宣讲 2026-11-05，贴号 171791792111075，需求职位列生物统计师、统计程序员和临床数据协调员。校招样本不代表药企或 CRO 普遍分工。",
  },
} as const;

const roleA = "生物统计师";
const roleB = "统计师";
const waitingRule = "纳入按预约时间到院并就诊的门诊人次，同次挂号计一次，排除爽约。入室后医生点击叫诊系统的时钟减分诊台或信息系统报到时钟，单位为分钟。";
const fixture = {
  before: "上线前上午 10、10 分钟，下午 30、30 分钟",
  after: "上线后上午 10、10、10 分钟，下午 30 分钟",
  exclusion: "前后各另有 1 次爽约",
  dashboard: "看板草稿把上线后的均值填为 12 分钟",
  beforeMean: "二十",
  afterMean: "十五",
  balancedMean: "二十",
} as const;
const rawInput = "八条均为不同挂号的有效就诊人次，均按预约时间到院，分钟数均为上述两个时钟之差。" + [
  fixture.before,
  fixture.after,
  fixture.exclusion,
].join("；") + "。";
const commonTrialAnswer = waitingRule + "两期各四人次。";
const crudeResult = "上午均为十分钟、下午均为三十分钟，整体均值由" + fixture.beforeMean + "降到" + fixture.afterMean + "分钟";
const balancedResult = "把两期上午和下午都各按一半计算，均为" + fixture.balancedMean + "分钟";

export const biostatisticsComparisonZhSpec: ModularComparisonSpec = {
  pairId: "biostatisticians-vs-statisticians",
  locale: "zh",
  title: "生物统计师 vs 统计师：临床研究、通用统计与入行路线",
  shortTitle: "生物统计师 vs 统计师",
  description: "从药企与 CRO、医院临研与公卫、政府调查及企业统计三条路径，比较生物统计师和统计师的交付、工具、资格与薪酬口径。",
  regionLabel: "中国大陆",
  authorName: "FermatMind 职业研究",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "同样面对一份结果，一边要回答“这项健康研究究竟证明了什么”，另一边要确认“统计覆盖了谁，换一批数据还能不能复算”。如果你想跟完整的药械或医学研究，先看生物统计岗的方案和报告；如果你更想跨政府调查、企业经营或金融项目解决抽样、指标和估计，先看通用统计方向。两边都做设计和质控，交给谁用、能据此做什么，才是主要分界。",
    roleA: {
      badgeTitle: roleA,
      riasecLabel: "霍兰德 ICS",
      aliases: "北大医学部生物统计部的岗位叫“统计师”“助理统计师”，上海临床研究中心叫“统计分析师”。CRO 招聘也可把“生物统计师”和“统计程序员”分开列。",
      keywords: "研究问题、分析计划、结果解释、可追溯报告",
    },
    roleB: {
      badgeTitle: roleB,
      riasecLabel: "霍兰德 ICR",
      aliases: "统计师也可指统计专业中级职称。广州越秀区建设街道的基层职位叫“专职统计员”。求职时还可查调查、统计分析岗位。企业的“数据分析”职位若负责编定口径和验证结果，也有相邻工作。",
      keywords: "指标口径、样本范围、分层汇总、复核报告",
    },
    interviewBoundaryTitle: "看到两个相似的岗位名，先问要交哪份材料",
    interviewBoundaryQuestions: [
      "第一份独立交付是统计分析计划、可验证的程序与表，还是调查统计的估计与质量报告？",
      "结果和预期不符时，我负责查分析定义、底层记录还是统计发布口径？谁能确认最终解释？",
    ],
    riasecBoundaryNote: "这里的霍兰德徽章按本站发布向量取前三项，只描述工作兴趣。胜任能力、学历、职称、数据权限与签审责任须另外核实。",
  },
  topology: {
    title: "一份结论怎样被两端核对",
    summary: "研究一端要让结论回到研究问题，通用统计一端要让数值回到统计总体与输入版本。即使同一人负责两段，也应留下分别能审阅的材料。这里把两种侧重画在同一张图上，实际项目以授权分工为准。",
    ariaLabel: "生物统计与通用统计围绕数据和结论的工作侧重",
    leftZoneTitle: roleA,
    leftSteps: [
      { title: "定研究问题", detail: "先说清比较对象" },
      { title: "写分析口径", detail: "记录规则与偏离" },
      { title: "写研究解释", detail: "交代推断边界" },
    ],
    centerZoneTitle: "数据与结果",
    upperBridge: { title: "交分析规则", line1: "记录对象", line2: "分析版本" },
    lowerBridge: { title: "回交复核表", line1: "分层人次", line2: "异常记录" },
    rightZoneTitle: roleB,
    rightSteps: [
      { title: "核总体和样本", detail: "确认覆盖与排除" },
      { title: "复算并拆层", detail: "查分母和权数" },
      { title: "写方法说明", detail: "说明可比范围" },
    ],
  },
  matrix: {
    title: "选岗位前，把两套交付要求对照一遍",
    summary: "生物统计是统计学的应用方向。下面把药企与 CRO、医院及高校公卫，以及政府调查、金融和企业等通用统计方向放到同一张表。矩阵说的是交付如何变化，岗位样本只说明这种分工存在。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    expandButtonLabel: "展开全部对照",
    collapseButtonLabel: "收起后四项",
    rows: [
      { id: "output", dimension: "交付物与职责边界", roleA: "生物统计师把健康研究问题变成可审核的分析计划，再跟踪数据、结果表和最终报告是否回答同一个问题。计划要明确人群、要衡量的结果、分析方法和解释界限。统计程序员按约定生成可复跑的数据与结果，同岗也可兼做。能不能独立起草计划、审定表注，是区分项目统计岗和纯生产岗的线索。", roleB: "统计师把调查或经营问题变成可复算的估计：定义总体、样本、指标与版本，交数据字典、统计表及误差说明。复核时说明抽不到谁、缺失记录如何处理、改口径后能否跨年比较。企业周报、抽样估计和风险模型验证是三类交付，岗位名一样也要分别判断。", defaultVisible: true },
      { id: "registration", dimension: "药企与 CRO 临床开发", roleA: "药企的医学、临床开发或生物统计团队可以参与药物试验的方案、SAP 和结果解释。恒瑞医药的 2027 届校招在临床类别列出上海高级生物统计师。CRO（合同研究组织）按委托范围提供统计、编程及数据服务。昆翎校招把生物统计师、统计程序员、临床数据协调员分别列岗；德达医药的统计编程岗明确用 SAS 按 CDISC 生成数据集。医疗器械临床试验另按器械规范核方案与申办者责任。", roleB: "通用统计背景可以进入这些团队，但投递前要对照作品：抽样、回归和复算可迁移；识别申报分析集、处理方案与数据差异、读懂研究材料要另练。若岗位只让你维护项目数量、结题周期和经营报表，它属于研发经营分析，即使办公地点在药企也不能当作试验统计经历。", defaultVisible: true },
      { id: "clinical", dimension: "医院、高校与公卫方向", roleA: "医院临床研究中心可以把医学问题变成研究问题并治理数据库；高校医学统计与公卫流行病学可把关注点移到暴露定义、人群异质性和可推广范围。华西临床流行病学与循证医学中心的招聘把研究设计、数据治理与分析列在一起；上海临床研究中心的统计分析师也列统计分析计划和研究协作。", roleB: "健康服务统计可追门诊量、就诊时长和缺失记录；公卫调查同样需要权数、样本覆盖和数据质控。判断自己偏哪边，看成果要交给哪一方：运营部门可能要分母订正及重复监测，研究组还要推断条件、协作定义和研究报告。真实人群资料只在授权环境用。", defaultVisible: true },
      { id: "general", dimension: "政府调查、金融与企业", roleA: "生物统计训练中的复现和不确定性解释也能迁移到公共调查、经营分析。若转风险定价，要补产品成本、暴露定义及验证口径，光凭健康研究作品不证明懂金融；若转企业研究，能先说明哪类用户未被覆盖、为何不能把样本直接当作全部客户，会比只交图更有用。", roleB: "政府统计按调查制度、采集、审核、评估和发布衔接，广州基层招聘还列名录与催报。金融风控、精算是相邻路径，重庆担保机构样本包含定价和风险计量，不等同于统计师职称。企业经营把数据用于预算、指标或决策；市场调研还要说清抽样框、回答偏差和结果可推广到谁。", defaultVisible: true },
      { id: "tools", dimension: "SAS、R、Python 如何分工", roleA: "采用 CDISC 的项目里，SDTM 描述标准化数据结构，ADaM 为分析与追溯准备数据和元数据，TLF 是结果表、列表和图。岗位实做可能一边写分析规则，一边核输出能否回到输入。北大医学部统计岗的 SAS、R 要求与华西的 Python、R、SAS 等备选工具只说明各自样本。", roleB: "SAS 的 PROC FREQ 能出频数和交叉表，R 的 aggregate 能按组汇总，Python 的 pandas 可按组计数和聚合。三者都要先确定一条记录代表什么。做规模以下工业调查，要另外核基础权数与无回答调整；用脚本普通平均，不能代替调查设计要求的估计。", defaultVisible: false },
      { id: "phase", dimension: "阶段、产出和审核", roleA: "临床试验 I–III 期的目标有侧重：I 期关注早期安全与临床药理，II 期探索，III 期验证，实际研究目的可重叠。进入哪一阶段都应先确认项目目标及分析计划，再对照报告。我国适用 ICH E9 的药物临床研究受该统计原则指导，药物 GCP 的申办者职责和医生医学判断须另核。", roleB: "通用统计团队也有事前与事后分工：先核调查方案与抽样结构，再做检查、估计、审阅和发布。形成口径意见、修数据、审核和同意发布可以由不同人承担。若表内两期总体不同，先分清数据错误、指标变化还是覆盖对象变了，再谈需要说明或修订什么。", defaultVisible: false },
      { id: "growth", dimension: "学历与成长方向", roleA: "研究方法方向可由按规则复算，走到独立写计划、解释偏离和向研究者汇报；编程质量方向可从生成表图，走到数据结构、输出规则和独立验证。北大医学部样本给统计师和助理统计师列不同学历和经验要求；以目标岗位条件核能从哪一段切入。", roleB: "政府与事业单位看聘任系列、考试和评审是否相关，企业需要判断报表岗能否进入抽样或方法设计。可把成长落实到逐级交付：整理一份有定义的表，独立做出可复跑的估计，再说明它怎样影响决策。企业校招样本接受相关本科的安排不能替其他职位定门槛。", defaultVisible: false },
      { id: "friction", dimension: "忙的时候，谁返工", roleA: "收到统计表，研究团队可能发现一个结局定义在两个中心没有对齐。此时需要回到定义和数据版本，明确修正理由；如果已经锁定分析材料，还要记录偏离、留痕并复核受影响的输出。求职先判定自己愿不愿面对很长的定义讨论和受限数据环境。", roleB: "报送前两个地区的单位编码不同，先处理名录差异和重复，再决定监测值有没有变化。经营项目还可能在口径没定时要结论。若职位只负责催收和搬表，且拿不到原始定义，难以做误差判断；若有成体系的复核岗，工作量也包括每次校对和订正。", defaultVisible: false },
    ],
  },
  incident: {
    title: "门诊等待看板下降，下一封邮件该怎么写",
    summary: "这是医院服务流程的模拟评估，两岗用的是同一份候诊卡。统计复核负责还原平均数，研究分析负责判断这份前后对比到底支持什么解释。眼前的目标是挡住不可靠的效果结论，同时保留可复核的描述。",
    triggerLabel: "看板草稿与底稿不一致",
    triggerBody: fixture.dashboard + "，但底稿按相同规则入组后，" + crudeResult + "。团队原本想在介绍分时预约的内部材料里直接写“改版缩短了等待”。",
    triggerCaveat: "时段、数据、岗位分工与审核流程均为纸面模拟。卫健委手册提供指标定义，未提供这些现场数据，也未验证该医院的改版。",
    rows: [
      { stage: "复核时点和人次", roleLabel: roleB, tone: "roleB", verifiedFacts: waitingRule, openGaps: "先核看板是错在字段、分组、分母还是抄录。当前只知道数字不一致，不猜测根因。", actionAndApproval: "交分时段总数与复算截图，列出改前后记录版本。页面草稿由运营负责人暂停采用，获授权编辑拿到复核结果后更正。" },
      { stage: "把改善主张拆开", roleLabel: roleA, tone: "roleA", verifiedFacts: balancedResult + "。", openGaps: "两期上午占比不同，尚未核项目是否还发生了科室、号源或就诊构成变化。没有对照或可信研究设计，因果解释留空。", actionAndApproval: "交描述性结论及限制句，按团队授权请指定研究负责人审阅；若仍要评估流程效果，先另立比较设计。" },
      { stage: "批准内部材料", roleLabel: "模拟运营负责人", tone: "roleB", verifiedFacts: "这项纸面交接只核内部描述。统计复核单和分析解释必须引用同一版数据。", openGaps: "确认图表、表注和正文说的是相同观察窗，确认未经验证的推广与疗效句均已删除。", actionAndApproval: "待获授权的第二位复核人可从同一份底稿得出相同结果，且研究负责人确认限制表述后，由运营负责人批准内部材料。" },
    ],
    recoveryAcceptanceTitle: "什么情况下，这张表可以回到材料里",
    recoveryAcceptanceCriteria: "用同一版底稿，逐条核对是否按预约时间到院、分诊台或信息系统报到时钟、入室后医生点击叫诊系统的时钟与有效人次。复核去重和爽约排除后，应能独立复算 20、15 分钟，及上午下午各半后的两个 20。正文与图注都把总体变化标成描述。若时点缺失、分母未锁定或两人复核不一致，保留待核标记，暂停采用受影响的数字。",
    defenseLayerNote: "同一套分析方法能被运行不意味着结果应进入汇报。先确认原始记录覆盖的人群，再确认报告想回答的问题。此练习涉及运营数据；真正的人体或药物临床项目由机构按适用伦理、数据治理和项目授权确定审批。",
  },
  payAndCerts: {
    title: "薪酬与职称，先看团队按什么交付定岗",
    summary: "药企、CRO、医院研究团队和企业统计部门可能都叫你统计师，考核对象却可以是申报材料、研究项目、发布表或业务指标。国家统计局的岗位大类工资只能交代背景，无法对比这两个职名。",
    salaryHeading: "按用工、周期和责任拆开报价",
    salaryBody: "药企或 CRO 的项目统计要区分程序生产和负责分析方案、复核、解释。两类岗位是否同级，先看职级文件是否支持独立审阅成果或对接委托方；若报价含项目奖金，区分按交付验收还是按年度考核确认，也核补数后的返工工时如何处理。医院或高校临研同时要看合同跟哪个项目、资金或岗位期限，不能把每月津贴直接乘全年。通用统计的政府岗位看聘任序列、用工合同和是否配套职称，企业岗位看指标或模型成果的验收责任，金融相邻岗还要区分做模型和独立验证。先用税前固定薪乘书面保证月数，把保证现金、条件奖金、项目补贴和实际合同期放在不同列；单独估差旅、返工和固定报送周期。报销是支出返还，在薪资列之外记录。对只有转表权限的岗位，若目标是升到方法或项目岗，把可拿到的独立交付与审核权限也作为选岗成本。",
    certs: [
      {
        name: "全国统计专业技术资格（初级、中级、高级）",
        officialScope: "按现行国家统计局、人社部规定，取得初级、中级资格分别对应助理统计师、统计师职称；高级统计师还须在考试合格后通过职称评审。",
        workplaceBoundary: "职称属于专业评价，是否聘到相应统计岗位要看用人单位。医院、研究机构和企业招聘也会把“统计师”用作职位名称，单凭职名不能推出已评聘职称。",
        verificationTips: "报考核当年考试通知及考区审核。求职把拟聘序列、起始岗位和评审对应分开核；看到资格与职称对应条款，也要看单位聘任文件。",
        officialLinks: [sources.cert, sources.certGuide],
      },
      {
        name: "药物临床试验 GCP 与 ICH E9",
        officialScope: "在适用的药物临床试验中，申办者负责制定符合试验方案的统计分析计划、按要求提交临床试验报告。我国对适用的药物临床研究采用 ICH E9 等相关技术指导原则。",
        workplaceBoundary: "项目可授权统计人员拟稿、分析或复核。伦理审批与医学判断由适用规范指定主体承担，统计职称或培训记录不能替代授权、申办者责任或医生资质。",
        verificationTips: "核岗位的项目类型与培训要求，再看方案、分析计划、程序验证和报告递交的分工文件。器械按相应规范核，非注册研究按项目适用制度核。",
        officialLinks: [sources.trialRule, sources.nmpaE9, sources.deviceRule],
      },
    ],
    interviewChecklistTitle: "三组书面条件，放到同一张表",
    interviewChecklistQuestions: [
      { label: "雇佣条款", question: "合同覆盖几个月？税前固定发薪月数、试用折扣、项目补贴、奖金触发条件和续聘分别写在哪份文件？" },
      { label: "研究或注册团队", question: "能否获授权起草计划或验证输出？数据迟交、版本变化时，哪些人要重跑并承担审核节点？" },
      { label: "调查或经营团队", question: "负责的是定义指标和估计，还是在给定口径下出表？错数由谁决定停发和订正，相关责任在哪一档职级体现？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "进阶作品",
    title: "四周交付一份可核的统计作品",
    summary: "任选一轨。全用自造非个人数据并在本地完成。生统轨练习公开结果标准的可追溯思路，统计轨练习分层和样本覆盖。不使用患者记录，不作临床试验方案或合规申报。",
    tracks: [
      {
        id: "health-report",
        title: "健康服务报告",
        badge: "生物统计轨",
        tone: "roleA",
        weeks: [
          { weekLabel: "第 1 周 · 先定问题", deliverable: "交一页版本化分析计划和模拟数据字典。写清研究目的、服务场景的纳入条件、时间单位和两个层。给三条输入附上人工可算的预期结果。" },
          { weekLabel: "第 2 周 · 生成结果", deliverable: "用 R 按组汇总合成记录，生成两张表。保留数据版号、实际分母和两处故意留空的处理日志；脚本应能从原始合成表重建结果。" },
          { weekLabel: "第 3 周 · 跟到来源", deliverable: "写两条结论，每条标表格单元、程序输出与计划句；另附初版和变更版两份输出，让同伴检查哪些数变了、哪些结论没变。" },
          { weekLabel: "第 4 周 · 核推断", deliverable: "交一页非因果报告和独立复核卡。另一人用三条预期记录复算，并说明一条因数据局限暂不可回答的问题。" },
        ],
      },
      {
        id: "survey-report",
        title: "小型分层调查",
        badge: "统计调查轨",
        tone: "roleB",
        weeks: [
          { weekLabel: "第 1 周 · 定总体", deliverable: "选非敏感的消费或服务主题，模拟两个分层的总体名录。交字段、抽取规则、一个未覆盖群组及其影响说明。" },
          { weekLabel: "第 2 周 · 做估计", deliverable: "用 Python pandas 汇总虚构答卷。交各层应答数、原始比例、用模拟总体份额合并的比例，与人工验算格对比。" },
          { weekLabel: "第 3 周 · 看漏答", deliverable: "将第一层一条原答为“是”的记录改为未答，保留抽中名单，未答不计为“否”。复跑并交两版表，分列应答率和有效答卷中的“是”占比；解释为何不能据此判断未答者的选择。" },
          { weekLabel: "第 4 周 · 模拟发布", deliverable: "交一张表、一页调查方法和修改日志。同伴仅按文档确认总体、单位、参数和可推广对象，再用手算对上一行。" },
        ],
      },
    ],
  },
  checklist: {
    title: "用两栏清单判断你愿意练什么、又能接受什么",
    summary: "技能和条件各自核对。就算你愿意学研究设计，也可以要求岗位给你足够的复核时间；喜欢复算和统计方法，也不必接受所有临时报送工作。",
    skillsHeading: "我想练的技能",
    skillsOptions: [
      { id: "study-target", track: "roleA", label: "把业务问题写成可检验的比较", summary: "愿意和提问者确认人、时点、比较和目标；先把分析想回答哪句话写下来。", interviewQuestions: ["研究目标调整时，谁记录变更理由？新人可以写计划初稿吗？"] },
      { id: "study-report", track: "roleA", label: "解释一个漂亮数字的限制", summary: "愿意并列报告总体结果与分层结果，给读者一句可理解的适用范围。", interviewQuestions: ["报告最后一页是谁写限制？会不会有第二位统计人员单独复核？"] },
      { id: "audit-denominator", track: "roleB", label: "核清分子、分母和时间字段", summary: "愿意沿统计表回溯采集记录，找重复、漏答、版本变化和单位差异。", interviewQuestions: ["某次看板变动后，你们怎么发现其实是分母变化？"] },
      { id: "audit-rebuild", track: "roleB", label: "交出别人能复算的结果", summary: "愿意附上分组人次、计算说明与数据版本，独立复算别人写的表。", interviewQuestions: ["核对失败后是原作者自行复查，还是另一人按同一份输入重跑？"] },
    ],
    conditionsHeading: "我能接受的工作条件",
    conditionsOptions: [
      { id: "study-review", track: "roleA", label: "多轮方案与结题讨论", summary: "愿意在不同专业同事之间反复确认目标和术语，也能说明为什么暂时不下结论。", interviewQuestions: ["上一次结题最后一周交了哪些材料？若延迟确认数据，由谁改交付计划？"] },
      { id: "study-access", track: "roleA", label: "遵守较细的数据授权", summary: "能接受按项目范围取数、在授权环境里核记录，不把就诊材料带离工作环境。", interviewQuestions: ["新人在哪个环境跑程序？需要查源记录时找谁申请，能拿到什么级别数据？"] },
      { id: "audit-deadline", track: "roleB", label: "固定出表节点或临时重跑", summary: "可以适应周期性交付，但需要明确在何种质量条件下可以暂停发出。", interviewQuestions: ["有几次固定出表节点？业务催稿与数据待核冲突时，谁决定延迟？"] },
      { id: "audit-collaboration", track: "roleB", label: "逐层追问原表负责人", summary: "能接受向填报、采集和系统同事追问证据，并记录每次更正来自何处。", interviewQuestions: ["数据错误需要跨部门核对时，这个岗位有多少查证权限、外勤和沟通时间？"] },
    ],
    defaultInterviewQuestions: ["拿最近一次看板差异或研究返工举例：用了什么原材料、谁决定处理方式、新人能参与到哪一步？"],
    crossTrackNote: "两栏分向不同岗位也有用。用具体雇主的首份交付、团队节奏与复核权限，判断这个岗位是否同时满足你的技能兴趣和工作条件。",
    offlinePrintHint: "打印后用两种记号分别勾题，再记下雇主给出的文件名称或例子。",
  },
  desktopExercise: {
    sectionTitle: "5 分钟纸面试做：平均少等五分钟，是不是改版更好了？",
    summary: "任选一轨，按离线卡复算两期，写一段交接说明。全程纸面。",
    publicLinksHeading: "公开指标原件",
    publicLinks: [sources.waiting],
    factSummaryHeading: "原件和模拟数据",
    factSummarySegments: [
      { text: "原件口径。", tone: "strong" },
      { text: waitingRule },
      { text: "模拟数据。", tone: "strong" },
      { text: rawInput + fixture.dashboard + "。运营材料拟把变化归功于分时预约改版。" },
    ],
    taskA: { title: "生物统计轨 · 解释备忘", instruction: "写人群、两期总体、两个时段和结论限制。把两期上午与下午各按一半重算。写一句汇报解释和一项待核条件。" },
    taskB: { title: "统计复核轨 · 差异单", instruction: "写人群、两期总体、两个时段和结论限制。用等待合计和有效人次说明看板哪处要改，写出退回对象和恢复用表的条件。" },
    rubricTitle: "对照样答",
    rubricHeading: "每轨三项",
    rubricPassRule: "两项共用加所选一轨，逐条核对。",
    rubricItems: [
      "共用一｜写齐纳入、去重、爽约排除和两个时钟；两期各四人次。",
      "共用二｜两期总体为二十和十五分钟、两个时段各自不变；观察差异不证明改版效果。",
      "生物统计轨｜两期各半重算均为二十分钟，提出要核时段构成以外的一项可追溯条件。",
      "统计复核轨｜列两个分子和分母，标明草稿数字错误，交报表负责人并等同版复算通过。",
    ],
    sampleAnswerALabel: "生物统计轨样答",
    sampleAnswerA: commonTrialAnswer + crudeResult + "。" + balancedResult + "。汇报只说观察均值下降，不能断因果。请核两期科室范围是否一致，若不一致就在结论注明。",
    sampleAnswerBLabel: "统计复核轨样答",
    sampleAnswerB: commonTrialAnswer + "总等待八十和六十分钟，分母都是四。" + crudeResult + "。看板十二需退回报表负责人，拿同版明细由他人复算一致后再用。下降不能证明改版效果。",
  },
  tools: {
    title: "从你现在卡住的地方选一项",
    summary: "先把想投的职位说明圈出来。若卡在兴趣、工作条件、岗位任务或行动记录，四个入口各解决一个问题。",
    cards: [
      { id: "compare", badge: "核任务", meta: "双岗对照", tone: "neutral", title: "职业对比工具", description: "手动选择生物统计相关职位和另一项统计职业，对照任务和工作环境。", purposeHint: "拿到两份招聘信息但分不清一个岗位主要交计划还是交表时使用。", ctaLabel: "手选两岗", href: "/zh/career/compare" },
      { id: "worksheet", badge: "记下一步", meta: "行动记录", tone: "accent", title: "职业探索工作表", description: "整理一份自己的面试核查清单，记录样本、分工与仍缺的证据。", purposeHint: "试做后把想追问的工作条件整理出来。", ctaLabel: "打开工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "看兴趣", meta: "60 题", tone: "roleA", title: "霍兰德职业兴趣测试", description: "探索你更愿意长期接触哪些活动。", purposeHint: "还不确定自己喜欢研究提问、方法核验还是其他工作活动。", ctaLabel: "看职业兴趣", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "assessment", badge: "核工作偏好", meta: "94 题", tone: "roleB", title: "费马职业测试", description: "梳理工作活动、工作方式和工作条件偏好。", purposeHint: "喜欢做统计，但还需要区分项目协作、报送节奏与持续复核。", ctaLabel: "看工作偏好", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "两岗位档案",
    profileLinks: [
      { label: roleA, href: "/zh/career/jobs/biostatisticians" },
      { label: roleB, href: "/zh/career/jobs/statisticians" },
    ],
  },
  faqs: [
    { id: "distinction", question: "生物统计师和统计师怎么选？", answer: "先看你希望交什么。想跟进药械研发、医院临研或公卫研究，优先找能接触分析计划、解释和复核的生物统计岗；更喜欢在政府调查、企业经营或风控相邻工作中解决总体、抽样和估计问题，可找通用统计方向。两边都能设计和分析；看到同一个职名时，用团队的头两件实际交付物确认分工。" },
    { id: "eligibility", question: "生物统计应聘，统计师职称、学历和软件哪个更重要？", answer: "先满足目标岗位明确列出的条件。北大生物统计部的统计师与助理统计师要求不同，上海临研样本列硕士及以上，不能推成统一学位门槛。若走单位统计系列，再核全国统计专业技术资格的考试、评审及聘任。没有药企经历时，先拿能从结果追到数据和口径的作品验证方法基础；若目标岗位要 SAS 验证，另补按规范读程序和复算的能力。" },
    { id: "pipeline", question: "从 SAP 到 CDISC 的 SDTM、ADaM 和 TLF，分别交什么？", answer: "SAP（统计分析计划）先约定如何回答研究问题；采用 CDISC 的项目中，SDTM 组织标准化数据，ADaM 支持正式分析和追溯，TLF 则把结果放进表、列表和图。看到不一致的结果，先从表注沿 ADaM、SDTM 回查同一次计算的计划与输入版本。CDISC 结果规范也强调追溯到方案、SAP 和分析数据，不能把这一套说成所有医院或统计岗的统一格式。" },
    { id: "phase", question: "做药物 I–III 期和做医疗器械试验，会按同一套规范吗？", answer: "药物和器械须按各自适用规范核对，不能直接互套。药物 I–III 期从早期安全与临床药理、到探索与验证，目标可以交叠；我国适用的 ICH E9 是药物临床试验统计指导原则。医疗器械另看器械临床试验质量管理规范及项目方案。对求职者，先看负责哪类产品和项目阶段，再准备对应的统计交付。" },
    { id: "authority", question: "写了统计分析计划，就能批准试验或签发医学判断吗？", answer: "写计划本身不授予批准或医学决定权。适用药物 GCP 时，试验启动前主要研究者需取得伦理审查委员会批准，申办者负责制定统计分析计划并向药监部门提交临床试验报告，医学判断由具备临床医生资质的主要研究者或其授权临床医生负责。统计人员可以依分工拟稿、分析或复核。" },
    { id: "salary", question: "生物统计师是否一定比统计师收入高？", answer: "现有工资公报无法比较两个职名，先比较第一个合同年。举例，一份医院项目岗合同覆盖九个月，另一份企业岗保证十二个月，不能只看月薪；若企业奖金要到离职后才发，就在保守情形先计为零。查下一档岗位看的究竟是能独立交计划和审结果，还是能设计抽样、维护模型口径或独立验收。若前两季都只搬表，和书面职级说明的成长目标对不上，就把这项机会成本单列。" },
    { id: "automation", question: "2026 年，自动化或 AI 可以替统计师完成哪些工作？", answer: "规则确定后，软件可以批量生成频数、按组汇总、复跑相同输出；用获准的工具起草表注时，仍要从结果表反核分母、单位、缺失与版本。生统岗复核输出是否回答了事先约定的研究问题，通用岗复核抽样范围和指标能否比较；发现两期构成不同应由人决定如何表述。软件文档只能证明这些操作能力，不能推出行业采用率或岗位替代比例。" },
  ],
  sourceGroups: [
    { id: "drug-device-guidance", title: "药械临床研究、统计计划与权限", links: [sources.trialRule, sources.deviceRule, sources.nmpaE9, sources.ichE9, sources.ichE8] },
    { id: "clinical-career-samples", title: "药械 CRO、临研和公卫岗位样本", links: [sources.pharmaJob, sources.pharmaCRO, sources.croJob, sources.bioJob, sources.shanghaiJob, sources.hospitalJob] },
    { id: "data-output-tools", title: "数据、分析结果与统计软件官方文档", links: [sources.sdtm, sources.adam, sources.ars, sources.cdiscTlf, sources.sas, sources.rManual, sources.pandas] },
    { id: "general-statistics", title: "大陆统计业务、调查方法和招聘样本", links: [sources.process, sources.sampling, sources.localStatistics, sources.generalJob, sources.riskJob] },
    { id: "qualification-evidence", title: "大陆统计职称与工资统计口径", links: [sources.cert, sources.certGuide, sources.wages] },
    { id: "appointment-evidence", title: "纸面试做指标原件", links: [sources.waiting] },
  ],
};
