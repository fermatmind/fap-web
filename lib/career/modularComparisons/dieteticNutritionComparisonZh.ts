import type { ModularComparisonSpec, ModularSourceLink } from '../modularComparison';

const technician = '营养技术员';
const dietitian = '营养师';

const source = {
  tianfu: { label: '四川大学华西天府医院临床营养科招聘', href: 'https://www.wctfh.cn/info/1510/5197.htm', note: '2026-06-17，四川成都。第四部分看指导关系、膳食监督及相关工作，第五部分区分学历硬条件和优先项。' },
  chongqingJob: { label: '重庆医科大学附属第二医院编外招聘第二批', href: 'https://www.cqsahcqmu.cn/index.php?c=show&id=25367', note: '2026-10-15，重庆。“临床营养科营养技师”行核学历、专业、岗位条件，证书名称需向用人方核准。' },
  ningguo: { label: '宁国市人民医院校园招聘岗位表', href: 'https://www.ningguo.gov.cn/OpennessContent/show/3782273.html?branch=453', note: '2026-06-26，安徽宁国。岗位表 20260003“营养师岗”核学历和专业，不据此推定岗位签审。' },
  clinical: { label: '国家卫生健康委进一步推进临床营养工作的通知', href: 'https://app.www.gov.cn/govdata/gov/202409/21/519727/article.html', note: '2024 年。第一至三部分核营养科能力建设、临床协作及营养筛查质控。' },
  indicators: { label: '国家卫生健康委临床营养质控指标', href: 'https://www.nhc.gov.cn/yzygj/c100068/202205/164e6556f6d34c33a3344fec9a2c5074/files/1733999800314_62777.pdf#page=2', note: '2022 年版附件三，第四项。' },
  exam: { label: '国家卫生健康委人才交流服务中心 2027 年度考试通知', href: 'https://www.21wecan.com/wsrcw/c100193/202611/1003488.shtml', note: '附件专业目录的初级（士）、初级（师）及中级三部分均核“营养”；正文第四至七项查报名范围，第十二项查聘任标准。' },
  skill: { label: '人社部公共营养师国家职业技能标准', href: 'https://www.mohrss.gov.cn/xxgk2020/fdzdgknr/qt/fzcwjxx/202112/W020211227599132291203.pdf', note: '2021 年版，第 1 章职业编码、职业定义及技能等级。' },
  evaluation: { label: '辽宁省人社厅公共营养师评价答复', href: 'https://rst.ln.gov.cn/eportal/ui?msgDataId=c00f1707260b43058cb3e6a82017ea47&pageId=ab4555d39b8b4d06a3c48b4319b3801e', note: '核社会化职业技能等级认定与备案机构。具体名录和报名期按当地当期公告。' },
  physician: { label: '《中华人民共和国医师法》', href: 'https://wsjk.ln.gov.cn/wsjk/zfxxgk/fdzdgknr/lzyj/fl/2025102214511839379/index.shtml', note: '查医师资格与注册、第二十二条执业活动范围、第二十四条医学证明文件与病历。' },
  cdr: { label: '美国 Commission on Dietetic Registration 证书使用政策', href: 'https://www.cdrnet.org/use-misuse', note: '只核美国 CDR 的 RD／RDN 与 DTR／NDTR 证书名称及授予方。' },
  pay: { label: '国家统计局 2025 年城镇单位就业人员年平均工资', href: 'https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html', note: '表 7 为全国规上企业按行业门类与岗位大类分组的年均工资，不是两个岗位分别统计。' },
  excel: { label: 'Microsoft 官方 Power Query 去重说明', href: 'https://support.microsoft.com/zh-cn/excel/keep-or-remove-duplicate-rows-power-query', note: '只核可按所选列识别重复值；不据此推断医院采购、采用率或替代率。' },
  rd: { label: '中国营养学会注册营养师水平评价制度暂行规定', href: 'https://www.cnsoc.org/acadconfg/7017212050.html', note: '第一、三、五条。学会水平评价分注册营养师和注册营养技师，考核及备案与地方招聘、卫生专业技术资格和医师注册分开。' },
  guideline: { label: '中国营养学会《中国居民膳食指南（2022）》', href: 'https://www.cnsoc.org/bookpublica/0522202019.html', note: '说明与目录。按人群选公开科普依据，不用于自行拟定个人治疗。' },
  canteen: { label: '国家卫健委《营养健康食堂建设指南》', href: 'https://www.nhc.gov.cn/sps/c100088/202012/9f71d532e5684a54a63090a75eb737fb/files/1732844457065_79752.pdf', note: '第二、三条及供餐建设要求。以单位食堂为适用对象；学校食堂可参考。' },
  school: { label: '国家卫健委《学生餐营养指南》', href: 'https://www.nhc.gov.cn/wjw/yingyang/201708/e8a131882d2c4a8c95f10a8b7b5fe662/files/1739783536840_54865.pdf', note: 'WS/T 554—2017，适用范围、术语和配餐原则。' },
  maternal: { label: '国家卫健委《婴幼儿营养喂养评估服务指南（试行）》', href: 'https://www.nhc.gov.cn/fys/c100078/202502/19903ff647694f3a85ed6fe332380b34.shtml', note: '服务对象、机构及转诊条目。用于妇幼和基层服务的职责区别。' },
  population: { label: '国家卫健委对全国人大有关营养健康建议的答复', href: 'https://www.nhc.gov.cn/wjw/jiany/202309/5057392c28644eb78f3d27ba2e89c2ff.shtml', note: '第二部分重点人群营养改善、监测与科普资源。只支持方向，非具体招聘或地区覆盖率。' },
  label2011: { label: '国家卫健委 GB 28050—2011 原文', href: 'https://www.nhc.gov.cn/sps/c100088/201111/714fdca49f15450580fc03a2ee3163f9/files/1732844863395_24655.pdf', note: '封面、适用范围与强制标示。2013 年实施。' },
  labelDate: { label: '国家卫健委食品安全国家标准目录', href: 'https://www.nhc.gov.cn/sps/c100087/202601/b8bc7bf0fd6243c1914d8c0708d9929a/files/%E9%A3%9F%E5%93%81%E5%AE%89%E5%85%A8%E5%9B%BD%E5%AE%B6%E6%A0%87%E5%87%86%E7%9B%AE%E5%BD%95%EF%BC%88%E6%88%AA%E8%87%B32025%E5%B9%B49%E6%9C%88%E5%85%B11725%E9%A1%B9%EF%BC%89.pdf', note: '目录 GB 28050—2011 行明确 2027-03-16 被替代。' },
  label2025: { label: '国家卫健委 GB 28050—2025 问答', href: 'https://www.nhc.gov.cn/sps/c100087/202509/470fa4ff5de14dd38619223cce9da4e7.shtml', note: '实施、强制标示和 NRV 项目。新版强制标示含糖及饱和脂肪，注意没有 NRV 的项目。' },
  fsmp: { label: '市场监管总局《特殊医学用途配方食品注册管理办法》', href: 'https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/fgs/art/2023/art_9b1a9daffc084d819bb4d7a31d909452.html', note: '总局令第85号，前三章。产品注册、申报方的材料真实性和可追溯责任。' },
  fsmpHospital: { label: '国家卫健委、市场监管总局医疗机构特医食品使用指导意见', href: 'https://www.samr.gov.cn/zw/zfxxgk/fdzdgknr/tssps/art/2026/art_81290de7385d4573939b6790103a5fb1.html', note: '院内目录及管理，第三部分第五、六项核培训、建议顺序和同意，第四部分第十二项核食品属性和处方限制。' },
  cdc: { label: '国家卫生健康委疾控机构食品安全与营养健康工作细则', href: 'https://nirp.chinacdc.cn/fsaqssjb/fswsfgbzsjb/fgsjb/gfxwjsjb/202502/W020250428534267236210.pdf', note: '营养监测章节。县级与地市层级现场采样、实施与质控职责分别核对。' },
  labelStandard: { label: 'GB 28050—2025 原件（广东省疾控部门）', href: 'https://cdcp.gd.gov.cn/attachment/0/593/593529/4773905.pdf', note: '封面和营养成分表强制标示。2027 年 3 月 16 日实施。' },
  nrs: { label: 'NRS 2002 原始论文', href: 'https://pubmed.ncbi.nlm.nih.gov/12765673/', note: '临床营养杂志 2003，原始摘要目的及结论。营养风险筛查不是个人诊断；场景限成人住院方向举例。' },
} satisfies Record<string, ModularSourceLink>;

