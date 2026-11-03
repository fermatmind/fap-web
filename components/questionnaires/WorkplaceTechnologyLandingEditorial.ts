import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Task-specific reasoning supplement; original keyed questions and revision reports remain intact. */
export const workplaceTechnologyLandingSections: QuestionnaireSection[] = [
  {
    "id": "worktech-scope",
    "title": {
      "zh": "职场技术与协作测试练什么？四类任务条件推理",
      "en": "What does this Workplace Technology Test practise? Four groups of task-based reasoning"
    },
    "paragraphs": [
      {
        "zh": "这份16题原创练习围绕交接、协作条件、共享工作与技术变化四个主题，每组四题。题面提供完成判断所需的记录、工具能力、权限、时段或数量，要求从四个选项中找出唯一符合条件的一项。它问的是“这条更新、安排或结论是否由给定信息支持”，不要求给自己的协作风格、技术信心或人格打分。",
        "en": "This original sixteen-item practice covers handovers, collaboration constraints, shared work and technology changes, with four items in each group. Records, capabilities, permissions, time windows or quantities in each prompt support one correct choice. The question is whether supplied information supports an update, arrangement or conclusion, rather than how you rate your collaboration style, technical confidence or personality."
      },
      {
        "zh": "适合想练习工作记录阅读与条件核对的读者。题中工具名称和权限为虚构设定，不要求登录办公账号，也不操作真实系统。本卷不会检查你能否熟练使用Teams、共享云盘或某个版本的软件；能读懂题定能力表，与能在具体组织的实际环境中完成操作，需要分别验证。",
        "en": "Readers can use it to practise reading work records and checking conditions. Tools and permissions are fictional, without workplace-account login or real-system operation. This bank does not check proficiency in Teams, a cloud drive or a software version. Understanding a supplied capability table and carrying out a task in an organisation’s actual environment require separate evidence."
      }
    ]
  },
  {
    "id": "worktech-handover",
    "title": {
      "zh": "交接记录：保留字段，再筛选可引用版本",
      "en": "Handover records: preserve fields, then filter eligible versions"
    },
    "paragraphs": [
      {
        "zh": "交接题要求同时保留任务编号、负责人、到期时间、状态与来源。以H7为例，负责人仍是米拉、期限仍是周二14:00、状态仍是等待数据而阻塞；只保留编号但改了其中一项，已经不是相同记录。决定记录题则把必需字段明确列为决定、负责人、到期日、来源链接，不能用“紧急”替代缺失的具体信息。",
        "en": "Handover items require the task ID, owner, deadline, status and source to remain intact. For H7, Mira remains the owner, Tuesday 14:00 the deadline, and waiting for data the blocked status. Keeping an ID while altering another field changes the record. The decision-note item explicitly requires decision, owner, due date and source link; urgency cannot replace a missing field."
      },
      {
        "zh": "版本题先筛“已批准”，再比较该集合中的时间：U1与U3已批准，U3较新；U4虽然时间更晚，仍是草稿。共同评论题也要同时满足“有评论”和“同一版本链接”，不能只看方便传送。反例是另一项目允许评阅草稿，答案条件就变了；本卷讲清的是题定规则的应用，不把一种交接制度说成所有团队的唯一做法。",
        "en": "For versions, filter approved records before comparing times: U1 and U3 qualify, and U3 is later. U4 is newer but remains a draft. Common-review comments similarly require both comments and one version link, not merely easy transmission. A project permitting draft review would change the condition. This bank demonstrates applying stated rules, not one mandatory handover policy for every team."
      }
    ]
  },
  {
    "id": "worktech-settings",
    "title": {
      "zh": "协作场景：共同时间、参与渠道与实体任务",
      "en": "Collaboration settings: shared time, participation channels and physical tasks"
    },
    "paragraphs": [
      {
        "zh": "会议时段应完整落在每个人的空闲窗口里，而不是只核对开始时间。安娜09:00—10:00、博09:30—10:15的交集为09:30—10:00 UTC，恰好容纳30分钟；09:45—10:15虽然博有空，却超出安娜的窗口。题面已统一UTC，不需要猜地点或额外套夏令时。",
        "en": "A meeting must fit wholly inside every participant’s availability, not merely start within it. Ana’s 09:00–10:00 and Bo’s 09:30–10:15 overlap from 09:30 to 10:00 UTC, exactly thirty minutes. A 09:45–10:15 slot fits Bo but exceeds Ana’s window. UTC is already supplied, so neither location guesses nor daylight-saving assumptions are needed."
      },
      {
        "zh": "其余三题分别核对混合参与的听、读、问三项要求，无共同工作时段下可异步更新的书面记录，以及实体原型接触加保留反馈。选项是否满足全部要求比“远程还是现场更好”的口号更有用。若任务需要即时讨论，原异步题的条件已不同；若必须共同操作实体原型，只有在线文档也不够。",
        "en": "The other items check all three hybrid-participation requirements—hearing, reading and questioning—an asynchronous shared record without overlapping hours, and physical prototype access plus retained feedback. Meeting all stated requirements matters more than declaring remote or in-person work universally better. Immediate discussion would change the asynchronous case; a document alone cannot supply required physical access."
      }
    ]
  },
  {
    "id": "worktech-shared",
    "title": {
      "zh": "共享工作：最少权限、状态变化与双重筛选",
      "en": "Shared work: minimum capabilities, status changes and combined filters"
    },
    "paragraphs": [
      {
        "zh": "权限题先列必要动作，再从具备这些动作的角色里选能力最少的一项。需要阅读和评论时，查看者缺少评论，评阅者正好覆盖，编辑者与管理者则多了题目不需要的能力。另一题只授予克里斯评论权限，解决讨论由帕特负责；提供观察并请帕特核对既能贡献，也保留题定责任。真实工具的角色定义与批准流程仍应另行查证。",
        "en": "For permissions, list required actions, then choose the least-capable role that supplies them. Reading plus commenting excludes Viewer, is met by Reviewer, and does not need Editor or Manager’s extra capabilities. Another item permits Chris to comment while Pat owns resolution: adding an observation and asking Pat to review contributes within that rule. Actual product roles and approval processes still need separate checking."
      },
      {
        "zh": "任务板题按相同编号逐项比对：T7从待办变完成、T9从阻塞变待办，T8没有变化。筛选题必须同时满足“属于萨姆”和“尚未完成”，因此保留X与W；Y虽属于他但已完成，Z虽待办却属于别人。题面明确阻塞也算未完成，不能自行把它排除。真实项目若采用其他状态定义，需要按实际定义重做筛选。",
        "en": "Compare the same task IDs across board snapshots: T7 changes from todo to done, T9 from blocked to todo, and T8 stays unchanged. Filtering requires both Sam as owner and not done, retaining X and W. Y belongs to Sam but is done; Z is todo but belongs to someone else. Blocked is explicitly included. A different real project’s status definitions require applying its own filter."
      }
    ]
  },
  {
    "id": "worktech-change",
    "title": {
      "zh": "技术改变工作：先算完整任务，再区分人数与因果",
      "en": "Technology changes: calculate whole tasks, then separate staffing and causation"
    },
    "paragraphs": [
      {
        "zh": "时长题要纳入所有变化：原先30分钟抄录加15分钟核对，共45；之后10分钟抄录、20分钟核对、5分钟新增审查，共35，净减10分钟。只看抄录减少20分钟会漏掉其他工作。某个步骤交给工具、员工转做异常核对，只能支持任务组成变化；没有业务量、需求、工时配置等信息，就不能算出人数增减。",
        "en": "Include every changed task in the time calculation. Thirty minutes transcribing plus fifteen checking gives forty-five; ten transcribing, twenty checking and five auditing gives thirty-five, a net reduction of ten. Focusing only on twenty minutes saved in transcription omits other work. A tool taking one step while staff check exceptions establishes changed task composition, not a staffing change without workload, demand and time-allocation information."
      },
      {
        "zh": "试用日志中，两周错误数都是2，但案例数从10变20，错误率分别为20%与10%，相差10个百分点。错误数、错误率与百分比变化不是同一个量。没有可比对照和其他条件，不能把差异归因于工具。培训题同样只核对课程是否同时覆盖导入数据核查与异常分流，不从课程名称或选对答案预测真实培训效果。",
        "en": "In the pilot log, both weeks have two errors, while cases rise from ten to twenty. Rates are twenty and ten percent, a ten-percentage-point difference. Error counts, rates and percentage change are different quantities. Without comparable controls and other conditions, the difference cannot be attributed to the tool. Training likewise asks whether both data checks and exception routing are covered, not whether a course name or correct answer predicts training success."
      }
    ]
  },
  {
    "id": "worktech-score",
    "title": {
      "zh": "16题怎样计分？四个小计与全部解析",
      "en": "How are sixteen items scored? Four subtotals and every worked answer"
    },
    "paragraphs": [
      {
        "zh": "每题答对记1，答错记0，四组各0—4题，总计0—16题；不加权、不反向、不计时，也没有速度奖励或部分分。按交接、协作条件、共享工作、工作变化顺序，2、4、0、3合计9／16。2／4只说明这组四题答对两题，不是协作等级、员工可靠性、招聘通过概率或人群百分位。",
        "en": "Each correct answer counts one and each incorrect answer zero. Four subtotals range from zero to four, and the total from zero to sixteen, without weighting, reversal, timing, speed rewards or partial credit. In handover, settings, shared-work and work-change order, 2, 4, 0, 3 sum to 9/16. Two of four describes those items, not a collaboration grade, employee reliability, hiring probability or population percentile."
      },
      {
        "zh": "16题全部完成后，逐题保留你的选择、正确答案和解析，四份各五节复习指南全部显示，共20节。零分、部分答对或满分都不影响阅读；同分的两组也无需分型或加赛。这是有答案键的练习，不套用角色测验“只展示最高匹配”的规则。缺答或未知选项不生成结果，也不自动补为错误答案。",
        "en": "After sixteen complete answers, every selection, key and explanation appears with all four five-section revision guides: twenty sections. Zero, partial or perfect counts do not restrict reading, and equal subtotals require no type or runoff. This keyed practice does not use character quizzes’ highest-match rule. Missing or unknown selections produce no result and are not silently filled as wrong answers."
      }
    ]
  },
  {
    "id": "worktech-review",
    "title": {
      "zh": "怎样复习错题？把漏看的条件变成检查步骤",
      "en": "How should errors be reviewed? Turn a missed condition into a checking step"
    },
    "paragraphs": [
      {
        "zh": "先把错题归到具体步骤：是否抄错字段、漏掉批准状态、没有求完整时间交集、只用了一个筛选条件，或混淆分子分母。再用一句话说明每个错误选项违反了哪条要求。例如U4的问题是未批准，不是时间不够新；编辑者的问题是多授了能力，不是没有评论能力。这样复习的是理由，而不是选项字母。",
        "en": "Locate the missed step: copying a field, filtering approval, fitting the full time window, combining filters or distinguishing numerator from denominator. Then state which requirement each distractor violates. U4 fails approval, not recency; Editor adds capability, rather than lacking comments. This reviews reasons instead of memorising option letters."
      },
      {
        "zh": "可以在纸上改一个无敏感信息的条件再推一遍：把会议时长改成40分钟，原30分钟交集就不够；把所需动作加上编辑，原评阅者就不再满足。每次改变后重新列条件，不假设旧答案仍成立。这个可选练习不上传数据，也不证明真实工作表现已改善；读过答案后的重做提高，还可能来自记忆与熟悉。",
        "en": "Optionally change one non-sensitive condition on paper and reason again. A forty-minute meeting cannot fit the original thirty-minute overlap; adding editing to required actions makes Reviewer insufficient. Relist conditions rather than assume the old answer survives. This optional exercise uploads no data and establishes no improvement in job performance; a higher retake score can also reflect memory and familiarity."
      }
    ]
  },
  {
    "id": "worktech-evidence-access",
    "title": {
      "zh": "题本依据、适用范围与完整免费使用",
      "en": "Questionnaire basis, interpretation scope and complete free access"
    },
    "paragraphs": [
      {
        "zh": "记录、能力表、虚构权限、数字、干扰项及解析由费马独立编写。参考区保留亚利桑那职业探索课程的背景出处，[1] 但课程背景不等于本题本经过官方对齐、认证或验证。答案能由题面条件复算，与已建立测量信度、效度、常模是不同问题；本卷尚未建立这些证据，也没有中英文测量等价证据。",
        "en": "FermatMind independently authored records, capability tables, fictional permissions, quantities, distractors and explanations. The reference area retains the Arizona career-exploration curriculum as background,[1] without claiming official alignment, certification or validation. Recomputable answer keys differ from established reliability, validity or norms. Those evidence bases and English–Chinese measurement equivalence are unestablished for this bank."
      },
      {
        "zh": "本卷用于个人知识练习与复习，不提供软件版本认证、招聘通过线、生产率基准或职业消失预测。真实工作还涉及实际操作、组织权限、业务数据与团队情境；不应把这16道文字题扩大成全面岗位胜任结论，也不要把公司的私密记录输入测验。",
        "en": "This bank supports individual knowledge practice and revision without software-version certification, hiring cutoffs, productivity benchmarks or occupation-loss forecasts. Real work also involves actual operation, organisational permissions, business data and team context. Sixteen text tasks cannot establish comprehensive job competence, and private workplace records should not be entered."
      },
      {
        "zh": "约8分钟是阅读估计，没有倒计时。16题、全部答案和四份完整指南免费，点击开始直接作答。答案在浏览器计分，主动保存才建立本标签页24小时草稿，完成、重测或退出清除即删除。分享仅复制公开测试链接，不含答卷、答对数或私人工作资料；也可以先读公开指南再决定是否作答。",
        "en": "About eight minutes is a reading estimate without a countdown. Sixteen items, all answers and four complete guides are free, and Start opens questions directly. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft cleared on completion, retake or exit-and-clear. Sharing copies a public test link without answers, counts or private work data. Public guides can be read before deciding whether to answer."
      }
    ]
  }
];

