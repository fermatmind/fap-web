import type { ModularComparisonSpec } from '../modularComparison';

const roleA = '作业治疗师';
const roleB = '物理治疗师';

const sources = {
  recordsLanding: { label: '《康复学报》卷期与公开摘要', href: 'https://cjournal.hep.com.cn/2096-0328/CN/1217460190158786629', note: '2025 年第 35 卷第 2 期，第 124–129 页。摘要公开，全文可能需登录。' },
  records: { label: '《住院患者康复治疗文书书写要点专家共识》', href: 'https://files.sciengine.com/pdfs/2096-0328/33D0D1B2621A41CD90E09E986873AFFC.pdf', note: '2025 年第 35 卷第 2 期，印刷页 126–127。查 §3.1.2.4、§3.1.2.5 和 §3.3。' },
  guideline: { label: '《综合医院康复医学科建设与管理指南》', href: 'https://www.nhc.gov.cn/wjw/gfxwj/201105/0fa3554447e84949aa129e88bb1cc7b6.shtml', note: '第八条区分康复医师组织与专业人员实施，第十二条涉及岗位责任、团队协作和文书。' },
  beijing: { label: '北京清华长庚医院康复医学科的治疗组与设备', href: 'https://www.btch.edu.cn/ksdh/zkb/kfk/ksdt_kfk/76045.htm', note: '查神经康复治疗组和作业康复治疗组。设备仅代表该院公开样本。' },
  westChina: { label: '华西医院康复医学中心的治疗部分工', href: 'https://www.wchscu.cn/public/department/nephrology/dynamics/72991.html', note: '2023 版简介，查神经物理治疗部、肌骨物理治疗部和作业治疗部。' },
  shanghai: { label: '同济大学附属养志康复医院 2026 年招聘启事', href: 'https://www.shygkf.org.cn/lxwm/index_35.aspx', note: '“热招岗位”里的康复治疗师组同时列两岗。' },
  chengdu: { label: '成都龙泉驿区 2026 年医疗卫生招聘岗位需求表', href: 'https://www.longquanyi.gov.cn/lqyqzfmhwz_gb/c123879/2026-09/04/07d5774a3be64637ad21eb3739beda54/files/98eecebb35c348959482b7009ef7df29.pdf', note: '查序号 19 与 21 的岗位名称、专业和资格证三列。' },
  exam: { label: '国家卫生健康委人才交流服务中心｜2027 年度考试通知和专业目录', href: 'https://www.21wecan.com/wsrcw/c100193/202611/1003488.shtml', note: '查正文第一、五、七、八、十二项及附件的专业代码。' },
  pay: { label: '国家统计局｜2025 年城镇单位就业人员年平均工资情况', href: 'https://www.stats.gov.cn/sj/zxfbhjd/202605/t20260515_1963707.html', note: '表 7 的单位是元，统计按规模以上企业行业门类和岗位大类划分。' },
};
const facts = {
  exam: { year: '2027', subject: '康复医学治疗技术', junior: '初级（士）107', practitioner: '初级（师）209', intermediate: '中级 381', physicianSubject: '康复医学', physicianCode: '348' },
  recruitment: { year: '2026', jobName: '康复治疗师', qualificationA: '初级（师）', qualificationB: '初级（士）' },
  pay: { scope: '国家统计局 2025 年规模以上企业分行业门类、分岗位大类的年平均工资', boundary: '同一表内没有分列作业治疗师和物理治疗师。' },
  records: { physicalSection: '§3.1.2.4', occupationalSection: '§3.1.2.5', dischargeSection: '§3.3.2', daily: '日常生活活动表现', environment: '活动环境', balance: '平衡', walking: '步行', shared: '关节活动度' },
};

const examLevels = `${facts.exam.junior}、${facts.exam.practitioner}、${facts.exam.intermediate}`;
const examSummary = `${facts.exam.year} 年度卫生专业技术资格考试目录把“${facts.exam.subject}”列为 ${examLevels}。`;
const physicianSummary = `同一目录的“${facts.exam.physicianSubject}”${facts.exam.physicianCode} 在报考时须已取得并提交相应执业医师资格证书。`;
const recruitmentSummary = `例如成都龙泉驿区 ${facts.recruitment.year} 年同一份社区招聘表里，两家社区卫生服务中心同招“${facts.recruitment.jobName}”，却分别要求“${facts.exam.subject}”${facts.recruitment.qualificationA}与${facts.recruitment.qualificationB}资格证（原表定位见文末出处）。`;
const paySummary = `${facts.pay.scope}适合观察行业大类。${facts.pay.boundary}`;
const otRecords = `${facts.records.daily}、${facts.records.environment}`;
const ptRecords = `${facts.records.balance}、${facts.records.walking}`;

