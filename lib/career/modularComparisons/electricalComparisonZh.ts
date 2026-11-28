import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "电气工程师";
const roleB = "电子工程师（计算机除外）";
const interestCode = "霍兰德 RIC";
const facts = {
  signing: {
    effectiveDate: "2026年6月1日", projectScope: "工程设计资质标准规定的有关中型及以上工程建设项目",
    role: "相应专业负责人", responsibility: "在工程设计文件的专业负责人责任栏签字并加盖执业印章",
    scopeLinks: [
      { label: "住房城乡建设部建市规〔2026〕1号", href: "https://www.mohurd.gov.cn/gongkai/zc/xzgfxwjk/art/2026/art_2063777831.html", note: "第一项规定项目和签章责任，文末官方附件分别列供配电与发输变电文件目录。" },
      { label: "勘察设计注册工程师管理规定", href: "https://www.mohurd.gov.cn/gongkai/zc/wjk/art/2023/art_17339_775516.html", note: "第十八至二十一条涵盖注册单位、执业范围和签章后的文件修改。" },
    ],
  },
  distribution: {
    cabinet: "1AA", voltageLabel: "0.4 kV", circuit: "1AA-12", useLabel: "备用",
    source: { label: "乌海职业技术学院换热站改造配电图", href: "https://www.ccgp-neimenggu.gov.cn/gpx-bid-file/150301/gpx-tender/2022/7/20/402881cc8211fcfe01821a54364b158d.pdf?accessCode=7fdd8e4f5769035d597aeb034585616a#page=1", note: "采购图纸 PDF 第 1 页右下图签及下方配电系统图，图签日期 2021-07。" },
  },
  board: {
    name: "ESP32-DevKitC V4", sheetSection: "Power Supply", inputNet: "EXT_5V", regulator: "U2", outputNet: "VDD33",
    layoutEvidence: "布局 PDF 第 1 页只见走线、焊盘和尺寸，没有可识读的 U2 位号",
    locatorEvidenceNeeded: "与原理图同修订且带位号的装配图或元件定位文件",
    schematic: { label: "乐鑫 ESP32-DevKitC V4 原理图", href: "https://dl.espressif.com/dl/schematics/esp32_devkitc_v4_sch.pdf#page=1", note: "第 1 页左上 Power Supply 图块，图签为 Rev V4，2020-02-25。" },
    layout: { label: "乐鑫 ESP32-DevKitC V4 PCB 布局图", href: "https://dl.espressif.com/dl/schematics/esp32_devkitc_v4_pcb_layout.pdf#page=1", note: "核首页可见的走线、焊盘与板尺寸；此图缺可识读位号。" },
  },
  pay: { label: "国家统计局《2025年城镇单位就业人员年平均工资情况》", href: "https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html", note: "规模以上企业分岗位部分及表 6 至表 8，区分专业技术人员大类与具体求职岗位。" },
  distributionJob: { label: "正浩创新 2027 届校园招聘 · 配电工程师", href: "https://jobs.ecoflow.com/602892/position/7680036440156539155/detail", note: "深圳，职位号 7680036440156539155，见器件选型、计算书、样机和单板配电评审。单个岗位样本。" },
  boardJob: { label: "深圳优联电气在五邑大学发布的硬件工程师校招", href: "https://career.wyu.edu.cn/detail/online?id=3281168&menu_id=3136", note: "深圳，2026-05-08，招聘页 3281168。见硬件工程师的原理图、PCB、Altium Designer 和调试职责。单个岗位样本。" },
} as const;
const { signing, distribution, board } = facts;
const signingScope = `自${signing.effectiveDate}起，${signing.projectScope}的相应供配电或发输变电专业设计，由对应专业的注册电气工程师担任${signing.role}并${signing.responsibility}。`;
const spareCircuit = `${distribution.circuit}（${distribution.useLabel}）`;
const boardPath = `${board.inputNet} → ${board.regulator} → ${board.outputNet}`;
const distributionGap = "现行批准版系统图，以及新增负荷和保护匹配的复核记录";
const boardGap = "对应板版的物料清单（BOM）和板级验证记录";