export const workplaceTechnologyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这16题需要操作真实办公软件吗？",
      "en": "Do these sixteen items require real office-software operation?"
    },
    "answer": {
      "zh": "不需要。题面给出虚构功能表与规则，只在四个选项中选择，不连接账号或更改真实设置。",
      "en": "No. Supplied fictional features and rules determine a choice among four options, without connecting accounts or changing settings."
    }
  },
  {
    "question": {
      "zh": "最新文件为什么不一定是交接引用的版本？",
      "en": "Why is the newest file not necessarily the handover reference?"
    },
    "answer": {
      "zh": "本题规定引用最新已批准版本。先排除草稿，再在已批准版本中比较时间，所以U3符合，时间更晚的U4不符合。",
      "en": "The item requires the latest approved version. Exclude drafts before comparing eligible times, making U3 valid while newer draft U4 is not."
    }
  },
  {
    "question": {
      "zh": "30分钟会议为什么不能选09:45—10:15？",
      "en": "Why does 09:45–10:15 fail for the thirty-minute meeting?"
    },
    "answer": {
      "zh": "虽然时长为30分钟，却超出安娜10:00结束的空闲窗口；双方交集只有09:30—10:00 UTC。",
      "en": "It lasts thirty minutes but exceeds Ana’s availability ending at 10:00. The shared window is only 09:30–10:00 UTC."
    }
  },
  {
    "question": {
      "zh": "异步协作是不是总比实时会议更好？",
      "en": "Is asynchronous collaboration always better than a live meeting?"
    },
    "answer": {
      "zh": "不是。本题给定无共同工作时间、需要书面记录且不要求即时讨论，因此异步任务板符合；条件改变需要重新判断。",
      "en": "No. The item specifies no overlapping hours, a written record and no immediate discussion, making the shared asynchronous board suitable. Different conditions require reconsideration."
    }
  },
  {
    "question": {
      "zh": "评阅者与编辑者都能评论，为什么选评阅者？",
      "en": "Why choose Reviewer when Editor can also comment?"
    },
    "answer": {
      "zh": "题目要求满足需要的最少能力。评阅者已能阅读和评论，编辑者额外加入不需要的编辑能力；实际产品角色另查。",
      "en": "The item requires the least capability meeting the need. Reviewer already reads and comments; Editor adds unnecessary editing. Actual product roles need separate checking."
    }
  },
  {
    "question": {
      "zh": "任务节省10分钟就说明需要更少员工吗？",
      "en": "Does saving ten task minutes establish lower staffing needs?"
    },
    "answer": {
      "zh": "不能。45到35分钟只描述题定任务总时长；没有业务量、需求与人员配置等数据，无法确定人数变化。",
      "en": "No. Forty-five to thirty-five minutes describes the supplied task total. Staffing change cannot be determined without workload, demand and staffing information."
    }
  },
  {
    "question": {
      "zh": "错误率从20%到10%能证明工具有效吗？",
      "en": "Does an error-rate change from twenty to ten percent prove tool effectiveness?"
    },
    "answer": {
      "zh": "不能。两周错误数都是2，分母从10变20；算术变化成立，但没有对照和其他条件就不能确定原因。",
      "en": "No. Both weeks have two errors, with denominators of ten and twenty. The arithmetic holds, but no control or other conditions establish causation."
    }
  },
  {
    "question": {
      "zh": "四项2、4、0、3会显示什么？",
      "en": "What appears for subtotals of 2, 4, 0 and 3?"
    },
    "answer": {
      "zh": "总计9／16，四项小计、全部16题所选与解析、四份各五节指南全部保留，不分协作能力等级。",
      "en": "A total of 9/16 appears with four subtotals, all sixteen selections and explanations, and four five-section guides, without a collaboration ability grade."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要同意、填邮箱或购买报告吗？",
      "en": "Must I agree again, enter an email or buy a report after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入16题，所有答案与完整复习指南免费，无需额外同意、邮箱、注册或前置测试。",
      "en": "No. Start opens sixteen questions directly. All answers and complete revision guides are free without another agreement, email, signup or prerequisite test."
    }
  }
];
