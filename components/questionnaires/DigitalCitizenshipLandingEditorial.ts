import type { Questionnaire } from "@/lib/questionnaires/types";

export const digitalCitizenshipLandingSections: Questionnaire["guide"] = [
  {
    "id": "digital-scope",
    "title": {
      "zh": "数字公民意识练习涵盖什么？五类在线决定",
      "en": "What does digital citizenship practice cover? Five areas of online decisions"
    },
    "paragraphs": [
      {
        "zh": "数字公民教育涉及参与数字社会所需的知识、技能、态度与价值观。欧洲委员会将其描述为十个领域、三大主题的整体教育框架，包含参与、媒介素养、隐私安全与包容。[1] 本页从中相关的日常问题出发，编写隐私、安全、信息与AI、网络沟通、访问与许可五组场景，各六题；并未覆盖该框架的全部领域，也不是欧洲委员会的测评工具。",
        "en": "Digital citizenship education concerns knowledge, skills, attitudes and values for participation in digital society. The Council of Europe describes a holistic framework with ten domains under three themes, including participation, media literacy, privacy, security and inclusion.[1] This original practice selects related everyday decisions in five groups of six: privacy, security, information and AI, communication, and access and permissions. It neither covers that whole framework nor administers a Council of Europe assessment."
      },
      {
        "zh": "30道四选一题都提供可核对的参考答案和理由，全部作答后同时开放五份各七节完整指南。约18分钟是编辑估计，没有倒计时、速度奖励或错题倒扣。它适合围绕虚构情境讨论判断依据；没有观察浏览记录、发送真实消息或要求提供密码、验证码、私聊。",
        "en": "All thirty four-option tasks have an authored key and rationale, with five complete seven-section guides after all responses. About eighteen minutes is an editorial estimate, without a countdown, speed bonus or guessing penalty. Use the fictional situations to discuss reasons for a decision. The practice does not inspect browsing history, send real messages or request passwords, login codes or private conversations."
      }
    ]
  },
  {
    "id": "digital-conditions",
    "title": {
      "zh": "怎样判断答案？分清事实、局部规则与教育概念",
      "en": "How are answers determined? Separate facts, local rules and educational concepts"
    },
    "paragraphs": [
      {
        "zh": "有些题问现有事实足以支持什么，有些给出项目或课程规则，另一些应用明确的教育指导。先写出题目目标，再找决定性的条件，避免自行补入未说明的动机或权限。选中参考答案表示在这道题的条件下匹配作者判断，不等于在所有真实情境中都该采取同一行动。",
        "en": "Some tasks ask what the evidence supports, some supply a project or course rule, and others apply an explicit educational concept. Identify the target and decisive condition without inventing motives or permissions. Matching the authored key means matching a judgment under these conditions, not establishing one action for every real situation."
      },
      {
        "zh": "另设社团允许向六位编辑分享未公开采访摘录，成员拟发到所有人可见的频道。按这项规则，原来的编辑授权不足以支持公开发布。若后来确有获准的公开版本，条件便改变，应重新核对版本与受众。练习时指出“哪条新增事实会改变结论”，比只记“永远不能分享”更有用；本例不授权实际发布或删除任何材料。",
        "en": "Suppose a club permits unpublished interview excerpts to be shared with six editors, but a member proposes an open channel. That permission does not establish approval for public posting. An approved public edition would change the conditions, requiring a new version and audience check. Identify which new fact would change the answer rather than memorizing “never share.” This example authorizes no real publication or deletion."
      }
    ]
  },
  {
    "id": "digital-privacy",
    "title": {
      "zh": "隐私边界：用途、受众、内容与保留终点",
      "en": "Privacy boundaries: purpose, audience, content and retention endpoint"
    },
    "paragraphs": [
      {
        "zh": "可用四个问题复查一个拟分享的材料：为什么需要这些信息，谁能访问，最终文件包含什么，以及按已有约定何时结束保留。字段多不自动证明诈骗，文件名写“私密”也不改变权限。问题应落在实际用途说明、访问设置及分享内容上，而不是仅凭外观给机构或个人定性。",
        "en": "Review a proposed disclosure through four questions: why the data is needed, who can access it, what the final material contains, and when an existing retention agreement ends. Many fields do not automatically prove fraud, and “private” in a filename does not change permissions. Examine purposes, actual access and content rather than assigning motives from appearances."
      },
      {
        "zh": "另设仅去掉名单姓名，却保留稀有岗位、活动场次与小组人数，组合仍可能对应公开安排。删一个直接标识不能单独建立“无人可识别”的结论。应审查剩余组合与发布范围；若缺少具体关联证据，也不能反过来断言每行都已被识别。本页练习识别这种信息缺口，不计算匿名化成功率或现实泄漏概率。",
        "en": "Removing names while retaining an unusual role, event session and small group count may leave a link to public schedules. Deleting a direct identifier alone does not establish that nobody is identifiable. Inspect remaining combinations and release scope; without linkage evidence, do not assert that every row has been identified either. This practice identifies the information gap, without estimating anonymization success or breach probability."
      }
    ]
  },
  {
    "id": "digital-verification",
    "title": {
      "zh": "账户安全：请求的内容与请求者的身份分别核实",
      "en": "Account safety: verify the request and requester separately"
    },
    "paragraphs": [
      {
        "zh": "认识发件显示名、看见熟悉标志、听见紧迫语气，都不单独证明请求获得授权。题中的安全判断常要求把“账户是否真有通知”与“附带入口是否可信”分开。可先从独立已知的服务入口核实际通知；练习不需要打开消息中的网址，也不要求下载附件来验证答案。",
        "en": "A familiar display name, logo or urgent tone does not by itself establish authority. Separate whether an account really has a notice from whether a supplied route is trustworthy. Check the notice through an independently known service route. Answering this practice requires neither opening a message-supplied URL nor downloading an attachment."
      },
      {
        "zh": "另设来信准确提到一次已公开的会议，随后要求接收者提供登录码。知道会议并没有证明对方有权获取认证秘密。记录你需要核实的身份、权限与官方处理渠道，不把“知道我的信息”当成通行证。即使一次核实完成，也不能推导账户从此绝不会被攻击；这30题更不检测设备或真实账户状态。",
        "en": "Suppose a message accurately names a public meeting, then requests a login code. Knowing the meeting does not establish a right to an authentication secret. Specify the identity, authority and legitimate handling route that need checking rather than treating personal knowledge as authorization. Verification is not a guarantee against future attacks; these thirty tasks do not inspect devices or accounts."
      }
    ]
  },
  {
    "id": "digital-information",
    "title": {
      "zh": "信息核查：找证据来处，而不只看转发数量",
      "en": "Checking information: trace evidence rather than count reposts"
    },
    "paragraphs": [
      {
        "zh": "另设四篇报道都引用同一张未核实的会议截图，不能把四次转述当四份独立观察。先核原始材料、日期、语境与支持的具体说法，再判断有没有真正独立的印证。旧材料可能真实但不适用于当前主张；尚未核实也不等于已证伪。",
        "en": "Four reports citing the same unverified meeting screenshot are not four independent observations. Check the original material, date, context and specific claim before asking whether corroboration is independent. Old material may be authentic but irrelevant to a current claim. Unverified and disproved are different conclusions."
      },
      {
        "zh": "Wineburg与McGrew的2017年工作论文观察45位参与者评估真实网站，比较事实核查员、历史学者与大学生的做法，报告了离开原页查外部资料的“横向阅读”策略。[5] 这是特定样本的过程研究，不是本站题本验证，也不能证明只开更多标签页就必然判断正确。这里依据论文摘要及方法部分介绍研究路径，没有复用其任务或评分量规。",
        "en": "Wineburg and McGrew’s 2017 working paper observed forty-five participants evaluating live websites, comparing fact checkers, historians and students and describing lateral reading beyond the original page.[5] This process study in a particular sample neither validates our bank nor shows that opening more tabs guarantees accuracy. This account draws on its abstract and methods, without reusing tasks or scoring rubrics."
      }
    ]
  },
  {
    "id": "digital-ai",
    "title": {
      "zh": "AI使用：可追溯来源、披露与输入权限",
      "en": "AI use: traceable sources, disclosure and input permissions"
    },
    "paragraphs": [
      {
        "zh": "生成的引文需要分别核实“资料确实存在”和“资料支持这条主张”。找到同题名论文不自动满足第二项。另设草稿引用一篇只讨论课堂参与的文章，却据此宣称某工具能提高考试成绩；即使文章真实，这条效果主张仍需自己的证据。不能补编页码、引文或实验结果来填空。",
        "en": "Verify both that a generated reference exists and that it supports the claim. A matching title is not enough. If a real article discusses classroom participation, it does not by that fact establish that a tool improves examination performance. The effect claim needs relevant evidence; invented pages, quotations or experiments cannot supply it."
      },
      {
        "zh": "UNESCO关于教育与研究中的生成式AI指导强调以人为本、数据隐私及教育用途的审查。[3] 本页因此把核查输出、按课程披露辅助和核输入授权分开讨论。允许列思路不代表允许代写全部分析；允许使用工具也不自动允许上传保密材料。具体决定仍需阅读当前课程或项目规则，这不是对所有机构或AI服务条款的统一结论。",
        "en": "UNESCO’s guidance emphasizes human agency, data privacy and review of educational AI use.[3] Here, checking output, disclosing assistance under course rules and verifying input permission are distinct decisions. Permission to brainstorm does not establish permission to outsource an analysis or upload confidential material. Read the current course or project rules; this is not a universal finding about institutions or service terms."
      }
    ]
  },
  {
    "id": "digital-participation",
    "title": {
      "zh": "网络沟通：区分观点分歧、伤害行为与证据限制",
      "en": "Online communication: distinguish disagreement, harmful conduct and limited evidence"
    },
    "paragraphs": [
      {
        "zh": "有理由的反对意见与公开联系方式、威胁、扩散侮辱不是同一行为。本页题目给出具体管理约定，让你比较行动与规则，而非选择更喜欢的立场。举报时按题定私密渠道提供必要证据，也应避免把被针对者的私聊变成公开材料；本练习不预测平台如何处理举报。",
        "en": "Reasoned disagreement differs from disclosing contact details, threatening someone or amplifying insults. These scenarios supply a moderation agreement and ask you to compare conduct with it rather than choose a preferred viewpoint. A bounded private report can supply relevant evidence without exposing the target’s messages publicly; the practice does not predict a platform response."
      },
      {
        "zh": "另设你把活动地点写错，组织方现已确认正确地址。可见的纠正应让收到旧消息的人找到更新及可靠来源，而不只是修改无关页面。面对裁剪对话，则先区分可见文字与对动机的推断，不借补充语境之名公开整段私人聊天。可检查的是具体主张和行为，不能从一道错题反推出某人的共情、品格或真实经历。",
        "en": "If you posted an incorrect event location and the organizer confirms the right one, make the correction and source findable to the original audience. With a cropped exchange, distinguish visible words from inferred motives without publishing an entire private conversation to supply context. Inspect claims and actions; a missed item cannot establish empathy, character or personal experiences."
      }
    ]
  },
  {
    "id": "digital-inclusion",
    "title": {
      "zh": "可访问性与许可：让信息可获得，让用途有依据",
      "en": "Access and permission: make information available and uses justified"
    },
    "paragraphs": [
      {
        "zh": "图片替代应由用途决定。另设放大镜图标是搜索按钮唯一内容，标签应传达搜索作用；同图若只是已有文字旁的装饰，就不需重复播报。W3C WAI的决策树区分功能、信息与装饰用途，纯装饰HTML图片可用空alt。[4] 这是一项内容处理决定，不是整页无障碍认证。",
        "en": "Image alternatives depend on purpose. A magnifying glass that alone labels a search button needs its function conveyed; decoration beside complete text need not repeat it. W3C WAI distinguishes functional, informative and decorative uses, including empty alt for purely decorative HTML images.[4] One such authoring decision does not certify a whole page as accessible."
      },
      {
        "zh": "作品可在网上看到，不自动说明允许任何再利用。按题给的具体许可核是否能修改、须如何署名、面向何种用途；服务试用则核本项续费与取消条件。本页仅练这些明示条件的判断。完整结果以五组各0—6及总计0—30正确数呈现，所有解析与指南都可读，不生成道德类型、资格证书或人群排名。",
        "en": "Online visibility does not establish permission for every reuse. Compare a work’s stated permission with alteration, attribution and intended use, and inspect the particular renewal and cancellation conditions of an offer. This practice checks explicit conditions. Results show five counts out of six and a total out of thirty, with all explanations and guides available, without a moral type, certificate or population ranking."
      }
    ]
  }
];

