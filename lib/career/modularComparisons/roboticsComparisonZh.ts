import type { ModularComparisonSpec } from '../modularComparison';

const engineer = '机器人工程师';
const technician = '机器人技术员';
const engineerSlug = 'robotics-engineers';
const technicianSlug = 'robotics-technicians';

const occupationClass = {
  label: '北京技术技能人才专业评价指引目录｜机器人',
  href: 'https://www.ncsti.gov.cn/zcfg/zcwj/202510/P020251009505915016655.pdf#page=1',
  note: '第 5、6 项可核工程职称评审专业与操作员、运维员技能评价的区分，及两技能工种的现行代码。',
};
const trainingCatalog = {
  label: '人社部｜国家基本职业培训包目录',
  href: 'https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/qt/fzcwjxx/202307/W020230714595929080833.pdf#page=1',
  note: '附件第 11、12 项复核运维员和操作员的现行分类代码。',
};
const engineerNotice = {
  label: '人社部、工信部｜机器人工程技术人员国家职业标准颁布通知',
  href: 'https://zsgx.mohrss.gov.cn/zsgx/htmlDocument/2023-03-29/detail_50274.html',
  note: '附件目录第 1 项列职业代码，并链接 2023 年版标准。',
};
const engineerStandard = {
  label: '机器人工程技术人员国家职业标准（2023 年版）',
  href: 'https://zsgx.mohrss.gov.cn/uploads/2024-10-24/%E6%9C%BA%E5%99%A8%E4%BA%BA%E5%B7%A5%E7%A8%8B%E6%8A%80%E6%9C%AF%E4%BA%BA%E5%91%98%E5%9B%BD%E5%AE%B6%E8%81%8C%E4%B8%9A%E6%A0%87%E5%87%86.pdf#page=4',
  note: '第 1.2–1.4 节列编码、职责和专业技术等级。结构、控制、系统三个方向仅适用于初级和中级，高级不分方向。',
};
const titlePolicy = {
  label: '人社部、工信部｜工程技术人才职称制度改革指导意见',
  href: 'https://www.miit.gov.cn/jgsj/rjj/wjfb/art/2020/art_09bb59c2df974722a8ee3441976f37d2.html',
  note: '人社部发〔2019〕16 号，第二部分及附件基本标准。',
};
const operatorStandard = {
  label: '工业机器人系统操作员国家职业技能标准（2020 年版）',
  href: 'https://www.ustl.edu.cn/__local/4/C2/09/5FEBF805294C680D5878D6BB3B9_2169C10F_EC451.pdf#page=6',
  note: '辽宁科技大学公开的部颁原版。第 1.2–1.4 节为该版本的编码、职责和等级。',
};
const maintenanceStandard = {
  label: '工业机器人系统运维员国家职业技能标准（2020 年颁布）',
  href: 'https://chinajob.mohrss.gov.cn/upload/resources/jnbzpdf/4ccc6a76ab912072690801.pdf#page=4',
  note: '中国就业网挂载的标准原件。第 1.2–1.4 节为该版本的编码、职责和等级。',
};
const safetyIndex = {
  label: '国家标准信息公共服务平台｜GB 11291 现行条目',
  href: 'https://std.samr.gov.cn/search/stdPage?q=GB+11291',
  note: '核对 GB 11291.1-2011 和 GB 11291.2-2013 的状态和范围。',
};
const safetyPlanA = {
  label: '国家标准修订计划 20262542-Q-339｜工业机器人整机',
  href: 'https://std.samr.gov.cn/gb/search/gbDetailed?id=5096745708F1CC3AE06397BE0A0AC3BD',
  note: '查看当前计划进度和拟替代的标准。',
};
const safetyPlanB = {
  label: '国家标准修订计划 20262543-Q-339｜应用与单元',
  href: 'https://std.samr.gov.cn/gb/search/gbDetailed?id=5096745708F2CC3AE06397BE0A0AC3BD',
  note: '查看当前计划进度和拟替代的标准。',
};
const specialOperations = {
  label: '三部门｜《特种作业目录》应急〔2026〕45 号',
  href: 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/t20260526_604988.shtml',
  note: '自 2026 年 6 月 1 日施行，通知附目录。',
};
const specialOperationsList = {
  label: '应急管理类特种作业目录原件｜电工、焊接与热切割',
  href: 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202605/W020260526532904903760.pdf#page=1',
  note: '第一部分第 1、2 项。第 2 项末句列全自动设备相关作业的排除范围。',
};
const specialOperationsRule = {
  label: '应急管理部令第 19 号｜特种作业人员培训考核规定',
  href: 'https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/202512/t20251219_589179.shtml?menuid=129',
  note: '第 3、4 条核作业范围和持证要求，培训与考核见对应章节。',
};
const commissioningPosting = {
  label: '郑州经纬科技｜工业机器人调试工程师',
  href: 'https://znzzxy.hagmc.edu.cn/info/1046/1747.htm',
  note: '2025-09-26，郑州中原区。招聘材料列动作调试、说明书、现场支持和 PLC 信号交互。',
};
const technicianPosting = {
  label: '陆汇智能科技校招｜工业机器人技术员',
  href: 'https://zhjyb.zua.edu.cn/module/campustalkdetail/id-6aab4989947c3f2b26ebad13/nid-5119',
  note: '2026-09-23 郑州校招宣讲。看技术员职责和工作条件，宣讲地点与派驻地分开核实。',
};
const factoryPosting = {
  label: '天津福莱迪｜自动化／机械／视觉技术',
  href: 'https://career.tjcu.edu.cn/correcruit/content/id/13231.html',
  note: '2026-09-11 天津招聘。看生产企业的升级方案、视觉与 PLC／机器人联动、移交文档。',
};
const wageNotice = {
  label: '国家统计局｜2025 年城镇单位就业人员年平均工资情况',
  href: 'https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html',
  note: '第三节表 6–8 和附注。岗位大类、统计范围、年平均工资口径。',
};

