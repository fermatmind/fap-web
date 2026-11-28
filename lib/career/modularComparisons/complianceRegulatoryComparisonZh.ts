import type { ModularComparisonSpec } from "../modularComparison";

const roleA = "合规经理";
const roleB = "法规事务经理";

const sources = {
  devices: {
    label: "医疗器械监督管理条例",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_70607fc4160041a383e68ff6bfb2826f.html",
    note: "2024 年第二次修订。第十四条核申请资料责任，第二十至二十一条核注册人义务与变更注册，第六十条核广告内容和审查边界。",
  },
  registration: {
    label: "医疗器械注册与备案管理办法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_568880e3ee344c45b38d073bba1c53ad.html",
    note: "第八条核境内二类审批主体，第五十二至五十八条核申请、受理、补正与审批，第七十九至八十一条核变更与原证合用。",
  },
  signing: {
    label: "国家药监局注册申报资料公告",
    href: "https://www.beijing.gov.cn/zhengce/zhengcefagui/qtwj/202307/t20230721_3204148.html",
    note: "国家药监局 2021 年第 121 号公告，附件 4 第一部分核电子申报与非系统申报的格式，第一部分（二）核非系统申报的境内器械签章。附件 7 核变更资料。",
  },
  guidance: {
    label: "总局医药企业合规指引",
    href: "https://www.samr.gov.cn/cms_files/filemanager/1647978232/attach/20251/28c15ed822ea424492de897e95abf96b.pdf",
    note: "第四、七、九条核适用企业与审核。第三十五至三十七条核设备投放、用途、权属及禁止借投放绑定最低采购。",
  },
  competition: {
    label: "反不正当竞争法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_3737890d856a4e44a8ea07c50c90c116.html",
    note: "2025 年第二次修订，自 2025-10-15 起施行。第八条核商业贿赂、明示折扣和佣金、如实入账。",
  },
  ads: {
    label: "医疗器械等广告审查管理暂行办法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_4ca076ac0eeb4a9e9204e0cee26e359b.html",
    note: "第二、六条核广告未经审查不得发布及内容所依凭证；第二十三条核只宣传产品名称的例外。",
  },
  portal: {
    label: "上海市医疗器械注册电子申报通告",
    href: "https://www.shanghai.gov.cn/gwk/search/content/8d829ab3a668492aa89ec66517601ed2",
    note: "第一、二部分核上海二类产品注册、变更、延续及电子签章的系统实例。其他地区请核当地现行指南。",
  },
  complianceJob: {
    label: "RGP Asia Pacific 招聘合规经理",
    href: "https://cn.linkedin.com/jobs/view/compliance-manager-at-rgp-asia-pacific-4492575481",
    note: "上海；职位 4492575481；2026-11-24 读取。顾问驻医疗器械客户，列经销商尽调、培训和高风险案件，合同工。页面仅显示相对发帖时间。",
  },
  registrationJob: {
    label: "航天新长征医疗器械招聘注册工程师",
    href: "https://career.nankai.edu.cn/correcruit/content/id/119479.html",
    note: "北京；2026-09-30；职位 119479。岗位职责列注册提交、补正、审评沟通。本招聘要求硕士，不能外推至其他雇主。",
  },
  hybridJob: {
    label: "苏州重点产业人才需求目录",
    href: "https://qytt.sipac.gov.cn/ecobrain/epservice/ndaservplat/Apps/kernel/index.php?s=%2FUpload%2FdownFileEx%2Fid%2FJxJX4_FoCEA_lgaprhIpdg",
    note: "2024 年版第 72–73 页，生物医药及大健康的医疗器械、大健康条目。法务总监样本列律师证或法律职业资格证。",
  },
  legalExam: {
    label: "司法部法律职业资格考试实施办法",
    href: "https://www.chinalaw.gov.cn/jgsz/jgszzsdw/zsdwgjsfkszx/gjsfkszcfg/202106/t20210622_428245.html",
    note: "第二条列法定职业范围及初次从事特定工作的情形。公司法务合规招聘条件另查雇主。",
  },
  drugRegistration: {
    label: "药品注册管理办法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_3275cb2a929d4c34ac8c0421b2a9c257.html",
    note: "总则及药物临床试验、药品上市注册章节，核国家药监局监管、药审中心审评、申请类型和审评路径。",
  },
  drugApproval: {
    label: "药审中心药品注册行政审批指引",
    href: "https://www.cde.org.cn/xzsl/zcfwzl/listpage/304848fa4ca8cc3a3481b6833bc4a3a3",
    note: "行政审批段列明药物临床试验等事项由药审中心以国家药监局名义作出行政审批决定，以及其他药品注册申请的批准机关。",
  },
  drugLaw: {
    label: "中华人民共和国药品管理法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_b73ec9dabb2d468281d6c994b4bcdaf8.html",
    note: "核上市许可持有人责任、药品生产质量管理规范及药品经营质量管理规范。",
  },
  drugGcp: {
    label: "2026 年药物临床试验质量管理规范",
    href: "https://yjj.sh.gov.cn/qtgzwj/20260608/89cbf084b5cb4eab8fd0fb56d8538a1d.html",
    note: "国家药监局等公告及附件。核施行日期、药物临床试验管理及申办者责任。",
  },
  drugEctd: {
    label: "国家药监局 2026 年药品 eCTD 扩围公告",
    href: "https://yjj.sh.gov.cn/qtgzwj/20260115/975448586280412d9ddb6a2fec2cb44e.html",
    note: "官方全文。核自 3 月 1 日适用的品类、申请和可选电子递交方式。",
  },
  cnManagement: {
    label: "GB/T 35770-2022 合规管理体系",
    href: "https://std.samr.gov.cn/gb/search/gbDetailed?id=EB58F4DA9034B2A2E05397BE0A0A7D33",
    note: "官方目录核现行状态、推荐性属性及等同采用 ISO 37301:2021。",
  },
  isoManagement: {
    label: "ISO 37301:2021 官方说明",
    href: "https://www.iso.org/standard/75080.html",
    note: "核合规体系建立、实施、评估与持续改进的跨行业适用。",
  },
  finance: {
    label: "金融机构合规管理办法",
    href: "https://www.nfra.gov.cn/cn/view/pages/governmentDetail.html?docId=1192220&generaltype=1",
    note: "自 2025 年 3 月 1 日起施行，核适用机构、合规官任职冲突与内部报告安排。",
  },
  aml: {
    label: "中华人民共和国反洗钱法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2025/art_cfcc31edf0a64744bb5d7ff1307c0356.html",
    note: "核义务主体、客户尽职调查、资料保存及可疑交易报告。",
  },
  amlJob: {
    label: "兴业银行总行反洗钱中心招聘",
    href: "https://www.cib.com.cn/cn/aboutCIB/about/jobs/2025/20251128.html",
    note: "2025 年 11 月 28 日，第二部分天津岗位。案例核查质检、复审、跟踪整改的已截止实例。",
  },
  pipl: {
    label: "中华人民共和国个人信息保护法",
    href: "https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm",
    note: "核处理依据、委托处理与特定情形的个人信息保护影响评估责任。",
  },
  dataSecurity: {
    label: "中华人民共和国数据安全法",
    href: "https://www.miit.gov.cn/zwgk/zcwj/flfg/art/2022/art_284b390b84484f10b0e43eeafaad0f6d.html",
    note: "核数据分类分级保护和数据处理全流程安全。",
  },
  cosmetics: {
    label: "化妆品监督管理条例",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/bgt/art/2023/art_9f8b70e79a2242df96c6c290a0ac425b.html",
    note: "核特殊化妆品注册与普通化妆品备案，按产品类别看机关和程序。",
  },
  fsmp: {
    label: "特殊医学用途配方食品注册管理办法",
    href: "https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_9b1a9daffc084d819bb4d7a31d909452.html",
    note: "核市监部门食品注册路径、申请人和资料责任。",
  },
  pharmaJob: {
    label: "奥科达医药药品注册招聘",
    href: "https://www.auctapharma.com.cn/AuctaShow/25.html",
    note: "企业发布，2026 年 11 月 24 日实读。写明注册材料整理和跨研发、生产及质量部门协作，原页未标发帖日。",
  },
  pay: {
    label: "国家统计局 2025 年工资公报",
    href: "https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html",
    note: "规模以上企业按岗位大类统计的是人民币年平均工资，不能拆为两岗在同城、同级的中位数。",
  },
} as const;