const associationBoundary = '中国营养学会的注册营养师和注册营养技师是团体水平评价，不能代替医院要求的卫生专业技术资格或医师执业注册。';
const labelingBoundary = '普通预包装食品营养标签要核 GB 28050 的版次和适用日期；特医食品还要按自身的产品注册和医院使用规则分别核对。';

const examLevels = '初级（士）108、初级（师）210、中级 382';
const qualifications = `2027 年度国家卫生专业技术资格考试目录在三个级别均设“营养”，分别是${examLevels}。`;
const clinicBoundary = '医院岗位名称、卫生技术资格与医师执业注册分别核查。需要以医师身份作出医学诊查、治疗决定或签署相应医学证明时，看人员的注册执业范围与机构权限安排。';
const payBoundary = '国家统计局发布的是城镇单位年度工资统计；其规模以上企业分行业和岗位大类的表并未分别列这两岗。';

const exercise = {
  indicator: 'NUT-P-01',
  label: '住院患者营养风险筛查率',
  rule: '以完成筛查的住院患者人数除以同期住院患者总数，再乘百分之百。原文指受训医师使用经过验证的工具开展筛查。',
  total: 20,
  confirmed: 12,
  repeatRows: 2,
  draftRows: 1,
  priorRows: 1,
  confirmedUnscreened: 7,
};