const procurement = {
  link: {
    label: '北京职业技术大学｜机器人拆装与检测实训室采购公告',
    href: 'https://www.bpu.edu.cn/zcglc/info/1004/1742.htm',
    note: '2026-06-15。项目基本情况第 4 项分项表 2.2–2.6，第 5 项第（2）（3）款。',
  },
  equipment: '公开采购原件在「软体灵巧手人机协作精益装配台」下设装配、装配验证、显示、PLC 控制和综合控制模块，',
  acceptance: '并载明乙方完成到货安装、调试、培训后提出验收申请，甲方组织验收并出具验收报告。',
};
const mismatch = '本轮装配验证未通过，显示仍保留上一轮通过';
const missingReview = '缺变更后的复核记录';
const fixture = {
  records: `卡 A（B1 版｜验证与显示一致｜有记录）、卡 B（B2 版｜常规一致｜有记录）、卡 C（B2 版｜${mismatch}｜有记录）、卡 D（B2 版｜${missingReview}）。`,
  initial: '初始第 2 页见 C、D；',
  order: '固定顺序 A、B、C、D，每页 2 卡（p1 A/B，p2 C/D）。',
  filter: '筛选规则：切／清筛选均重置回 p1。',
  baseline: '移交以 B2 为基线：A 属旧版，B 仅覆盖常规，C 显示异常，D 缺复核记录。',
  closure: '同一获批版上，指定验证人补齐常规一致与异常显示留痕记录，由指定批准人按项签认；缺项保持待验。',
};
const exerciseBoundary = `${procurement.equipment}${procurement.acceptance}B1／B2、四卡与验收角色均为纸面模拟。`;