const signatureBoundary = "境内医疗器械注册资料未通过医疗器械电子申报系统申报时，如无特殊说明，注册申请人盖公章，或由其法定代表人、负责人签名并加盖公章。通过器械电子系统申报的，按适用的电子申报格式办理。";

const exercise = {
  documents: "模拟：境内二类设备现行注册证及说明书均限医疗机构。经销商拟把宣传页写成可供家庭使用，还提出免费借设备，但合同草案要求医院最低采购耗材。现阶段只有草稿，没有签约、投放或发布。拟扩大适用范围，影响安全有效。",
  references: "原件规则：免费投放应核用途、权属和追踪，不得借投放绑定最低采购以谋取不当优势。二类器械适用范围实质变化并可能影响安全有效，向原注册部门申请变更。",
  authority: "模拟纸件申报：业务负责人定项目去留，合同另按授权签；注册申请人签章，授权经办人递交；药监部门决定注册。",
} as const;

export const complianceRegulatoryComparisonZhSpec: ModularComparisonSpec = {
  pairId: "compliance-managers-vs-regulatory-affairs-managers",
  locale: "zh",
  title: "合规经理 vs 法规事务经理：内控、产品注册与职业路线对比",
  shortTitle: "合规经理 vs 法规事务经理",
  description: "中国大陆合规经理与法规事务经理的分工比较。从医药器械、金融内控和数据隐私看交付、注册权限、资格、薪酬和转岗。",
  regionLabel: "中国大陆",
  authorName: "费马测试编辑部",
  datePublished: "2026-11-24",
  dateModified: "2026-11-24",
  defaultPlugins: { ai: false, thirtyDay: true },
  hero: {
    directAnswer: "一家药械公司要启动新项目，销售想请经销商办学术会，研发又想把设备说明书的用途改大。前一项交给合规线核参与方、经费和跟踪记录，后一项交给法规事务线核产品依据、变更路径和申报版本。商业合规交付可追踪的风险意见和整改记录，产品法规事务交付与拟申报产品版本一致的证据包。做金融内控和数据隐私，主要管企业与员工的行为；做药械、化妆品或特医食品注册，主要管产品能否按指定条件进入市场。先选愿意承担的交付，再选行业和单位。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍兰德 CES", aliases: "招聘可写 Compliance Manager、商业合规经理、内控合规经理或反洗钱岗位。各名称对应的风险对象不同，先看交付与汇报关系。", keywords: "第三方尽调、金融内控、反洗钱、隐私、整改" },
    roleB: { badgeTitle: roleB, riasecLabel: "霍兰德 ECI", aliases: "招聘可写 Regulatory Affairs Manager、药品注册、医疗器械注册工程师。先区分产品领域、承担的版本范围与岗位职级。", keywords: "药械注册、适用范围、eCTD、变更、审评沟通" },
    interviewBoundaryTitle: "用一个真实项目分清两条工作线",
    interviewBoundaryQuestions: [
      "上一单有争议的经销商、业务例外或数据共享，谁形成意见、谁决定退回、谁跟踪整改？",
      "上一款产品改变适用范围或申报版本，谁判路径、谁签章、谁递交、谁跟补正直到收到决定？",
    ],
    riasecBoundaryNote: "徽章取费马职业资料中六维兴趣向量最高的三项。它可以帮助你观察自己喜欢审记录、协调还是追证据。胜任力、资格、签审权限和录用条件分别核查。",
  },
  topology: {
    title: "同一项目，合作方式与产品范围各过一道检查",
    summary: "合规侧带回经销商、医院和合同条件的核查记录；法规侧带回本版产品文件、变更路径及待补材料。业务决策人要看两份明确的意见，再按授权处理项目。",
    ariaLabel: "从合作方尽调与产品变更判断，合流为项目决策的交接图",
    leftZoneTitle: "商业合规",
    leftSteps: [
      { title: "核合作条件", detail: "对照真实用途和付款安排。" },
      { title: "出风险意见", detail: "记退回原因和待补证据。" },
    ],
    centerZoneTitle: "项目交接",
    upperBridge: { title: "合规侧交付", line1: "合同风险与补件", line2: "交内部决策人" },
    lowerBridge: { title: "法规侧回传", line1: "现行适用范围", line2: "标明变更进度" },
    rightZoneTitle: "产品法规事务",
    rightSteps: [
      { title: "核产品版本", detail: "对照注册证、说明书。" },
      { title: "定申报路径", detail: "列变化依据和资料缺口。" },
    ],
  },
  matrix: {
    title: "日常工作从对象、交付物和权限看",
    summary: "同一条行业规定会产生两份工作：合规要改变业务流程，法规事务要让申报材料与产品事实相符。药械项目最容易看见这条分界；金融内控与跨国企业体系、数据治理与其他产品注册也能用同一方法比较。",
    roleAColumn: "合规经理 · 商业行为线",
    roleBColumn: "法规事务经理 · 产品准入线",
    rows: [
      { id: "object", dimension: "药械项目先查什么", roleA: "从经销商尽调、学术活动经费和设备无偿投放查起。把活动对象、费用流向和对价放在同一张表里，查合同、执行记录与账务能否互证。例如会议服务费有合同，还要核服务内容、对价及交付凭证。免费试用如果与采购捆绑，要回真实商业条件核查并形成意见。", roleB: "按拟变动的产品及申报阶段拆分任务。药物临床试验申请看拟开展的研究与配套资料，上市许可申请看支持上市的研究和产品证据。器械看管理类别、适用范围和变化影响。拿旧版说明书、新版拟申报文件和原始质量或研究资料逐一比对。", defaultVisible: true },
      { id: "outputs", dimension: "金融与跨国企业的分工", roleA: "适用金融监管规定的机构，要区分经营部门落实规则、合规线监督和内审独立检查。反洗钱义务场景下，交尽调复核、可疑案例检查和整改记录。跨国企业可用 GB/T 35770 或 ISO 37301 把义务拆成员工行为、控制动作、负责人和复查计划；看雇主实际采用哪一套。", roleB: "跨国医药企业的产品法规事务，把总部拟用的材料与大陆申请类型、语言、申报版本和本地标签要求相对照。境外已有产品资料，可以成为拟用输入，仍要核其是否能覆盖中国申请事项和版本。银行的反洗钱、运营内控与药械产品注册是不同岗位方向。", defaultVisible: true },
      { id: "inputs-tools", dimension: "隐私工作与强监管准入", roleA: "《个人信息保护法》从谁、为哪个目的处理个人信息开始，《数据安全法》还要求从数据分类分级及全流程安全看。给业务一份数据流图、处理依据和受托方责任清单，遇到法律要求评估的情形留下评估记录。对照数据是否真按约定用途、范围和保存期限处理。", roleB: "做强监管产品的市场准入，先把产品送入正确程序：药品有临床试验与上市申请，器械按分类注册或备案，特殊化妆品注册、普通化妆品备案，特殊医学用途配方食品按食品注册程序办。产品事实卡应写名称、主张、适用范围、受理路径和所需资料。", defaultVisible: true },
      { id: "decision", dimension: "谁形成、谁签、谁批准", roleA: "形成风险意见可以写补证、退回建议、整改要求与拟议时限。渠道负责人、合规和合同签署人的决定权分开，看企业制度及授权；线索达到升级条件，交有权复核的负责人。需要披露或报告时，也要先核义务主体及正式提交权限。", roleB: "形成资料和变更判断的经办人员可按授权递交。境内第二类医疗器械注册由省级药品监管部门审查批准；境内第三类医疗器械向国家药监局申请注册。签章由所办器械类型和申报渠道的规则确定。行政批准、技术审评、经办递交分别跟踪；签收或受理也不代表获准。", defaultVisible: true },
      { id: "handoff", dimension: "跨部门移交什么", roleA: "医药合规把经销商核查表、异常费用、待补证明和意见交商业团队，要求反馈已停止的动作及修订材料；隐私合规给系统团队可落实的采集和访问条件。对方交回处理证据，才能把整改状态从待处理改为完成。", roleB: "把产品状态交给研发、质量和市场。研发回答设计和验证范围，质量提供受控报告与版本，注册岗写明已批准口径与待申请变化；市场按当前有效状态写宣传。遇到补正，将问题归到具体材料、责任人、版本和提交时点。", defaultVisible: true },
      { id: "friction", dimension: "工作代价与风险", roleA: "如果渠道月底要放行但受益和费用证明未齐，得能把缺证与已核事实分开陈述，做好复核访谈和后续追踪。银行案例复审、集团跨区域整改对工作的要求不同。判断岗位能否做成，先找内部升级路径、记录访问权与负责关闭问题的人。", roleB: "如果报告与说明书不是同一版本，先定出版本差异和责任人，再重排补正顺序。一个变更可能影响标签、生产控制和资料包，动一个字段也要追到引用它的文件。多个市场的资料可能各用一套窗口、语言和模板；具体并行负担取决于负责的产品。", defaultVisible: false },
      { id: "entry", dimension: "去向与可复用经验", roleA: "医疗器械客户驻场合规顾问样本列经销商尽调、培训和案件管理；兴业银行反洗钱中心样本列可疑案例质检与跟进。可从合同履行、第三方核查、内控或数据流程进入，能带走的是从规则识别、证据收集到整改复核的全段经验。", roleB: "药品注册企业样本列注册材料与研发、生产和质量协作；器械注册工程师样本列递交、补正和沟通。想从产品研发、质量或临床项目支持转岗，先把单个产品的技术依据转成可审阅的申请资料。由国内转海外时，需重新核当地分类和程序。", defaultVisible: false },
      { id: "pitfall", dimension: "避免选中挂名岗位", roleA: "想做风险判断，拿职位说明找有没有案件复核、第三方尽调、控制升级或整改闭环。只有检查流程是否点击完成时，能积累的是流程运营；接触不到实际合同、支付或数据流，形成意见的能力要靠别的项目补。", roleB: "想做产品路径判断，找是否能参与证据缺口评估、说明书变更和真实补正。仅管理账号、传文件、催盖章会练到文控和协调；将来接产品线还要能解释某份研究或报告支持哪个版本、哪项用途，以及缺失会影响哪个决定。", defaultVisible: false },
    ],
  },
  incident: {
    title: "模拟交接：设备试用草稿能否递给医院",
    summary: "经销商说免费试用能尽快出反馈，材料却同时写了最低耗材采购和现行注册范围外的家庭用途。把商业条件和产品变更分别记录，再合并给项目负责人。",
    triggerLabel: "上线前同时发现两处冲突",
    triggerBody: exercise.documents,
    triggerCaveat: "文中的角色分工和控制动作均为虚构企业预案。实际调查、合同签署、发布和申报分别查公司授权与适用程序。",
    rows: [
      { stage: "形成商业风险意见", roleLabel: roleA, tone: "roleA", verifiedFacts: "合同草案把免费借用和最低耗材采购捆在一起；目前没有签约或实际投放。", openGaps: "补齐医院需求、评估目的、必要数量和期限、权属约定、追踪安排及合同各版本。", actionAndApproval: "合规经理记录证据、建议退回项目；模拟业务负责人决定停止当前方案。获授权经办人撤回内部发布单，文控保留原草稿和决策记录。" },
      { stage: "形成产品变更判断", roleLabel: roleB, tone: "roleB", verifiedFacts: "现行注册证与说明书指向医疗机构，家庭用途仍是草稿。", openGaps: "让研发和质量补变更评估、支持研究及版本对照，确定涉及的产品技术要求、说明书与标签资料。", actionAndApproval: "法规事务经理形成变更清单和申报建议。本例假定采用纸件申报，注册人作为申请人按纸件要求签章，获授权经办人递交。药监部门决定是否批准。" },
      { stage: "复核项目能否推进", roleLabel: "模拟项目负责人", tone: "roleA", verifiedFacts: "一份商业审核和一份产品证据链可分别保存，项目均适用当前获准范围。", openGaps: "核修订合同和现行范围是否一致；如果计划仍写家庭用途，须看到变更决定及经核准文件。", actionAndApproval: "两份意见都满足对应条件后，项目负责人按内部授权决定是否继续，授权经办人落实。任何审批只覆盖其明确范围。" },
    ],
    recoveryAcceptanceTitle: "重新开启材料审核的条件",
    recoveryAcceptanceCriteria: "先核合同已删除不当最低采购绑定，补齐用途、权属及追踪安排。再核宣传稿只引用可用版本。若仍拟推广家庭用途，先取得变更注册的批准及对应文件。依法应审查的广告，另核广告审查结果。批准和执行记录分别归档。",
    defenseLayerNote: "恢复指恢复纸面材料审核。商业审批、产品注册、广告审查及实际投放各有自己的门槛。",
  },
  payAndCerts: {
    title: "薪酬比较与行业准入核查",
    summary: "按实际承担的风险单元或产品线比较同级职责。先拆薪项，再核负责范围、定级证据与实际负担。",
    salaryHeading: "从薪项、职级、陷阱到年度折算",
    salaryBody: "商业合规侧的工作单元是区域、业务线、经销渠道或一类控制流程。可以负责一个区域的第三方核查，也可以独立主持多区域调查、推动同类风险整改和复查。金融机构法定合规官另有任职和汇报要求；分类时区分企业职级与法定岗位。法规事务侧按产品线、注册类型或上市市场划分交付，整理卷宗与负责多品种首注、变更和补正需要不同深度的判断。用已有风险结案或申报资料的复核记录说明定级依据，别只拿项目数量或经理头衔谈。拿到报价先分固定月薪、保证薪月、条件奖金与可报销项目；报价若写项目奖，再核考评依据、发放条件和离职处理，未确定的钱单列。防止把顾问合同总额、短期项目补贴或个人垫付差旅计成正式年薪。对同城、相近职级和同一用工安排的报价，用税前固定月薪乘保证月数，再列试用期、差旅、驻场、跨时区审查与补正窗口；用实际工作量和承诺程度判断。公开行业工资大类给的是年平均口径，无法用来给两岗排高低。",
    certs: [
      { name: "法律职业资格", officialScope: "司法部考试实施办法列明法定职业范围及特定工作情形。企业商业合规岗位的招聘条件须回职位原件核对。", workplaceBoundary: "苏州医疗器械及大健康目录的法务总监样本列律师证或法律职业资格证。取得该资格也不能推定已取得目标企业合同签署或调查权限。", verificationTips: "问人事条件究竟用于法务任职、招聘筛选还是上岗后的职责划分，并请对方列明实际签字的业务文件。", officialLinks: [sources.legalExam, sources.hybridJob] },
      { name: "医疗器械注册证与变更文件", officialScope: "这是产品注册凭证。境内二类器械依法由省级药品监管部门审批，变更注册文件与原证合用。", workplaceBoundary: "产品注册证不能证明个人取得执业资格。法规经办人主持材料、沟通和递交的职责，应与注册人法定义务及监管批准的职责分别核。", verificationTips: "拿到职位后先问产品管理类别、境内还是进口、维护的是哪一版本文件。再问经办账号、盖章申请和审评沟通各由谁负责。", officialLinks: [sources.devices, sources.registration] },
      { name: "境内器械注册签章与经办授权", officialScope: signatureBoundary, workplaceBoundary: "经办人可以按授权提交或回复补正，经理头衔本身不能替代公司签章。质量体系及上市后责任按注册人和实际任命划分。", verificationTips: "请雇主展示空白签章节点，对应哪类文件、谁复核、谁用章；例如上海二类器械通过当地电子系统办理时，按办事指引核电子签章与经办授权。", officialLinks: [sources.signing, sources.portal] },
    ],
    interviewChecklistTitle: "三项面试核查",
    interviewChecklistQuestions: [
      { label: "固定与浮动", question: "保证发薪月数、固定部分和奖金分别如何写进 Offer？奖金按个人评级、团队表现还是指定项目核算？" },
      { label: "职责和职级", question: "这个职级能独立交第三方风险意见或注册补正包吗？近一次晋级或调薪看的是哪份已验收交付，什么时候评审，由谁复核？" },
      { label: "折算负担", question: "目标地区、用工主体、试用期、预计驻场天数和补正窗口要不要折算进实际负担？" },
    ],
  },
  thirtyDayPlugin: {
    badge: "离线作品",
    title: "四周做一份合规或注册的证据包",
    summary: "任选一轨，只用文末公开制度与虚构材料。每周做一件可复核的作品，把单次判断扩成能接手、能复核的业务流程。无需账号，不上传任何资料，不使用真实个人记录。",
    tracks: [
      {
        id: "conduct-portfolio", title: "合规轨：从义务到整改", badge: "商业合规", tone: "roleA",
        weeks: [
          { weekLabel: "第 1 周", deliverable: "用医药企业防范商业贿赂指引做一张规则索引。选学术活动和设备投放，各写一个适用对象、可复核义务及原件所在章节。另一位读者应能回原件区分要求和内部政策。" },
          { weekLabel: "第 2 周", deliverable: "给虚构产品写一页第三方风险记录：合作方、用途、费用、获益方与凭证各一栏。记录两个待补证项及责任人，再写一句哪些材料到齐才能复核。" },
          { weekLabel: "第 3 周", deliverable: "按 GB/T 35770 的管理体系思路做整改跟踪表。把同一风险分到控制设计、执行记录与复核，每条有处理人、期限、状态与可验收条件。" },
          { weekLabel: "第 4 周", deliverable: "把规则索引、风险意见和整改表组成模拟审阅包。一位同伴应能指出哪个事实已核、哪个仅是待查、由谁作内部决定，并找回意见对应的凭证栏。" },
        ],
      },
      {
        id: "filing-portfolio", title: "法规轨：从变化到申报交接", badge: "产品法规", tone: "roleB",
        weeks: [
          { weekLabel: "第 1 周", deliverable: "用药品注册管理办法和医疗器械注册与备案管理办法各取一个例子，做一页路径表。每行标明产品类别、申请事项、受理或审查部门和核过的原件位置。" },
          { weekLabel: "第 2 周", deliverable: "给一个虚构境内二类器械写新旧版适用范围对照。列出两项支持资料及责任团队，再留一列说明目前能讲什么、什么待变更决定。" },
          { weekLabel: "第 3 周", deliverable: "依据申报资料要求与药品 eCTD 扩围公告，列一张资料与递交通道清单。注明哪项操作适用于药品、哪项用于选定器械案例，分别写核章、经办和待审状态。" },
          { weekLabel: "第 4 周", deliverable: "交一份模拟补正回复包。每条写问题、证据所在版本、部门负责人、待签或待审状态及下一节点；让同伴任选一条，能从回复追到原文件与签章权限规则。" },
        ],
      },
    ],
  },
  checklist: {
    title: "求职前自检：能交什么，愿意做什么",
    summary: "先勾你能举例证明的技能，再勾你接受的工作条件。两栏分别核对，可以指向不同岗位。",
    skillsHeading: "我能提供的证据",
    skillsOptions: [
      { id: "skills-diligence", track: "roleA", label: "能做经销商尽调", summary: "能把权属、利益冲突和项目对价列成可复核的问题。", interviewQuestions: ["有签约前的第三方检查表吗？异常谁复核？"] },
      { id: "skills-investigation", track: "roleA", label: "能记录风险与整改", summary: "能分开直接事实、待核线索、风险意见与负责下一步的人。", interviewQuestions: ["同一风险从提出到关闭，谁看证据，谁决定延期？"] },
      { id: "skills-filing-map", track: "roleB", label: "能写版本与申报对照", summary: "能把旧版适用范围、新版主张及所需支持资料列在一页。", interviewQuestions: ["上一个变更由谁复核适用范围和资料版本？"] },
      { id: "skills-evidence", track: "roleB", label: "能定位补正证据", summary: "能把审评问题拆到特定说明书、技术要求或研究资料。", interviewQuestions: ["新人是否能参与补正回复，还是只维护上传目录？"] },
    ],
    conditionsHeading: "我愿意接受的条件",
    conditionsOptions: [
      { id: "conditions-escalation", track: "roleA", label: "愿意和业务讨论退回", summary: "业务推进与风险停留可能冲突，愿意解释证据并记录意见。", interviewQuestions: ["提出退回后是否有独立升级渠道？"] },
      { id: "conditions-site", track: "roleA", label: "接受驻场或访谈核查", summary: "能先问清是否为派驻、谁发薪及查证职责。", interviewQuestions: ["最近一次驻场的地点、天数和交付物是什么？"] },
      { id: "conditions-cycles", track: "roleB", label: "接受资料反复改版", summary: "能按依赖关系跟进研发、质量和说明书版本，接受补正后重核。", interviewQuestions: ["收到补正通知时谁排计划，能否调动原证据责任人？"] },
      { id: "conditions-products", track: "roleB", label: "愿意专注产品及市场", summary: "接受不同类别、市场、资料深度和发证流程带来的切换成本。", interviewQuestions: ["这个岗实际负责哪些产品和法域，做首注还是维护？"] },
    ],
    defaultInterviewQuestions: ["请说最近一个你交给新人的项目，实际产出由谁复核、签署、提交和批准？"],
    crossTrackNote: "如果你喜欢查第三方风险但更接受产品线专岗的节奏，优先向同时设有两条线的企业索要具体岗位说明，再分别询问汇报对象与第一份交付。",
    offlinePrintHint: "面试前可把选中的条目写入自己的核查清单，带上可公开复述的工作案例。",
  },
  desktopExercise: {
    sectionTitle: "五分钟试做：一份试用草稿的两张回执",
    summary: "任选一轨，凭离线卡写纸面回执。不开系统、不联系任何人、不提交。",
    publicLinksHeading: "公开原件",
    publicLinks: [
      { label: sources.guidance.label, href: sources.guidance.href, note: "医疗设备无偿投放一节。" },
      { label: sources.registration.label, href: sources.registration.href, note: "变更注册一节。" },
    ],
    factSummaryHeading: "离线卡",
    factSummarySegments: [
      { text: exercise.documents },
      { text: exercise.references },
      { text: exercise.authority },
    ],
    taskA: { title: "合规轨：写退回意见", instruction: "在回执上区分现行范围与草稿；指出合同绑定条件，写要补的用途、权属和追踪证据，以及由谁决定退回。另记法规侧须复核的新用途。" },
    taskB: { title: "法规轨：写变更判断", instruction: "在回执上区分现行范围与草稿；说明变更路径、两项资料缺口及签章、递交和审批分工。把采购绑定转合规提出意见，由业务负责人决定退回。" },
    rubricTitle: "展开评分和双轨样答",
    rubricHeading: "每轨检查四项",
    rubricPassRule: "命中两项共用与本轨两项即可。资料待补时保持草稿。",
    rubricItems: [
      "共用一｜写现行仅限医疗机构，家庭用途仍是草稿，未签约、投放或发布。",
      "共用二｜写另一轨待处理事项，状态仍待复核。",
      "合规一｜识别最低采购绑定，索要用途、权属及追踪依据。",
      "合规二｜意见交业务负责人，由其决定退回。",
      "法规一｜识别应申请变更，列至少两项支持资料缺口。",
      "法规二｜注册申请人签章、授权经办人递交、药监部门决定是否批准。",
    ],
    sampleAnswerALabel: "合规轨样答",
    sampleAnswerA: "现行只限医疗机构，家庭用途为草稿，未签约、投放或发布。合同附最低耗材采购条件，建议退回。向项目人员索取评估目的和必要数量、期限，补设备权属条款与追踪计划，写明责任人和留痕字段。把风险意见交业务负责人决定。家庭用途由法规侧核变更，整份回执标待复核。",
    sampleAnswerBLabel: "法规轨样答",
    sampleAnswerB: "现行只限医疗机构，家庭用途为草稿，未签约、投放或发布。扩大用途可能影响安全有效，应向原注册部门申请变更。请研发和质量补变更影响评估、新旧说明书对照及支持研究。注册申请人签章，授权经办人递交，药监部门决定是否批准。把最低采购绑定转合规提出意见，由业务负责人决定退回。回执待复核。",
  },
  tools: {
    title: "按你现在要解决的问题选四个工具",
    summary: "先解决一个问题。已经有职位说明时，可以直接抄出交付物和签审节点，带到面试。",
    cards: [
      { id: "compare", badge: "岗位对照", meta: "任选两岗", tone: "neutral", title: "职业对比工具", description: "打开后手动选择两岗，核工作内容和环境。", purposeHint: "适合两条路线已有明确职位时。", ctaLabel: "手选对比岗位", href: "/zh/career/compare" },
      { id: "worksheet", badge: "记录行动", meta: "探索工作表", tone: "accent", title: "职业兴趣探索工作表", description: "记录尚待核证的项目与面试问题。", purposeHint: "适合准备下次和招聘负责人核职责时。", ctaLabel: "打开工作表", href: "/zh/career/interest-worksheet#my-worksheet" },
      { id: "holland", badge: "找兴趣", meta: "60 题", tone: "roleA", title: "霍兰德职业兴趣测试", description: "探索你偏好的活动类型和工作主题。", purposeHint: "适合还未缩小职业范围时。", ctaLabel: "了解霍兰德测试", href: "/zh/tests/holland-career-interest-test-riasec" },
      { id: "career-assessment", badge: "核工作方式", meta: "94 题", tone: "roleB", title: "职业测试", description: "梳理工作活动、工作方式和工作条件偏好。", purposeHint: "适合想再核对自己的工作条件时。", ctaLabel: "了解职业测试", href: "/zh/tests/career-planning-and-work-style-test" },
    ],
    profileLinksLabel: "分开深入两岗",
    profileLinks: [
      { label: roleA, href: "/zh/career/jobs/compliance-managers" },
      { label: roleB, href: "/zh/career/jobs/regulatory-affairs-managers" },
    ],
  },
  faqs: [
    { id: "task-split", question: "合规经理和法规事务经理有什么区别？岗位写「负责合规」怎么选？", answer: "先看第一份要交的文件。医药商业合规交经销商尽调、学术活动和费用审核、调查或整改记录；法规事务交注册计划、资料包、新旧版本对照与补正。金融机构可有反洗钱监控和内控审核岗位，跨国企业可以把法务、合规与数据职责分设或合设。同一个标题可能把两条线都列进去。拿职位描述逐项找负责的对象、审核链和关键证据，就能区分在做哪类工作。" },
    { id: "apply-sign-approve", question: "NMPA、CDE、IND、NDA 和 eCTD 分别管哪一步？", answer: "国家药监局 NMPA 组织药品注册审评审批。药审中心 CDE 承担技术审评，并就药物临床试验等规定事项以国家药监局名义作出行政审批决定。药品上市许可申请的审批决定由国家药监局作出。临床试验申请和上市许可申请是不同程序，行业常用 IND、NDA 指代这两类阶段，办理仍按大陆正式事项名称和适用路径。自 2026 年 3 月 1 日起，规定范围内的化学药品、化学原料药和生物制品申请可使用药品 eCTD；上海二类器械电子申报另走器械渠道。递交成功、技术审评和获批要分别记录，岗位头衔本身不能授权签署或批准。" },
    { id: "change-scope", question: "医药法规事务日常说的 MAH、GMP、GCP、GSP 怎么区分？", answer: "先分持有人责任和工作阶段。药品上市许可持有人（MAH）按药品管理法承担药品全生命周期的相关责任；GMP 对应生产质量，GCP 约束药物临床试验，GSP 约束经营质量。器械另有注册人制度。标签或说明书变化时，注册岗先要证据并确认路径，质量、研发和持有人团队各交对应记录。职称、企业质量岗位与产品行政程序不要混作一套权限。" },
    { id: "free-device", question: "医药行业合规经理主要管商业贿赂，还是管隐私和金融内控？", answer: "按雇主行业和实际交付分，不以「合规」一词覆盖所有工作。医药企业防范商业贿赂合规指引列经销、学术活动与设备投放等风险。免费设备投放应核真实用途、权属和追踪，防借投放捆绑最低采购获取不当优势。金融机构按适用规范做经营行为监督及反洗钱；数据隐私岗则追处理目的、依据、受托关系和风险评估。三类方向都要留证，但不能复用各自的批准权限。" },
    { id: "salary", question: "项目驻场合规经理和企业药械法规岗都拿到 Offer，怎么比较？", answer: "优先比实际责任与风险，再折算钱。如果一份是第三方驻项目、一份是药械企业直接雇佣，先分清用工主体、项目到期安排和能否参与独立复核。如果驻场只催表、接触不到调查证据，按流程协调岗估值；如果直聘只负责上传文件和催盖章、不参与补正或版本判断，按申报文控岗估值。用税前固定月薪 × 保证发放月数比较保底，合同不足一年按实际保证薪月计算，并注明期限；未保证奖金与差旅报销分栏，不并入保底。金额接近时，再比较驻场天数和补正窗口占用。用一份经主管验收的整改结案记录或补正回复包作定级凭据，并确认是试用期结束时评审，还是纳入下一次职级或调薪评审。" },
    { id: "tools-boundary", question: "2026 年电子申报、文本比对和自动化能分别帮两岗做什么？", answer: "法规岗可用电子渠道递交适用资料，若团队有版本比对或目录校验，可先找差异、漏件和命名不一致；合规岗可先用条件匹配标出付款记录与合同条款的疑点。差异提示不足以证明违法，格式合规也不足以证明产品主张成立。复核人要回原始证据查受益人、用途或版本与适用范围，并按授权复核签章和提交。工具输出留下核对记录，最终状态以正式程序为准。" },
    { id: "career-switch", question: "学法律、质量、研发或临床的人，入行先补哪份作品？", answer: "想去商业合规，做一份经销商或活动的风险卡，从合同、费用和履约记录追到意见和后续复核；想去产品法规，做一份拟变更事项的证据对照，从产品版本追到资料、签章和递交。质量或研发经验可以起步于解释证据，法律训练可以起步于定义义务和存在冲突的动作。国家统一法律职业资格按法定职业范围使用。应聘具体合规岗位时，以雇主是否要求相应法务职责以及职位说明为准。" },
  ],
  sourceGroups: [
    { id: "mainland-device-rules", title: "大陆器械注册、变更与申请人责任", links: [sources.devices, sources.registration, sources.signing, sources.portal] },
    { id: "pharma-lifecycle", title: "药品注册、临床试验与质量责任", links: [sources.drugRegistration, sources.drugApproval, sources.drugLaw, sources.drugGcp, sources.drugEctd] },
    { id: "business-conduct", title: "医药商业行为、活动、投放与广告审查", links: [sources.guidance, sources.competition, sources.ads] },
    { id: "enterprise-compliance", title: "企业体系、金融合规与反洗钱", links: [sources.cnManagement, sources.isoManagement, sources.finance, sources.aml] },
    { id: "data-market", title: "数据治理及食品、化妆品市场准入", links: [sources.pipl, sources.dataSecurity, sources.cosmetics, sources.fsmp] },
    { id: "job-evidence", title: "招聘样本、职业资格与统计口径", links: [sources.complianceJob, sources.registrationJob, sources.amlJob, sources.pharmaJob, sources.hybridJob, sources.legalExam, sources.pay] },
  ],
};
