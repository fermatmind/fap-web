export const gta6CareerDimensions = {
  R: ["Realistic · hands-on work", "现实型 · 动手操作", "實作型 · 動手操作"],
  I: ["Investigative · inquiry", "研究型 · 研究分析", "研究型 · 查證與分析"],
  A: ["Artistic · creative work", "艺术型 · 创意表达", "藝術型 · 創作表達"],
  S: ["Social · helping and teaching", "社会型 · 帮助或教学", "社會型 · 幫助或教學"],
  E: ["Enterprising · organizing or negotiating", "企业型 · 组织或谈判", "企業型 · 組織與協商"],
  C: ["Conventional · procedures or records", "常规型 · 流程或记录", "事務型 · 流程與紀錄"],
} as const;

export const gta6CareerRows = [
  {
    role: "lucia-caminos", interests: ["E", "R"],
    jobs: [
      ["general-and-operations-managers", "General and Operations Managers", "总经理和运营经理", "總經理和運營經理"],
      ["project-management-specialists", "Project management specialists", "项目管理专员", "專案管理專員"],
    ],
    tag: ["Get work moving", "先做出第一步", "先讓事情動起來"],
    behavior: ["Try one workable change, then tell the team what it needs to pick up.", "先完成一个可行的动作，再同步下一步和交接人。", "先做一個走得通的小調整，再跟接手的人說清楚。"],
  },
  {
    role: "jason-duval", interests: ["R", "C"],
    jobs: [
      ["logisticians", "Logistician", "物流专员（物流师）", "物流專員（物流師）"],
      ["occupational-health-and-safety-specialists", "Occupational health and safety specialists", "作业健康专员", "作業健康專員"],
    ],
    tag: ["Keep commitments on track", "守住承诺", "顧好說過的事"],
    behavior: ["Check who still needs help and cover a task that might otherwise be dropped.", "核对谁需要支援，把容易漏掉的任务补上。", "先問哪位同事還缺人手，把快掉下來的工作接住。"],
  },
  {
    role: "cal-hampton", interests: ["I", "C"],
    jobs: [
      ["information-security-analysts", "Information Security Analyst", "信息安全分析师", "資訊安全分析師"],
      ["intelligence-analysts", "Intelligence Analysts", "情报分析师", "情報分析師"],
    ],
    tag: ["Verify details", "核对信息", "查清楚消息"],
    behavior: ["Trace a report to its source, cross-check it and tell the team what is still uncertain.", "追溯原始消息，交叉核对，告诉团队还有什么待确认。", "找第一手說法，把查到的事和還沒確認的部分分開說。"],
  },
  {
    role: "brian-heder", interests: ["E", "C"],
    jobs: [
      ["supply-chain-managers", "Supply chain managers", "供应链经理", "供應鏈經理"],
      ["management-analysts", "Management Analysts", "管理分析师", "管理分析師"],
    ],
    tag: ["Plan handoffs", "统筹交接", "把交接排清楚"],
    behavior: ["Set owners and backups, and specify when the next person takes over.", "先排责任人和备选，再明确在什么条件下交接。", "先把主辦人、備案和交接時間排好，讓大家知道輪到誰。"],
  },
  {
    role: "raul-bautista", interests: ["E", "I"],
    jobs: [
      ["emergency-management-directors", "Emergency management director", "应急管理主管", "應急管理主管"],
      ["financial-risk-specialists", "Financial Risk Specialists", "金融风险专家", "金融風險專家"],
    ],
    tag: ["Compare time-sensitive options", "判断短窗口", "抓住快消失的機會"],
    behavior: ["Compare the upside and downside of a short window, and agree when to stop.", "在有限时间内比较收益和代价，事先约好停止条件。", "時間不多時先想清楚能多做什麼、失手要付什麼代價，再講好何時喊停。"],
  },
  {
    role: "boobie-ike", interests: ["E", "C"],
    jobs: [
      ["property-real-estate-and-community-association-managers", "Property, real estate, and community association managers", "物业、房地产与社区协会经理", "物業、房地產與社群協會經理"],
      ["sales-managers", "Sales Managers", "销售经理", "銷售經理"],
    ],
    tag: ["Negotiate terms", "谈清合作条件", "把條件談明白"],
    behavior: ["Turn a vague proposal into a budget, a scope and terms the other team can deliver.", "把模糊意向谈成预算、分工和能兑现的合作条件。", "把想合作的口頭承諾講成預算、做法和各自要交的東西。"],
  },
  {
    role: "drequan-priest", interests: ["A", "E"],
    jobs: [
      ["sound-engineering-technicians", "Sound engineering technicians", "音响工程技术员", "音響工程技術員"],
      ["producers-and-directors", "Producers and directors", "制片人与导演", "製片人與導演"],
    ],
    tag: ["Protect creative quality", "保住作品特色", "留住作品的味道"],
    behavior: ["Define what the work must keep, then revise the format around time and equipment limits.", "先定作品必须保留的部分，再按时间和设备调整制作。", "先決定作品最不能丟掉什麼，再用手邊器材和時間重排做法。"],
  },
  {
    role: "real-dimez", interests: ["A", "S"],
    jobs: [
      ["search-marketing-strategists", "Search marketing strategists", "搜索营销策略师", "搜尋營銷策略師"],
      ["public-relations-specialists", "Public Relations Specialists", "公共关系专员", "公共關係專員"],
    ],
    tag: ["Invite audience participation", "让观众参与", "讓台下也玩得到"],
    behavior: ["Work with a partner to offer an easy way in, then watch what the audience responds to.", "跟搭档设计低门槛互动，再看观众实际回应了什么。", "跟搭檔想一個觀眾隨手就能加入的做法，再看現場反應。"],
  },
] as const;

