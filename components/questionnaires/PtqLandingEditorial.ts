import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const ptqSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Overthinking and the PTQ: a process, three components and four readings",
      "zh": "过度思考与PTQ：一个过程、三个部分、四篇读法"
    },
    "paragraphs": [
      {
        "en": "Overthinking is an everyday description, not a diagnosis. This page uses the 15-item Perseverative Thinking Questionnaire (PTQ) to organise self-reported repetitive negative thinking. Its focus is how thinking repeats, intrudes and becomes difficult to leave, together with perceived unproductiveness and occupied attention. It does not ask you to reveal the subject of a private thought. [1]",
        "zh": "“过度思考”是日常描述，不是诊断。本页采用15项重复思维问卷（PTQ），整理自报的重复消极思维：思考如何反复出现、不请自来、难以转开，以及自觉无益和注意被占用的体验。作答无需透露私密想法的具体内容。[1]"
      },
      {
        "en": "Your complete result contains a total and three component sums, with four full readings available before or after answering. These are four views of the same questionnaire, not four competing personality types. You can read the method, the worked calculation and the individual guides without registering or completing another test.",
        "zh": "完整结果包含一个总分与三个部分之和；四篇读法均可在作答前后直接阅读。它们是同一问卷的四个观察角度，不是互相竞争的四种人格类型。无需注册或先完成其他测试，即可查看方法、复算示例与各篇指南。"
      }
    ]
  },
  {
    "id": "reference",
    "title": {
      "en": "Answer about typical thinking, with the same reference throughout",
      "zh": "按通常思考方式回答，整份保持同一参照"
    },
    "paragraphs": [
      {
        "en": "The published instruction concerns how you typically think about negative experiences or problems. Keep that reference across all fifteen statements. This form does not introduce a past-two-weeks window, a single stressful event or a required number of minutes spent thinking. Read each statement rather than treating the title as an instruction to report every kind of careful thought.",
        "zh": "原指示关注面对负面经历或问题时通常怎样思考。十五项均保留这一参照，不增加“过去两周”、某一次压力事件或每天思考分钟数的要求。请逐条阅读陈述，不因标题中的“过度思考”而把所有认真思考都算进去。"
      },
      {
        "en": "The five numeric anchors run from Never to Almost always, coded 0–4. An added unscored choice lets you decline or mark uncertainty. Zero is a substantive answer; unscored is missing information. A response can be revised before completing the questionnaire, and there are no right answers or desired totals.",
        "zh": "五级数值选项由“从不”到“几乎总是”，记为0—4。新增的不计分选项用于暂不回答或无法判断。0是一种实质回答，不计分则是资料缺失。完成前可以修改选择，没有正确答案，也没有应当达到的总分。"
      }
    ]
  },
  {
    "id": "core",
    "title": {
      "en": "Core characteristics: repetition, intrusion and difficulty disengaging",
      "zh": "核心特征：重复、不请自来与难以转开"
    },
    "paragraphs": [
      {
        "en": "Nine items belong to the core component: 1, 2, 3, 6, 7, 8, 11, 12 and 13. Their complete sum ranges from 0 to 36. They are interleaved with the other components, so taking the first nine questions would use the wrong grouping. This page preserves the published item order and the actual grouping.",
        "zh": "核心部分包括第1、2、3、6、7、8、11、12、13项，九项齐全时合计范围为0—36。它们与其他部分交错排列，直接取前九题会用错分组。本页保留已发表的题序与实际题号分组。"
      },
      {
        "en": "For a fictional example, compare revisiting a message to verify a newly available detail with reopening the same message while feeling unable to leave it. The questionnaire gives language for noticing a process; it does not decide which description fits a real event or establish that an unwanted thought reflects an intention, weak will or a permanent identity.",
        "zh": "以虚构例子说明：重新打开消息核对新出现的细节，与感觉无法转开、反复打开同一条消息，可能是不同体验。问卷提供观察过程的语言，不替真实事件判定类别，也不把不想要的想法解释为行动意图、意志薄弱或永久身份。"
      }
    ]
  },
  {
    "id": "unproductive",
    "title": {
      "en": "Perceived unproductiveness: the experience of getting little help from thinking",
      "zh": "自觉无益：感觉思考没有带来多少帮助"
    },
    "paragraphs": [
      {
        "en": "Items 4, 9 and 14 form a three-item sum from 0 to 12. The word unproductive concerns the person’s experience of thinking, not employment output, intelligence or motivation. The questionnaire does not check whether a solution was objectively possible or whether information, resources or another person’s decision were missing.",
        "zh": "第4、9、14项形成三题和，范围为0—12。“无益”指本人对思考过程的体验，不是工作产出、智力或动机评价。问卷不核查问题在客观上能否解决，也不知道是否缺少信息、资源或他人的决定。"
      },
      {
        "en": "Imagine repeatedly guessing why an application has not received a reply. Repeating the possibilities does not itself reveal the status. A factual enquiry might add information if appropriate, but this example is not a prescription to contact someone or a judgment that uncertainty is your fault. Read the sum alongside the actual situation.",
        "zh": "例如反复猜一份申请为什么没有回复，重复可能原因本身并不能揭示实际进度。情境允许时，事实查询也许带来新信息；例子不规定你必须联系谁，也不把不确定归咎于你。应把本组和与具体处境放在一起理解。"
      }
    ]
  },
  {
    "id": "attention",
    "title": {
      "en": "Occupied attention: a self-report, not a cognitive performance test",
      "zh": "注意力被占用：主观报告，而非认知表现测试"
    },
    "paragraphs": [
      {
        "en": "Items 5, 10 and 15 form a separate sum from 0 to 12. They concern the experience that repetitive thinking takes attention from other activities. No reading-speed task, memory test or reaction-time measurement takes place. The number cannot be interpreted as a percentage of attention lost or as an objective capacity score.",
        "zh": "第5、10、15项另成一组，合计范围为0—12，关注反复思考似乎从其他活动中占去注意的体验。页面不进行阅读速度、记忆或反应时测试，数值不能解释为损失了多少百分比注意力，也不是客观能力分。"
      },
      {
        "en": "A fictional reader may reach the end of a notice while still occupied by a concern. That illustrates an experience, not proof of its cause. The form cannot distinguish every contribution of the environment, fatigue, task difficulty or other circumstances, and it does not establish ADHD or a neurological condition.",
        "zh": "虚构读者可能读到通知末尾，仍被一件担忧占着心思。这是在说明体验，并非证明成因。问卷不能分清环境、疲劳、任务难度或其他处境的所有影响，也不据此判定ADHD或神经系统状况。"
      }
    ]
  },
  {
    "id": "calculation",
    "title": {
      "en": "Read the arithmetic without turning it into a rank",
      "zh": "读懂计算，不把原始和变成排名"
    },
    "paragraphs": [
      {
        "en": "All numeric items add their displayed value without reversal. For the complete response pattern in the method section, the three sums are 18, 6 and 5, and the total is 29. Check the item grouping before adding. Neither 29/60 nor 18/36 is a population percentile, diagnostic probability or percent of a person who is an overthinker.",
        "zh": "所有数值回答按所示值直接相加，不反向。方法区完整作答示例的三个和为18、6、5，总分为29。相加前先核对题号分组。29/60或18/36都不是人群百分位、诊断概率，也不是一个人有多少百分比“属于过度思考者”。"
      },
      {
        "en": "The nine-item core component has a larger possible range than either three-item component. A larger raw sum can therefore reflect the number of questions rather than a more prominent problem. This edition does not select a strongest component, assign severity bands or borrow thresholds from another rumination or worry questionnaire.",
        "zh": "九题核心部分的可取范围大于另外两个三题部分；原始和较大可能体现题量差异，不能据此选出最突出的问题。本版不指定最强部分、不划严重程度档，也不借用其他反刍或担忧问卷的阈值。"
      }
    ]
  },
  {
    "id": "missing",
    "title": {
      "en": "Incomplete information and repeat attempts",
      "zh": "资料暂缺与重复作答怎样理解"
    },
    "paragraphs": [
      {
        "en": "One unscored answer withholds its own component and the overall total. Other fully answered components remain available. Selecting unscored for all statements still finishes the form and opens every reading. This website rule avoids filling missing answers with zeros or estimating a total; it is not a new validated missing-data method.",
        "zh": "任一不计分回答使所在部分与总分暂缺，其余回答齐全的部分仍保留。全部选择不计分也能完成并阅读每篇全文。本网站以此避免将缺失补成0或推算总分；这不是一种新近验证的缺失数据处理方法。"
      },
      {
        "en": "For example, changing only item 4 to unscored in the worked pattern leaves the core sum 18 and attention sum 5 intact; the unproductiveness sum and total are withheld. On a later attempt, compare wording, reference, context and individual answers first. A changed total alone does not show treatment success, worsening or a meaningful amount of change.",
        "zh": "例如把复算示例中第4项改为不计分，核心和18、注意占用和5仍保留；自觉无益和与总分暂缺。日后重做时，应先比较措辞、参照、处境与逐项选择。总分变化本身不证明治疗有效、情况恶化或达到有意义的变化量。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Research evidence belongs to a specific version and use",
      "zh": "研究证据属于具体版本与用途"
    },
    "paragraphs": [
      {
        "en": "The original development paper studied German and English versions and supported a general factor with three related components. It also identified limits of brief subscales and reliance on self-report. Research associations do not make this web result an individual diagnosis or establish a clinical cutoff. [1]",
        "zh": "原开发论文研究德文与英文版，支持一个一般因子及三个相关部分，也指出简短分量表和自报资料的限制。研究中的关联不会使本网页结果成为个人诊断，也不据此建立临床判定线。[1]"
      },
      {
        "en": "Translation requires its own investigation. A French validation study retained ten items with different component organisation, illustrating why findings cannot simply be transferred across languages. This page retains the original fifteen-item grouping; its new Chinese working translation and web adaptations have not established equivalent measurement properties. [4]",
        "zh": "翻译需要单独研究。一项法文验证研究保留十项，并采用不同的部分组织，说明测量结论不能在语言间直接移用。本页仍保留原十五项分组；新的中文工作译文和网页改编尚未建立等价测量证据。[4]"
      }
    ]
  },
  {
    "id": "use",
    "title": {
      "en": "Use the reading as context for observation or support",
      "zh": "把读法用于观察或支持对话"
    },
    "paragraphs": [
      {
        "en": "You can privately note a situation, whether thinking brought new information and whether it interfered with something you wanted to do. This is an optional observation, not a treatment exercise or an obligation to record distressing details. Stop if it adds distress. No private thought content needs to be entered or included in a public link.",
        "zh": "可以私下记一件事：思考是否带来新信息，是否影响了原本想做的活动。这只是可选观察，不是治疗练习，也不要求记录令人痛苦的细节；加重困扰时可以停止。无需在这里输入私密想法，也不必放进公开链接。"
      },
      {
        "en": "If thinking is distressing, persistent or affecting daily life, a qualified professional can consider the wider circumstances regardless of the score. A small sum does not rule out difficulties, and a large one does not identify their cause or prescribe treatment. The result has no hiring, intelligence, personality-type or career-fit interpretation.",
        "zh": "思考持续令人困扰或影响日常时，无论分数多少，合格专业人士都可以结合更广的处境了解情况。较小和不能排除困难，较大和也不识别成因或规定治疗。结果不产生招聘、智力、人格类型或职业适配解释。"
      }
    ]
  }
];
export const ptqFaq = [
  {
    "question": {
      "en": "Is this the same as an RRS or RTSQ rumination test?",
      "zh": "这与RRS、RTSQ反刍测试一样吗？"
    },
    "answer": {
      "en": "No. This page uses PTQ15 and its three-component grouping. RRS and RTSQ have different wording, response scales and structures. Similar topic names do not make scores convertible.",
      "zh": "不同。本页使用PTQ15及其三部分分组。RRS、RTSQ的题目、选项尺度和结构不同；主题名称接近，不表示分数可以换算。"
    }
  },
  {
    "question": {
      "en": "Does repetitive thinking always mean something is wrong?",
      "zh": "反复思考就说明有问题吗？"
    },
    "answer": {
      "en": "No. Reviewing information can be useful. PTQ concerns a self-reported negative thinking process and its experienced effects; it does not judge every real thought or decide whether a situation requires further action.",
      "zh": "不一定。回顾信息可以有用。PTQ关注自报的消极思考过程及所体验的影响，不裁定每一个真实想法，也不决定现实问题是否仍需处理。"
    }
  },
  {
    "question": {
      "en": "Why not name the highest subscale as my type?",
      "zh": "为什么不把最高分量表叫作我的类型？"
    },
    "answer": {
      "en": "The core component has nine items, while the other two have three each. Their raw ranges differ, and all three are related views of the same process. This edition provides neither a type assignment nor a component ranking.",
      "zh": "核心部分有九题，另外两部分各三题，原始范围不同；它们是同一过程的相关角度。本版不分派类型，也不给三个部分排名。"
    }
  },
  {
    "question": {
      "en": "What does 29 out of 60 mean?",
      "zh": "29/60是什么意思？"
    },
    "answer": {
      "en": "It is the total of the fictional fifteen-response example, not a typical score or a threshold. Use the actual three item groups to reproduce 18 + 6 + 5 = 29. It is not a percentile, diagnosis probability or percentage of attention lost.",
      "zh": "这是虚构十五项算例的总和，不是典型分或阈值。按实际三组题号可复算18 + 6 + 5 = 29；它不是百分位、诊断概率或注意力损失百分比。"
    }
  },
  {
    "question": {
      "en": "Can a change in score demonstrate improvement?",
      "zh": "分数变化能证明改善吗？"
    },
    "answer": {
      "en": "Not on its own. This web edition has not established measurement error or a meaningful-change threshold. Compare reference, circumstances and answers; do not use repeated attempts as a treatment verdict.",
      "zh": "不能单凭变化判断。本网页版尚未建立测量误差或有意义变化阈值，应比较参照、处境及回答，不把重做结果当作治疗判决。"
    }
  },
  {
    "question": {
      "en": "Does occupied attention measure my concentration ability?",
      "zh": "注意占用部分测的是专注能力吗？"
    },
    "answer": {
      "en": "It records your reported experience of thinking taking attention from other activities. No objective attention task is administered, and the sum cannot establish an impairment, neurological condition or work restriction.",
      "zh": "它记录思考似乎从其他活动中占去注意的自报体验。没有客观注意任务，不能用本和认定损害、神经状况或工作限制。"
    }
  },
  {
    "question": {
      "en": "Is there an agreement screen before the questions?",
      "zh": "开始前还要再点击同意吗？"
    },
    "answer": {
      "en": "No. Start test opens the first statement directly. Saving a tab draft is optional and is not required to answer. All full public readings are also available without completing the questionnaire.",
      "zh": "不需要。点击开始直接打开第一项；标签页草稿保存是可选项，不是作答条件。所有完整公开读法也可在不完成问卷的情况下阅读。"
    }
  },
  {
    "question": {
      "en": "Must I describe the thoughts that bother me?",
      "zh": "必须描述令我困扰的想法吗？"
    },
    "answer": {
      "en": "No. Select the response that fits each statement; no private thought text is requested. You can choose unscored when uncertain or unwilling to answer, and the complete reading library remains open.",
      "zh": "无需描述。逐项选择符合情况的选项即可，不索取私密想法文字。无法判断或不愿答可选不计分，完整读法库仍开放。"
    }
  }
];
export const ptqSummaries: Record<string, Text> = {
  "total-reading": {
    "en": "Follow the fifteen-item total back to its three sums, the 29-point fictional example and strict missing-answer rule. Read what research and a web self-report can support.",
    "zh": "从十五项总分追溯三个和，复算虚构29分示例及严格缺答规则，理解研究与网页自报分别能支持什么。"
  },
  "core-reading": {
    "en": "Read the nine interleaved items on repetition, intrusion and disengagement, with an 18/36 example and contrasting message-review situations.",
    "zh": "阅读重复、不请自来与难以转开的九项交错分组，结合18/36算例及消息复核的不同情境理解。"
  },
  "unproductive-reading": {
    "en": "Interpret the three-item 6/12 example as perceived help from thinking, with an application-delay scenario and distinctions from productivity or intelligence.",
    "zh": "以三项6/12算例理解思考自觉有没有帮助，结合申请延误情境，区分工作生产率与智力评价。"
  },
  "mental-capacity-reading": {
    "en": "Understand a 5/12 self-reported attention example, the reading-notice scenario and why the result is not an objective cognitive test.",
    "zh": "理解5/12的自报注意占用算例、阅读通知情境，以及它为何不等于客观认知测试。"
  }
};
