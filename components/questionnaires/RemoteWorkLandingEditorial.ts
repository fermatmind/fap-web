import type { Questionnaire } from "@/lib/questionnaires/types";

export const remoteWorkLandingSections: Questionnaire["guide"] = [
  {
    "id": "remote-arrangement",
    "title": {
      "en": "Remote readiness starts with an arrangement, not a personality",
      "zh": "远程工作准备，从具体安排开始"
    },
    "paragraphs": [
      {
        "en": "This original twenty-item review concerns preparation for one current or proposed remote arrangement. Choose a representative task and keep it as your reference. The five groups cover working conditions and access, task planning, information handover and decisions, help and coordination, and boundaries for continuing the arrangement. They are records of reported actions, not five personality traits.",
        "zh": "这份20题原创回顾关注一项当前或拟议远程安排的准备。先选择代表性任务，整份问卷使用同一参照。五组分别涉及工作条件与接入、任务计划、信息交接与决策、求助协同，以及可持续安排的边界。它们记录自报行动，不是五种人格特质。"
      },
      {
        "en": "You can use a fictional rehearsal before your first remote role. An arrangement might involve regular home working, alternating home and office days, or coordination with colleagues in different locations. Name the task and available conditions privately; you do not need to submit your employer, location, household circumstances or work documents.",
        "zh": "首次远程岗位之前，也可以用虚构任务演练。参照可以是经常居家工作、居家与办公室交替，或与不同地点的同事协作。私下明确任务和可用条件即可，不需要提交雇主、地点、家庭情况或工作文件。"
      }
    ]
  },
  {
    "id": "remote-access",
    "title": {
      "en": "Access, tools and support have different owners",
      "zh": "接入、工具与支持，需要分别确认"
    },
    "paragraphs": [
      {
        "en": "Being familiar with software is different from having approved access to a particular project. Likewise, owning a device does not establish that its setup meets an organization’s requirements. The first group asks whether you have tried a task’s approved tools, considered its working conditions, rehearsed a contact route after disruption and found the relevant information-handling rules.",
        "zh": "熟悉软件与获得某项目的获准访问是两回事；拥有设备，也不证明配置符合组织要求。第一组回看是否试过任务所需的获准工具、考虑工作条件、演练中断后的通知路径，并找到相关信息处理规则。"
      },
      {
        "en": "HSE’s guidance for employers in Great Britain includes home and hybrid workers and asks employers to consider equipment, the working environment and other risks in discussion with workers. That is jurisdiction-specific guidance, not a legal assessment by this test. Here, identify which unresolved condition needs organizational support instead of assigning every resource gap to an individual. [2]",
        "zh": "HSE面向大不列颠地区雇主的指导覆盖居家及混合工作，并要求结合与工作者的讨论考虑设备、工作环境等风险。这是特定辖区指导，不是本测试作出的法律评估。本页应帮助确认哪些未落实条件需要组织支持，而不是把资源缺口全部归为个人问题。[2]"
      }
    ]
  },
  {
    "id": "remote-research",
    "title": {
      "en": "What remote and hybrid-work research can establish",
      "zh": "远程与混合工作研究，能说明到哪一步"
    },
    "paragraphs": [
      {
        "en": "Bloom, Han and Liang’s 2024 study reports a six-month randomized trial involving 1,612 employees at a Chinese technology company. A schedule with two home-working days improved satisfaction and retention without worsening the performance measures examined. This is evidence about that arrangement and sample, not a finding that every job or individual will benefit from remote work. [3]",
        "zh": "Bloom、Han与Liang在2024年报告了中国一家科技企业1,612名员工的六个月随机试验。每周两天居家的安排改善了满意度与留任，所考察的绩效指标未变差。这是针对该安排和样本的证据，不代表每种岗位或每个人都会因远程工作受益。[3]"
      },
      {
        "en": "Yang and colleagues analysed communication records from 61,182 US Microsoft employees around the 2020 shift to company-wide remote work. Their natural-experiment analysis found more siloed collaboration and changes in communication channels; it did not directly measure productivity or innovation. Together, these studies show why arrangement, outcome and research design must be specified. Neither validates this questionnaire or predicts your readiness. [4]",
        "zh": "Yang等人分析美国微软61,182名员工在2020年全公司转向远程前后的沟通记录，其自然实验分析发现协作联系更分隔、沟通渠道发生变化，但没有直接测量生产力或创新。这两项研究提示，应说清工作安排、结果指标和研究设计；它们都不验证本站问卷，也不预测你的准备程度。[4]"
      }
    ]
  },
  {
    "id": "remote-planning",
    "title": {
      "en": "Make the output and the dependency visible",
      "zh": "让产出与依赖条件可见"
    },
    "paragraphs": [
      {
        "en": "A useful task plan says what must be produced, how completion is checked and which decision or input is needed first. A shared progress note can distinguish completed work, a blocker and a pending decision. These are different observations from time online, message volume or apparent busyness. The questionnaire records preparation for making those distinctions.",
        "zh": "可讨论的任务计划需要说明产出什么、怎样核对完成，以及先需要哪项决定或输入。共享进度可以区分已完成、受阻和等待决定；这些与在线时间、消息数量或看起来忙碌不同。本问卷记录为作出这些区分所做的准备。"
      },
      {
        "en": "ILO’s 2020 pandemic-era guidance discusses management support, clear expectations, suitable tools and trust, including progress discussions without excessive reporting. It is practical guidance for a particular historical context, not evidence that constant availability improves performance. For a rehearsal, compare one bounded plan with what happened and record a dependency to clarify before the next attempt. [1]",
        "zh": "ILO在2020年疫情背景下的指导讨论管理支持、清楚预期、适用工具和信任，也强调进度讨论不应变成过度汇报。这是特定历史情境的实践指导，不证明持续在线能改善表现。演练时，可以比较一次有限计划与实际经过，记录下次需要先澄清的依赖。[1]"
      }
    ]
  },
  {
    "id": "remote-handover",
    "title": {
      "en": "A handover should let another person take the next step",
      "zh": "交接的重点，是让接收方能接着行动"
    },
    "paragraphs": [
      {
        "en": "Write down enough context to identify the task, current artifact, requested decision and response window. A file link alone may omit why it matters; a long conversation may still leave the decision owner unclear. The handover group asks whether you prepared and tried a shared understanding, rather than whether you prefer written messages to calls.",
        "zh": "交接应提供足够背景，让人辨认任务、当前材料、所需决定与回应时间。一个文件链接可能没有说明用途，很长的对话也可能没说清谁决定。交接组关注是否准备和试过共同理解，不是偏好文字还是通话。"
      },
      {
        "en": "For example, use a fictional draft and ask a willing collaborator to locate the current version and explain the next action. Compare their understanding with yours and revise one unclear part. A live conversation may be useful before the final note; the test does not declare one channel universally better. No real meeting needs to be recorded, and restricted material should stay in its approved location.",
        "zh": "例如，用虚构草稿请自愿协助的人找到当前版本，复述下一步，再比较双方理解并修改一处含糊之处。形成最终记录前，也可能需要实时沟通；本页没有宣布某种渠道普遍更优。无需录制真实会议，受限材料仍应留在获准位置。"
      }
    ]
  },
  {
    "id": "remote-coordination",
    "title": {
      "en": "Agree how to ask for help and how to be unavailable",
      "zh": "约定怎样求助，也约定何时不可联系"
    },
    "paragraphs": [
      {
        "en": "Working independently still involves dependencies. A blocker message can name the obstacle, its effect, what has already been tried and the decision needed. Contact windows and an alternative support route help make that request actionable. A constraint outside your authority is a condition to discuss, not automatically a lack of initiative or cooperation.",
        "zh": "独立工作仍有依赖条件。求助说明可以交代障碍、影响、已经试过什么，以及需要哪项决定。联系时段与替代支持路径，让请求更容易落实。超出个人权限的限制应进入共同讨论，不自动说明缺乏主动性或合作意愿。"
      },
      {
        "en": "The final group asks about start and stop boundaries, non-urgent messages, usable breaks and discussing changed conditions. Rehearse one ordinary day and one message arriving outside the agreed window. Check assumptions with a willing partner. This exercise does not require ignoring urgent duties, disabling safety-related alerts or disclosing private caring or accessibility details.",
        "zh": "最后一组回看工作起止边界、非紧急消息、实际可用的休息，以及条件变化后的讨论。可以演练一个普通工作日和一条在约定时段外到来的消息，再与自愿同伴核对假设。练习不要求忽略紧急职责、关闭安全通知，或披露私人照护与无障碍细节。"
      }
    ]
  },
  {
    "id": "remote-stages",
    "title": {
      "en": "Four action stages and five independent summaries",
      "zh": "四个行动阶段，五组分别概括"
    },
    "paragraphs": [
      {
        "en": "The response stages are not started (0), drafted but not tried (1), tried in a real or simulated task (2), and reviewed the trial with an adjustment (3). A separate not-rated choice preserves situations that do not apply, cannot be assessed or are private. Choose what you have done for this arrangement, rather than how confident you feel or how a remote worker ought to behave.",
        "zh": "回答阶段依次为尚未开始（0）、有草案但未试（1）、在真实或模拟任务试过（2）、试后复盘并调整（3）。单独的不计分选项保留不适用、无法判断或不愿回答的情况。应按针对该安排做过什么选择，而非按自信程度或理想远程工作者的样子回答。"
      },
      {
        "en": "Each group needs all four numeric choices before showing a sum and mean. For 3, 2, 1 and 0, the sum is 6 and the mean 1.5; displayed means use one decimal place. Zero is valid. Any not-rated action withholds only its group’s numbers, while stage counts and item selections remain. All twenty not-rated choices still produce five full guides. These ordered stage codes do not establish equal psychological intervals or a total readiness percentage.",
        "zh": "同组四项全部有数字回答，才显示合计与均值。3、2、1、0合计为6，均值1.5，显示保留一位小数；0是有效回答。任一不计分只撤下本组数字，阶段计数与逐项选择仍保留。20项全部不计分也能阅读五篇全文。这些有序阶段代码不证明心理间距相等，也不生成总准备率。"
      }
    ]
  },
  {
    "id": "remote-use",
    "title": {
      "en": "Read the pattern, then choose one arrangement to revisit",
      "zh": "先看行动分布，再选一个安排重谈"
    },
    "paragraphs": [
      {
        "en": "The same mean can conceal different preparation: 3, 3, 0, 0 and 2, 2, 1, 1 both display 1.5. Read which actions remain drafts or have not been started. A later higher response may reflect a different task, new support or a changed understanding, rather than verified improvement in performance. This original form has no hiring threshold, burnout diagnosis or validated remote-work success prediction.",
        "zh": "相同均值可以藏着不同准备：3、3、0、0与2、2、1、1都显示1.5。先看哪些行动仍是草案或尚未开始。之后回答更高，可能来自不同任务、新支持或理解变化，不证明绩效已经改善。这份原创问卷没有招聘阈值、倦怠诊断或经过验证的远程成功预测。"
      },
      {
        "en": "Start test opens the first item directly. Only selected stages are needed, and calculation takes place in the browser. Temporary saving is optional and applies to this tab for up to twenty-four hours; completion, retake or exit-and-clear removes the draft. Public guide links share general explanations without answers or values. You can read all five guides without an attempt, signup or a further agreement step.",
        "zh": "点击开始直接进入第一项，只需所选阶段，计算在浏览器完成。临时保存可自愿选择，仅在本标签页保留最多24小时；完成、重测或退出并清除会删除草稿。公开指南链接只分享通用说明，不含答案或数值。无需作答、注册或额外勾选协议，也可阅读五篇全文。"
      }
    ]
  }
];

