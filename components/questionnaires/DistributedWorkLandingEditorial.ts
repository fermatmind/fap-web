import type { Questionnaire } from "@/lib/questionnaires/types";
export const distributedLandingSections: Questionnaire["guide"] = [
  {
    "id": "distributed-purpose",
    "title": {
      "en": "Distributed work choices: four ways of coordinating, without a readiness grade",
      "zh": "分布式协作选择回顾：四类协调行动，分别理解"
    },
    "paragraphs": [
      {
        "en": "This original reflection compares handover context, visible task state, answerable help requests and workable reply windows. Each pair presents two useful actions and asks where your attention usually went first. It records relative choices within these particular situations, rather than how often you perform either action in daily life. Choosing a handover action does not establish that you neglect task updates.",
        "zh": "本原创回顾比较交接背景、任务状态可见、可回答的求助请求与可行回复窗口。每组呈现两种有用行动，询问你通常先把注意力放在哪里。它记录的是这些特定情境中的相对选择，而不是两种行动在日常生活中的绝对频率。选择交接行动，并不能证明你忽略任务更新。"
      },
      {
        "en": "Complete 24 bilingual pairs in about six minutes, with no time limit. Read four complete public guides before or after answering; an entirely unscored attempt still leaves every guide available. The result keeps selected, other-action and unscored counts separate for each theme. It does not select a winning style, assign a remote-worker identity or certify readiness.",
        "zh": "完成24组双语配对预计约六分钟，不限时。四篇完整公开指南在作答前后都可阅读；即使整份未计分，也能读到全部全文。结果分别保留各主题的选中、选择另一行动与未计分次数，不选出胜出风格、不分配远程工作者身份，也不认证准备程度。"
      }
    ]
  },
  {
    "id": "distributed-context",
    "title": {
      "en": "Use one arrangement and the same past-four-week reference",
      "zh": "固定一种协作安排，以过去四周为参照"
    },
    "paragraphs": [
      {
        "en": "Think about one work, study or volunteer arrangement during the past four weeks. Keep that arrangement in mind throughout, rather than changing between your most independent project and your most closely supervised one. Recall what you actually attended to first, not an ideal worker or what an employer might prefer. Different task dependencies, authority, tools and access to colleagues can change which action is feasible.",
        "zh": "请回想过去四周的一种工作、学习或志愿协作安排，整份保持同一参照，不在最独立的项目与监督最密集的项目之间切换。回忆实际先关注什么，不代入理想员工或雇主可能偏好的答案。任务依赖、职责权限、工具与同伴可联系程度，都可能改变哪种行动可行。"
      },
      {
        "en": "When both actions fit, compare which tended to come first in that arrangement. When neither fits, both are equally relevant, there is no relevant instance, comparison is impossible or you prefer not to answer, choose the supplied unscored option. Do not invent a workplace experience to complete a pair. All 24 responses must be explicit, but selecting the unscored option is a valid response rather than a wrong answer.",
        "zh": "两种行动都符合时，比较在该安排中哪一种通常先出现。两者都不符合、同样相关、没有对应经历、无法比较或不愿回答时，选择所提供的未计分选项，无需为完成题目编造职场经历。24组都需要明确回应，但选择未计分是有效回应，不是答错。"
      }
    ]
  },
  {
    "id": "distributed-handover-visibility",
    "title": {
      "en": "Handover context and visible task state answer different questions",
      "zh": "交接背景与状态可见，解决不同协调问题"
    },
    "paragraphs": [
      {
        "en": "Handover context concerns information another person needs to continue: what has been decided, which source matters and what remains unresolved. For example, a short handover may explain why a draft uses one assumption and where its supporting material is stored. Visible task state concerns the current shared picture: what is underway, what has changed and what is awaiting action. A status update can be accurate while still lacking the background needed to take over.",
        "zh": "交接背景关注另一人继续推进所需的信息：已经决定什么、哪项依据重要、还有什么未解决。例如，简短交接可以说明草稿为何采用某个假设，以及支持材料放在哪里。状态可见关注当前共享图景：什么正在进行、什么发生变化、什么等待行动。状态更新可以准确，同时仍缺少接手所需背景。"
      },
      {
        "en": "The same task may need both actions at different moments. A teammate taking over tomorrow may need the reasoning behind a decision, while colleagues coordinating today may first need to know that the next milestone has moved. A relative preference in this bank does not decide which action is better, whether your actual messages are clear or whether the team can find its records. Check those questions against real examples and authorized feedback.",
        "zh": "同一任务在不同时点可能需要两种行动。明天接手的同伴可能需要决策理由，今天协调的成员则可能先需要知道下一里程碑已调整。本题组中的相对侧重，不决定哪种行动更好，也不判断实际消息是否清楚、团队能否找到记录；这些问题要结合真实实例与获授权反馈核对。"
      }
    ]
  },
  {
    "id": "distributed-help-windows",
    "title": {
      "en": "Answerable requests and reply windows: clarity without constant availability",
      "zh": "求助可回答、回复有窗口：明确协作条件"
    },
    "paragraphs": [
      {
        "en": "An answerable help request makes the decision or obstacle specific enough for another person to respond: the relevant context, what has already been tried and the particular input needed. For example, asking which of two stated conditions applies differs from sending only “I am stuck.” This illustration is a practical communication prompt, not a scored item, a universal message template or evidence that every delay is caused by the requester.",
        "zh": "可回答的求助请求，会把决策点或障碍说到足以让另一人回应：相关背景、已经尝试什么，以及具体需要哪项输入。例如，询问两项明示条件中适用哪一项，与只发“我卡住了”不同。这是沟通观察例子，不是计分题、通用消息模板，也不说明每次延误都由求助者造成。"
      },
      {
        "en": "A workable reply window makes expectations and availability explicit across schedules: when a response is needed, when someone is available and what happens if the usual contact cannot respond. It is not the shortest possible response time. In a distributed team, a useful request and an agreed window can work together; urgent or complex issues may require a synchronous conversation under the team’s actual procedures. GitLab’s guidance treats asynchronous and synchronous communication as a contextual balance. [1][3]",
        "zh": "可行回复窗口，让不同日程之间的期待与可联系时段明确：何时需要回复、何时方便回应，以及通常联系人无法回应时如何处理。它不等于尽可能短的回复时间。分布式团队中，清楚请求与约定窗口可以配合；紧急或复杂问题可能需要按团队实际流程同步沟通。GitLab的实践指南也强调结合情境平衡异步与同步交流。[1][3]"
      }
    ]
  },
  {
    "id": "distributed-counts",
    "title": {
      "en": "How the 12 opportunities per theme become three counts",
      "zh": "每主题十二次出现机会，怎样形成三类计数"
    },
    "paragraphs": [
      {
        "en": "The four themes form six distinct pairings, and each pairing appears four times. Each theme therefore appears in 12 pairs: six times as option A and six as option B. Choosing its action adds one selected count to that theme and one other-action count to the paired theme. An unscored response adds one unscored count to each of the two themes. For each theme, selected + other-action + unscored always equals 12.",
        "zh": "四主题形成六种不同配对，每种出现四次。因此，每主题出现在12组中，分别有六次位于A、六次位于B。选择某主题行动，该主题选中次数加一，配对主题的选择另一行动次数加一。未计分回应则给两主题各加一次未计分。每主题“选中＋选择另一行动＋未计分”恒为12。"
      },
      {
        "en": "For example, 8 selected, 3 other-action and 1 unscored accounts for all 12 appearances of one theme. The denominator is 12 opportunities for that theme, not all 24 pairs. This is not an eight-point ability score or a population percentile. Counts are linked by the paired format; they are not independent trait measurements that can be summed into a remote-work score.",
        "zh": "例如，一个主题选中8次、选择另一行动3次、未计分1次，正好覆盖其全部12次出现。分母是该主题的12次机会，不是整份24组。这不是能力得8分，也不是人群百分位。配对形式使各主题计数相互关联，不能视为独立特质测量，再相加成远程工作总分。"
      }
    ]
  },
  {
    "id": "distributed-coverage",
    "title": {
      "en": "Read coverage and examples before comparing counts",
      "zh": "比较计数前，先看回答覆盖与具体实例"
    },
    "paragraphs": [
      {
        "en": "Six selected with six other-action responses is different from six selected with six unscored responses. The first includes 12 comparisons; the second includes only six scored comparisons. Missing comparison information is not evidence of low ability or absence of the action. An entirely unscored theme has no usable relative-choice information, even though its public guide remains available.",
        "zh": "选中六次、选择另一行动六次，与选中六次、未计分六次不同：前者完成12次比较，后者仅有六次计分比较。缺少比较信息，不是能力低或没有该行动的证据。一个主题全部未计分时，没有可用的相对选择信息，但其公开指南仍可完整阅读。"
      },
      {
        "en": "Choosing A throughout or B throughout produces six selected and six other-action counts for every theme because positions are balanced. That is a property of this design, not evidence of a balanced personality. One-count differences have no established measurement-error threshold here. Comparing people, teams, languages or repeated attempts would require evidence beyond these counts; a changed count alone cannot separate changed circumstances, interpretation and behavior.",
        "zh": "全选A或全选B，都会使每主题各有六次选中与六次选择另一行动，这是选项位置平衡带来的设计性质，不是人格均衡的证据。本页没有已建立的一次计数差异测量误差阈值。跨个人、团队、语言或重复作答比较，需要计数以外的证据；计数改变本身无法区分情境、理解与行为的变化。"
      }
    ]
  },
  {
    "id": "distributed-evidence",
    "title": {
      "en": "Research on distributed collaboration and evidence for this inventory",
      "zh": "分布式协作研究，与本题组证据分开看"
    },
    "paragraphs": [
      {
        "en": "GitLab’s public handbook supplies organizational practices for documented context, asynchronous work and deciding when a meeting is useful. [1][3] Yang and colleagues studied collaboration among 61,182 US Microsoft employees around the early-2020 move to firm-wide remote work. The authors report changes in collaboration networks and communication modes; their public research summary explains the comparison and its assumptions. [2] These are different forms of evidence: company practice guidance and an organizational study.",
        "zh": "GitLab公开手册提供记录背景、异步工作及判断会议是否有用的组织实践。[1][3] Yang等研究者考察了61,182名美国微软员工在2020年初全面转向远程工作前后的协作，报告协作网络与沟通方式的变化；作者公开研究摘要说明了比较方法与假设。[2] 两者属于不同证据：企业实践指南与组织层面的研究。"
      },
      {
        "en": "Neither source validates these 24 original pairs. Findings from one employer during a pandemic do not establish how any individual will perform or which response is universally preferable. This bank has not established reliability, factor structure, norms, criterion validity or English–Chinese measurement equivalence. Balanced item positions and reproducible arithmetic establish design and counting properties, not hiring prediction, honesty detection or a calibrated readiness classification.",
        "zh": "这些来源都不验证本页24组原创配对。疫情期间单一雇主的发现，不足以判断某个人未来表现，也不确定哪种回应普遍更好。本题组尚未建立信度、因素结构、常模、效标效度或英中文测量等值。位置平衡与可复算算术说明设计和计数性质，不证明招聘预测、诚实识别或经校准的准备程度分类。"
      }
    ]
  },
  {
    "id": "distributed-use-privacy",
    "title": {
      "en": "Use a concrete coordination question and keep the record private",
      "zh": "转成具体协调问题，保留私人作答"
    },
    "paragraphs": [
      {
        "en": "Choose one recent, non-sensitive example to discuss: could the next person identify the current task state, locate the necessary context, understand the requested decision and know a feasible reply window? Try one small change within your authority, then ask whether it helped the actual handover. Success is clearer coordination in that situation, not increasing a selected count. Do not paste confidential work messages, colleague details or customer information into the exercise.",
        "zh": "可选一个近期、非敏感实例来讨论：下一人能否识别当前任务状态、找到必要背景、理解所请求的决策，并知道可行回复窗口？在职责权限内尝试一项小调整，再核对是否帮助了实际交接。效果是该情境中协调更清楚，而不是选中次数上升。不要把保密工作消息、同事资料或客户信息粘贴进练习。"
      },
      {
        "en": "Start opens the first pair directly; there is no additional agreement step. Answers are counted in the current browser. Progress saving is optional and off by default; explicitly saved tab progress expires after 24 hours and is cleared on completion, exit-and-clear or retaking. Refreshing without saving loses the attempt. Copying the public entry shares only the page title and URL, not responses or counts.",
        "zh": "点击开始直接进入第一组配对，没有额外同意步骤。作答在当前浏览器内计数。保存进度为默认关闭的可选功能；主动保存的本标签页进度24小时后失效，完成、退出清除或重测会删除。不保存而刷新会丢失本次作答。复制公开入口仅分享页面标题与网址，不分享回答或计数。"
      }
    ]
  }
];
export const distributedLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What situation should I recall?",
      "zh": "应该回想哪种情境？"
    },
    "answer": {
      "en": "Use one work, study or volunteer arrangement from the past four weeks. If you lack a relevant example, use the unscored option instead of answering as an imagined ideal worker. Availability, authority and task dependencies belong to the interpretation.",
      "zh": "以过去四周的一种工作、学习或志愿协作安排为参照。没有相关实例时，选择未计分，不必代入想象中的理想员工。可联系条件、权限与任务依赖都应纳入解释。"
    }
  },
  {
    "question": {
      "en": "Why is each theme counted out of 12, not 24?",
      "zh": "为什么每主题以12次而非24次为分母？"
    },
    "answer": {
      "en": "There are 24 pairs, but any one theme appears in only 12 of them. Its selected, other-action and unscored counts cover those 12 appearances. A skipped pair contributes unscored information to both themes in that pair.",
      "zh": "整份有24组，但某一主题只出现于其中12组。该主题的选中、选择另一行动与未计分，覆盖这12次出现。一组未计分会同时计入该组两主题的未计分次数。"
    }
  },
  {
    "question": {
      "en": "Does choosing the other action mean I never do this one?",
      "zh": "选择另一行动，意味着我从不做这个行动吗？"
    },
    "answer": {
      "en": "No. The choice concerns which action usually drew attention first in the supplied comparison. Both may occur in the same task. Read a lower selected count alongside other-action and unscored counts and check concrete examples, rather than interpreting it as an absent skill.",
      "zh": "不意味着。配对比较的是通常哪种行动先引起注意，同一任务中两种行动都可能发生。选中较少时，应一起阅读选择另一行动、未计分次数与具体实例，不把它解释为缺少某项技能。"
    }
  },
  {
    "question": {
      "en": "Can two equally useful actions both be true?",
      "zh": "两种同样有用的行动可以同时符合吗？"
    },
    "answer": {
      "en": "Yes. The format asks for a relative first focus. If they were equally relevant and you cannot distinguish their order, the unscored option is available. It preserves uncertainty instead of forcing an artificial distinction.",
      "zh": "可以。本形式询问相对先关注哪一项。两者同样相关、无法区分先后时，可用未计分选项保留不确定性，无需制造差异。"
    }
  },
  {
    "question": {
      "en": "Does a reply-window count reward being online all the time?",
      "zh": "回复窗口次数是在奖励全天在线吗？"
    },
    "answer": {
      "en": "No. Workable windows concern explicit, feasible expectations across schedules. They do not measure speed or require constant availability. Actual urgent issues should follow the team’s agreed procedures, including synchronous communication when appropriate. [1][3]",
      "zh": "不是。可行窗口关注不同日程之间明确、可实现的期待，不测回复速度，也不要求持续在线。真实紧急事项应按团队约定流程处理，必要时同步沟通。[1][3]"
    }
  },
  {
    "question": {
      "en": "Can this result be converted into MBTI or a remote-readiness score?",
      "zh": "能换算为MBTI或远程工作准备分数吗？"
    },
    "answer": {
      "en": "No conversion is defined. These four relative coordination themes differ from personality preferences and from inventories of preparation actions. Similar wording does not create shared constructs, comparable scales or interchangeable results.",
      "zh": "本页没有定义这种换算。四类相对协调主题，不同于人格偏好，也不同于准备行动盘点。用词相近不代表构念相同、尺度可比或结果可互换。"
    }
  },
  {
    "question": {
      "en": "Can employers rank applicants using these counts?",
      "zh": "雇主能用这些次数给求职者排名吗？"
    },
    "answer": {
      "en": "This bank has no established hiring validity, norms or pass mark. Counts should not determine selection, promotion or performance judgments. If a team discusses coordination, voluntary discussion of concrete work arrangements is more informative than assigning people a count-based label.",
      "zh": "本题组尚无已建立的招聘效度、常模或通过线，次数不应用于决定录用、晋升或绩效判断。团队讨论协调时，自愿围绕具体工作安排交流，比按次数给个人贴标签更有信息价值。"
    }
  },
  {
    "question": {
      "en": "Will starting, refreshing or copying publish my answers?",
      "zh": "开始、刷新或复制，会公开我的答案吗？"
    },
    "answer": {
      "en": "Starting enters the first pair directly. Default answers stay in page memory; saving is an optional tab-only feature with a 24-hour expiry. Unsaved progress is lost on refresh. Copy public entry includes the public title and URL only. Public guides contain the same explanatory text for everyone.",
      "zh": "开始直接进入第一组。默认回答留在页面内存；保存为可选的本标签页功能，24小时到期。未保存的进度刷新后丢失。复制公开入口只含公开标题与网址；公开指南为人人相同的解释文本。"
    }
  }
];
export const distributedLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Yang et al. — The effects of remote work on collaboration among information workers (author research summary)",
      "zh": "Yang等：远程工作对信息工作者协作的影响（作者研究摘要）"
    },
    "url": "https://www.microsoft.com/en-us/research/publication/the-effects-of-remote-work-on-collaboration-among-information-workers/"
  },
  {
    "title": {
      "en": "GitLab Handbook — Communication",
      "zh": "GitLab手册：沟通实践"
    },
    "url": "https://handbook.gitlab.com/handbook/communication/"
  }
];