export const digitalCitizenshipLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "数字公民教育是否只讲网络安全？",
      "en": "Is digital citizenship education only about security?"
    },
    "answer": {
      "zh": "不是。它还涉及信息素养、参与、沟通与权利责任。本站选五组日常场景练判断，不宣称覆盖所有数字公民教育领域。",
      "en": "No. It also concerns information literacy, participation, communication, rights and responsibilities. These five practice groups do not claim to cover the entire educational field."
    }
  },
  {
    "question": {
      "zh": "为什么最获支持的答案不等于对别人动机的判断？",
      "en": "Why is a supported answer different from a judgment about motive?"
    },
    "answer": {
      "zh": "事实可以支持指出范围或证据不足，却未必证明对方诈骗、说谎或故意伤害。先区分已知行动、适用规则和未知动机，避免把疑虑写成已证事实。",
      "en": "Facts can support identifying a scope or evidence gap without proving fraud, dishonesty or intent to harm. Distinguish known actions, applicable rules and unknown motives."
    }
  },
  {
    "question": {
      "zh": "多个网站转述相同消息就算独立印证吗？",
      "en": "Do several sites repeating a claim establish independent corroboration?"
    },
    "answer": {
      "zh": "不一定。若都追溯到同一材料，仍是同一证据来处。先追原始来源、日期及语境；重复不能自动证明真，也不能自动证明假。",
      "en": "Not necessarily. Several reports may share one evidential origin. Trace the source, date and context; repetition alone establishes neither truth nor falsity."
    }
  },
  {
    "question": {
      "zh": "删掉姓名就能把材料称为匿名吗？",
      "en": "Does removing names establish anonymity?"
    },
    "answer": {
      "zh": "不能单凭这一点。岗位、地点、班次等组合仍可能对应个人。应核剩余信息与受众，本测试不计算识别概率或认证匿名化。",
      "en": "Not by itself. Combinations such as role, location and schedule can still identify someone. Review remaining information and audience; this test neither estimates reidentification probability nor certifies anonymization."
    }
  },
  {
    "question": {
      "zh": "所有图片都应该写很长的替代文字吗？",
      "en": "Should every image have a long alternative?"
    },
    "answer": {
      "zh": "不是。按用途与周边内容判断：功能图传达操作，信息图传达所需信息，纯装饰图可用空alt。一个替代文字决定不能证明整个系统无障碍。",
      "en": "No. Consider purpose and context: functional images convey actions, informative images convey needed information, and purely decorative images can use empty alt. One decision does not establish system-wide accessibility."
    }
  },
  {
    "question": {
      "zh": "课程允许用AI，就可以上传任何资料吗？",
      "en": "Does permission to use AI cover every input?"
    },
    "answer": {
      "zh": "不可以这样推断。工具许可、用途许可与数据输入授权应分别核对；按题给项目规则处理保密材料，不以付费档位或改文件名替代授权。",
      "en": "No. Tool use, permitted tasks and input authorization are separate. Follow the supplied project rule for confidential material rather than treating payment tier or a changed filename as permission."
    }
  },
  {
    "question": {
      "zh": "满分能证明我是安全或合格的数字公民吗？",
      "en": "Does a perfect result establish safe or qualified citizenship?"
    },
    "answer": {
      "zh": "不能。30/30只记录本版题目匹配参考答案，不观察实际行为、认证法律合规或提供职业资格。可用逐题理由和五份指南定位要继续核实的条件。",
      "en": "No. Thirty out of thirty records matches to this bank’s keys, without observing conduct, certifying compliance or granting professional qualifications. Use rationales and guides to identify conditions worth reviewing."
    }
  },
  {
    "question": {
      "zh": "零题正确或不会某些概念，会锁住完整结果吗？",
      "en": "Are full results locked at zero correct or unfamiliar concepts?"
    },
    "answer": {
      "zh": "不会。完成全部30题即可免费阅读30道解析与五份各七节指南，不按分数设权限，不要求邮箱、购买证书或再次同意。",
      "en": "No. All thirty responses unlock the free explanations and five seven-section guides regardless of correctness, without email, certificate purchase or another agreement step."
    }
  }
];

export const digitalCitizenshipLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Wineburg与McGrew（2017）：横向阅读工作论文，摘要与方法",
      "en": "Wineburg & McGrew (2017): lateral reading working paper, abstract and methods"
    },
    "url": "https://www.hendrix.edu/uploadedFiles/Academics/Faculty_Resources/Teaching_and_Learning/EvaluatingDigitalInformation.pdf"
  }
];