export const gta6CareerTopics = [
  {
    roles: ["lucia-caminos", "jason-duval"],
    title: ["Lucia & Jason: move first or secure the handoff?", "Lucia 与 Jason：先破局，还是先稳住交接？", "露西婭與傑森：先動手，還是先把交接說清楚？"],
    summary: ["Compare who makes the first reversible change and who checks promises and coverage. In a project handoff, write down who updates the rest of the team and when.", "把先做一步和照顾承诺分给两人。试着给项目写一条交接约定，讲清谁在什么时候把变更同步给全队。", "一個先做可以回頭的小調整，一個確認原班夥伴不會被漏掉。可以先約好，安排一變由誰通知大家。"],
  },
  {
    roles: ["boobie-ike", "drequan-priest"],
    title: ["Boobie & Dre’Quan: financing and production", "Boobie 与 Dre’Quan：资本与制作怎么分工？", "布比與德雷・泉：談預算的人，怎麼跟做作品的人配合？"],
    summary: ["One negotiates a budget and scope. The other identifies what the finished work must keep. Try agreeing on both the spending limit and the creative requirement before committing.", "一个谈预算与交付，另一个确认作品哪些部分必须保留。接项目时，可以先把花费上限和作品的最低要求都写进交付约定。", "一個和場地方談費用，一個保住演出的聲音。合作前把最多能花多少、哪些部分不能刪一起說清楚。"],
  },
  {
    roles: ["cal-hampton", "brian-heder"],
    title: ["Cal & Brian: verification and coordination", "Cal 与 Brian：谁核实情报，谁安排资源？", "卡爾與布萊恩：消息還沒查清，人手先怎麼排？"],
    summary: ["Verification asks whether a report is reliable. Coordination asks what the crew can prepare while it waits. Give the verifier a deadline and name the person who can change the plan.", "核查需要说清消息有多可靠，调度则要决定等待时能先准备什么。两人可先定一个核查时点，并明确谁有权更改安排。", "卡爾追原始消息，布萊恩先把備案排好。約定幾點前要回報、誰能決定換方案，兩邊就能同時進行。"],
  },
  {
    roles: ["raul-bautista", "real-dimez"],
    title: ["Raul & Real Dimez: short windows and audience response", "Raul 与 Real Dimez：抢机会与带热现场", "勞爾與 Real Dimez：剩下十分鐘，要加碼還是拉觀眾一起玩？"],
    summary: ["A short window is a decision about time and resources. Audience engagement is a decision about participation. Set a time limit and pick one observable response to learn from.", "压线加码需要控制时间和投入，带热现场需要让人愿意参与。给试验定一个结束时间，再观察一个直接反应，比如参与人数。", "限時多做一件事，要先講好何時喊停。想讓觀眾加入，則可以看看多少人真的回應，而不是只看場面熱不熱。"],
  },
] as const;