export const electricalComparisonZhSpec: ModularComparisonSpec = {
  pairId: "electrical-engineers-vs-electronics-engineers-except-computer",
  locale: "zh",
  title: "电气工程师 vs 电子工程师：职责、签章与入行路线对比",
  shortTitle: "电气工程师 vs 电子工程师",
  description: "比较中国大陆配电与电子硬件岗位的图纸、工作条件和入行作品，核对注册电气工程师签章、软考中级与 IPC 标准的适用范围。",
  regionLabel: "中国大陆",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "一台工业设备或充电桩要运转，电气工程师管“电怎么从配电柜安全接到机柜”，电子工程师管“机柜里那块电路板上的芯片和供电怎么跑通”。想弄清设备从哪条回路取电、负荷和保护如何复核，先看电气工程师的配电方向；想把板上供电和信号要求变成器件选型、原理图、PCB 与验证记录，先看电子工程师（计算机除外）的板级硬件方向。遇到储能或电源产品岗位，问清新人第一份交付是什么、由谁复核。",
    roleA: { badgeTitle: roleA, riasecLabel: interestCode, aliases: "招聘样本里的叫法：配电工程师", keywords: "配电系统图、回路表、器件选型、计算书" },
    roleB: { badgeTitle: roleB, riasecLabel: interestCode, aliases: "招聘样本里的叫法：硬件工程师", keywords: "电子原理图、器件选型、PCB、板级验证" },
    interviewBoundaryTitle: "面试时问两份图的责任",
    interviewBoundaryQuestions: [
      "我负责到配电柜的回路表和计算书，还是也要交控制板的原理图和 PCB？能举一项最近已交付的工作吗？",
      "设备输入要求改动后，谁复核回路和保护方案，谁批准新版板卡，项目涉及时谁在工程设计文件上签章？",
    ],
    riasecBoundaryNote: "两份费马职业档案均列霍兰德 RIC。可用它探索对动手实践、分析和有条理工作的兴趣。胜任力看技能与作品，执业资格和录用条件按具体要求核对。",
  },
  topology: {
    title: "给设备控制板供电，两边各交什么？",
    summary: "选岗时先沿接口找责任。配电侧交付设备供电条件与回路依据，电子侧交付产品输入要求和板级设计证据。图上的空白由能提供证据的人补齐。",
    ariaLabel: "从配电回路到设备输入条件，再到电子板卡设计的交接示意",
    leftZoneTitle: "系统配电",
    leftSteps: [
      { title: "盘点用电需求", detail: "向设备团队确认负荷、接口和运行条件。" },
      { title: "交付配电资料", detail: "让系统图、回路表及选型计算彼此对应。" },
    ],
    centerZoneTitle: "设备供电接口",
    upperBridge: { title: "电子侧交出", line1: "设备输入要求", line2: "适用板版和验证缺口" },
    lowerBridge: { title: "电气侧回传", line1: "系统端供电和保护边界", line2: "对应回路和文件版次" },
    rightZoneTitle: "板级电子设计",
    rightSteps: [
      { title: "拆解板级功能", detail: "把输入电源、稳压与信号分到对应电路块。" },
      { title: "交付板级资料", detail: "让原理图、PCB 位号及验证记录对得上。" },
    ],
  },
  matrix: {
    title: "对比两岗的文件、工具和工作条件",
    summary: "本表聚焦工程或设备配电与产品电子硬件。招聘样本说明具体团队的岗位和任务，不能用来估算工作频率或行业占比。",
    roleAColumn: "电气工程师 · 配电方向",
    roleBColumn: "电子工程师 · 硬件方向",
    rows: [
      { id: "work-object", dimension: "主要设计对象", roleA: "配电柜、母线、支路和设备进线。先厘清负荷分配和保护责任。", roleB: "设备内部的电子电路和 PCB。把板级电源、信号及器件连接落实到图纸。", defaultVisible: true },
      { id: "document-output", dimension: "能拿出来看的交付物", roleA: `系统图、回路表、选型计算书。公开图可看 ${distribution.cabinet} 柜和 ${spareCircuit}的标注。`, roleB: `原理图、PCB 布局、器件清单及验证记录。公开样板可在原理图定位 ${board.regulator}；${board.layoutEvidence}，需要${board.locatorEvidenceNeeded}才能核实际位置。`, defaultVisible: true },
      { id: "tools", dimension: "工具要会到什么程度", roleA: "深圳配电招聘样本要求 CAD，配套交付配电原理图和低压器件选型计算。核目标团队使用的软件和图框。", roleB: "深圳硬件招聘样本列 Altium Designer 等 EDA 工具。问是自己完成原理图与布局，还是交由专职 Layout 同事。", defaultVisible: true },
      { id: "handoff", dimension: "更改方案时要补的材料", roleA: "新增设备时核设备输入要求、现行回路表和负荷／保护复核。把经确认的接口与图纸版次交给下游。", roleB: "改板时对应原理图、PCB、BOM 与测试记录。把板版、输入条件及尚待验证的项目交给测试和整机团队。", defaultVisible: true },
      { id: "signoff", dimension: "谁在文件上负责", roleA: signingScope, roleB: "产品电路图和 PCB 的研发发布看公司指定的硬件与测试复核人。若同时承担工程设计专业负责人职责，再按具体工程和文件核签章要求。", defaultVisible: true },
      { id: "work-conditions", dimension: "入职前要问的工作条件", roleA: "想少出差就问近一次勘查和现场调试的地点、天数及新人责任。赛腾苏州电气设计岗写有厂内及出差调试，目标团队安排请向雇主核实。", roleB: "想少驻厂就核打样和试产地点、谁在实验室调试，以及工艺与硬件怎样分担返工。问上一轮试产各角色实际去了几天。", defaultVisible: false },
      { id: "early-mismatch", dimension: "入行半年内的预警信号", roleA: "想做配电方案，但岗位交给你的工作主要是转抄图纸，没人带你把负荷、保护与回路标注对一遍。", roleB: "想做电路设计，但岗位只有样机返修，没有原理图评审或验证记录的复盘机会。入职前问一项新人负责过的模块。", defaultVisible: false },
      {
        "id": "employer-industry",
        "dimension": "典型雇主与行业去向",
        "defaultVisible": false,
        "roleA": "想走设计院和电力系统，天津电力设计院校招把电气设计和电力电子分列，可问新人参与输变电、配电网设计还是设备方案。想做能源装备或工业配电，可对照正浩创新的配电岗和苏州赛腾的设备电气设计岗，问清交付系统配电文件、柜内图还是 PLC 联调记录。项目经历按公告所列团队核实。",
        "roleB": "看消费电子、工业控制、新能源车电控或半导体应用时，先分清设计对象。深圳优联把硬件、电源硬件和测试分列，宇树把机器人主控板与器件验证列入硬件岗。汇川联合动力的披露可用来辨认电控与车载电源场景，华芯智源校招分列芯片研发、封装测试与设备电子研发。问清岗位交的是产品板、芯片验证结果还是板级应用方案，并核量产前谁接手。"
      },
    ],
  },
  incident: {
    title: "模拟交接：新控制板的供电边界没对上",
    summary: "假设一个设备项目准备更换控制板。设计组拿到上游配电资料和新版板卡资料，设备输入条件却没有注明对应的板版。先退回接口记录核对，直到上下游引用同一版。",
    triggerLabel: "设计评审发现",
    triggerBody: "配电清单仍引用旧设备输入资料，硬件组提交的是新版板级原理图。两份文件写着电源，但对应的是设备入口与板上电源两个层级。",
    triggerCaveat: "这是纸面模拟。下列复核人与执行人是题设分工，实际项目依任命和受控文件确定。",
    rows: [
      { stage: "核对配电侧交付", roleLabel: roleA, tone: "roleA", verifiedFacts: "从现行版系统图、回路表和设备表识别本台设备的供电支路，记录对应文号和版次。", openGaps: "向硬件侧索取新版设备输入条件，核是否触发负荷、保护或图纸变更。", actionAndApproval: "配电设计人员提交修订与计算复核。工程项目的配电专业负责人按项目职责复核。" },
      { stage: "核对电子侧交付", roleLabel: roleB, tone: "roleB", verifiedFacts: "确认新版原理图的输入网络、PCB 版次及用于评审的 BOM 版次。", openGaps: "用缺口表列出尚待验证的设备输入条件和对应记录，交硬件负责人核准。", actionAndApproval: "硬件设计人员回传带板版的输入条件，由硬件负责人确认设计资料，测试负责人复核配套验证证据。" },
      { stage: "复核同一份接口记录", roleLabel: "配电专业负责人", tone: "roleA", verifiedFacts: "从硬件侧接收已复核的输入条件，核其引用的板版与提交资料一致。", openGaps: "将当前系统图、回路、配电复核记录及板版中的差异逐条标记为关闭或待补证。", actionAndApproval: "模拟中由配电与硬件负责人确认各自资料，由指定文控人员发布经批准的文件组合。工程签章适用要求另按本页证照表核对。" },
    ],
    recoveryAcceptanceTitle: "何时恢复文件移交？",
    recoveryAcceptanceCriteria: "接口记录同时指向同一台设备、当前批准的配电图和相应板版。写明设备输入与系统侧供电及保护复核结论，由双方负责人分别确认。若仍待补证，记录补件人和复核所需资料。",
    defenseLayerNote: "这里恢复的是文件移交。实物接线、送电和板级验证属于项目另行批准的工作。",
  },
  payAndCerts: {
    title: "两岗薪酬怎么比，哪些文件涉及注册签章？",
    summary: "拿到 Offer 先统一年收入与工作条件的口径，再问岗位是参与制图与校审、担任工程专业负责人，还是负责产品硬件发布。",
    salaryHeading: "薪酬怎么算、定级核查什么，以及 Offer 对比口径",
    salaryBody: "全国公开统计无法按这两岗排序。面试配电或设计岗时，核对固定月薪之外是否另列项目奖、驻场补贴，大型项目职责或注册签章是否计入定级。面试板级硬件岗时，问有无项目绩效、由谁验收，以及高速电路、电源设计或量产排障是否对应不同职级。想积累设计经验，先问新人是否能独立交选型计算或原理图，而不是一直抄图或返修。对比同城同级 Offer 时，把保证薪月、浮动奖金兑现条件、驻场时长和加班补偿统一折算到同一年。",
    certs: [{
      name: "注册电气工程师（供配电／发输变电）",
      officialScope: `${signingScope} 目录包含相关初步设计和施工图设计文件。供配电示例包括系统图、原理图和计算书。发输变电条目另列保护配置图、输电线路路径图等。`,
      workplaceBoundary: "取得资格证书后仍需按规定注册。从事建设工程设计执业活动须受聘并注册在具备相应资质的单位。产品 PCB 的公司内部评审看硬件与测试的实际职责。",
      verificationTips: "请设计单位说明项目类别与规模、注册专业、拟任角色及需本人签章的文件。若 HR 写“持证优先”，问它对应制图、校审还是专业负责人。",
      officialLinks: signing.scopeLinks,
    }, {"name":"软考中级 · 嵌入式系统设计师","officialScope":"深圳市考试院 2026 年软考通知将嵌入式系统设计师列为中级。湖南省软考办说明涉及嵌入式软硬件、设计开发和集成测试。考期查看当地当年公告。","workplaceBoundary":"这项水平考试可作为嵌入式知识的履历材料。投板级硬件岗还要用原理图、布局或验证作品说明设计能力，不产生注册签章权限。","verificationTips":"问招聘方是否认可该资格、入职交付偏系统方案还是板级设计。","officialLinks":[{"label":"深圳市考试院 2026 年软考考务通知","href":"https://hrss.sz.gov.cn/szksy/zwgk/bmxx/content/post_12693780.html","note":"第一节上半年中级安排。"},{"label":"湖南省软考办《嵌入式系统设计师考试说明》","href":"https://gxt.hunan.gov.cn/gxt/rkb/zgjs11/zgjs22/202202/t20220210_22479879.html","note":"第 1 至 2 部分说明知识范围。"}]}, {"name":"IPC 标准与企业内部评审","officialScope":"IPC 官方《印制板组装标准核对表》将印制板设计相关的 CAD 检查项与 IPC-A-610 组装验收分列。","workplaceBoundary":"IPC 标准用于项目设计与验收，企业内部评审按单位流程分工。两者本身均不授予个人执业准入或工程签章资格。","verificationTips":"问团队用哪份标准、版次和等级，谁复核布局及批准出板。JD 点名个人认证时另问证书用途。","officialLinks":[{"label":"IPC《印制板组装标准核对表》","href":"https://www.ipc.org/sites/default/files/documents/PCBA-Checklist_0.pdf","note":"见 Standards Checklist 的设计和组装验收条目。"}]}],
    interviewChecklistTitle: "决定接 Offer 前问清",
    interviewChecklistQuestions: [
      { label: "收入构成", question: "税前固定部分一年实发几个月？项目奖、量产奖或驻场补偿分别按什么条件支付？" },
      { label: "签章文件", question: "我会署名在哪类图纸上？工程专业负责人是谁，哪些文件要求注册签章？" },
      { label: "验证分工", question: "如果图纸退回或样机指标未达标，谁改图、谁复测、谁批准新版本？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "纸面作品",
    title: "四周做出一份可复核的设计变更包",
    summary: "选一个方向，把一次接口变化记录成能追溯的修改、评审与移交材料。使用本页原件与纸面假设，作品供面试讲解，全程离线并保持设备断开。",
    tracks: [
      {
        id: "distribution", title: "配电方向 · 新增设备的文件变更", badge: "配电", tone: "roleA",
        weeks: [
          { weekLabel: "第 1 周", deliverable: `用公开配电图做一页图纸索引。记录原件、页码、柜号与 ${spareCircuit}，让同伴能在原图找回每个标注。` },
          { weekLabel: "第 2 周", deliverable: "以“新增设备输入资料缺失”为假设，写一张变更申请。设备、电源接口、负荷资料、保护复核及各自的提供人都能在申请上定位。" },
          { weekLabel: "第 3 周", deliverable: "用配电系统图、回路表和计算书类型制作一张版本影响表。每行写清变更涉及哪份文件、需要什么复核证据，以及谁负责补齐。" },
          { weekLabel: "第 4 周", deliverable: "交一份标注为模拟的移交目录，把图纸索引、变更申请和影响表串起来。一位同伴应能指出一个已确认的图面事实、一个尚缺证的判断和对应接手人。" },
        ],
      },
      {
        id: "electronics", title: "电子方向 · 板级电源器件的变更审查", badge: "硬件", tone: "roleB",
        weeks: [
          { weekLabel: "第 1 周", deliverable: `用乐鑫原理图和布局 PDF 写一页电源块证据卡。给出 ${boardPath} 并标出原理图位置。记录“${board.layoutEvidence}”及需要的${board.locatorEvidenceNeeded}，让同伴区分哪一项可以复核。` },
          { weekLabel: "第 2 周", deliverable: `假设 ${board.regulator} 面临供货变动，写一张替代评审单。列出待核的功能、引脚、封装与输入输出条件，每项注明需要的数据表或设计文件。` },
          { weekLabel: "第 3 周", deliverable: "写一张原理图—布局—BOM 影响表。每行标明位号、涉及的文件、版次和待复查项目。纸面假设的替代件维持待评审状态。" },
          { weekLabel: "第 4 周", deliverable: "交一页模拟验证交接单，写明样机标识、待验证项、验收限值的批准来源，以及负责复核的人。测试结果明确标为待测，读者能从任一条记录回到对应的图纸位置。" },
        ],
      },
    ],
  },
  checklist: {
    title: "核对岗位要求：技能与工作条件分别选",
    summary: "用第一栏找到你愿意练的交付物，用第二栏找到你能接受的工作环境。每个选项都能转成面试中可以要到具体例子的提问。",
    skillsHeading: "我愿意练哪种交付物",
    skillsOptions: [
      { id: "distribution-drawing", track: "roleA", label: "读系统图，复核回路与计算书", summary: "沿进线、母线和支路找到设备回路，再核计算输入和图纸一致。", interviewQuestions: ["入职第一季度，我会独立负责哪张系统图或哪一段负荷、保护复核？谁带我做第一次校审？"] },
      { id: "board-trace", track: "roleB", label: "读电子原理图，对照 PCB 与器件", summary: "用网络名和位号定位电路，追查板版变化会影响哪些验证记录。", interviewQuestions: ["新人拿到的是一个电路块设计任务还是一块已出图的调试板？交付时要给出哪些记录？"] },
      {
        "id": "distribution-change",
        "track": "roleA",
        "label": "把设备变更写成配电复核单",
        "summary": "写明支路、图号、版次及待补输入。",
        "interviewQuestions": [
          "新增设备后哪些资料由新人更新，谁复核负荷和保护？"
        ]
      },
      {
        "id": "board-change",
        "track": "roleB",
        "label": "把替代料影响追到验证记录",
        "summary": "从原理图位号追到同版 BOM，列出待测项。",
        "interviewQuestions": [
          "最近一次替代料评审，谁改原理图、谁改布局、谁复核测试？"
        ]
      },
    ],
    conditionsHeading: "我能接受哪种工作环境",
    conditionsOptions: [
      { id: "distribution-site", track: "roleA", label: "能协调勘查、项目交付和现场问题", summary: "具体追问现场地点、频次、连续驻场时长和新人到场责任。", interviewQuestions: ["能举上个项目从图纸交付到现场问题关闭的例子吗？设计岗去了几次，谁处理非工作时间的问题？"] },
      { id: "board-validation", track: "roleB", label: "能接受样机迭代、实验室和试产协作", summary: "具体追问调试地点、试产节点和发生返工时的团队分工。", interviewQuestions: ["最近一轮样机调试与试产在哪进行？原理图、维修、验证和驻厂分别由谁负责？"] },
      {
        "id": "project-review-cycle",
        "track": "roleA",
        "label": "接受按项目阶段排审和补资料",
        "summary": "问资料晚到时怎样排交付优先级。",
        "interviewQuestions": [
          "上次设备输入变更时谁决定排期，新人要联系哪些供应商？"
        ]
      },
      {
        "id": "prototype-rework-cycle",
        "track": "roleB",
        "label": "接受按板版追故障与返工",
        "summary": "问故障从实验室交到工艺组的条件。",
        "interviewQuestions": [
          "复测未通过时我是否要去试产点，谁确认问题关闭？"
        ]
      },
    ],
    defaultInterviewQuestions: ["请拿最近一个已交付项目举例。这个岗位交出哪份文件、向谁交、哪种错误最容易退回？"],
    crossTrackNote: "技能与工作条件出现在不同方向时，找一条具体的交叉岗核对。请面试官分别说明首份交付和首个现场或实验室任务，再判断两项条件能否同时满足。",
    offlinePrintHint: "打印后也可以逐项标记，并记下雇主给出的例子。",
  },
  desktopExercise: {
    sectionTitle: "5 分钟纸面试做：读一条配电回路和一段板上稳压",
    summary: "凭下方公开 PDF 摘记任选一轨约 5 分钟完成。只读图、圈标注、写交接句，全程零通电、零接线、零线上操作（两组图来自独立对象）。",
    publicLinksHeading: "备齐这三张图的指定页",
    factSummaryHeading: "在原件上找这些标记",
    factSummarySegments: [
      { text: `${distribution.voltageLabel}｜${distribution.cabinet}｜${spareCircuit}`, tone: "code" },
      { text: "。另一组图从 " }, { text: `${board.name} ${board.sheetSection}`, tone: "strong" },
      { text: " 追到 " }, { text: boardPath, tone: "code" }, { text: "。布局图用来辨认元件定位还缺什么。" },
    ],
    publicLinks: [distribution.source, board.schematic, board.layout],
    taskA: { title: "配电侧 · 回路摘录", instruction: `在第 1 页下方系统图圈出 ${distribution.cabinet} 柜的进线、母线和 ${distribution.circuit} 支路。写一行“柜号／电压标注／回路号／用途／待补资料”。模拟收到“给新增设备找一条回路”的请求，写明你要核的批准版图纸及负荷和保护记录。` },
    taskB: { title: "电子侧 · 原理图与布局对照", instruction: `在 ${board.name} 原理图第 1 页 ${board.sheetSection} 区沿输入网络写到输出网络，中间注明稳压器位号。对照 PCB 布局第 1 页，记下它能展示什么、能否确认该位号。写一行“输入网络／原理图位号／输出网络／布局证据边界／待补资料”。模拟接手样机问题，写明还需核对的板版 BOM 和验证记录。` },
    rubricTitle: "拿原图逐项核对",
    rubricPassRule: "所选一轨填完全部字段，对应两条均可逐一指出原图证据即可完成；若两轨均试做，四项全部核对。",
    rubricItems: [
      `配电摘录同时对应 ${distribution.cabinet}、${distribution.voltageLabel} 和 ${spareCircuit}。`,
      `配电摘录把图面的“${distribution.useLabel}”保留为用途，能说出还需 ${distributionGap}。`,
      `电子摘录在原理图标出 ${boardPath}，明确${board.layoutEvidence}，并列明所需${board.locatorEvidenceNeeded}。`,
      `电子摘录能列出还缺的${boardGap}，本页只记录纸面发现。`,
    ],
    sampleAnswerALabel: "配电侧样答",
    sampleAnswerA: `第 1 页：${distribution.cabinet}／${distribution.voltageLabel}／${distribution.circuit}／${distribution.useLabel}／待补${distributionGap}。线路在图面从进线经母线分出，新增设备是否可用此回路先留待核对。`,
    sampleAnswerBLabel: "电子侧样答",
    sampleAnswerB: `原理图第 1 页 ${board.sheetSection}：${board.inputNet}／${board.regulator}／${board.outputNet}／${board.layoutEvidence}（无法标出物理位置）／待补${board.locatorEvidenceNeeded}及${boardGap}。`,
  },
  tools: {
    title: "按现在缺什么信息选工具",
    summary: "先解决一个问题。已有目标职位时先拿 JD 核实图纸和审批责任，再决定要不要继续测评。",
    cards: [
      { id: "career-compare", badge: "对照职责", meta: "已选两岗", tone: "neutral", title: "职业对比工具", description: "手动选择电气工程师和电子工程师（计算机除外），并排查看职业资料。", purposeHint: "适合已经圈定两岗，想把职位描述和职业档案放在一起核对的人。", ctaLabel: "手选两岗对照", href: "/zh/career/compare" },
      { id: "worksheet", badge: "记录行动", meta: "已有面试问题", tone: "accent", title: "职业探索工作表", description: "记下读图发现、需要雇主补证的问题和下一步，按需复制、下载或打印。", purposeHint: "适合拿到两个岗位描述后整理面试前的追问。", ctaLabel: "打开行动工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "探索兴趣", meta: "60 题", tone: "roleA", title: "霍兰德职业兴趣测试", description: "查看六维职业兴趣，获得进一步探索的方向。", purposeHint: "适合还想了解自己对研究分析、动手实践等活动的兴趣分布。", ctaLabel: "探索职业兴趣", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "career-assessment", badge: "核工作条件", meta: "94 题", tone: "roleB", title: "职业测试", description: "梳理工作活动、工作方式和工作条件偏好。", purposeHint: "适合已经喜欢技术工作，但在项目现场、样机验证或工作节奏上还有犹豫的人。", ctaLabel: "梳理工作偏好", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "单岗详情",
    profileLinks: [{ label: roleA, href: "/zh/career/jobs/electrical-engineers" }, { label: roleB, href: "/zh/career/jobs/electronics-engineers-except-computer" }],
  },
  faqs: [
    { id: "how-to-tell", question: "职位名称只有“电气工程师”或“硬件工程师”，怎么判断工作内容？", answer: "以配电系统图、支路和选型计算书为交付的，优先按配电方向核对。以器件、板级原理图、PCB 和验证记录为交付的，优先按电子硬件核对。若两类文件都进一个 JD，就请主管说清新人负责哪份，以及谁批准变更。" },
    { id: "signing", question: "电气工程师都要考注册电气工程师吗？做 PCB 也要盖章吗？", answer: `想担任适用工程的电气专业负责人，要核对应注册与签章要求；做常规产品 PCB 研发，先核企业内部评审职责。${signingScope}应聘工程设计岗时，请单位指明适用项目规模、专业、任命角色和文件清单。` },
    { id: "pay", question: "电气工程师和电子工程师，哪个岗位工资高？", answer: "没有全国同口径的数据支持哪岗工资更高。投配电岗，问单位是否单列出图奖、驻场津贴，签章或负责大型项目是否影响定级。投板级硬件岗，问是否有项目奖、按什么节点兑现，高速电路与量产排障是否属于更高薪档的职责。先分清岗位能否接触校审或原理图评审，再按保证薪月、浮动奖条件和驻场时间对比两份书面报价。" },
    { id: "switching", question: "学电气工程及其自动化，转电子硬件应先补什么？", answer: "投板级硬件岗，先补一份能把器件选型、原理图、PCB 位号和验证记录串起来的作品。投配电岗，先补一份能解释支路、负荷、保护复核和图纸版次的记录。用目标 JD 查清新人是否需要自己完成布局或跟进现场。" },
    {
      "id": "foundation-exam-student",
      "question": "本科在校生能报注册电气工程师基础考试吗？",
      "answer": "用在读的本科报考，要先取得本专业或相近专业本科及以上学历或学位。在读者如果已经取得本专业或相近专业的专科学历，并累计从事电气专业工程设计满 1 年，可核专科路径。已经取得其他工科专业本科及以上学历或学位的，也须累计从事同类设计满 1 年。学籍、实习和其他工作经历不能自行等同于符合条件，临近毕业请向拟报考地核当年认定时间和材料。"
    },
    {
      "id": "pcb-layout-ownership",
      "question": "做电子硬件一定要自己做 PCB Layout 吗？",
      "answer": "兼做布局的岗位问负责哪些板；有专职 Layout 时问自己如何交约束并审核图。团队大不一定拆岗，团队小也可能外委布局。深圳优联与宇树的公开岗位都把原理图和 PCB 纳入硬件任务。请主管拿一次已出板的项目说明谁布局布线、谁检查修改、谁批准出板，确认简历该展示完整板还是原理图和评审记录。"
    },
    {
      "id": "ai-task-boundary",
      "question": "如果团队使用 AI 和自动化工具，配电与电子硬件的哪些任务会变？",
      "answer": "目前缺少两岗可比的岗位替代实证，无法断定谁更易被替代，也无可靠采用率或提效比例统计。从工程流程分工看，数据手册检索、规范条文比对、初步 BOM 核对和文档整理等辅助环节可引入 AI 或自动化脚本协助（是否采用及实际效果因团队而异，输出仍须人工核验）；但在配电侧，现场勘查、保护定值复核以及法定工程设计签章责任无法外包给工具；在电子硬件侧，样机实测波形定位、电磁兼容排障、替代料验证与量产返工拍板也必须由工程师承担。面试时可问团队哪些环节用了辅助工具、可输入哪些资料、最终复核与签字责任归谁。"
    },
  ],
  sourceGroups: [
    { id: "signing-rules", title: "注册执业与工程签章", links: signing.scopeLinks },
    { id: "work-and-pay", title: "招聘岗位样本与薪酬统计口径", links: [facts.distributionJob, facts.boardJob, facts.pay] },
    { id: "engineering-artifacts", title: "公开配电系统图与板级图纸", links: [distribution.source, board.schematic, board.layout] },
    {
      "id": "registration-exam",
      "title": "注册电气工程师报考条件",
      "links": [
        {
          "label": "深圳市考试院《注册电气工程师资格考试》",
          "href": "https://hrss.sz.gov.cn/szksy/fzlm/ksjs/content/post_12553233.html",
          "note": "第三节列基础、专业考试条件。"
        }
      ]
    },
    {
      "id": "employer-context",
      "title": "雇主行业与岗位分工样本",
      "links": [
        {
          "label": "正浩创新 2027 届校招公告（广州大学就业网）",
          "href": "https://jy.gzhu.edu.cn/web/index/jobs-brief-detail?id=SMUXSW0",
          "note": "2026-09-10，公告 SMUXSW0。公司介绍和研发岗位表支持智慧能源行业、深圳配电岗位与专业方向。"
        },
        {
          "label": "苏州赛腾电气设计工程师校招",
          "href": "https://zhjyb.zua.edu.cn/module/position_details/id-473854/nid-5119",
          "note": "2026-09-23，苏州，岗位 473854。职责节列电气图、PLC 软件、厂内与出差调试及配电协作。"
        }
      ]
    },
    { id: "industry-paths", title: "电力设计、工业控制与电子行业原件", links: [
      { label: "天津电力设计院 2027 年招聘公告", href: "https://job.ncepu.edu.cn/xjh/8edda309ef4f46a68bb1ea9b94725331.htm", note: "华北电力大学就业网。对照公司业务与招聘岗位第一项至第三项。" },
      { label: "宇树科技原始岗位表", href: "https://www.unitree.com/cn/position/", note: "杭州 J10007 嵌入式硬件工程师职责。" },
      { label: "汇川联合动力招股说明书（申报稿）", href: "https://static.cninfo.com.cn/finalpage/2025-05-21/1223624328.PDF", note: "2025 年 5 月，第六节业务与技术，查电驱及电源产品和研发流程。用于识别行业场景。" },
      { label: "华芯智源校招材料", href: "https://myjob.dlmu.edu.cn/attachment/myjob/ueditor/file/20250915/4961_%E5%8D%8E%E8%8A%AF%E7%AE%80%E4%BB%8B.pdf", note: "大连海事大学就业网所载企业材料，“应用领域”与“校招岗位”。" },
    ] },
  ],
};
