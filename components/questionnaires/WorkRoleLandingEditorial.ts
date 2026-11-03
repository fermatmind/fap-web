import type { Questionnaire } from "@/lib/questionnaires/types";
export const workRoleLandingSections: Questionnaire["guide"] = [
  {
    "id": "work-role-purpose",
    "title": {
      "en": "Work role reflection: responsibility and support in twelve instances",
      "zh": "工作角色与支持方式回顾：十二项实例中的责任与支持"
    },
    "paragraphs": [
      {
        "en": "This original inventory organises twelve task instances into clarifying a problem, checking a delivery and contributing with others. For each instance it records the main responsibility you select: working with step-by-step guidance, owning the task with agreed checkpoints, supporting another person’s task or leaving the instance unassessed. The output is a set of categorical records, not a skills score.",
        "zh": "本原创回顾将十二项任务实例分为澄清问题、核对交付和共同贡献，逐项记录你所选的主要责任：在逐步指导下参与、按约定检查点承担任务、支持他人完成任务，或保留未评估。输出是类别记录，不是技能分数。"
      },
      {
        "en": "A task can be difficult even when you receive guidance; supporting someone else need not imply greater expertise. A review checkpoint can be a normal part of accountable work. Read the chosen contexts alongside the task and its constraints, rather than turning them into beginner, intermediate and expert stages.",
        "zh": "即使接受指导，任务仍可能很难；支持别人也不必然说明专业程度更高。约定复核可以是负责交付的常规环节。应将所选情境与任务及限制一起阅读，不把它们转换成初级、中级和专家阶段。"
      }
    ]
  },
  {
    "id": "work-role-recall",
    "title": {
      "en": "Choose one role and the most recent relevant instance",
      "zh": "怎样回顾：一个角色、近十二周、最近的相关实例"
    },
    "paragraphs": [
      {
        "en": "Use one current or recent role throughout the past twelve weeks. Paid work, volunteering and a study project are all eligible contexts. For each prompt recall one concrete instance; if several fit, use the most recent. This reduces the temptation to combine your strongest examples from unrelated roles into a general career claim.",
        "zh": "全程使用一个当前或近期角色，回看近十二周。付费工作、志愿活动和学习项目都可以作为背景。每题回想一个具体实例；有多个符合时，选最近一次，以免把不同角色中最突出的经历拼成整体职业判断。"
      },
      {
        "en": "Choose your main responsibility in that instance, not the job title you held or the responsibility you would like next. When guidance, ownership and support overlap, ask whose output you were primarily accountable for and what help was actually involved. If you cannot make that distinction, the non-assessment option remains available.",
        "zh": "选择那次实例中的主要责任，不按职位名称或期待下一步承担的责任回答。指导、承担与支持重叠时，可以问自己主要对谁的产出负责、实际涉及什么帮助；确实无法区分时，仍可选择未评估。"
      }
    ]
  },
  {
    "id": "work-role-clarification",
    "title": {
      "en": "Clarifying problems: requests, evidence and changed assumptions",
      "zh": "澄清问题：请求、依据与改变的假设"
    },
    "paragraphs": [
      {
        "en": "The first four prompts concern making an unclear request explicit, comparing approaches, separating what is known from what needs checking and revising an approach when information changes. They ask about participation in those tasks. They do not test the correctness of an analysis or the complexity of a decision.",
        "zh": "前四题关注明确模糊请求、比较处理办法、区分已知与待核信息，以及在信息改变时修订办法。题目询问你怎样参与这些任务，不检验分析是否正确或决策有多复杂。"
      },
      {
        "en": "For a private example, distinguish the question you helped clarify from the decision someone else was authorised to make. A colleague may have supplied a procedure while you checked the missing information; on another task you may have supported their investigation. The same category can therefore describe very different practical work.",
        "zh": "私下回看实例时，可以区分自己帮助澄清的问题与别人获授权作出的决定。例如，同事提供程序，你核对缺失信息；另一项任务中，你可能支持对方调查。因此，相同类别也可能对应很不相同的实际工作。"
      }
    ]
  },
  {
    "id": "work-role-delivery",
    "title": {
      "en": "Checking delivery: requirements, limits and escalation",
      "zh": "核对交付：要求、限制与升级求助"
    },
    "paragraphs": [
      {
        "en": "The second group concerns agreeing completion conditions, checking an output against them, raising a blocker outside your responsibility and adjusting a delivery plan after change. Selecting ownership means responsibility with agreed checkpoints in the chosen instance. It does not mean unchecked autonomy or that the output met every requirement.",
        "zh": "第二组关注约定完成条件、据此核对产出、提出职责外的阻碍，以及条件变化后调整交付计划。在本表中选择承担任务，指那次实例中按约定检查点负责，不表示无需复核的自主权，也不证明产出满足了全部要求。"
      },
      {
        "en": "Receiving review, asking for permission and identifying a remaining limitation can all be appropriate to a task. The record does not assess whether escalation happened at the right time or whether a reviewer accepted the work. If you want to understand quality, return separately to the agreed criteria and actual feedback rather than treating the category count as evidence.",
        "zh": "接受复核、申请许可及指出剩余限制，都可能符合任务需要。本记录不评估升级求助是否及时，也不核实复核者是否接受产出。想理解质量时，应另外回到约定标准与实际反馈，不把类别次数当作表现证据。"
      }
    ]
  },
  {
    "id": "work-role-contribution",
    "title": {
      "en": "Contributing with others: explain, coordinate and preserve learning",
      "zh": "共同贡献：解释、协调与保留经验"
    },
    "paragraphs": [
      {
        "en": "The final four prompts concern explaining reasoning for a collaborator, resolving different expectations, helping with another person’s task and recording a reusable lesson. Supporting another person here identifies the main responsibility you recall; it is not a managerial credential or a team-role personality label.",
        "zh": "最后四题关注向协作者解释依据、协调不同预期、帮助他人完成任务，以及记录可复用经验。在这里支持他人，标记的是你回忆的主要责任，不是管理资格或团队角色人格标签。"
      },
      {
        "en": "You might support a collaborator by finding a missing instruction while owning a different task yourself. Neither contribution tells us how the whole team performed. Keep the actual handoff, permissions and resources in view; other people’s motives or competence cannot be inferred from your twelve choices.",
        "zh": "你可能通过找到缺失指引支持协作者，同时自己承担另一项任务。两种参与都不能说明整个团队表现如何。阅读时保留实际交接、权限与资源，不从自己的十二个选择推断别人的动机或能力。"
      }
    ]
  },
  {
    "id": "work-role-counts",
    "title": {
      "en": "How category counts work: no weights, means or winning context",
      "zh": "类别怎样计数：无权重、均值或胜出情境"
    },
    "paragraphs": [
      {
        "en": "Each four-task group has four category counts whose sum is always four. Suppose its choices are guided, owned, owned and unassessed: the counts are 1, 2, 0 and 1 in the displayed category order. There is no multiplication by a proficiency weight and no averaging. A zero for supporting others says that category was not selected for these four instances; it does not establish inability to support.",
        "zh": "每个四题组有四种类别计数，合计始终为四。例如，四项分别选择指导下参与、承担、承担及未评估，按展示类别顺序计数为1、2、0、1。不乘熟练程度权重，不求均值。支持他人为零，只表示这四项实例未选择该类别，不证明无法支持别人。"
      },
      {
        "en": "Counts can match while the records differ. Guided, owned, owned, unassessed and owned, guided, owned, unassessed both give 1, 2, 0, 1, but the first two tasks have different responsibilities. That is why the result retains all twelve item-level records. Four unassessed choices produce 0, 0, 0, 4 and still keep the full guide available.",
        "zh": "计数相同，记录仍可能不同。指导、承担、承担、未评估，与承担、指导、承担、未评估，都得到1、2、0、1，但前两项任务的责任不同。因此结果同时保留十二条逐题记录。四项全部未评估得到0、0、0、4，完整指南仍然开放。"
      }
    ]
  },
  {
    "id": "work-role-evidence",
    "title": {
      "en": "Task reflection, competency assessment and evidence",
      "zh": "任务回顾、胜任力评估与证据：清楚区分用途"
    },
    "paragraphs": [
      {
        "en": "OPM distinguishes competencies needed for successful work from the tasks themselves and ties proficiency decisions to analysis of specific positions. [1][2] USA Staffing also publishes rating scales for particular assessment purposes. [3] Those sources explain why task context and intended use matter; this page does not administer their rating scales or inherit their employment-assessment authority.",
        "zh": "OPM区分成功完成工作所需的胜任力与任务本身，并将熟练程度判断联系到具体岗位分析。[1][2] USA Staffing也公布用于特定评估目的的评分尺度。[3] 这些资料说明任务情境与用途为何重要；本页不施测其评分尺度，也不继承其雇佣评估权威。"
      },
      {
        "en": "This original twelve-prompt inventory has no established psychometric validation, population norms, career-stage calibration or English–Chinese measurement equivalence. Its counts are reproducible records of selected categories. They are not verified work samples, supervisor observations or predictions of job performance, and cannot be converted into a hiring threshold or credential.",
        "zh": "本原创十二题回顾尚未建立心理测量验证、人群常模、职业阶段校准或英中测量等值。计数是对所选类别的可复算记录，不是经过验证的工作样本、主管观察或工作表现预测，也不能转换为录用线或资格证书。"
      }
    ]
  },
  {
    "id": "work-role-use",
    "title": {
      "en": "Use the record for a specific support conversation",
      "zh": "怎样使用记录：围绕具体任务讨论支持"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one item and privately note what the task required, what you contributed and which checkpoint or resource helped. A practical question might be: before my next delivery, who can confirm the acceptance criteria? This is an optional planning prompt, not a conclusion that you need more or less supervision. Do not upload work documents or identify clients or colleagues.",
        "zh": "如有帮助，可以选一题，私下记下任务要求、自己的贡献，以及有用的检查点或资源。一个实际问题可以是：下次交付前，谁能确认验收条件？这只是可选计划提示，不是你应接受更多或更少监督的结论。不要上传工作文件或识别客户、同事。"
      },
      {
        "en": "Start opens the first task directly, with no registration or required agreement step. Complete questions and all three public guides are free. Draft saving and anonymous activity counts are optional, initially off; a saved tab draft lasts up to twenty-four hours and clears on completion, retake or exit-and-clear. Sharing copies the public entry rather than your choices or counts.",
        "zh": "点击开始直接进入第一项任务，无需注册或额外必选同意步骤。完整题目及三篇公开指南免费。草稿保存与匿名使用计数均为可选，初始关闭；标签页草稿最多保留二十四小时，完成、重测或退出并清除后删除。分享复制公开入口，不包含选择或计数。"
      }
    ]
  }
];
export const workRoleLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does work role reflection record?",
      "zh": "工作角色回顾记录什么？"
    },
    "answer": {
      "en": "Your selected participation context for twelve concrete task instances in one role over the past twelve weeks. Three groups concern clarifying problems, checking delivery and contributing with others. No ability score or career tier is generated.",
      "zh": "记录同一角色近十二周内十二项具体任务实例的所选参与情境，三组关注澄清问题、核对交付与共同贡献，不生成能力分或职业等级。"
    }
  },
  {
    "question": {
      "en": "Does owning a task mean working without review?",
      "zh": "承担任务等于完全不需要复核吗？"
    },
    "answer": {
      "en": "No. The ownership option explicitly includes agreed checkpoints. The record does not measure review frequency, decision authority or whether your output was accepted. Choose the main responsibility in the instance you recall.",
      "zh": "不等于。承担选项明确包含约定检查点；记录不测复核频率、决策权限或产出是否被接受。按回忆实例中的主要责任选择即可。"
    }
  },
  {
    "question": {
      "en": "Is supporting others a higher category than receiving guidance?",
      "zh": "支持他人比接受指导等级更高吗？"
    },
    "answer": {
      "en": "No. These are unordered contexts. A person can support one task and receive guidance on a different unfamiliar task. None of the categories is assigned a numerical proficiency weight.",
      "zh": "不是。它们是无顺序的情境；一个人可以支持某项任务，也在另一项陌生任务中接受指导。类别没有熟练程度数值权重。"
    }
  },
  {
    "question": {
      "en": "How do I verify the counts?",
      "zh": "怎样核对类别次数？"
    },
    "answer": {
      "en": "Count the four chosen categories in each group. Guided, owned, owned and unassessed give 1, 2, 0, 1. All four counts sum to four, including unassessed. There is no mean, total ability score or winning context.",
      "zh": "逐组统计四个所选类别。指导、承担、承担、未评估得到1、2、0、1；包含未评估在内，四种计数合计四。不计算均值、能力总分或胜出情境。"
    }
  },
  {
    "question": {
      "en": "Why retain every item when the counts are shown?",
      "zh": "已经显示计数，为什么还保留逐题记录？"
    },
    "answer": {
      "en": "The same counts can arise from different responsibilities on particular tasks. Switching guided and owned between two tasks leaves the distribution unchanged but changes the instances. Item-level records preserve that distinction.",
      "zh": "不同任务上的责任不同，仍可能得到相同计数。两题互换指导与承担后，分布不变，但实例记录改变；逐题展示保留这种差别。"
    }
  },
  {
    "question": {
      "en": "Does an unassessed choice mean lack of competence?",
      "zh": "未评估是否表示缺乏胜任力？"
    },
    "answer": {
      "en": "No. It combines no relevant instance, inability to assess and choosing not to answer. The page does not distinguish those reasons or convert them into a low score. All three full guides remain available even when every response is unassessed.",
      "zh": "不是。它包含没有相关实例、无法判断及不愿回答；页面不区分这些原因，也不转换成低分。即使全部未评估，三份完整指南仍开放。"
    }
  },
  {
    "question": {
      "en": "Can I compare two people or different roles?",
      "zh": "可以比较两个人或不同角色吗？"
    },
    "answer": {
      "en": "The records have no common difficulty or opportunity standard. Tasks, permissions, review and resources differ. Use them to recall specific participation, not to rank people, infer a promotion decision or certify readiness for a job.",
      "zh": "记录没有统一难度或机会标准，任务、权限、复核与资源均可能不同。可用来回顾具体参与，不用于人员排名、推断晋升决定或认证岗位准备程度。"
    }
  },
  {
    "question": {
      "en": "Does a changed count prove professional development?",
      "zh": "计数改变能证明职业成长吗？"
    },
    "answer": {
      "en": "Not by itself. New tasks, a different role, changed support or a different recalled instance can change the distribution. Compare the actual tasks and context before drawing conclusions; this edition has no calibrated change score or established test–retest interpretation.",
      "zh": "仅凭计数不能。新任务、不同角色、支持改变或回忆不同实例，都可能改变分布。应先核对实际任务与情境；本版没有校准的变化分数或已建立的重测解释。"
    }
  }
];