export const rehabilitationComparisonZhSpec: ModularComparisonSpec = {
  pairId: 'occupational-therapists-vs-physical-therapists',
  locale: 'zh',
  title: '作业治疗师 vs 物理治疗师：职责、招聘与入行条件',
  shortTitle: '作业治疗师 vs 物理治疗师',
  description: '比较中国大陆康复团队的作业治疗与物理治疗分工，读懂同名招聘和卫生专业技术资格，再用公开康复文书做一次桌面核对。',
  regionLabel: '中国大陆',
  authorName: '费马测试编辑部',
  datePublished: '2026-11-24',
  dateModified: '2026-11-24',
  defaultPlugins: { ai: false, thirtyDay: false },
  hero: {
    directAnswer: "病人中风出院后，物理治疗师（PT）围绕更安全地走到洗手间这一目标练腿力和平衡；作业治疗师（OT）围绕更独立地洗漱、穿衣和做饭，评估手功能、辅具与浴室动线。想围绕穿衣、洗漱、重返生活与工作拆解障碍，先看 OT；更想追踪站立、转移、步态和肌骨运动功能变化，先看 PT。选岗时先问科室实际分组，再用招聘表核证书级别。",
    roleA: { badgeTitle: roleA, riasecLabel: "霍兰德 SIR", aliases: `作业治疗师（OT）。招聘也可归入“${facts.recruitment.jobName}”。`, keywords: '手功能、日常生活活动、自助具、环境适配' },
    roleB: { badgeTitle: roleB, riasecLabel: "霍兰德 SIR", aliases: `物理治疗师（PT）。招聘也可归入“${facts.recruitment.jobName}”。`, keywords: '运动功能、平衡、步态、步行、转移' },
    interviewBoundaryTitle: '职位写着“康复治疗师”，先问哪两件事？',
    interviewBoundaryQuestions: [
      '这个岗位入职后归作业治疗组、物理治疗组，还是按科室需求跨组轮转？能否说一份新人要完成的记录？',
      '出院摘要里的洗漱协助情况和步行条件分别由谁记录？两份记录不完整时由谁退回，谁确认补件？',
    ],
    riasecBoundaryNote: "SIR 指社会型、研究型、现实型，是按六维兴趣资料取前三项的职业探索线索。两岗按此取前三的顺序相同，仍要用实际工作区分偏好。能否胜任看训练和岗位表现，能否报考或录用看当年考点与招聘条件。",
  },
  topology: {
    title: '同一个“回家后能否自己到洗手间”，两岗各看什么？',
    summary: '从移动到完成洗漱，一项出院目标可以同时需要两类信息。两个方向会做功能评定，记录焦点随团队分工和目标而变。',
    ariaLabel: '作业治疗记录生活任务和环境，物理治疗记录移动功能，两类记录汇入团队交接。',
    leftZoneTitle: roleA,
    leftSteps: [
      { title: '确认活动目标', detail: '了解要恢复的是洗漱、穿衣还是其他有意义的活动。' },
      { title: '拆解活动表现', detail: '辨认手部操作、任务步骤、环境和所需协助各自带来的限制。' },
      { title: '记录自理任务', detail: '写清观察的是哪项活动、在哪种环境下完成，以及仍有哪些未核信息。' },
    ],
    centerZoneTitle: '团队交接',
    upperBridge: { title: '同一个目标', line1: '到得了洗手间', line2: '也要知道能否完成洗漱' },
    lowerBridge: { title: '共享的记录', line1: '同一功能可供双方参考', line2: '保留评定阶段和观察条件' },
    rightZoneTitle: roleB,
    rightSteps: [
      { title: '确认移动目标', detail: '了解需要改善的站立、步行或转移场景。' },
      { title: '观察运动功能', detail: '围绕关节活动、肌力、平衡或步态记录功能表现。' },
      { title: '比较前后变化', detail: '复核起始与后续记录采用的条件，再向团队说明哪些结论可以比较。' },
    ],
  },
  matrix: {
    title: '日常任务、工具和交付物对照',
    summary: "先看记录对象、工具和岗位资格，再展开机构、排班与成长。医院介绍和招聘表只反映该院、该年的公开信息，比较自己的职位时，要把同名岗位落实到具体亚组、工作地点和带教安排。",
    roleAColumn: roleA,
    roleBColumn: roleB,
    rows: [
      { id: 'purpose', dimension: '评定关注点', defaultVisible: true, roleA: "从要恢复的活动出发，例如洗漱时如何取用物品。记录完成到哪一步，以及手部操作、认知、环境或协助条件的影响。", roleB: "从转移、站立或步行任务出发。记录运动功能有哪些变化，写清平衡、步行或转移的观察条件，以便接手者复核。" },
      { id: 'records', dimension: '典型记录内容', defaultVisible: true, roleA: "同看日常生活活动表现、环境和手的灵活性。两岗可共享关节活动度，洗漱还要单独记录完成步骤与协助情况。", roleB: "同看平衡、步行和关节活动度。比较前后记录时，保留每次步行的地点、辅助和协助条件，有变化就写清。" },
      { id: 'tools', dimension: '医院公开样本中的工具', defaultVisible: true, roleA: "北京清华长庚医院 2022 年介绍列作业康复组的日常生活训练系统、视觉反馈手功能训练器，成员介绍提到自助具。面试问设备与活动记录各进哪份文书。", roleB: "该院神经康复组列步态分析系统、平衡评定训练系统，成员名单有物理治疗师。面试问是否同时交设备数据和移动记录。" },
      { id: 'recruitment', dimension: '招聘怎么写', defaultVisible: true, roleA: "上海养志康复医院 2026 年公告把作业治疗师归在“康复治疗师”组。先问学历专业能报哪个方向，再问作业组要新人交哪类记录。", roleB: "同一公告也列物理治疗师，治疗师组要求相关专业硕士及以上，适用于该次招聘。再问首站分组、轮转和带教。" },
      { id: 'qualification', dimension: '考试与岗位门槛', defaultVisible: true, roleA: "2027 年度“康复医学治疗技术”列初级（士）107、初级（师）209、中级 381。目标单位写 OT 时，仍需核岗位要求的具体级别。", roleB: "PT 也核同一目录。有两个同名岗位时先逐行核专业、资格级别和最晚取证日期，再比较实际任务。" },
      { id: 'team', dimension: '团队协作和工作条件', defaultVisible: false, roleA: "面试先问病区、治疗区和模拟生活空间的分工。再问家庭环境由谁核实、家属转述和直接观察怎样分别记录。", roleB: "面试先问病区与治疗区如何交班。再问转移类工作如何安排协作，以及设备数据与病区观察能否回查到各自的条件。" },
      {
        "id": "settings-and-specialties",
        "dimension": "机构和亚组去向",
        "defaultVisible": false,
        "roleA": "华西医院 2023 年简介的作业治疗部列有日常生活活动、职业评估及环境评估。想做其中一项可问医院有无专岗。看成都样本这类社区统称职位时，先问有无作业组，再问是否能跟做相关工作。",
        "roleB": "华西医院简介分列神经和肌骨物理治疗部，肌骨部又分疼痛与外科术后组。想做神经康复或运动损伤相关工作，先请科室确认第一站服务人群和亚组，再问转组要补哪些记录训练。"
      },
      {
        "id": "physical-load-and-schedule",
        "dimension": "体能、排班和后续发展",
        "defaultVisible": false,
        "roleA": "担心反复示范、持续精细操作或场地切换，先问真实班表和站坐安排。想长期做手功能、生活活动或职业康复，可问何时能跟做，日后能否申请辅具、带教或文书质控工作。",
        "roleB": "担心移动任务体能负荷，先问连续站立时段、转移协作和设备支持。想由通用轮转转入神经或肌骨组，问近期是否开放、由谁确认阶段能力，以及换组后怎么排班。"
      },
    ],
  },
  incident: {
    title: '模拟出院交接：写着“能走到洗手间”，接手团队还缺什么？',
    summary: '同一份住院康复转社区交接摘要，同时需要移动与自理两类结论。以下分工和审核顺序是模拟设定。',
    triggerLabel: '接手团队请两组解释记录',
    triggerBody: "草稿只记“能走到洗手间”，没有地点、日期和协助情况，也没交代到了以后能不能洗漱。接手团队要分清哪些表现有记录，哪些仍要等补件。",
    triggerCaveat: '公开行业共识提供文书字段。这里的情节和审批安排用于解释协作。',
    rows: [
      { stage: '核对活动记录', roleLabel: roleA, tone: 'roleA', verifiedFacts: `资料包含移动表现。作业治疗部分要交接${otRecords}。`, openGaps: '洗漱任务是否观察过，哪一步有困难，所需协助以及居家浴室条件均待核。', actionAndApproval: "模拟中由获授权的作业治疗师回查原记录，补写活动、地点、日期和协助情况。直接观察和家属转述各注明出处。缺项单列，交康复医师审核摘要。" },
      { stage: '核对移动记录', roleLabel: roleB, tone: 'roleB', verifiedFacts: `原摘要记录了步行。物理治疗部分要交接${ptRecords}等移动功能信息。`, openGaps: '记录未交代评定阶段、地点、辅助和协助情况，摘要暂不能判断观察条件是否可比。', actionAndApproval: "模拟中由获授权的物理治疗师回查步行地点、阶段、辅助和协助情况。若条件变过，写明哪些结论可比。缺项注明原文位置，交康复医师审核。" },
    ],
    recoveryAcceptanceTitle: '什么样的交接摘要可以交给下一站？',
    recoveryAcceptanceCriteria: "两轨各留下可回查的结论及评定阶段、观察条件。接手者能分别回答“移动表现如何”“自理完成到哪一步”，并指出原记录。缺证的结论先留待核，由模拟中的康复医师退回指定组，注明负责人及回报时间后再核交接摘要。这里只验收文书。",
    defenseLayerNote: "综合医院科室指南区分康复医师组织治疗与专业人员实施治疗。文书共识建议康复治疗师签名并写记录日期，出院诊断宜引用主管医生的诊断。实际出院审批、转介和科室文书复核按本院授权执行。",
  },
  payAndCerts: {
    title: '薪酬怎么比，康复医学治疗技术资格怎么用',
    summary: '应聘时先让人事确认岗位所属方向、劳动关系和要求的证书级别，再谈同口径薪酬。',
    salaryHeading: '薪酬怎么算、定级核查什么，以及 Offer 对比口径',
    salaryBody: `${paySummary}比较两岗待遇时，先问用工主体和固定工资，再问是否有按治疗量、课时或考核结果计发的浮动部分。面试医院或社区岗位，核编制或合同类型、初中级资格怎样影响聘任、入职后能否进入目标亚组。面试儿童或运动康复机构，问有没有排课或续费考核，取消预约或治疗未排满时怎样结算。若岗位只要求操作设备，问新人是否能做功能评定及复评。对照 Offer 时统一试用期、绩效基数、跨病区班次和补贴口径。`,
    certs: [
      { name: `全国卫生专业技术资格考试｜${facts.exam.subject}`, officialScope: `${examSummary}2027 年度考试通知及基本标准用于核学历、学位和资格条件（具体条款见文末出处）。`, workplaceBoundary: "分四步核对。考点审报名材料，合格后取得相应专业资格，单位依岗位标准决定聘任，科室再明确具体技术和文书权限。有证后想换亚组，仍要向目标科室问带教和授权。", verificationTips: "准备毕业证学位证上的专业全称、从事相应岗位的材料、工作起止日期与目标级别。用当年目录核代码，把疑问交当地考点书面确认，再问单位要求报名时还是入职前交证。", officialLinks: [sources.exam, {"label":"深化卫生专业技术人员职称制度改革的指导意见","href":"https://www.sport.gov.cn/rlzx/n5630/c23464262/content.html","note":"人社部发〔2021〕51 号，附件卫生专业技术人员职称评价基本标准，查药（技）士、药（技）师。"}] },
      { name: '同名岗位的单位招聘条件', officialScope: recruitmentSummary, workplaceBoundary: '这两条是当地当次员额招聘条件。同一个“康复治疗师”岗位名可以对应不同证书级别，分组应向科室核实。', verificationTips: "对照成都公开招聘表的岗位、学历专业和资格证要求，再用上海样本练习区分招聘大类与细分方向。提交申请前把岗位编号、可报专业、证书级别、提交时点和实际分组记在同一行。", officialLinks: [sources.chengdu, sources.shanghai] },
      {
        "name": "医师资格与执业注册｜海内外学习经历怎么用",
        "officialScope": "2027 年度目录的康复医学 348 是卫生专业技术中级资格考试科目，报考该科目须已取得并提交相应执业医师资格证书（具体条款见文末出处）。医师资格与取得注册后的执业证书另适用《医师法》相关规定。",
        "workplaceBoundary": "根据《处方管理办法》，药品处方依医师处方权限开具。OT、PT 岗位身份和治疗技术证书本身均不授予药品处方权。治疗师在团队授权范围内开展专业工作和记录功能表现。",
        "verificationTips": "在看 OT 学校时，查世界作业治疗师联盟（WFOT）名录中具体课程是否符合其教育标准，并核项目期次。看美国 PT 路径时，DPT（Doctor of Physical Therapy）是学位。希望凭这些学习经历回大陆应聘，要分别问考点认可哪种学历材料、单位接受哪些专业和资格。名录和海外学位都不能代替这两项确认。",
        "officialLinks": [
          {
            "label": "国家卫生健康委人才交流服务中心｜2027 年度考试通知和专业目录",
            "href": "https://www.21wecan.com/wsrcw/c100193/202611/1003488.shtml",
            "note": "查正文第一、五、七、八、十二项及附件的专业代码。"
          },
          {
            "label": "《中华人民共和国医师法》",
            "href": "https://wjw.beijing.gov.cn/zwgk_20040/zcwj2022/flfg/202304/t20230407_2992842.html",
            "note": "第十二至十四条区分取得医师资格、注册取证与执业范围。"
          },
          {
            "label": "《处方管理办法》政府转载 PDF",
            "href": "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3171/site/attach/0/8e2a1736e6c14f02af6c6045d148944f.pdf",
            "note": "第二条界定用药处方，第八至十条列常规处方权限和相关条件。"
          },
          {
            "label": "WFOT 作业治疗教育项目状态说明",
            "href": "https://wfot.org/education/explanation-of-designations-of-education-programme-status",
            "note": "查项目符合教育标准的状态，由相关成员组织评估，不等于 WFOT 授予执业资格。"
          },
          {
            "label": "美国物理治疗协会｜DPT 教育项目申请",
            "href": "https://www.apta.org/your-career/careers-in-physical-therapy/pt-admissions-process",
            "note": "DPT 是美国物理治疗的学位路径；本页以中国大陆招聘与报考为准。"
          }
        ]
      },
    ],
    interviewChecklistTitle: '面试前请人事和科室各确认一件事',
    interviewChecklistQuestions: [
      { label: '人事', question: '岗位要求的证书全称和级别是什么？试用期与转正后的税前固定薪资、绩效和排班津贴分别怎样核算？' },
      { label: '科室', question: '试用期由哪个组带教？日常生活评定记录或步行功能记录由谁复核，我获准独立完成哪些部分？' },
    ],
  },
  checklist: {
    title: '核对两份职位说明时，把技能和工作条件分开',
    summary: '勾选你愿意进一步练的技能，再单独选你能接受的工作条件。先访谈两栏各自有疑问的地方。',
    skillsHeading: '我愿意练的技能',
    skillsOptions: [
      { id: 'ot-task-analysis', track: 'roleA', label: '拆解生活活动', summary: '能耐心区分任务步骤、手功能和环境的影响。', interviewQuestions: ['新人记录洗漱或穿衣时，如何交代任务情境和协助程度？'] },
      { id: 'pt-compare-motion', track: 'roleB', label: '比较移动功能记录', summary: '愿意维持可比的记录条件，回查平衡、步态或转移表现。', interviewQuestions: ['步态报告交班要保留哪些条件，前后条件变化时由谁复核？'] },
      {
        "id": "ot-compare-contexts",
        "track": "roleA",
        "label": "区分生活情境和协助",
        "summary": "愿意把同一项任务在病区、模拟环境或家里出现的不同表现写清楚。",
        "interviewQuestions": [
          "能否带我看一份去标识化活动记录，说明家属转述和直接观察分别怎么记？"
        ]
      },
      {
        "id": "pt-explain-data",
        "track": "roleB",
        "label": "解释设备与现场记录",
        "summary": "愿意追问步态或平衡数据和实际移动观察各自能支持什么结论。",
        "interviewQuestions": [
          "设备报告与病区观察发生在不同条件时，科室用哪类记录说明前后变化？"
        ]
      },
    ],
    conditionsHeading: '我能接受的工作条件',
    conditionsOptions: [
      { id: 'ot-daily-context', track: 'roleA', label: '接受与团队核实家庭环境', summary: '愿意和团队沟通训练区与真实生活环境的差别。', interviewQuestions: ['涉及家庭环境的信息由谁提供，缺资料时怎么标注和交班？'] },
      { id: 'pt-ward', track: 'roleB', label: '核对病区与治疗区工作安排', summary: '关注现场协同、站立工作时段和岗位支持。', interviewQuestions: ['病区和治疗区怎么排班，需要多人协同的移动工作怎么安排？'] },
      {
        "id": "ot-task-setting",
        "track": "roleA",
        "label": "接受活动观察的场地切换",
        "summary": "考虑一天内来回病区、作业治疗区或模拟空间，以及需要持续动手示范的时段。",
        "interviewQuestions": [
          "本岗位实际会在哪些场地工作，一天要切换几次，带教到场的时段如何安排？"
        ]
      },
      {
        "id": "pt-physical-and-roster",
        "track": "roleB",
        "label": "接受站立安排和轮转",
        "summary": "把连续站立、协作时的人手和目标亚组的班次纳入求职比较。",
        "interviewQuestions": [
          "能否按上一轮实际班表解释病区与治疗区的班次，以及需要两人协同时怎么调配？"
        ]
      },
    ],
    defaultInterviewQuestions: ['请各看一条本地 OT、PT 方向的招聘，圈出负责的评定、要交的记录和要求的资格。', '把自己半年内难以持续接受的一项工作条件标出，面试时用具体班次、场地或协作安排求证。'],
    crossTrackNote: '你选中的技能和工作条件来自不同方向。把问题分别问给两组，看看哪份岗位同时提供你想学的任务和能接受的安排。',
    offlinePrintHint: '纸面核对时保留技能与工作条件两栏，各写一条要向科室确认的问题。',
  },
  desktopExercise: {
    sectionTitle: '5 分钟桌面练习：出院交接摘要字段索引',
    summary: '凭下方字段卡纸面完成（原刊打不开也可离线作答，不填真实病例与方案）。模拟摘要仅写“能走到洗手间”。任选一轨：找本轨 2 项记录及节号、列 1 个共享字段并说明为何不可替代两类观察、用 §3.3.2 解释为何须兼顾移动与自理并各留 1 条待核。',
    publicLinksHeading: '原刊定位',
    publicLinks: [
      { label: '《康复学报》文章页', href: sources.recordsLanding.href, note: '2025 年 35 卷 2 期。' },
      { label: '《康复学报》原文 PDF', href: sources.records.href, note: '印刷页 126–127。' },
    ],
    factSummaryHeading: '离线字段卡（印刷页 126–127，节选意译）',
    factSummarySegments: [
      { text: facts.records.physicalSection, tone: 'strong' }, { text: `（PT）记${ptRecords}及${facts.records.shared}。` },
      { text: facts.records.occupationalSection, tone: 'strong' }, { text: `（OT）记${otRecords}及${facts.records.shared}。` },
      { text: facts.records.dischargeSection, tone: 'strong' }, { text: '（出院评定）须分别交代移动与日常自理；题设仅写步行，洗漱、环境与步行条件待核。' },
    ],
    taskA: { title: 'OT 轨：活动与环境索引', instruction: `在 ${facts.records.occupationalSection} 选 2 项解释洗漱完成与环境限制的记录并记节号，按上方要求补齐共享字段与 ${facts.records.dischargeSection} 待核项。` },
    taskB: { title: 'PT 轨：移动功能索引', instruction: `在 ${facts.records.physicalSection} 选 2 项解释去洗手间移动与稳定的记录并记节号，按上方要求补齐共享字段与 ${facts.records.dischargeSection} 待核项。` },
    rubricTitle: '对照自检',
    rubricPassRule: '任选一轨核本轨 1 项 + 共用 2 项；双轨同做核全部 4 项。',
    rubricItems: [
      `OT 轨｜两项回指 ${facts.records.occupationalSection}，解释活动表现与活动环境。`,
      `PT 轨｜两项回指 ${facts.records.physicalSection}，解释步行与平衡表现。`,
      `共用 1｜指出共享字段${facts.records.shared}，说明为何仍须分记活动与移动。`,
      `共用 2｜用 ${facts.records.dischargeSection} 解释出院须含两类信息，各标 1 条待核。`,
    ],
    sampleAnswerALabel: 'OT 轨样答',
    sampleAnswerA: `${facts.records.occupationalSection}：${facts.records.daily}核洗漱步骤，${facts.records.environment}核浴室限制。${facts.records.shared}虽可共享，但不替代洗漱协助或步行条件。按 ${facts.records.dischargeSection}，出院评定须分列移动与日常自理，仅写步行不能证明自理，留待核：OT 核洗漱协助步骤，PT 核步行辅助与协助条件。`,
    sampleAnswerBLabel: 'PT 轨样答',
    sampleAnswerB: `${facts.records.physicalSection}：${facts.records.walking}核去洗手间移动，${facts.records.balance}核稳定表现。${facts.records.shared}虽可共享，但不替代步行条件或洗漱完成度。按 ${facts.records.dischargeSection}，出院评定须分列移动与日常自理，仅写步行不能证明自理，留待核：PT 核步行阶段与协助条件，OT 核洗漱需帮助步骤。`,
  },
  tools: {
    title: '按下一步选择工具',
    summary: '已有两份岗位说明，就先核岗位要求。已经做过练习或访谈，可以直接记录行动。还在确定工作偏好时再使用测评。',
    cards: [
      { id: 'compare-careers', badge: '比较职业', meta: '简中', tone: 'neutral', title: '并排核对两个职业', description: '在两槽中分别手动选择作业治疗师和物理治疗师，再对照手头的招聘说明。', purposeHint: '适合已经有两个候选方向的人。', ctaLabel: '打开双槽对比', href: '/zh/career/compare' },
      { id: 'exploration-worksheet', badge: '记录行动', meta: '简中', tone: 'roleA', title: '记录试做和访谈结果', description: '把你愿意做的任务、不确定的岗位条件和下一位要问的人写进探索工作表。', purposeHint: '适合已经试做或约到科室访谈的人。', ctaLabel: '打开探索工作表', href: '/zh/career/interest-worksheet#my-worksheet' },
      { id: 'holland-interest', badge: '探索兴趣', meta: '60 题', tone: 'roleB', title: '霍兰德职业兴趣测试', description: '查看你的兴趣六维与三字代码，辅助判断自己更享受人际照护、动手实操还是研究分析（兴趣不等于胜任力或报考资格）。', purposeHint: '适合仍在医疗康复与相邻助人方向之间摇摆的人。', ctaLabel: '测职业兴趣', href: '/zh/tests/holland-career-interest-test-riasec' },
      { id: 'career-assessment', badge: '核工作条件', meta: '94 题', tone: 'accent', title: '梳理工作方式与现实条件', description: '用职业测试整理对站立负荷、病区协作、工时节奏与工作条件的偏好，再带着结果核对真实岗位。', purposeHint: '适合喜欢康复方向，但想进一步核对体力与排班耐受度的人。', ctaLabel: '打开职业测试', href: '/zh/tests/career-planning-and-work-style-test' },
    ],
    profileLinksLabel: '继续读单岗档案',
    profileLinks: [{ label: `${roleA}档案`, href: '/zh/career/jobs/occupational-therapists' }, { label: `${roleB}档案`, href: '/zh/career/jobs/physical-therapists' }],
  },
  faqs: [
    { id: 'scope', question: '作业治疗师和物理治疗师都会看关节活动度，怎么选？', answer: "想追踪穿衣、洗漱或工作活动完成到哪一步，先看 OT。更想解释站立、转移或步行有什么变化，先看 PT。住院文书共识两节都提到关节活动度。面试时请两组各说一份用到这个字段的记录，看看它最后用于解释任务完成，还是说明移动功能。" },
    { id: 'title', question: '招聘只写“康复治疗师”，我能看出是哪个方向吗？', answer: "如果附表写了亚组和任务，先按交付物判断方向。只写“康复治疗师”时，先问科室实际跟哪组。上海养志康复医院 2026 年把 OT 和 PT 都列在治疗师组下，成都龙泉驿区两条社区岗只有统称，岗位表不能说明最终分组。" },
    { id: 'exam', question: '大陆的作业治疗、物理治疗岗位要怎么查考试？', answer: "目标写康复医学治疗技术时，按岗位表选级别，再请考点核个人资格。2027 年度目录为初级（士）107、初级（师）209、中级 381。问用人单位何时交证。" },
    { id: 'doctor', question: '康复医学和康复医学治疗技术是同一个报考专业吗？', answer: `目标是治疗师就查康复医学治疗技术和岗位授权。目标是康复医师就分别核医师资格、执业注册与相关职称要求。${physicianSummary}它是卫生专业技术中级资格考试科目。治疗师的岗位身份不授予药品处方权。` },
    { id: 'entry', question: '应聘同名康复治疗师岗位，证书级别一样吗？', answer: "不一定一样。即使同名岗位来自同一份地方招聘表，证书级别也可能不同，投递前务必逐行核对职位编号、证书级别与到岗期限。例如成都龙泉驿区 2026 年同一份社区招聘表中，两家社区卫生服务中心同招康复治疗师，却分别要求康复医学治疗技术初级（师）与初级（士）（原表定位见文末出处）。" },
    { id: 'pay', question: '作业治疗师和物理治疗师在大陆哪边工资更高？', answer: "公开统计没有在大陆分列 OT 与 PT 的收入，先比具体单位。上海招聘样本区分两岗；成都社区招聘表只列康复治疗师通用岗位，实际亚组要另问。医院或社区面试可问固定薪资和治疗量绩效如何核算、资格级别是否影响聘任和调薪。民营机构可问是否按课时或治疗人次结算、是否挂钩续费、有没有完整评定训练。拿到书面方案后统一固定薪月、试用期折算、绩效周期和排班补贴。" },
    {
      "id": "ai-and-rehab-tools",
      "question": "如果机构使用智能设备和 AI 文书工具，OT 和 PT 的哪些工作会变？",
      "answer": "目前缺少两岗的岗位替代实证，无法给出替代比例，但真实临床分工的边界很明确：步态与平衡系统可辅助采集评定数据，视觉反馈设备可用于手功能训练，语音整理可辅助起草文书；但在一线临床中，安全转移保护、手法力量微调、针对真实家庭浴室与厨房的环境改造，以及面对患者情绪低落时的现场引导与鼓励，都高度依赖治疗师的即时观察和动手判断。选岗时可问科室现有智能设备怎么配合评定记录，以及文书复核与临床操作由谁负责。"
    },
    {
      "id": "cross-major-student",
      "question": "跨专业或还在读，可以直接报考康复医学治疗技术吗？",
      "answer": "在读且截至 2026 年 12 月 31 日仍未取得所需毕业学历或学位，不能用这段在读经历满足 2027 年度对应学历条件。同一日期也是本年度从事本专业年限的计算截止日。因工作岗位变动要报现岗位专业类别，须从事现岗位专业工作满 2 年。若已毕业但专业名称不同，先问考点是否认定为相应专业，再核工作经历。人社部发〔2021〕51 号附件里，药（技）师一项对相应专业硕士和相应专业本科采用不同条件，本科学历或学士学位路径要求从事本专业工作满一年。实习或转岗前经历能否计入，带着毕业时间、岗位证明和拟报考级别请考点核定。"
    },
  ],
  sourceGroups: [
    { id: 'role-and-documentation', title: '康复分工与文书原件', links: [sources.recordsLanding, sources.records, sources.guideline, sources.beijing, sources.westChina] },
    { id: 'local-job-samples', title: '大陆招聘样本', links: [sources.shanghai, sources.chengdu] },
    { id: 'exam-and-pay-authority', title: '考试目录和薪酬统计', links: [sources.exam, sources.pay, {"label":"深化卫生专业技术人员职称制度改革的指导意见","href":"https://www.sport.gov.cn/rlzx/n5630/c23464262/content.html","note":"人社部发〔2021〕51 号，附件卫生专业技术人员职称评价基本标准，查药（技）士、药（技）师。"}] },
    {
      "id": "medical-and-education-scope",
      "title": "医师执业、处方与课程原件",
      "links": [
        {
          "label": "《中华人民共和国医师法》",
          "href": "https://wjw.beijing.gov.cn/zwgk_20040/zcwj2022/flfg/202304/t20230407_2992842.html",
          "note": "第十二至十四条区分取得医师资格、注册取证与执业范围。"
        },
        {
          "label": "《处方管理办法》政府转载 PDF",
          "href": "https://zjjcmspublic.oss-cn-hangzhou-zwynet-d01-a.internet.cloud.zj.gov.cn/jcms_files/jcms1/web3171/site/attach/0/8e2a1736e6c14f02af6c6045d148944f.pdf",
          "note": "第二条界定用药处方，第八至十条列常规处方权限和相关条件。"
        },
        {
          "label": "WFOT 作业治疗教育项目状态说明",
          "href": "https://wfot.org/education/explanation-of-designations-of-education-programme-status",
          "note": "查项目符合教育标准的状态，由相关成员组织评估，不等于 WFOT 授予执业资格。"
        },
        {
          "label": "美国物理治疗协会｜DPT 教育项目申请",
          "href": "https://www.apta.org/your-career/careers-in-physical-therapy/pt-admissions-process",
          "note": "DPT 是美国物理治疗的学位路径；本页以中国大陆招聘与报考为准。"
        }
      ]
    },
  ],
};
