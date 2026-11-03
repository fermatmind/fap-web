import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const workEthicsSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Work ethics and reliability: four specific task-habit readings",
      "zh": "工作伦理与可靠性：四组具体任务习惯"
    },
    "paragraphs": [
      {
        "en": "This Work Ethics & Reliability Test is an original 24-statement reflection on the past four weeks. Six statements address each group: keeping and renegotiating agreements, checking work before handover, accurate updates and attribution, and following through on a correction within your control. Read each group separately, with its own six responses and complete explanation.",
        "zh": "工作伦理和可靠性测试是一份回顾过去四周的24项原创自评。履行与重新商定约定、交付前核对、如实说明与署名、控制范围内的修正跟进，各有六项陈述。每组分别呈现六项回答与完整解释，帮助把笼统的“做事是否可靠”拆成具体可回看的任务习惯。"
      },
      {
        "en": "Work-related concepts such as dependability, integrity and attention to detail appear in O*NET and OPM descriptions. Those public definitions help explain the topic; they do not establish that these four editorial groups form a validated psychological model. This page records selected responses rather than observing conduct or verifying a workplace incident. [1][2]",
        "zh": "O*NET与OPM的公开描述涉及可靠履约、诚信和细节关注等工作概念，可帮助理解主题；这些定义并不能证明本站四个编辑题组构成已验证的心理模型。本页记录所选回答，不观察实际行为，也不核实工作事件。[1][2]"
      }
    ]
  },
  {
    "id": "agreements",
    "title": {
      "en": "Agreements: feasibility, dependencies and a timely update",
      "zh": "履约与重新商定：可行性、依赖与及时更新"
    },
    "paragraphs": [
      {
        "en": "The first six statements follow an agreement from accepting it to handing it over. They ask about checking the deliverable and time, reviewing existing commitments and notifying affected people when a plan changes. Saying yes quickly and making a feasible agreement are different actions; a change can call for renegotiation rather than a larger promise.",
        "zh": "前六项沿着接下约定、执行和交接的过程展开，涉及核对交付物与时间、查看已有承诺，以及计划改变时通知受影响的人。迅速答应与形成可行约定是两件事；条件变化时，可能需要重新商定，而非再作更大的保证。"
      },
      {
        "en": "For a fictional study project, a reference file expected on Monday arrives on Wednesday. An update can distinguish the part still deliverable on Tuesday, the blocked part and the date that now needs agreement. This example concerns coordination. It cannot determine who caused the delay or require one person to absorb every dependency through extra work.",
        "zh": "例如一项虚构学习项目需要的资料原定周一到达，实际周三才到。更新时可区分周二仍能交的部分、受阻部分及需要重新商定的日期。这个例子讨论协作信息，不裁定延误责任，也不要求一个人通过额外工作承担所有外部依赖。"
      }
    ]
  },
  {
    "id": "checks",
    "title": {
      "en": "Handover checks: an agreed criterion and a performed check",
      "zh": "交付前核对：商定条件与实际检查"
    },
    "paragraphs": [
      {
        "en": "Items 7–12 concern completion criteria, details the recipient needs, unclear requirements and known errors. A check is meaningful in relation to a use: can the recipient open the file, identify its version and understand the units? Merely labelling work reviewed does not describe which check was actually carried out.",
        "zh": "第7—12项涉及完成条件、接收方需要的细节、含糊要求和已知错误。核对应联系使用目的：对方能否打开文件、辨认版本、理解单位？仅标注“已复核”，并没有说明实际做过哪项检查。"
      },
      {
        "en": "A fictional handover could have a correct total but an omitted unit. Checking the unit addresses that specific problem; repeatedly changing colours may leave it unresolved. These items describe checking habits, not technical mastery, the defect rate of real work or a requirement to keep polishing indefinitely.",
        "zh": "虚构交接表格可能加总正确却漏写单位。核对单位能处理这个具体问题，反复换颜色却可能仍未解决。本组描述核对习惯，不测技术熟练度、不计算真实成果缺陷率，也不要求无限打磨。"
      }
    ]
  },
  {
    "id": "updates",
    "title": {
      "en": "Updates and attribution: status, source, uncertainty and permission",
      "zh": "如实说明与署名：状态、来源、不确定与许可"
    },
    "paragraphs": [
      {
        "en": "Items 13–18 distinguish work completed from work underway, identify another person’s contribution, state uncertainty and check whether sharing is permitted. An update can be accurate while leaving restricted details undisclosed. The topic is how a claim is communicated, rather than an honesty certificate about the person making it.",
        "zh": "第13—18项区分已完成与进行中、注明他人贡献、说明不确定性，并核对分享是否获准。说明可以准确，同时不披露受限细节。本组关注说法怎样被传达，不给发言者颁发诚实证明。"
      },
      {
        "en": "For example: “The draft is ready; the figures came from the team; one assumption still needs checking.” This separates three states that “all done” would blur. A useful reflection asks whether the recipient could understand the status, without uploading a colleague’s work, revealing restricted information or treating a questionnaire answer as proof of misconduct.",
        "zh": "例如：“草稿已完成；数字由团队提供；其中一项假设仍需核对。”这区分了被“全做完了”混在一起的三种状态。反思可关注接收方能否理解状态，无需上传同事作品、披露受限信息，也不能把问卷回答当成不当行为证据。"
      }
    ]
  },
  {
    "id": "repair",
    "title": {
      "en": "Repair: your contribution, a feasible action and a stopping point",
      "zh": "跟进修正：自身部分、可行行动与结束条件"
    },
    "paragraphs": [
      {
        "en": "Items 19–24 ask about examining your part after a setback, explaining known impact, taking an agreed correction within your control and checking whether it addressed the problem. Responsibility can be bounded: identifying your own input does not make every consequence or unrelated system failure yours to fix.",
        "zh": "第19—24项询问受挫后核对自身部分、说明已知影响、采取控制范围内的商定修正，以及核对问题是否得到处理。责任可以有边界：确认自己的输入，不意味着所有后果或无关系统问题都由自己修复。"
      },
      {
        "en": "If you added a duplicate to a fictional shared list, a bounded correction identifies the duplicate, uses an authorised edit and checks that the intended record remains. If access is missing, the next step can be asking for the required permission. A blocked action is not by itself proof of avoidance; record what the constraint was before interpreting a response.",
        "zh": "假设你向虚构共享清单新增了重复项，范围明确的修正可以指出重复位置、采用获准编辑并确认所需记录仍在。缺少访问权限时，下一步可能是申请所需许可。行动受阻本身不能证明逃避；理解回答前先辨认具体限制。"
      }
    ]
  },
  {
    "id": "arithmetic",
    "title": {
      "en": "How to reproduce the four means",
      "zh": "四组均分怎样复算"
    },
    "paragraphs": [
      {
        "en": "Each group contains six statements. Keep the selected value for its first, second, fourth and fifth positions; for the third and sixth positions use 6 minus the selected value. Across the form these reverse items are 3, 6, 9, 12, 15, 18, 21 and 24. Add the six contributions, divide by six and round once to one decimal.",
        "zh": "每组六项：第一、二、四、五项保留所选数值；第三、第六项按“6减所选值”反向处理。全题本反向题为第3、6、9、12、15、18、21、24项。六项贡献相加后除以六，最后四舍五入保留一位小数。"
      },
      {
        "en": "For example, raw values 4, 4, 2, 5, 4, 4 become 4, 4, 4, 5, 4, 2. The sum is 23 and 23 / 6 is about 3.8333, displayed as 3.8 / 5. This is an arithmetic description of coded choices, not 76% reliability, a percentile or a probability of meeting a future deadline. Reverse coding aligns wording; it does not detect deception.",
        "zh": "例如原选值4、4、2、5、4、4转换为4、4、4、5、4、2，合计23；23除以六约3.8333，显示3.8 / 5。这是对处理后选项的算术描述，不是“76%可靠”、人群百分位或未来按期交付的概率。反向处理用于统一措辞方向，不检测欺骗。"
      }
    ]
  },
  {
    "id": "opportunity",
    "title": {
      "en": "Never, no opportunity and an unavailable mean",
      "zh": "从未、没有机会与暂不给均分"
    },
    "paragraphs": [
      {
        "en": "Use Never when a relevant opportunity occurred but the described action did not happen. Use the unscored option when there was no opportunity, you cannot judge or you prefer not to answer. The same distinction applies to reverse-worded statements: consider the behaviour as written before selecting its frequency.",
        "zh": "有相关机会，但没有发生所述行动时，选择“从未”；没有机会、无法判断或不愿回答时，选择不计分。反向陈述同样如此：先按题面理解具体行为，再选发生频率，不必自己倒转选项。"
      },
      {
        "en": "All six numeric answers are required for a group mean. One unscored answer leaves that group with 5/6 numeric responses and no mean; other complete groups remain available. Even 24 unscored answers can finish and open all four guides. This completeness policy neither imputes zero nor interprets a skip as suspicious, and it is not a research-validated missing-data cutoff.",
        "zh": "本组六项数值完整才显示均分。一项不计分时，本组保留5/6项数值回答并暂不给均分，其他完整组仍可显示。即使24项全部不计分，也能完成并阅读四篇指南。这个完整性规则不补零、不把跳题当作可疑，也不是经研究验证的缺失数据阈值。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Conceptual background and evidence for this questionnaire",
      "zh": "概念背景与本题本的测量证据"
    },
    "paragraphs": [
      {
        "en": "O*NET describes occupational work styles and provides ratings about occupations. OPM describes competencies within its own assessment. Those sources support definitions of related concepts; neither source supplies this original 24-item bank, its four-group structure, scoring thresholds or bilingual validation. [1][2]",
        "zh": "O*NET描述职业工作风格，所提供评分针对职业；OPM介绍其自身测评中的胜任力。两者支持相关概念的定义，但都不提供本站原创24题、四组结构、计分阈值或双语验证。[1][2]"
      },
      {
        "en": "This edition has no established reliability, factor structure, criterion validity, norms or English–Chinese measurement equivalence. Deterministic scoring makes the calculation reproducible but does not establish those properties. Repeated self-ratings, peer reports and observed task outcomes answer different questions; this page does not combine them into a validated employee grade.",
        "zh": "本版尚未建立信度、因素结构、效标效度、常模或英中测量等价性。确定的计分规则让计算可复算，却不能证明这些性质。重复自评、他人评价与实际任务结果回答不同问题，本页不把它们合成为验证过的员工等级。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "Turn one reading into an observable task question",
      "zh": "把一组读法转成可观察的任务问题"
    },
    "paragraphs": [
      {
        "en": "Choose one ordinary recent task and one concrete question: was the changed date understood, was the required check performed, was uncertainty clear, or did a correction address its target? If useful, write one example supporting your answer and another that complicates it. Keep private names, files and incidents outside the questionnaire.",
        "zh": "选择一项近期普通任务和一个具体问题：更改的日期是否理解一致、所需检查是否实际完成、不确定性是否说清、修正是否处理目标问题？若有帮助，可各写一个支持回答和使判断更复杂的例子。私人姓名、文件及事件无需填入问卷。"
      },
      {
        "en": "Try a small change you can control, then check what actually happened. A later mean changing does not establish a change in character; recall, opportunity and task conditions may also have changed. Keep the four readings separate. Use the questionnaire for voluntary reflection rather than hiring, promotion, discipline, employee comparison or predicting misconduct.",
        "zh": "尝试一项自己可控制的小调整，再核对实际发生了什么。后来均分改变不能证明品格变化，因为记忆、机会与任务条件也可能变化。四组读法应分别理解，用于自愿反思，不用于录用、晋升、处分、员工比较或预测不当行为。"
      }
    ]
  }
];
export const workEthicsFaq = [
  {
    "question": {
      "en": "What are the four parts of this work-habit test?",
      "zh": "工作习惯测试分哪四部分？"
    },
    "answer": {
      "en": "Agreements, handover checks, accurate updates and attribution, and bounded repair each have six statements. They are separately reported editorial groups, not four employee types or an exhaustive model of work ethics.",
      "zh": "履约与重新商定、交付前核对、如实说明与署名、控制范围内的修正跟进，各六项。它们是分别呈现的编辑题组，不是四类员工，也不穷尽工作伦理。"
    }
  },
  {
    "question": {
      "en": "Can I answer if I am studying or volunteering?",
      "zh": "学习或志愿活动也能回答吗？"
    },
    "answer": {
      "en": "Yes. Use ordinary tasks from the past four weeks in work, study, volunteering or a shared project. Stay with a reasonably consistent context. An item without a relevant opportunity can remain unscored rather than becoming Never.",
      "zh": "可以。回看过去四周工作、学习、志愿活动或共同项目中的普通任务，尽量保持参照情境一致。没有相关机会的题可选不计分，不必选从未。"
    }
  },
  {
    "question": {
      "en": "How is 3.8 out of 5 calculated?",
      "zh": "3.8 / 5怎样计算？"
    },
    "answer": {
      "en": "Raw values 4, 4, 2, 5, 4, 4 become 4, 4, 4, 5, 4, 2 after reversing positions three and six. The sum is 23; dividing by six and rounding once gives 3.8. The number is not a reliability percentage.",
      "zh": "原值4、4、2、5、4、4在第三、第六位置反向后为4、4、4、5、4、2，合计23；除以六并保留一位小数得3.8。这个数不是可靠性百分比。"
    }
  },
  {
    "question": {
      "en": "Does one unscored response remove every result?",
      "zh": "一题不计分，会失去全部结果吗？"
    },
    "answer": {
      "en": "No. Only its own group withholds the mean. For example, a group with five numeric responses shows incomplete information, while another group with six can show its mean. All four complete guides remain available, including after an entirely unscored attempt.",
      "zh": "不会。只有所在组暂不给均分。例如一组五项数值回答显示资料不足，另一组六项完整时仍可显示均分。四篇完整指南始终可读，全部不计分也能完成。"
    }
  },
  {
    "question": {
      "en": "Should I add the four means to get an ethics score?",
      "zh": "需要把四组均分相加得到伦理总分吗？"
    },
    "answer": {
      "en": "No. This edition defines no overall score, lowest-group verdict, pass mark or ranked employee type. A mean refers only to its own six coded responses and their context.",
      "zh": "不需要。本版没有定义总分、最低组定论、通过线或员工排名类型。每个均分只对应本组六项处理后的回答及其参照情境。"
    }
  },
  {
    "question": {
      "en": "Are these the same as O*NET ratings or a commercial integrity test?",
      "zh": "这与O*NET评分或商业诚信测试一样吗？"
    },
    "answer": {
      "en": "No. O*NET describes work styles and occupational ratings; commercial instruments have their own items, norms and intended uses. This original four-week self-reflection does not inherit another instrument’s validation, screening rules or risk predictions.",
      "zh": "不同。O*NET描述工作风格并提供职业评分；商业工具有各自题目、常模与用途。本原创四周自评不继承其他工具的验证、筛选规则或风险预测。"
    }
  },
  {
    "question": {
      "en": "What does a change on retesting mean?",
      "zh": "重测时均分变化说明什么？"
    },
    "answer": {
      "en": "It records different coded responses. Opportunity, task type, recall and interpretation can also change. Without this edition’s measurement-error and retest evidence, a difference cannot be converted into a quantified improvement in character or reliability.",
      "zh": "它记录处理后的回答不同。机会、任务类型、记忆和理解也可能变化；缺少本版测量误差与重测证据时，不能将差值换算成品格或可靠性提升了多少。"
    }
  },
  {
    "question": {
      "en": "Does Start test require another agreement screen?",
      "zh": "点击开始测试还要再同意一次吗？"
    },
    "answer": {
      "en": "Start test opens the first statement directly. Saving a draft is optional and does not unlock questions or guides. You can choose unscored, leave the attempt, or read the four public guides without completing the form.",
      "zh": "点击开始测试直接打开第一项陈述。保存草稿是自选功能，不是解锁题目或指南的条件。可以选不计分、退出，或不作答直接阅读四篇公开指南。"
    }
  }
];
export const workEthicsSummaries: Record<string, Text> = {
  "commitments-reading": {
    "en": "Trace an agreement from feasible acceptance to a timely update: six-item arithmetic, a changed-deadline example and a bounded communication experiment.",
    "zh": "沿可行承诺、计划更新与交接阅读六项习惯，附反向计分、期限变化情境及范围明确的沟通尝试。"
  },
  "quality-reading": {
    "en": "Separate agreed completion criteria from the act of checking. A worked mean, missing-unit example and proportionate handover check keep the reading concrete.",
    "zh": "区分商定完成条件与实际核对，结合均分算例、单位遗漏情境与适度交接检查理解本组。"
  },
  "honesty-reading": {
    "en": "Distinguish completed work, shared contributions, uncertain claims and permitted disclosure, with a full arithmetic example rather than an honesty grade.",
    "zh": "区分完成状态、共同贡献、不确定说法与获准披露，附完整计算例子，不给诚实等级。"
  },
  "repair-reading": {
    "en": "Follow your contribution, known impact, feasible correction and verification. The guide separates bounded responsibility from accepting every blame.",
    "zh": "沿自身部分、已知影响、可行修正与核对阅读，区分有边界的责任与接受全部归责。"
  }
};