const draftRate = exercise.confirmed / exercise.total * 100;
const completedRate = (exercise.confirmed + exercise.draftRows) / exercise.total * 100;
const currentCounts = `同一期共有 ${exercise.total} 名住院者。汇总表列 ${exercise.confirmed} 名有完成凭证的本期人员，另有 ${exercise.repeatRows} 行重复了其中人员、${exercise.priorRows} 行来自上期、${exercise.draftRows} 行是另一位本期人员的未确认草稿。剩余 ${exercise.confirmedUnscreened} 人已确认未完成筛查。`;
const draftRule = `确认数 ${exercise.confirmed}，分母 ${exercise.total}，${draftRate}% 只能作已确认口径的暂算值。`;

export const dieteticNutritionComparisonZhSpec: ModularComparisonSpec = {
  pairId: 'dietetic-technicians-vs-dietitians-and-nutritionists',
  locale: 'zh',
  title: '营养技术员 vs 营养师：医院、团餐与食品岗位怎么选',
  shortTitle: '营养技术员 vs 营养师',
  description: '中国大陆营养技术员与营养师怎么选？从医院临床营养、公共营养与团体供餐，到食品标签和特医食品，逐项比较交付、证照、工作条件与薪酬，并附离线质控试做。',
  regionLabel: '中国大陆',
  authorName: '费马测试编辑部',
  datePublished: '2026-11-24',
  dateModified: '2026-11-24',
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: '同事退回一张餐单说「这份送错了」，月报又显示「筛查做完了但找不到凭证」。喜欢把这两件事追到具体记录、改动人和补证时间，先看营养技术支持。更想把膳食资料、服务目标和执行反馈连起来，形成供人复核的建议，先看营养师方向。先看雇主服务谁、第一份成果交给谁。医院可以是筛查记录，团餐或妇幼是食谱版本或项目记录，食品企业则有标签、证据资料或合规科普。',
    roleA: { badgeTitle: technician, riasecLabel: '霍兰德 SCR', aliases: '华西天府医院招过“临床营养技师”，岗位含膳食监督、协助诊疗及宣教。重庆医科大学附属第二医院招过“临床营养科营养技师”，该公告列岗位名称及任用条件。中国营养学会的注册营养技师是独立的专业水平评价。', keywords: '膳食监督、原记录核对、差异登记、协助随访' },
    roleB: { badgeTitle: dietitian, riasecLabel: '霍兰德 SIE', aliases: '大陆医院有“营养师岗”的公开招聘，团餐和健康管理职位也可能带“营养”二字。公共营养师有专门的国家职业技能标准；中国营养学会的注册营养师与医院职务、美国证书分别核对。', keywords: '营养评估、膳食建议、健康宣教、服务评价' },
    interviewBoundaryTitle: '都写“营养”，面试先确认哪两处边界？',
    interviewBoundaryQuestions: [
      '新人第一份交付是餐单差异记录、筛查质控表，还是膳食评估及建议？能否看一份脱敏样稿？',
      '如果膳食建议涉及治疗，谁提出、谁复核、谁在系统确认？目标岗位实际有哪一段权限？',
    ],
    riasecBoundaryNote: 'SCR 为社会型、常规型、现实型，SIE 为社会型、研究型、企业型。按职业兴趣向量取前三，用来选值得尝试的任务，不能替代能力、资格或单位授权。',
  },
  topology: {
    title: '同一张营养记录，怎样分两路交付？',
    summary: '病区记录、营养科复核和用餐交付，用不同文件回答不同问题。下图用医院场景解释职责分工，具体落到哪位人员由医院决定。',
    ariaLabel: '营养技术员核对记录并交差异单，营养师解释评估并交复核意见，两边在营养科交接。',
    leftZoneTitle: technician,
    leftSteps: [
      { title: '点清记录', detail: '对日期、病区和来源' },
      { title: '归类差异', detail: '分重复、跨期和待核' },
      { title: '提交底表', detail: '标原记录、状态及接手人' },
    ],
    centerZoneTitle: '同一份营养记录',
    upperBridge: { title: '共享核对对象', line1: '人数、日期与凭证', line2: '一人只计一次' },
    lowerBridge: { title: '先核后确认', line1: '记录、意见各归其位', line2: '按权限确认' },
    rightZoneTitle: dietitian,
    rightSteps: [
      { title: '解释口径', detail: '确认分子与分母' },
      { title: '评估证据', detail: '核查凭证与未闭合项' },
      { title: '提交意见', detail: '说明何时可定稿' },
    ],
  },
  matrix: {
    title: '日常、证照与工作代价怎么比',
    summary: '医院临床营养科负责住院营养风险筛查、营养评估和干预协作；公共营养的工作对象可以是学校、食堂或妇幼人群；食品企业审核的是标签、配方资料和对外内容。三条线都讲“营养”，但谁能改哪份文件、如何验收、由谁承担责任，各有答案。',
    roleAColumn: technician,
    roleBColumn: dietitian,
    rows: [
      { id: 'deliverables', dimension: '医院日常与首次交付', defaultVisible: true, roleA: '住院部的一份新膳食记录，要和原医嘱、餐次、配送记录及更正版本对齐。运营支持侧可登记差异、跟踪缺失记录、交给厨房或原记录人核；华西天府的技师样本还写有在上级指导下协助诊疗和宣教。遇到换餐或当天出院，状态不能靠口头信息悄悄改，交接单要能说清哪一条进了新版本。', roleB: '评估侧要交代为什么复核、使用什么资料，以及哪个结论等补证。营养科与病区共同处理治疗膳食和肠内营养时，形成营养建议、确认临床决定、按医嘱执行、复核执行结果，各自核人员身份和授权。餐单与医嘱冲突时要复查、升级。' },
      { id: 'evidence', dimension: '临床筛查和质控', defaultVisible: true, roleA: 'NRS 2002 是成人住院方向的营养风险筛查工具之一；质控记录核的是人员、时间和完成凭证。谁实施筛查、使用哪种经验证的工具，由适用规范和院内安排决定。同名或复住记录先定位、再去重，合并后留原始索引。', roleB: '有记录显示筛查完成，只表示完成该项流程；覆盖率既不是阳性率，也不能说明治疗效果。评估侧把筛查线索、进一步评估意见、医师决定及执行反馈分开留痕。题中只对汇总人数做复算，不示范如何给个人筛查打分或选择营养干预。' },
      { id: 'public', dimension: '公共营养、团餐、疾控与妇幼', defaultVisible: true, roleA: '在学校或单位团餐，技术支持可跟食谱版本、餐次与营养标识，把报餐变动和供餐反馈交回项目负责人。妇幼或公共项目把人群、年龄段、表单和随访状态逐项对齐；疾控相关营养监测可核岗位是在整理样本记录还是统计分析。机构或项目名称不等于临床诊疗权限。', roleB: '食堂服务以供餐人群和项目验收为起点，单位食堂可对照《营养健康食堂建设指南》，学生供餐查《学生餐营养指南》；面向公众的科普可从《中国居民膳食指南》选适用对象。社区、疾控监测、妇幼不同项目的成果可能分别是人群监测、宣教或转诊记录，不能拿一套成人住院工具覆盖所有场景。' },
      { id: 'industry', dimension: '食品、特医食品与健康企业', defaultVisible: true, roleA: '以包装改版为例，技术侧可把产品类别、营养成分字段、原始检测或配方资料、审核稿和印刷版本放在一张追溯表。GB 28050—2025 已发布，2027 年 3 月 16 日实施并替代 2011 版。新版强制标示涉及糖、饱和脂肪等。校对时要核生产日期、适用版次和实际项目，不因新版已发布就把仍在过渡期的旧版标签一律判错。', roleB: '营养、研发或法规同事可提供产品营养属性的论证和标签审核意见。特医食品（FSMP）的企业注册申报，与医院供应目录及使用管理分别把关。院内相关医师或临床营养技师等须接受临床营养专业教育或培训，以及特医食品使用和规范化管理培训。按诊疗流程先提出膳食指导建议，膳食干预无法满足临床需求且符合应用指征时，才提出必要的特医食品使用建议。使用前须征得患者或家属同意。特医食品属于食品，院内不得开具处方。健康管理公司若把专业岗的验收写成售课、保健品销售或拉新，先按销售职位识别，不用头衔替代业务性质。' },
      { id: 'authority', dimension: '提交、复核与签审', defaultVisible: true, roleA: '技术人员可依岗位权限提交台账和疑点；对需要补证的记录，把栏位、时间、证据和回交人员标齐。《医师法》涉及医师执业及相关医学证明，不能从招聘称谓推导临床签署权。这个界限也适用于用人单位把医学内容交给营养团队先整理的情形。', roleB: '医院的营养技术支持侧交出可追溯的底表，评估建议侧说明资料怎样支持结论；遇到医师诊疗决定时，由具备相应执业资格并获院内授权的人员确认。 企业侧的原料、标签和宣传意见也须回到负责审核的岗位和具体授权，不把撰稿或递交资料当成批准。' },
      { id: 'tools', dimension: '工具、协作和出错成本', defaultVisible: false, roleA: '医院文档和膳食交付记录的重点是可追溯，表格可帮助找同一订单的版本和重复行。团餐现场如果一个班次同时更换原料和餐次，要把变更通知交给实际执行人并保留确认。食品侧如果手握多个包材版本，要把检测单位和印刷版逐项对上；用错资料会让后续复核返工。', roleB: '评估或营养管理岗位要对不同来源和对象选择不同资料：项目记录不能代替临床资料，化验摘要不能替代人群代表性。食品内容审核要能区分标签事实、允许的声称和无依据的产品比较。读者可用一份脱敏复核稿核实际协作对象，是医师、厨务、基层项目单位，还是产品法规同事。' },
      { id: 'friction', dimension: '真实工作摩擦', defaultVisible: false, roleA: '医院膳食与团餐岗位可能受出餐、交班和月报截止共同约束；食品标签校对会遇到产品临近印刷才发现引用版次变化。愿意反复对原始凭证和更正版本，才能接受这类返工。固定坐班、跟餐早班、跨点支持或包装物上厂确认，都看实际岗位表，不拿一份公告给其他地区排班。', roleB: '评估或宣教容易遇到不同人要不同答案：病区关心能否执行，食堂关心能否按时出餐，项目方关心是否完成验收。需要把专业判断解释到对方能执行。若岗位还承担内容营销，看业务考核写的是经审查的营养材料、项目达成，还是销售额及佣金；三种责任不能共用同一个职位预期。' },
      { id: 'growth', dimension: '入行与转岗', defaultVisible: false, roleA: '投医院先对照专业、学历和公告所写的卫生技术资格，积累任务记录和带教反馈，而非先购买跨行业证书。投食堂、社区或食品侧，可选真实公开材料做质控底表、交付记录或标签核对单。让用人方看到原证能追、修订能复算，区分操作记录和专业评估。', roleB: '由一般营养科普转向法规或临床时，需补目标岗位认可的课程、实践和专业资格。转食品研发或合规，能解释标签字段、日期及证据冲突是有用功；转妇幼或社区项目，要能把人群范围、服务记录和转接条件交代清楚。报名成功、考到证书和拿到岗位授权分别验收。' },
    ],
  },
  incident: {
    title: '模拟交接：筛查完成数为什么对不上',
    summary: '月底要交同一报告期的病区汇总。一边能查出哪条记录需要修，一边解释该指标何时能定稿。原件给出指标，下面的审批链为纸面模拟。',
    triggerLabel: '一份待签收的质控草稿',
    triggerBody: '导出表同时出现重复记录、上一期记录与未确认草稿。只看表格行数容易多算。营养科接手者需要知道分母从哪里来、完成凭证由谁补核，及报出前还有哪些记录待查。',
    triggerCaveat: '数字和人员均为模拟。练习在纸面完成，不打开病历、调整餐单或安排治疗。',
    rows: [
      { stage: '核差异', roleLabel: technician, tone: 'roleA', verifiedFacts: '原表有当前报告期名单，以及可追到出处的完成记录；一人可出现多行。', openGaps: '本期草稿缺完成凭证，同名和重复项不能自动改写原表。', actionAndApproval: '获授权的技术员在工作副本标注日期、重复来源和待核项，保留原记；交原记录责任人确认。技术员只递交核对资料。' },
      { stage: '复核口径', roleLabel: dietitian, tone: 'roleB', verifiedFacts: '公开质控指标以人数为单位，分母为同期住院患者总数。', openGaps: '草稿是否对应有效完成待核；没有确认前不能宣称最终人数。', actionAndApproval: '在这个模拟分工里，营养师提交分子分母及暂算值，写明哪些证据会改变结果，以及谁需要回补。' },
      { stage: '确认版本', roleLabel: '科室质控责任人', tone: 'roleB', verifiedFacts: '收到核对底表和口径复核意见后，可以比较修订前后的报告值。', openGaps: '重复、跨期和草稿需要有可定位的处理结论。', actionAndApproval: '模拟中由科室指定质控责任人复核并确认报告版本，获授权人员按流程登记。质控确认不产生临床处置权限。' },
    ],
    recoveryAcceptanceTitle: '何时允许这份表定稿',
    recoveryAcceptanceCriteria: '本期名单、有效完成记录与分子分母能逐项对得上。重复与跨期条目标明出处，草稿由原记录责任人确认完成或未完成。然后重新复算，另一位核对者能从版本与底表得到同一数字，再交科室指定责任人确认。',
    defenseLayerNote: '先确认记录和统计口径，再确认审批。没有完成凭证就保留为待核，不因赶截止时间改成已完成。',
  },
  payAndCerts: {
    title: '薪酬怎么比较，哪些证书要先核',
    summary: '把目标岗位归到医院卫生技术、医疗诊疗、公共营养或团体供餐。食品企业另核是产品法规、营养内容还是销售。再核证书发证机构、聘任层级和上岗责任。',
    salaryHeading: '用同口径 Offer 区分薪项、职级与工作代价',
    salaryBody: `${payBoundary}医院岗位先分编内、合同制和项目聘用，再比同等级薪项。面向临床的专业评估与质控复核、单纯膳食执行与记录支持，分工的定价差别应落在书面岗位等级、绩效计量和实际责任。哪项绩效受排班、工作量或科室规则影响，拿书面办法核，别把指导下参与写成独立承担。团餐和公共项目随供餐时点或项目推进，承包项目和本单位聘用的计发办法可能不同；比固定工资、现场或活动时段的补贴，以及项目奖金的验收和发放条件。食品企业先区分法规／产品研发与销售职能，前者交标签版本、申报资料或经审核的科学内容，后者若按线索、成交、续费拿提成，估算收入时不能把满额提成算作保底。三条路都把保证薪月作同口径年化，排除未保证绩效、另列试用期和驻点成本。只给销售名单、没有原件、没有质量复核入口的职位，不能凭“营养师”头衔证明能积累专业履历。`,
    certs: [
      { name: '卫生专业技术资格考试｜营养', officialScope: qualifications, workplaceBoundary: '目标医院有证书要求时，先核对应的是报名条件、取得资格还是聘任条件。考试专业“营养”与岗位名称中的“营养师”不能互换作同一字段。', verificationTips: '将毕业证的专业全称、学历和工作经历带给拟报名考点核对，不把邻近专业或已有行业培训证当成考点已受理。问医院具体级别和最迟提供日期。', officialLinks: [source.exam, source.tianfu, source.ningguo] },
      { name: '公共营养师｜职业技能评价', officialScope: '人社部国家职业技能标准列明公共营养师的职业任务与技能等级；公共营养技能等级认定由人社部门备案公布的用人单位或社会培训评价组织实施。', workplaceBoundary: '可用于核公共营养服务相关能力和目标岗位证书要求。需以医师身份从事诊疗时，应另核医师资格、注册执业范围及所在机构授权。', verificationTips: '先核培训、技能等级评价和证书查询是否为不同环节。对方声称承诺取证、就业或有医疗执业效力时，请其出示公告条文和可查询机构名称。', officialLinks: [source.skill, source.evaluation, source.physician] },
      { name: '中国营养学会注册营养师／注册营养技师与医师执业边界', officialScope: associationBoundary, workplaceBoundary: clinicBoundary, verificationTips: '学会评价按对应级别核课程、实践、考试和备案。美国 RD／RDN 与 DTR／NDTR 由 CDR 按其规则授予，不能由缩写推断成同一资格。若医院公告只写简称，先核证书及发证机构原名，再核实聘任层级和院内岗位权限。', officialLinks: [source.rd, source.cdr, source.physician] },
    ],
    interviewChecklistTitle: '谈 Offer 前核三张表',
    interviewChecklistQuestions: [
      { label: '岗位表', question: '请写明第一份脱敏交付、对应科室、复核责任人和到岗须交的证书。' },
      { label: '薪项表', question: '书面报价保证发几个月？变动薪项按出勤、工作量、服务评价还是别的条件计算？结算何时能确认？' },
      { label: '班次表', question: '跨病区、跟餐、早班或周末宣传活动怎样安排？教研、质控与临床支持是否分别记工时？' },
    ],
  },
  checklist: {
    title: '先试交付，再核工作条件',
    summary: '技能和工作条件分别勾选。既能做表，也可能更愿意在有人带教的岗位逐步接手评估。用两栏结果生成面试问题。',
    skillsHeading: '我愿意练哪类技能',
    skillsOptions: [
      { id: 'trace-diet-note', track: 'roleA', label: '从膳食或筛查底表追回原凭证', summary: '能给一条修正写清记录、日期和回查对象。', interviewQuestions: ['工作清单如何保留原凭证、纠错人和修订时间？'] },
      { id: 'derive-denominator', track: 'roleA', label: '把重复、跨期和待核拆开', summary: '同一条记录改状态后，另一人仍能复算人数。', interviewQuestions: ['科室如何区分系统重复、数据补录和本期新增？'] },
      { id: 'explain-assessment', track: 'roleB', label: '写清评估用的资料与证据限制', summary: '从资料中得出可解释的专业意见，并指出未核条件。', interviewQuestions: ['新人的评估意见由谁复核，遇到资料冲突交给谁？'] },
      { id: 'design-review', track: 'roleB', label: '把计划与复评标准对上', summary: '能说明交付后何时问反馈、哪里要复核、结果以何者为准。', interviewQuestions: ['项目评价看活动量、覆盖率还是分层反馈？'] },
    ],
    conditionsHeading: '我能接受哪些工作条件',
    conditionsOptions: [
      { id: 'delivery-window', track: 'roleA', label: '愿意留意供餐和质控截止窗口', summary: '在同事等交接时仍愿按原件逐字段核查。', interviewQuestions: ['餐次交付和月报撞在一起时，谁提供核对支持？'] },
      { id: 'field-rotation', track: 'roleA', label: '愿意在病区或供餐现场之间协调', summary: '先问岗位是否涉及跨病区、供餐现场和固定班次。', interviewQuestions: ['实际需要去哪几处工作，什么时候做交班？'] },
      { id: 'repeat-explanation', track: 'roleB', label: '愿意反复解释建议和不确定性', summary: '服务对象目标不同，也能用清楚的语言解释结论。', interviewQuestions: ['宣教、评估或随访由谁分工？哪些成果可以见到复核？'] },
      { id: 'review-delay', track: 'roleB', label: '接受意见需要带教或临床复核', summary: '能写专业意见，也能在授权边界停下来等别人确认。', interviewQuestions: ['谁决定何时可独立完成哪类文件，怎样检查阶段能力？'] },
    ],
    defaultInterviewQuestions: ['能否举一件近期的脱敏任务，说清第一份交付、接收者和一个真实退回原因？'],
    crossTrackNote: '技能和工作条件落在不同方向时，优先找能用相关技能、又能满足实际班次和带教偏好的职位。问清两类工作各占什么时段与职责。',
    offlinePrintHint: '可在纸上分别记一个想练的交付、一项班次限制和一个必须问清的审批人。',
  },
  desktopExercise: {
    sectionTitle: '五分钟试做：审一张营养筛查汇总表',
    summary: '任选一轨。对照公开质控指标，用离线卡核同一时期人数。产出为质控材料，不查询真实病历，也不写筛查或干预方案。',
    publicLinksHeading: '公开原件',
    publicLinks: [source.indicators],
    factSummaryHeading: '离线卡｜原件口径与模拟数据',
    factSummarySegments: [
      { text: `${exercise.indicator} ${exercise.label}。${exercise.rule} ` },
      { text: `本题模拟。${currentCounts}` },
    ],
    taskA: { title: '技术轨：差异交接', instruction: '列本期确认、重复、跨期和草稿各自怎样处理，写清分子分母和暂算值。写一条能回查原记录的备注，说明交给谁补证。' },
    taskB: { title: '评估轨：口径复核', instruction: '写给质控责任人一段复核意见，交代同期口径、重复跨期草稿的去向、暂算值。分别写草稿确认完成和确认未完成时的定稿数，并指出确认报告的人。' },
    rubricTitle: '完成后核对样答',
    rubricHeading: '两项共用加本轨一项',
    rubricPassRule: '达三项即完成自己的一轨，不要求跑另一轨。',
    rubricItems: [
      `共用｜按同期人数取分母，${draftRule}`,
      '共用｜重复不增加人数，跨期剔除，草稿未确认不算完成。只核记录，不改医疗决定。',
      '技术轨｜留下原表位置或记录索引、待核状态及补证责任人。',
      `评估轨｜确认完成为 ${completedRate}%，确认未完成为 ${draftRate}%；质控责任人按结果确认报告。`,
    ],
    sampleAnswerALabel: '技术轨样答',
    sampleAnswerA: `按同期住院人数核对。${draftRule}重复项合并到原人，跨期不进本表，草稿单列待核。备注“本期底表草稿行：缺已完成凭证”，保留原记录索引，交原记录责任人查明并记录其答复。只登记差异和暂算结果，不改医疗决定。`,
    sampleAnswerBLabel: '评估轨样答',
    sampleAnswerB: `统一按同期住院人数取分母。重复项不加人数，跨期排除，草稿未确认不算完成。${draftRule}若原记录责任人核为完成，改为 ${exercise.confirmed + exercise.draftRows}/${exercise.total}，即 ${completedRate}%；若核为未完成，最终为 ${exercise.confirmed}/${exercise.total}，即 ${draftRate}%。让科室质控责任人确认报表版本。本意见不改医疗决定。`,
  },
  tools: {
    title: '按你现在缺的证据选工具',
    summary: '先核目标岗位，再选一个下一步。已经拿到岗位表的读者，可以先记录证书和授权问题。',
    cards: [
      { id: 'compare', badge: '双岗', meta: '已有两份岗位描述', tone: 'roleA', title: '对比两份岗位', description: '手动选两岗后并排核交付、职责范围和入行条件，再把本地公告放在旁边对照。', purposeHint: '适合方向已缩小到两岗。', ctaLabel: '打开职业对比', href: '/zh/career/compare' },
      { id: 'worksheet', badge: '记录', meta: '准备一次面试', tone: 'neutral', title: '记录带教和审批问题', description: '记下目标单位、证书原名、第一份交付和复核人，面试后补实际答复。', purposeHint: '适合已有一份具体招聘。', ctaLabel: '使用探索工作表', href: '/zh/career/interest-worksheet#my-worksheet' },
      { id: 'holland', badge: '兴趣', meta: '方向仍不清楚', tone: 'roleB', title: '核职业兴趣侧重', description: '先看自己更愿做记录核对、沟通服务还是分析评估，再选择参加哪条纸面试做。', purposeHint: '适合想用兴趣缩小探索范围。', ctaLabel: '做霍兰德职业兴趣测试', href: '/zh/tests/holland-career-interest-test-riasec' },
      { id: 'work-style', badge: '条件', meta: '担心入职节奏', tone: 'accent', title: '核工作方式和条件', description: '按工作活动、方式和条件梳理对班次、带教、现场切换与答疑的偏好。', purposeHint: '适合在两份真实工作安排之间比较。', ctaLabel: '做职业测试', href: '/zh/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: '回看两个职业档案',
    profileLinks: [
      { label: '膳食技术员职业档案', href: '/zh/career/jobs/dietetic-technicians' },
      { label: '膳食与营养师职业档案', href: '/zh/career/jobs/dietitians-and-nutritionists' },
    ],
  },
  faqs: [
    { id: 'first-deliverable', question: '怎么分营养技术员和营养师？', answer: '先看工作最后由谁接收。营养技术支持侧需要让别人追到供餐、调查、标签或统计底表的原始记录；评估建议侧需要给出可以复核的理由和下一轮检查标准。医院样本中的技师也可以协助诊疗和宣教，但形成建议、依据医嘱执行、作出诊疗决定是不同节点；公共营养和食品企业则分别看服务项目和食品法规。' },
    { id: 'clinical-title', question: '临床营养技师都要求本科吗？', answer: '先对照实际公告，不是全国统一学历线。成都的一次临床营养技师招聘列本科及指定专业，把相关经历等列优先；重庆同类称谓的一次招聘另列硕士及公共卫生专业和相关履历；安徽宁国营养师岗还单列本科／研究生对应专业。把专业全称、学位和经历逐项对照原件，也要分清医院聘用要求和全国卫生考试的报名条件。' },
    { id: 'credential-choice', question: '考公共营养师、卫生资格的“营养”，还是注册营养师？', answer: '按目标岗位选，三类证书不能当成同一套晋级顺序。医院要求卫生专业技术资格时，按公告和考点核“营养”专业及级别；公共营养岗位要求技能等级时，核备案评价组织和证书查询路径。中国营养学会的注册营养师与注册营养技师是团体水平评价，按当期要求核课程、实践、考试及备案。美国 RD／RDN、DTR／NDTR 由美国 CDR 按其规则授予，不因使用相同简称就成为大陆同一种证书。应聘时写明发证机构和证书全名；涉及医师诊疗，还须另核医师资格、执业注册及机构授权。' },
    { id: 'pay-comparability', question: '营养师一定比营养技术员工资高吗？', answer: '不能只看“师”或“技术员”。先把两份 Offer 对齐到同城、同级、同用工方式，再看保证年薪、绩效会在哪个周期核定，以及试用期是否计发。拿岗位说明和考核表一起核：医院的膳食差错底表或签有复核意见的评估稿，哪一项对应下一职级？公告要求的卫生技术资格是入职门槛，还是新取得后有书面调级条款？团餐的交接回单、食品企业过审的标签稿，算职级考核、项目奖金，还是只计工作量？把首个可核周期写清，例如试用期届满、首个完整考核期或项目验收日，并确认谁审批、达标后何时计发。按同一周期折算保证税前现金：税前固定月薪乘以书面保证月数，再加保证津贴。试用期的薪资差额、驻点自付开支和时间成本、达标才发的奖金和提成分别列出。若岗位只按成交或续费验收，拿不出标签稿或评估稿这样的专业交付，也没有专业复核人，就按销售岗评估这段履历。' },
    { id: 'automation', question: '2026 年如果团队用自动报表，营养岗位还需做什么？', answer: '能批量做规则检查，仍要靠人确认原始证据和签审。Power Query 可以按选定字段识别重复，医院质控若漏掉住院期或把姓名当唯一键，就会合并本不相同的记录；工具无法判断未签记录是否等于已完成。食品团队可用结构化表对照标签值、单位和版本，但产品类别、适用日期、证据冲突和宣称边界仍须由获授权人员复核。妇幼或社区项目产生的个人资料只进本单位批准系统，不上传到个人工具。这里描述规则可做什么，不推断任何机构在 2026 年必用某种软件，也不把生成内容当审批。' },
    { id: 'label-and-fsmp', question: '营养师去食品或特医食品公司，做的是临床营养吗？', answer: `${labelingBoundary}企业岗位可以做营养标签比对、注册资料核验或合规科普。核新版和旧版时要标清适用日，不把营养标签作为处方。产品取得注册仍须经过医院目录遴选；单位还要落实进货核查及评价。` },
    { id: 'portfolio', question: '食品、营养相关专业，投简历前能做哪种作品？', answer: '选一个能让别人按原件重做的产出。技术支持方向交复算后的差异表；团餐或社区方向按公开指南标清人群、交付和验收；食品方向可做一份只含公开示例、不含商业配方的标签校核单，标注版次、适用日期、字段及资料缺口。医院评估方向展示审题和追证，不拿患者病例做作品，不套个人营养治疗方案。' },
  ],
  sourceGroups: [
    { id: 'recruitment', title: '大陆招聘与实际岗位名', links: [source.tianfu, source.chongqingJob, source.ningguo] },
    { id: 'clinical-rules', title: '临床工作、医师边界与质控口径', links: [source.clinical, source.physician, source.indicators, source.nrs] },
    { id: 'credentials', title: '考试、技能评价与美国证书边界', links: [source.exam, source.skill, source.evaluation, source.rd, source.cdr] },
    { id: 'public-nutrition', title: '公共营养、团体供餐与妇幼服务原件', links: [source.guideline, source.canteen, source.school, source.maternal, source.population, source.cdc] },
    { id: 'food-and-fsmp', title: '食品标示与特医食品：标准、注册及医疗机构管理', links: [source.label2011, source.labelDate, source.labelStandard, source.label2025, source.fsmp, source.fsmpHospital] },
    { id: 'pay-and-tool', title: '工资统计口径与工具实际能力', links: [source.pay, source.excel] },
  ],
};