export const roboticsComparisonZhSpec: ModularComparisonSpec = {
  pairId: `${engineerSlug}-vs-${technicianSlug}`,
  locale: 'zh',
  title: `${engineer} vs ${technician}：工作差别、入行条件与试做`,
  shortTitle: `${engineer} vs ${technician}`,
  description: '在中国大陆选机器人工程师还是机器人技术员？对比工业工作站的设计交付、现场装调运维、薪酬及证照，用公开采购原件试做一次版本与验收交接。',
  regionLabel: '中国大陆',
  authorName: '费马测试编辑部',
  datePublished: '2026-11-24',
  dateModified: '2026-11-24',
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: '同样面对汽车厂或 3C 产线里的一条机械臂工作站：机器人工程师偏“设计与集成架构”，负责本体与夹具选型、视觉／PLC 接口设计，并起草整站验收方案；机器人技术员是产线的“保健医生”，负责工厂产线里的日常点检、示教维护、故障排查和跨班交接。介于两者之间的“机器人调试工程师”，视项目交付模式而定，部分岗位需跨城出差、驻客户现场打通整线。选岗前先圈出首份交付、驻场出差和倒班安排。',
    roleA: { badgeTitle: engineer, riasecLabel: '霍兰德 RIC', aliases: '大陆招聘样本有「工业机器人调试工程师」，其职责重点可以是客户现场调试。另有「自动化／机械／视觉技术」岗位覆盖工装、产线接口或视觉集成。', keywords: '工装选型、机器人与 PLC 接口、验证覆盖、方案变更' },
    roleB: { badgeTitle: technician, riasecLabel: '霍兰德 RCI', aliases: '大陆样本称「工业机器人技术员」。国家职业体系中的工业机器人系统操作员、运维员可作任务参照，现场岗位可能组合两类任务。', keywords: '装配图、示教器、点检与诊断、复验交接' },
    interviewBoundaryTitle: '拿上一次工作站交接问两句',
    interviewBoundaryQuestions: [
      '新产品共用旧工作站时，谁交夹具与验证逻辑的改动清单？谁确认哪些旧版记录还能用于验收？',
      '夜班发现装配结果与屏幕显示不一致时，本岗要交哪几项记录？谁可以批准改动，谁确认恢复条件具备？',
    ],
    riasecBoundaryNote: '两张霍兰德徽章用来选值得亲手试做的工作活动。兴趣与岗位胜任、取证条件、作业授权和录用分别核验。',
  },
  topology: {
    title: '装配件换了，上一轮的通过记录还能用吗？',
    summary: '以同一个工业装配单元分工。工程侧明确夹具、装配验证、显示和 PLC 之间的接口及验收范围。技术侧回传工位、版本与观察记录，让评审人区分原方案遗漏、交付执行偏差和仍待核实的线索。',
    ariaLabel: '装配单元交接。左侧工程人员拆分装配、验证和显示，提交验收范围。右侧技术人员核工位版本、保留观察和补交复核记录。两侧通过证据和获批的交付条件互相交接。',
    leftZoneTitle: engineer,
    leftSteps: [
      { title: '拆分工作站接口', detail: '划清工装、装配验证和显示' },
      { title: '比较版本影响', detail: '把变更映射到待复核项目' },
      { title: '提交验收条件', detail: '列常规和异常两种可见结果' },
    ],
    centerZoneTitle: '工位版本与验证记录',
    upperBridge: { title: '技术员交回现场证据', line1: '区分验证结果与界面显示', line2: '附工位、版本和待验项' },
    lowerBridge: { title: '工程师交付获批判据', line1: '明确版本、适用范围和反例', line2: '列负责复核及签认的角色' },
    rightZoneTitle: technician,
    rightSteps: [
      { title: '认工位和版本', detail: '逐项核对工单与交付基线' },
      { title: '记录装配偏差', detail: '分开记事实、缺项和猜测' },
      { title: '汇总复核证据', detail: '跨班可追踪每一项关闭理由' },
    ],
  },
  matrix: {
    title: '看一套工作站怎样设计、交付和维护',
    summary: '本文重点是工业机器人工作站，尤其是机械工装、机器人控制与产线单元的集成。2023 年版国家职业标准在初级和中级设机器人结构设计与开发、控制设计与开发、系统设计与开发三个方向，高级不分职业方向。郑州调试、天津自动化技术、陆汇校招是具体岗位样本，适合看不同招聘说明给了谁什么任务。班次和出差占比要问目标团队。',
    roleAColumn: engineer,
    roleBColumn: technician,
    expandButtonLabel: '展开学历、发展与验证边界',
    collapseButtonLabel: '收起补充对照',
    rows: [
      { id: 'outputs', dimension: '主要交付物', roleA: '交付满足产能与精度要求的方案、接口表、图纸或程序版本，以及可以复验的工况清单。做结构侧，重点是末端工装怎样匹配负载、工件定位与维护空间。做系统集成侧，要说清 PLC、装配验证和显示各自输出什么，谁接收异常。', roleB: '交付可追溯的装调与保养工单、点检表、异常记录以及维修后复核记录。到现场先看班次、工位、设备和程序版本能否对上。有需要时附获准留存的报警、观察时间及受影响的批次，让下一班看得出哪一项已处理、哪一项仍待复核。', defaultVisible: true },
      { id: 'methods', dimension: '常用工具和方法', roleA: '按方向用 CAD／三维模型、机器人程序或控制时序图。系统集成先画工序、信号和验证结果的归属，再把正常工件、边界工件和失败情况下的预期写进用例。天津福莱迪的招聘列出 CAD、SolidWorks 和视觉检测与 PLC、机器人的联动。', roleB: '按用工范围读装配图、电气图和示教器记录，结合工单、检测仪具及维护资料，把症状定位到可负责的部位。2020 年版运维标准列状态监测、故障分析和预防性维护。看 JD 是否给具体品牌培训、作业指导及超权限时的升级人。', defaultVisible: true },
      { id: 'verification', dimension: '出问题时先查哪项', roleA: '一套验证对旧工件有效，对新工件还需重新核对适用范围。技术侧交回一份有版本的反例后，把故障影响落到夹具、验证模块或显示接口，并列出哪些判据要由工艺或质量方确认。', roleB: '记录何时看到验证未通过、何时看到显示保留上一轮结果。两类观察分别记，再核同一工位和版本。证据不足时可以列出待确认的先后关系与记录缺口，便于工程或质量复盘，不凭单次现场现象写换件结论。', defaultVisible: true },
      { id: 'approval', dimension: '谁提交、谁签审', roleA: '可以起草方案、提出变更和提交验证材料。夹具或控制方案由项目指定的人评审，安全相关变更按单位组织和规则处理。拿上一版资料问清技术评审、客户验收和生产放行是否是三项签认，各由谁负责。', roleB: '可以在岗位范围内形成并提交装调、保养和复验记录。面试问班组能关闭哪些普通工单，哪些情况必须转设备负责人。能填写异常工单、能接触工位、能批准改动或复产都是不同权限，逐一核到项目分工和单位授权。', defaultVisible: true },
      { id: 'friction', dimension: '日常摩擦和排班', roleA: '研发与方案设计偏坐班，而系统集成与现场调试岗会随交付节点面对客户驻场、联调排期与多方催节拍（如公开郑州调试样本注明出差以省内为主，其他跨区项目需单独核实）。求职前请团队拿最近两次联调说清连续驻场天数与补贴，确认岗位是方案设计还是纯现场执行，再对照个人底线取舍。', roleB: '产线运维岗相对聚焦设备运行与现场排故，但不同企业排班差异大——部分工厂岗位涉及两班／三班倒、停线急修与车间噪声防护，部分技术服务岗也含客户现场出差（如公开陆汇样本提示核清派驻与倒班）。筛岗前先写清夜班与出差底线，拿近一月班表和工单确认是否真做点检排故，避开只做重复上料却挂名技术员的岗位。', defaultVisible: true },
      { id: 'entry', dimension: '学历与面试证据', roleA: '对研究、结构设计或控制开发，逐条匹配 JD 的专业、学历和交付题。一则郑州现场调试招聘样本接受大专及以上，工作覆盖动作调试、写调试报告和现场技术支持。若应聘系统设计，准备两版工况和一张接口图，讲清哪次变更影响哪项验收。', roleB: '操作、装调和运维的面试题会随设备和雇主而变。陆汇校招技术员样本列出轨迹示教、维护、排故与点检文档等任务。准备一张带版本的点检或故障记录，说明什么是观察、什么还要核实、交给谁待办。遇到证书条件先核具体工种、等级和用途。', defaultVisible: false },
      { id: 'employer-path', dimension: '雇主样本与成长方向', roleA: '可分别看集成商的项目调试和制造企业的工艺升级。郑州样本体现交付型工作，天津样本体现生产企业对夹具、视觉与设备联动的需求。想从单机扩到整站，问下一阶段是否能参加选型和接口评审，并主笔异常验收用例。', roleB: '面向产线设备团队可看点检、保养与重复故障分析，面向供应商现场服务可问装调、培训和客户移交。想走向高级运维，争取积累多个班次可复用的故障记录。想转集成，再补接口定义、方案更改和试验覆盖的证据。', defaultVisible: false },
      { id: 'safety-scope', dimension: '整机与单元安全边界', roleA: '看工作站项目时先核标准适用对象：GB 11291.1-2011 对应机器人本体，GB 11291.2-2013 对应机器人系统与集成。项目涉及工装、验证模块或人机接口变更时，问指定评审方是否已确认适用标准和验证范围。', roleB: '读现场交付资料时记清设备、工位和文件版本，查询批准的工作范围、所需培训和升级链。会认示教器和会读图纸都是技术能力。涉及具体特种作业或安全相关变更时，再核证书范围与企业现场授权。', defaultVisible: false },
    ],
  },
  incident: {
    title: '模拟交接：装配验证失败，屏幕却保留上一轮通过',
    summary: '以精益装配单元（含装配、验证、显示与 PLC 控制模块，完整项目出处见文末）为背景，模拟 B1 升级到 B2 后的纸面验收异常与跨班交接。',
    triggerLabel: '换版后的模拟验收发现',
    triggerBody: `移交按 B2 评审。${fixture.initial}卡 C：${mismatch}。卡 D：${missingReview}。纸面资料还包含旧版通过和新版常规通过两条记录。`,
    triggerCaveat: '案例中的工位版本、角色分工、卡片与异常均为模拟。真实项目查合同、适用文件和单位授权，验收消息与运行授权分别确认。',
    rows: [
      { stage: '核版本影响与验收口径', roleLabel: engineer, tone: 'roleA', verifiedFacts: fixture.baseline, openGaps: '先向对应维护方核 PLC 与显示接口的版本和记录所属轮次。保留验证、数据传递、显示三个待查点，等待证据缩小范围。', actionAndApproval: '提交写有当前版本、工况、预期结果和复核责任人的变更核对单。交指定技术负责人评审，涉及项目安全或质量条款时由相应负责人按流程确认；本案例的批准人以纸面设定为准。' },
      { stage: '整理观察并移交复核', roleLabel: technician, tone: 'roleB', verifiedFacts: '卡 C 同时有当轮装配验证和屏幕表现，两项记录须分列。卡 D 缺复核材料，在交接单上仍记待验。', openGaps: '保存受影响的卡号、工位、程序或文件版本及附档位置，补列待提供的相同版本记录。交接时说明目前没有原因确证。', actionAndApproval: '技术员交异常证据，指定且获授权的验证人员按获批方案执行核验和提交记录，项目指定批准人判断能否关闭。验收申请与生产侧恢复授权各走对应权限。' },
    ],
    recoveryAcceptanceTitle: '关闭移交问题所需的记录',
    recoveryAcceptanceCriteria: `${fixture.closure}新装配件或参数导致口径再变时，重新对齐待验范围。按真实现场规则判定运行许可，本页的纸面通过只代表材料齐全。`,
    defenseLayerNote: '把结果确认分两层：一次装配验证说明该轮工件结果，团队签认说明证据是否达到约定门槛。现场还需核防护、授权及组织规则，界面状态仅作记录中的一项证据。',
  },
  payAndCerts: {
    title: '薪资看书面构成，证照按实际任务核',
    summary: '两岗的合同关系和工作场所都可能不同。同城、同职级、同用工类型的书面方案才便于比较。职业标准说明能力，职称用于专业技术评价与相关聘用，目录内特种作业按实际操作类别和项目持证。厂内可以另设培训和授权。',
    salaryHeading: '薪酬怎么算、定级核查什么，以及 Offer 对比口径',
    salaryBody: '国家统计局 2025 年大类均值不能给两岗排序。面试控制或集成岗时，先问固定月薪、是否有研发或项目交付奖，以及跨品牌集成责任能否影响定级。投客户现场调试岗时，问是否另列验收奖、差旅报销和驻场补助，把时间成本算进去。投技术员时，问夜班、加班和技能津贴怎么列，工作地点是否固定、要不要跨厂支援，能否从基础点检转向更深入的运维。对比 Offer 时把差旅报销与报酬分开，再统一发薪月数和驻场班次。',
    certs: [
      {
        name: '工程技术人才职称',
        officialScope: '工程技术人才职称依人社部发〔2019〕16 号及适用地方、行业和单位规则核。这里的员级称技术员，中级称工程师，都是正式职称层级名称。2023 年版机器人工程技术人员国家职业标准使用 2-02-38-10，列初级、中级和高级专业技术等级及工作要求。',
        workplaceBoundary: '招聘的「调试工程师」描述岗位工作。单位是否要求职称、接受哪一专业、如何对应聘任，以及项目签审和验收归谁，由各自适用的规则与授权决定。',
        verificationTips: '问人事是否存在正式职称和聘任条款，请其给出专业、级别与申报渠道。问项目负责人是否另有人员材料、资历或签审要求。准备能证明本人贡献的变更说明与验收记录。',
        officialLinks: [titlePolicy, engineerNotice, engineerStandard],
      },
      {
        name: '工业机器人系统操作员／运维员技能等级',
        officialScope: '现行分类中，操作员为 6-31-07-03，运维员为 6-31-07-01。两份 2020 年版职业技能标准分别印有当时的 6-30-99-00 和 6-31-01-10。操作员标准侧重装配、编程、调试等任务，运维员标准侧重状态监测、诊断维修与预防性维护。',
        workplaceBoundary: '技能等级可用来展示对目标工种的能力。招聘若要求取证或认可某等级，向单位核实实际用途。采用哪份技能标准、如何评价和由谁发证，可和当地评价机构核验。涉及特种作业时要查对应的操作证规则。',
        verificationTips: '要求写清工种全称和岗位主要任务。把招工采用的现行分类代码和标准原件上印的历史代码分开记，再问人事在录用、定级或培训哪一步看证。',
        officialLinks: [occupationClass, trainingCatalog, operatorStandard, maintenanceStandard],
      },
      {
        name: '特种作业操作证｜电工、焊接与热切割',
        officialScope: '按 2026 年 6 月 1 日起施行的《特种作业目录》和应急管理部令第 19 号第 3、4 条，直接从事目录内的低压电工作业等特种作业，须取得相应特种作业操作证后方可上岗作业。焊接与热切割条目明确排除全自动焊接与热切割设备的安装、研发、编程、调试、操作和维护保养。',
        workplaceBoundary: '岗位若直接从事目录内的电气设备检修、熔化焊接或热切割等作业，逐项核相应操作证。全自动焊接与热切割设备的上述工作按焊接条目的排除范围判断，兼做的电工作业仍逐项对照电工条目。可独立执行哪些工单，另查企业内部授权。',
        verificationTips: '向雇主安全管理人员确认本岗直接从事哪些目录内作业、分别对应哪个操作项目，再核证书全称和有效性。另问企业由谁授权独立作业、授权覆盖哪些工单。',
        officialLinks: [specialOperations, specialOperationsList, specialOperationsRule],
      },
    ],
    interviewChecklistTitle: '请招聘方用一份班表和岗位说明回答',
    interviewChecklistQuestions: [
      { label: '年收入', question: '固定工资发几个月？奖金、夜班津贴、驻场补贴和报销分别按什么时间、条件或单据发放？' },
      { label: '劳动关系', question: '签约、发薪和现场管理各是哪个主体？最近一次客户联调或停线支持的排班如何安排？' },
      { label: '持证与现场授权', question: '本岗直接从事哪些目录内作业，需要哪项操作证？公司准许独立作业前，还有哪些内部培训和授权要求？' },
    ],
  },
  checklist: {
    title: '用作品核技能，用排班和授权核现实条件',
    summary: '先按能举证的技能勾选，再按可以接受且仍待核实的工作安排单独勾选。面试时带上一张缺项清单，直接对照拟入职的工作站、工单制度和培训安排。',
    skillsHeading: '我能用一份材料证明的技能',
    skillsOptions: [
      { id: 'scope-and-interface', track: 'roleA', label: '我能把工作站拆成可验收的接口', summary: '用一张非机密框图给工装、装配验证、PLC 和显示各写一个职责及交接字段。说清显示与验证冲突时哪个记录能说明哪件事。', interviewQuestions: ['你们的第一个项目是做结构、控制还是整站集成？输出接口表由哪些人复核？'] },
      { id: 'revision-and-coverage', track: 'roleA', label: '我能把版本差异转成复核范围', summary: '在两版纸面材料中标出一个影响验证的变化，给正常工况和异常各写一条验收条件。把待确认的字段交给具名角色。', interviewQuestions: ['哪类夹具或显示改动必须由质量、工艺或设备方参加复核？'] },
      { id: 'event-records', track: 'roleB', label: '我能写清报警、版本与观察顺序', summary: '用两列分开记录看到的结果和待核推断，附工位、版本、时间与复核人。交接对象能按原卡号续办。', interviewQuestions: ['你们用什么记录跨班异常？新手可取得哪些只读线索，缺项找谁补？'] },
      { id: 'service-handoff', track: 'roleB', label: '我能按工单整理装调和复验材料', summary: '用一份模拟记录标明对应工况、记录状态、升级对象和已获授权的工作范围。复核中缺证据的项目保留待验。', interviewQuestions: ['常规点检、独立检修和整站复验，各由谁指派与验收？'] },
    ],
    conditionsHeading: '我能接受并会向招聘方核实的条件',
    conditionsOptions: [
      { id: 'customer-site', track: 'roleA', label: '我能接受有明确边界的客户现场交付', summary: '用实习或项目经历估计自己能接受的连续驻场、跨城往返及临时联调时间。', interviewQuestions: ['最近一个验收项目驻场多久？周末联调和夜间响应怎样轮换？'] },
      { id: 'design-discussions', track: 'roleA', label: '我能接受计划受工艺和客户评审牵动', summary: '确认多方评审的等待、返工和验证时间是否适合自己的工作方式。', interviewQuestions: ['客户希望缩短节拍时，谁去协调工艺与质量约束？同时会跟多少工位？'] },
      { id: 'shift-and-access', track: 'roleB', label: '我能接受目标班组的轮班与现场环境', summary: '拿实际班表和厂区安排衡量夜班后的通勤、工位环境及替班条件。', interviewQuestions: ['最近一月如何排班？遇到产线停机时谁负责升级和提供现场支持？'] },
      { id: 'permission-and-training', track: 'roleB', label: '我能接受培训和授权逐级增加', summary: '把跟班观察、记录、协助和独立作业分别对照培训内容、考核时间和证书条件。', interviewQuestions: ['入职第一个月会负责几类工单？哪些可独立做，哪些须由指定人员接管？'] },
    ],
    defaultInterviewQuestions: ['请用最近一次装配单元改造说明试用期第一个交付物、评审人和可独立执行的工作范围。'],
    crossTrackNote: '两轨都有勾选时，用相同一份 B2 资料各做一次试交付。看你愿意投入时间把哪份材料做得更准确，再和具体岗位的工时及授权一起判断。',
    offlinePrintHint: '打印可保留技能和工作条件两栏，面试后在问题旁填实际回答或待补证据。',
  },
  desktopExercise: {
    sectionTitle: '5 分钟试做：四卡交 B2 移交材料',
    summary: '任选一轨凭卡纸笔复做（原件见下方）。',
    publicLinksHeading: '原件',
    factSummaryHeading: '原件摘记与四卡',
    factSummarySegments: [
      { text: '边界：', tone: 'strong' },
      { text: `${exerciseBoundary} ` },
      { text: '四卡与角色：', tone: 'strong' },
      { text: `${fixture.records}${fixture.order}${fixture.initial}${fixture.filter}角色：指定验证人、指定技术评审人、指定批准人。` },
    ],
    publicLinks: [{ label: '北职大实训室采购公告', href: procurement.link.href, note: '第 4 项 2.2–2.6、第 5 项（2）（3）款。' }],
    taskA: { title: engineer, instruction: '交版本验收卡：写 5 模块、甲乙方验收责任与模拟边界，标 A–D 效力，列 B2 常规与异常留痕、指定批准人签认门槛及 1 条接口归属问题；页脚写未达条件待验，交指定验证人补证、技术评审人续办复核。' },
    taskB: { title: technician, instruction: '交班次交接单：写 5 模块、甲乙方验收责任与模拟边界，从 p2 演示仅看 B2、翻 p2、清筛选并记可见卡号；标 B2 下 A–D 效力并分栏记 C 现象与 D 缺证，写明补证、签认与待验关闭条件。' },
    rubricTitle: '自检与样答',
    rubricHeading: '每轨检查四项',
    rubricPassRule: '命中 2 共用 + 本轨 2 项即过关。',
    rubricItems: [
      '共用 1｜引准装配、验证、显示、PLC、综合控制 5 模块与乙方申请／甲方验收，标清模拟边界。',
      `共用 2｜${fixture.baseline}`,
      '工程 1｜说明 A–D 效力，提 1 条接口归属问题交指定技术评审人确认。',
      '工程 2｜列 B2 常规与异常留痕及签认门槛，未达条件待验并交指定验证人补证、技术评审人续办复核。',
      '技术 1｜从初始 p2（C/D）起，写准仅看 B2（p1 B/C、p2 D）及清筛选回 p1（A/B）。',
      '技术 2｜分栏记 C 现象与 D 缺证，明示指定验证人补证、指定批准人签认，缺项待验。',
    ],
    sampleAnswerALabel: '工程样答',
    sampleAnswerA: '据精益装配台原件（装配／验证／显示／PLC／综合控制；乙方申请、甲方验收），B1／B2 与四卡模拟。以 B2 为基线：A 旧版，B 仅常规，C 失败却显旧通过，D 缺复核。问指定技术评审人：“B2 版由谁传递验证结果并清除旧显示？”关闭门槛：同获批版补齐常规一致与异常留痕，指定批准人签认。页脚：待验，交指定验证人补证并由指定技术评审人续办复核。',
    sampleAnswerBLabel: '技术样答',
    sampleAnswerB: '据精益装配台原件（装配／验证／显示／PLC／综合控制；乙方申请、甲方验收），B1／B2 与四卡模拟。初始 p2（C/D）→仅看 B2 回 p1（B/C）→翻 p2（D）→清筛选回 p1（A/B）。以 B2 为基线：A 旧版、B 仅常规，分栏记 C 本轮验证未通过却显上轮通过、D 缺变更后复核。交指定验证人与下一班补证，同获批版留痕齐备且指定批准人按项签认前待验。',
  },
  tools: {
    title: '按下一步要弄清的问题选一个工具',
    summary: '已有两个目标岗位，可先对照岗位任务。做过试做，可留一份面试记录。工作方式或现实条件仍影响决定时，可先梳理自己的取舍。',
    cards: [
      { id: 'manual-career-compare', badge: '手里有两个岗位', meta: '并排核对', tone: 'neutral', title: '比较两个职业', description: '打开两槽，手动选择机器人工程师和机器人技术员，沿任务与技能核两份招聘说明。', purposeHint: '对两份岗位说明列出各自缺的一条关键证据。', ctaLabel: '打开职业对比', href: '/zh/career/compare' },
      { id: 'record-next-step', badge: '已经做过试做', meta: '行动记录', tone: 'roleA', title: '职业探索工作表', description: '记录题目、产物、待问的班次或授权问题。离开前可复制、下载或打印。', purposeHint: '把试做发现带到下一次面试。', ctaLabel: '打开工作表', href: '/zh/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: '先摸清兴趣', meta: '60 题', tone: 'roleB', title: '霍兰德职业兴趣测试', description: '查看你的兴趣六维与三字代码，辅助判断自己更享受系统研发设计还是现场机电排故（兴趣不等于胜任力或作业资格）。', purposeHint: '适合在自动化、机电、控制与运维方向间摸索兴趣的人。', ctaLabel: '测职业兴趣', href: '/zh/tests/holland-career-interest-test-riasec' },
      { id: 'career-conditions', badge: '核现实条件', meta: '94 题', tone: 'accent', title: '职业测试', description: '梳理工作活动、工作方式和工作条件，例如高频出差驻厂、产线倒班与通勤取舍。', purposeHint: '用自己的偏好与约束挑下一条证据。', ctaLabel: '查看职业测试', href: '/zh/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: '单岗档案',
    profileLinks: [{ label: engineer, href: `/zh/career/jobs/${engineerSlug}` }, { label: technician, href: `/zh/career/jobs/${technicianSlug}` }],
  },
  faqs: [
    { id: 'commissioning-title', question: '调试工程师和机器人技术员怎么区分？', answer: '如果岗位交版本化方案、定义接口并编写整站验收条件，按工程交付准备。如果重点是按已有工艺完成现场装调、诊断和跨班交接，按技术员的工作准备。郑州样本的调试工程师负责动作调试、写现场调试报告并提供现场技术支持。两头都做时，面试请团队拿上一套工位说明谁写方案、谁核记录、谁签变更。' },
    { id: 'coding', question: '两岗都要编程吗？PLC、示教和控制开发怎么选？', answer: '想写机器人控制与感知应用，先看工程侧控制或系统方向。想做现有工作站的交付与支持，先看装调、操作和运维任务。PLC 信号、示教和版本记录可能同时用到。面试让对方举最近一例，确认产物是整套控制逻辑、获准范围内的装调记录，还是面向故障的证据。' },
    { id: 'standards-status', question: 'GB 11291 的两个部分和修订资料应该怎么用？', answer: '核机器人本体读第 1 部分，核机器人系统与集成读第 2 部分。2026 年 11 月 24 日查国家标准平台，GB 11291.1-2011、GB 11291.2-2013 均标为现行。计划 20262542-Q-339、20262543-Q-339 分别拟修订整机与应用单元，平台均显示正在起草。草案用于研究拟议变动。项目依据看正式发布文本、实施日期和替代关系。' },
    { id: 'qualification', question: '机器人技术员要考电工证或焊工证吗？', answer: '需要直接从事目录所列电工、焊接或热切割作业时，须取得相应特种作业操作证后方可上岗作业。仅承担全自动焊接与热切割设备列明的安装、研发、编程、调试、操作或维护保养时，适用焊接条目的排除范围。若还直接从事目录内的电工作业，单独核相应操作项目与证书。再问企业如何授权独立作业，谁负责电气检修、谁负责焊接工艺、谁提交装调记录。' },
    { id: 'transition', question: '大专或机电背景能从技术员转工程师吗？', answer: '想转系统集成或调试，可先拿得出版本、验证和故障证据，再补接口图、负责的方案变更和验收范围。目标若是机器人结构研发或控制开发，优先对照目标 JD 的建模、实验、控制或学历条件。郑州调试岗接受大专是一个招聘实例，作品和实际门槛要按拟投岗位核。' },
    { id: 'salary', question: '机器人工程师的收入一定更高吗？', answer: '公开统计没有两岗同口径收入排序，比较待遇时宜按岗位细分、考核方式与出差／倒班补偿逐项核实（具体固浮比以书面 Offer 为准）：面试控制、视觉或集成岗时，问固定月薪、是否有研发或项目奖、承担什么职责可以定到相应薪档；面试现场调试岗时，问是否另发驻场补助或验收奖，再把驻外耗时折入时薪；面试技术员岗时，问夜班与技能津贴怎样计发，核清是否固定厂区、是否需要跨厂支援，以及能否从基础点检转向高级运维或集成调试。对比 Offer 时先核签约、发薪和日常管理分别由谁负责，把差旅报销剔除出劳动报酬，再按固定年薪和真实出差／夜班天数一起算。' },
    { id: 'ai-and-simulation-tools', question: '如果团队使用离线仿真或代码生成工具，两岗的哪些任务会变？', answer: '目前缺少两岗可比的岗位替代实证，无法给出替代比例，但从作业边界看，自动化工具与人工担责的分工非常清晰：离线仿真、自动路径规划与代码生成工具可辅助完成基础示教点位预演和模板化 PLC 代码编写；而在工程侧，非标工件的夹具选型、多传感器信号异常排查，以及依 GB 11291 和合同授权推进的系统安全评审与验收责任仍由人承担；在技术员侧，车间现场真实机械磨损、线束松动、气动泄漏与复杂停线排故高度依赖动手检测与跨班交接。选岗时可重点避开只做重复按按钮上料的纯操作工位。' },
    { id: 'test-and-release', question: '一次验收显示通过，就可以交班或恢复生产吗？', answer: '资料缺版本、异常用例或指定人员签认时，保留待验并交给负责复核的人。资料达到验收条件时，按项目约定完成验收记录，另向生产侧的授权人核运行许可。交班单上列卡号、适用工位和仍待核实的事项，让下一班知道能继承哪份判断。' },
  ],
  sourceGroups: [
    {
      id: 'cn-roles-and-recruiting', title: '大陆职业定义与可定位招聘材料',
      links: [occupationClass, engineerNotice, engineerStandard, commissioningPosting, technicianPosting, factoryPosting],
    },
    {
      id: 'cn-credentials-and-pay', title: '职称、技能评价、作业准入和薪酬统计',
      links: [titlePolicy, trainingCatalog, operatorStandard, maintenanceStandard, specialOperations, specialOperationsList, specialOperationsRule, wageNotice],
    },
    {
      id: 'system-safety-and-paper-source', title: '工业机器人安全标准与试做原件',
      links: [safetyIndex, safetyPlanA, safetyPlanB, procurement.link],
    },
    {
      id: 'onet-role-identity', title: '页面职业身份的 O*NET 任务参考',
      links: [
        { label: 'O*NET｜Robotics Engineers', href: 'https://www.onetonline.org/link/details/17-2199.08', note: '17-2199.08。读职业定义与 Tasks，限于两岗身份与任务参照。' },
        { label: 'O*NET｜Robotics Technicians', href: 'https://www.onetonline.org/link/details/17-3024.01', note: '17-3024.01。读装配、安装、测试、维护及服务记录。' },
      ],
    },
  ],
};
