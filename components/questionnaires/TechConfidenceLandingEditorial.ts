import type { Questionnaire } from "@/lib/questionnaires/types";

export const techConfidenceLandingSections: Questionnaire["guide"] = [
  {
    "id": "tech-confidence-scope",
    "title": {
      "en": "What the Tech Savvy Test asks: confidence with six small tasks",
      "zh": "技术素养自评测什么？六种小任务的信心"
    },
    "paragraphs": [
      {
        "en": "This original six-item form asks about the past month: finding a first control, checking a step, choosing necessary features, repeating a demonstration, explaining a sticking point and testing a reversible example. Rate how confident you feel about each stated situation. You do not have to demonstrate an operation, answer a knowledge question or upload a file.",
        "zh": "这份原创六题问卷回顾过去一个月：找到基本控件、核对步骤、选择必要功能、重复演示、说明卡点，以及尝试可撤销示例。分别评价对指定情境有多大把握；不要求演示操作、回答知识题或上传文件。"
      },
      {
        "en": "Digital competence covers more than confidence. The European Commission’s JRC describes DigCompSat as addressing knowledge, skills and attitudes across five areas. [1] This six-item form is not DigCompSat, a DigComp level assessment or a shortened equivalent. Its mean summarizes only your selected confidence ratings.",
        "zh": "数字能力包含的内容比信心更多。欧盟委员会联合研究中心介绍，DigCompSat涉及五个领域的知识、技能与态度。[1] 本六题问卷不是DigCompSat、DigComp等级测评或其等价短版；均值只概括你选择的信心评价。"
      }
    ]
  },
  {
    "id": "tech-confidence-start",
    "title": {
      "en": "Finding a control and checking an unexpected step",
      "zh": "找到控件与核对异常步骤"
    },
    "paragraphs": [
      {
        "en": "The first statement concerns beginning a small task in an unfamiliar app with harmless sample data. The second concerns comparing one setting or step when a tool behaves differently from its instructions. Starting and troubleshooting are different moments; a confident start does not establish that you can resolve every later problem.",
        "zh": "第一条关注用无敏感信息的示例数据，在陌生应用中开始一个小任务；第二条关注工具表现与说明不同时，一次比较一个设置或步骤。开始操作与排查问题属于不同阶段，有把握开始不代表能够解决之后的所有问题。"
      },
      {
        "en": "For example, finding a sample calendar’s new-event control and checking why a fictional appointment appears on the wrong day are separate observations. A remembered successful attempt can inform your rating, but the page does not verify the output. Device layout, language and accessible controls may affect what you have had an opportunity to try.",
        "zh": "例如，在示例日历中找到新建事件控件，与核对虚构约会为何显示在错误日期，是两项不同观察。回忆一次成功操作可以帮助评价，但页面不会验证输出。设备布局、语言和控件可访问性可能影响你有机会尝试什么。"
      }
    ]
  },
  {
    "id": "tech-confidence-choose",
    "title": {
      "en": "Choosing features and repeating a demonstration",
      "zh": "选择功能与重复演示"
    },
    "paragraphs": [
      {
        "en": "The third statement asks whether you feel able to describe the features needed for a small personal task. The fourth asks about repeating a new operation after a brief demonstration with your own notes. Neither asks how many apps you know, how much you spend on software or whether you can work without help.",
        "zh": "第三条询问是否有把握说清小型个人任务所需的功能；第四条询问看过简短演示后，能否借助自己的笔记重复新操作。两条都不询问认识多少应用、购买多少软件，或能否完全不靠帮助工作。"
      },
      {
        "en": "Suppose you want to sort three invented entries: identifying the need to sort is different from remembering the menu sequence after a demonstration. Keep the task size and available notes in view. The six ratings do not certify feature-selection expertise or measure memory capacity.",
        "zh": "例如要排列三个虚构条目，辨认“需要排序”与看演示后记住菜单步骤是不同事情。评价时保留任务大小和笔记条件；六项自评不认证功能选择的专业性，也不测量记忆能力。"
      }
    ]
  },
  {
    "id": "tech-confidence-help",
    "title": {
      "en": "Explaining a sticking point and checking a reversible example",
      "zh": "说明卡点与核对可撤销示例"
    },
    "paragraphs": [
      {
        "en": "The fifth statement concerns describing the goal, current step and needed help without revealing private data. The sixth concerns trying a small reversible example before relying on an unfamiliar tool for something important. These ask about perceived confidence in bounded actions, not general independence or a guarantee of safe tool use.",
        "zh": "第五条关注在不暴露隐私数据的前提下说明目标、当前步骤和所需帮助；第六条关注把陌生工具用于重要事情之前，先做可撤销的小示例。它们询问对有限行动的主观把握，不评判总体独立程度，也不保证工具使用安全。"
      },
      {
        "en": "An invented help request might say that a sample table is not sorting as expected, name the menu already tried and ask which control to inspect. No real document, account name or screenshot is required here. Asking for help can be part of the task rather than evidence of poor competence.",
        "zh": "虚构求助可以这样描述：示例表格未按预期排序，说明已经试过哪个菜单，再询问应核对哪个控件。本页不需要真实文档、账户名称或截图。求助可以是任务的一部分，不能据此认定能力不足。"
      }
    ]
  },
  {
    "id": "tech-confidence-arithmetic",
    "title": {
      "en": "Read the raw sum, rated count and one-decimal mean together",
      "zh": "把原始和、数字项数与一位小数均值一起读"
    },
    "paragraphs": [
      {
        "en": "All six prompts need either a numeric choice or an explicit unscored response. Add only the 1–5 ratings; with at least four numeric ratings, divide their sum by their count and round to one decimal. There are no reverse items, weights or proficiency bands. For 2, 3, 4, 4, 5 and one unscored response, the sum is 18, the count is five and the mean is 3.6.",
        "zh": "六题都需选择数字或明确不计分回答。只把1至5相加；至少四项数字时，原始和除以数字项数，四舍五入保留一位小数。没有反向题、权重或熟练度档位。例如2、3、4、4、5及一个不计分回答，原始和18、数字项数5、均值3.6。"
      },
      {
        "en": "Three means somewhat confident in this form, unlike quizzes where a midpoint means uncertainty. An unscored response contributes neither zero nor three. With fewer than four ratings, the result states that a mean is not calculated while leaving the full general guide available. Four is an editorial coverage rule, not an empirically validated pass mark.",
        "zh": "本问卷的3表示“有一定把握”，与将中间选项定义为不确定的其他问卷不同。不计分回答既不补0，也不补3。少于四项数字时明确不计算均值，仍保留完整通用指南。四项是编辑覆盖规则，不是经过实证验证的通过线。"
      }
    ]
  },
  {
    "id": "tech-confidence-comparison",
    "title": {
      "en": "Equal averages can hide different task coverage",
      "zh": "相同均值可能覆盖不同任务"
    },
    "paragraphs": [
      {
        "en": "Four ratings of 4 with two unscored responses and six ratings of 4 both yield 4.0, but describe different coverage. Six 3s and the pattern 1, 2, 3, 4, 4, 4 both yield 3.0, while their individual answers differ. Read the response record rather than treating an average as six demonstrated strengths.",
        "zh": "四个4加两项不计分，与六个4，均值都是4.0，但覆盖范围不同。六个3与1、2、3、4、4、4的均值都是3.0，逐项回答却不同。应结合回答记录阅读，不把平均数当作六种已经证明的长处。"
      },
      {
        "en": "A later difference cannot separate practice, a new app, changed support or a different understanding of the response anchors. This edition has no established measurement error, reliable-change threshold or population norms. It cannot rank you against other users, predict earnings or decide suitability for a job.",
        "zh": "之后数值不同，无法区分练习、新应用、支持条件变化，或对选项理解不同等原因。本版尚未建立测量误差、可靠变化阈值或人群常模；不能据此给用户排名、预测收入或决定岗位适合度。"
      }
    ]
  },
  {
    "id": "tech-confidence-use",
    "title": {
      "en": "An optional small comparison, not a training prescription",
      "zh": "一个可选的小比较，不是训练处方"
    },
    "paragraphs": [
      {
        "en": "If useful, choose a harmless task you actually want to do. State an expected output, try it with invented entries and compare the result. You could arrange three sample calendar events or sort three fictional rows. Keep the example reversible and separate from important accounts or private files.",
        "zh": "若有用，可以选一项你确实想做、不会涉及敏感信息的小任务：说明预期输出，用虚构条目尝试，再对照结果。例如排列三个示例日历事件，或给三行虚构数据排序。示例保持可撤销，与重要账户和私人文件分开。"
      },
      {
        "en": "You may stop after reading, ask for a demonstration or leave the task untried. This suggestion is not a requirement to buy a tool or prove improvement. Open University course materials distinguish reflecting on digital confidence from choosing and using tools for real tasks. [2] Completing this page does not award their badge or any certificate.",
        "zh": "可以只阅读、请人演示，也可以不尝试。这项建议不要求购买工具或证明进步。英国开放大学课程将回顾数字信心与为实际任务选择、使用工具分别列为学习内容。[2] 完成本页不会获得该校徽章或任何证书。"
      }
    ]
  },
  {
    "id": "tech-confidence-evidence",
    "title": {
      "en": "Research scope, complete reading and optional progress",
      "zh": "研究范围、全文阅读与自愿保存进度"
    },
    "paragraphs": [
      {
        "en": "The six prompts and their equal-weight arithmetic are original editorial choices. No reliability, validity, cross-language equivalence or calibration to an external digital-skills framework has been established for this edition. External standards clarify what a broader assessment would need to cover; they do not validate this particular score.",
        "zh": "六条题目和等权算式属于原创编辑选择。本版尚未建立信度、效度、跨语言等值，或与外部数字技能框架的标定。外部标准帮助说明更广泛测评应覆盖什么，不会自动验证这个具体分数。"
      },
      {
        "en": "The complete public guide is available before answering. Calculation occurs in the browser. Saving progress is optional, lasts up to 24 hours in this tab and clears on completion, retake or exit-and-clear. Copying shares a general reading label and public link, without answers, sum or mean; a public guide is not a private score report.",
        "zh": "答题前即可阅读完整公开指南，在浏览器中计算。保存进度由你主动选择，在本标签页最长保留24小时，完成、重测或退出清除后删除。复制仅包含通用读法名称和公开链接，不含回答、原始和或均值；公开指南不是私人分数报告。"
      }
    ]
  }
];
export const techConfidenceLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does a 3 mean in this form?",
      "zh": "本问卷的3是什么意思？"
    },
    "answer": {
      "en": "Somewhat confident about the stated task. It is a numeric rating, not uncertainty, an error or a digital-skills level.",
      "zh": "表示对指定任务“有一定把握”，属于数字评价，不表示不确定、答错或某个数字技能等级。"
    }
  },
  {
    "question": {
      "en": "Does skipping mean I lack the skill?",
      "zh": "不评分是否表示我不会？"
    },
    "answer": {
      "en": "No. No recent opportunity or preferring not to rate is explicitly unscored. It is excluded from the sum and denominator without inferring a reason.",
      "zh": "不表示。近期没有机会或不想评价明确不计分，从原始和与分母排除，不推断原因。"
    }
  },
  {
    "question": {
      "en": "Why show the count beside the mean?",
      "zh": "为什么均值旁边还显示数字项数？"
    },
    "answer": {
      "en": "The count shows coverage. Four ratings and six ratings can give the same average while covering different tasks; compare the actual choices as well.",
      "zh": "数字项数显示覆盖范围。四项与六项可能得到相同均值，却覆盖不同任务，应连同具体选项阅读。"
    }
  },
  {
    "question": {
      "en": "Is this a short DigCompSat or a certification test?",
      "zh": "这是DigCompSat短版或认证考试吗？"
    },
    "answer": {
      "en": "Neither. These six original confidence prompts are not mapped to DigComp levels and do not inherit another instrument’s validation. No certificate is issued. [1]",
      "zh": "都不是。六条原创信心题未与DigComp等级标定，也不继承其他工具的验证结论，不颁发证书。[1]"
    }
  },
  {
    "question": {
      "en": "Do I need to install an app or submit a file?",
      "zh": "需要安装应用或提交文件吗？"
    },
    "answer": {
      "en": "No. Answer about the task descriptions. No password, private file, live account action or software purchase is needed.",
      "zh": "不需要。根据任务描述评价即可，无需密码、私密文件、真实账户操作或购买软件。"
    }
  },
  {
    "question": {
      "en": "Can this mean show whether I improved?",
      "zh": "均值能证明我进步了吗？"
    },
    "answer": {
      "en": "Not by itself. Task familiarity, available help and interpretation of the scale may change. The edition has no validated change threshold.",
      "zh": "仅凭均值不能。任务熟悉度、可用帮助和选项理解可能变化，本版没有经过验证的变化阈值。"
    }
  },
  {
    "question": {
      "en": "Can I read everything without completing the form?",
      "zh": "不完成问卷能否阅读全部说明？"
    },
    "answer": {
      "en": "Yes. The same complete continuous guide is public, including worked examples and optional observations. It is available even when a completed attempt has too few numeric ratings.",
      "zh": "可以。同一份完整连续读法公开开放，包含算例和可选观察；完成后数字项数不足时也仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Does a higher confidence rating guarantee safe tool use?",
      "zh": "信心较高是否能保证工具使用安全？"
    },
    "answer": {
      "en": "No. The page does not inspect tools, verify outputs or assess security practices. Check an actual task and its conditions separately from how confident you feel.",
      "zh": "不能。页面不检查工具、验证输出或评估安全操作，应将实际任务及其条件与主观信心分别核对。"
    }
  }
];
export const techConfidenceLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "European Commission JRC: DigComp-based assessment tools (background)",
      "zh": "欧盟委员会JRC：基于DigComp的测评工具（背景）"
    },
    "url": "https://joint-research-centre.ec.europa.eu/scientific-activities/key-competences-lifelong-learning/digital-competence-framework-digcomp/digcomp-based-assessment-and-monitoring-tools_en"
  },
  {
    "title": {
      "en": "Open University: Digital skills course learning outcomes",
      "zh": "英国开放大学：数字技能课程学习目标"
    },
    "url": "https://www.open.edu/openlearn/digital-computing/digital-skills-succeeding-digital-world"
  }
];