export const remoteWorkLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does remote readiness mean the same thing as introversion?",
      "zh": "远程准备程度等于内向程度吗？"
    },
    "answer": {
      "en": "No. These items record preparation for access, planning, handover, coordination and boundaries. Preferring solitude or social contact does not establish any of those actions. There is no conversion to MBTI, Big Five or an introversion score.",
      "zh": "不等于。题目记录接入、计划、交接、协同与边界的准备。偏好独处或社交不能证明已经完成这些行动，本页不能换算成MBTI、大五或内向分数。"
    }
  },
  {
    "question": {
      "en": "Can one successful trial establish that my whole job can be remote?",
      "zh": "一次试做顺利，就说明整个岗位都能远程吗？"
    },
    "answer": {
      "en": "No. One task may work while another needs on-site access, supervision or resources. Keep the reference task clear and discuss other duties separately. A stage record is not a role-eligibility decision.",
      "zh": "不能。一项任务可行，另一项可能需要现场接入、监督或资源。应明确参照任务，其他职责另行讨论，阶段记录不是岗位可远程的资格判定。"
    }
  },
  {
    "question": {
      "en": "Does the test inspect my device or verify security?",
      "zh": "测试会检查设备或验证信息安全吗？"
    },
    "answer": {
      "en": "No. It receives stage selections, not device configurations, credentials or work files. A selected stage cannot certify an approved setup. Follow the responsible organization’s rules and support route.",
      "zh": "不会。本页接收阶段选择，不索取设备配置、凭据或工作文件。选择某阶段不能认证配置获准，应核对相关组织的规则与支持路径。"
    }
  },
  {
    "question": {
      "en": "Do I have to remain online all day to choose a higher stage?",
      "zh": "必须整天在线，才能选较高阶段吗？"
    },
    "answer": {
      "en": "No. A stage describes preparing, trying and reviewing a specific arrangement. Agreeing contact windows or a response expectation can be relevant preparation. Continuous online status is not a scored requirement.",
      "zh": "不用。阶段描述对具体安排的准备、试行与复盘。约定联系窗口或回应预期也属于相关准备；持续在线不是计分要求。"
    }
  },
  {
    "question": {
      "en": "Why are some numbers withheld while the full guides remain?",
      "zh": "为什么撤下数字，却保留完整指南？"
    },
    "answer": {
      "en": "A group mean needs four numeric stage choices. One not-rated response leaves that group without a number; it is not treated as zero or estimated from other answers. Guides explain the topics and remain useful without a personal numeric summary.",
      "zh": "本组均值需要四个数字阶段，一个不计分就使本组不显示数值，不按0处理，也不用其他回答估计。指南解释主题，不依赖个人数值概括即可阅读。"
    }
  },
  {
    "question": {
      "en": "Do the cited studies prove these twenty questions are accurate?",
      "zh": "引用研究证明这20题准确吗？"
    },
    "answer": {
      "en": "No. The studies examine particular working arrangements and organizational outcomes, not this original form. Validation would need evidence for these items, instructions, scoring and intended interpretation in the relevant population. [3][4]",
      "zh": "不能。研究考察特定工作安排与组织结果，并非本原创题本。验证需要针对这些条目、指导语、计分、预期解释及相应人群的证据。[3][4]"
    }
  },
  {
    "question": {
      "en": "Can I compare these five means with another person’s?",
      "zh": "能拿这五组均值与别人比较吗？"
    },
    "answer": {
      "en": "The form supplies no population norms or meaningful-difference threshold. People may be rating different tasks, permissions and support. If both people want to discuss an arrangement, compare concrete dependencies rather than ranking their means.",
      "zh": "本页没有人群常模或有意义差异阈值。不同人可能参照不同任务、权限和支持。双方愿意讨论时，可以对照具体依赖，而非排列均值高低。"
    }
  },
  {
    "question": {
      "en": "Can I start without agreeing again or saving progress?",
      "zh": "不开启保存、不再勾选同意也能开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first item. Saving is optional; all five guides and the current result are free without an extra test or signup. Public links do not contain your responses.",
      "zh": "可以。点击开始即进入第一项，保存自愿选择。五篇指南与当前结果免费，无需追加测试或注册，公开链接不含个人回答。"
    }
  }
];

export const remoteWorkLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Bloom, Han & Liang (2024): randomized trial of a specific hybrid-work schedule",
      "zh": "Bloom、Han与Liang（2024）：特定混合工作安排的随机试验"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/38867040/"
  },
  {
    "title": {
      "en": "Yang et al. (2022): remote work and collaboration networks",
      "zh": "Yang等（2022）：远程工作与协作网络"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/34504299/"
  }
];
