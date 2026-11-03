import type { Questionnaire } from "@/lib/questionnaires/types";

export const fscrsLandingSections: Questionnaire["guide"] = [
  {
    "id": "fscrs-context-construct",
    "title": {
      "en": "What FSCRS measures: responses to setbacks, in three parts",
      "zh": "FSCRS测量什么：面对挫折的三类自我回应"
    },
    "paragraphs": [
      {
        "en": "FSCRS stands for Forms of Self-Criticising/Attacking and Self-Reassuring Scale. Gilbert and colleagues developed it to distinguish forms of self-criticism and self-support. Their 2004 development study involved 246 female students and also examined a separate measure of the functions of criticism. A form of response and its presumed purpose are different questions: this page does not infer why a response developed. [4]",
        "zh": "FSCRS是自我批评／攻击与自我安抚形式量表的英文缩写。Gilbert等开发它，以区分自我批评和自我支持的形式。2004年开发研究涉及246名女学生，也考察了另一份关于批评功能的工具。反应形式与推测的目的属于不同问题；本页不据此推断一种反应怎样形成。[4]"
      },
      {
        "en": "The three readouts concern feeling inadequate, rejecting or attacking oneself, and reassuring oneself. They describe responses endorsed in these statements, rather than three kinds of people. “Inner critic voice” is a familiar metaphor for self-directed thoughts and feelings here. The form neither records sound nor assesses hearing voices, and its three-part result cannot identify an underlying diagnosis.",
        "zh": "三个读数分别关注不足感、对自己的排斥或攻击，以及自我安抚，描述的是对这些陈述的认同，不是三种人。“内心批评家的声音”在这里是自我指向的想法与感受的通俗比喻；本问卷不录音、不评估听到声音的体验，三部分结果也不能识别某种诊断。"
      }
    ]
  },
  {
    "id": "fscrs-context-response",
    "title": {
      "en": "How to answer: similarity, not a four-week frequency count",
      "zh": "怎样作答：符合程度，不是四周发生频率"
    },
    "paragraphs": [
      {
        "en": "Think about how you respond when things go wrong or fall short of what you hoped. The source instructions do not impose a past-four-weeks recall window. Use that same reference across the attempt. The endpoints are 1, Not at all like me, and 5, Extremely like me; the three middle positions display numbers. These are ordered self-ratings, not recorded event counts, so a mean is descriptive rather than a percentage of days.",
        "zh": "请回想事情不顺、未达到期待时，自己怎样回应。来源指导语没有规定过去四周的回忆窗口，本次作答应保持同一参照。端点为1“完全不符合我”与5“非常符合我”，中间三档显示数字。这是有顺序的自我评价，不是事件记录，因此均值是描述数值，不是某种反应发生的天数比例。"
      },
      {
        "en": "You may choose unscored for any statement without explaining why. Leaving a question unanswered differs from explicitly skipping it: Next needs either a numeric choice or unscored. You may also stop and clear the attempt. There is no second agreement, account or payment step after Start. All three public explanations can be read without disclosing any answers.",
        "zh": "每条均可选不计分，无需说明理由。没有回答，不同于明确跳过：继续下一题需要选择数字或不计分，也可停止并清除本次回答。点击开始后没有第二次同意、账户或付款步骤；无需披露答案，也能阅读三篇公开完整解释。"
      }
    ]
  },
  {
    "id": "fscrs-context-parts",
    "title": {
      "en": "Inadequate, Hated and Reassured Self: read each on its own",
      "zh": "不足感、自我厌弃与自我安抚：分别阅读"
    },
    "paragraphs": [
      {
        "en": "The nine Inadequate Self statements concern disappointment, dwelling on failings and feeling not good enough. The five Hated Self statements include disgust, rejection and self-directed hostility. The eight Reassured Self statements concern supportive, accepting or encouraging responses after difficulty. The labels are names of parts of a questionnaire, not judgments of a person’s value. No part is reverse-scored to cancel another.",
        "zh": "不足感部分九条，关注失望、反复留意失误与觉得不够好；自我厌弃部分五条，涉及厌恶、排斥和指向自己的敌意；自我安抚部分八条，关注困难之后支持、接纳或鼓励自己的回应。名称属于问卷部分，不是对人的价值判断；不会把其中一部分反向计分来抵消另一部分。"
      },
      {
        "en": "Self-criticism and self-support may both be endorsed. For example, after an unfinished task a person may judge themselves harshly and still arrange food, rest or practical assistance. The reassurance responses do not erase the other report, and criticism responses do not prove that support was absent. Read the three means alongside an actual event rather than choosing the largest mean as a dominant personality.",
        "zh": "自我批评与自我支持可以同时被认同。例如，一项任务没有完成后，一个人可能严厉评价自己，同时仍安排饮食、休息或实际帮助。安抚回答不抹去另一部分的报告，批评回答也不证明支持不存在。应结合真实事件一起看三个均值，不以最大的均值选出主导人格。"
      }
    ]
  },
  {
    "id": "fscrs-context-calculation",
    "title": {
      "en": "Worked example: three sums, three means, no overall score",
      "zh": "完整算例：三项原始和、三个均值，没有总分"
    },
    "paragraphs": [
      {
        "en": "Following each part’s item order, example choices 5, 1, 4, 2, 5, 3, 4, 2, 5 give Inadequate Self 31/9 = 3.44 on screen. Choices 2, 4, 1, 3, 2 give Hated Self 12/5 = 2.40. Choices 4, 2, 5, 1, 4, 3, 5, 2 give Reassured Self 26/8 = 3.25. The screen rounds means to two decimal places. Their raw-sum ranges are 9–45, 5–25 and 8–40; all mean ranges are 1–5.",
        "zh": "按各部分内部题序，一组算例为：不足感选5、1、4、2、5、3、4、2、5，31除以9，页面显示3.44；自我厌弃选2、4、1、3、2，12除以5，显示2.40；自我安抚选4、2、5、1、4、3、5、2，26除以8，显示3.25。均值保留两位小数。三项原始和范围分别为9—45、5—25、8—40，均值范围均为1—5。"
      },
      {
        "en": "If statement nine is unscored in that example, Hated Self has four numeric responses and one skip; both its sum and mean are withheld. The complete Inadequate and Reassured parts keep their own results. This edition does not impute a response or average a partial part. It also provides no combined criticism total, reassurance-minus-criticism balance, severity band or population percentile.",
        "zh": "若算例中第九条改选不计分，自我厌弃部分有四条数字回答、一条跳过，其原始和与均值均不显示；完整的不足感与安抚部分仍保留各自结果。本版不代填，也不对不完整部分求平均，同时不提供合并批评总分、安抚减批评净值、严重程度分档或人群百分位。"
      }
    ]
  },
  {
    "id": "fscrs-context-versions",
    "title": {
      "en": "Why this edition starts at one while other forms start at zero",
      "zh": "为什么本版从1起，而其他表单从0起"
    },
    "paragraphs": [
      {
        "en": "The 2019 article’s measure description uses endpoints 1 and 5; that is the edition retained here. Other published forms use 0–4, including the form reproduced by Portland Psychotherapy. A nine-item sum coded 1–5 is nine points above the sum of the same nine positions coded 0–4, purely by arithmetic. That offset alone does not establish equivalent wording, administration, interpretation or norms. Check the actual form before comparing. [1][5]",
        "zh": "本页保留2019年论文测量说明中的1与5端点；其他公开表单使用0—4，包括Portland Psychotherapy所提供的表单。同样九个位置若由0—4改记1—5，九项合计仅按算术会多九分；这个偏移本身不能确立题文、施测、解释或常模等价。比较前应核对真实表单。[1][5]"
      },
      {
        "en": "The English statements follow the selected published table. The Chinese is a new working translation, not the Chinese version used in that international study. The unscored response, strict complete-part policy, descriptive means and public guides are website additions. The source attribution explains reproduction and adaptation under CC BY 4.0; that license and correct arithmetic do not validate a new translation or imply the authors endorse this website. [1][2][3]",
        "zh": "英文陈述依所选发表表格保留；中文是新的工作译文，不是该国际研究使用的中文版。不计分选项、部分完整才出分的政策、描述均值及公开指南属于网站新增。来源署名说明按CC BY 4.0复现与改编；许可和正确计算不能验证新译文，也不意味着作者为本网站背书。[1][2][3]"
      }
    ]
  },
  {
    "id": "fscrs-context-research",
    "title": {
      "en": "What international research establishes, and what it leaves open",
      "zh": "国际研究提供什么证据，又留下哪些问题"
    },
    "paragraphs": [
      {
        "en": "Halamová and colleagues’ 2019 study examined 7,714 responses in thirteen samples across twelve countries, testing whether the three subscales functioned comparably. Some pairwise comparisons did not support measurement equivalence. Self-report, socially desirable responding and different collection formats were among the limitations discussed. International research therefore supports investigating these constructs, not a claim that identical scores mean identical experiences in every language. [1]",
        "zh": "Halamová等2019年研究考察十二国十三个样本的7,714份回答，检验三个分量表能否作可比测量。部分样本配对不支持测量等价；作者讨论了自报、社会赞许回答与收集形式不同等限制。因此，国际研究支持继续研究这些概念，不支持声称相同分数在所有语言里都代表相同体验。[1]"
      },
      {
        "en": "This website has not established its own reliability, factor structure, norms, reliable-change threshold or English–Chinese measurement equivalence. A reproducible score answers how these selected responses are aggregated. Evidence for a particular interpretation or use is a separate question. Neither published group associations nor an individual readout determines diagnosis, treatment, employability or personal worth.",
        "zh": "本网站尚未建立本版信度、因子结构、常模、可靠变化阈值或英中测量等价。可复算分数回答这些选项怎样聚合，而某种解释或用途是否有证据属于另一问题。研究中的群体关联或个人读数，都不能决定诊断、治疗、岗位适任性或个人价值。"
      }
    ]
  },
  {
    "id": "fscrs-context-safety",
    "title": {
      "en": "Sensitive statements and support remain separate from scoring",
      "zh": "敏感陈述与支持，不依赖计分结论"
    },
    "paragraphs": [
      {
        "en": "Statement nine explicitly mentions wanting to hurt or injure oneself. Its wording is retained from the selected source, with a notice before answering and again at that statement. You can skip it, stop or use the support information without finishing. A Hated Self mean is not a safety assessment: a smaller number cannot rule out current danger, and a larger number cannot predict an individual’s actions.",
        "zh": "第九条明确提及想伤害自己，题文按所选来源保留，作答前及该条处均有提示。可以跳过、停止或直接查看支持信息，无需完成。自我厌弃均值不是安全评估：较小数值排除不了当前危险，较大数值也不能预测个人行动。"
      },
      {
        "en": "If your current safety is uncertain, prioritize real-time help over completing or interpreting the form. For ongoing distress, discuss the actual experience and its effect on daily life with an appropriate professional. You may describe one situation without sending a questionnaire record. The existing support text is available before, during and after answering; no score or consent screen is required to read it.",
        "zh": "若担心当前安全，应优先获得实时帮助，而非继续作答或解释结果。持续困扰时，可与合适的专业人员讨论实际体验及其日常影响；无需发送问卷记录，也能说明一个情境。现有支持文字在作答前、过程中和完成后均可阅读，无需分数或同意弹窗。"
      }
    ]
  },
  {
    "id": "fscrs-context-reflection",
    "title": {
      "en": "From a readout to a specific, optional observation",
      "zh": "从读数到一项具体、可选择的观察"
    },
    "paragraphs": [
      {
        "en": "Choose an ordinary setback you are comfortable considering. Separate what happened, the words used about yourself and the practical response that followed. For instance, “I missed one detail” names an event; a global insult adds a judgment that this test cannot prove. If useful, identify one factual correction and one believable supportive action. This is an optional reflection example, not a treatment protocol or a promise to improve a score.",
        "zh": "选择愿意回想的一次普通挫折，分清发生了什么、对自己用了什么话、随后采取了什么实际行动。例如，“我漏掉一个细节”描述事件，对整个人的侮辱则添加了本测验不能证实的判断。如有帮助，可以明确一项事实修正与一项自己相信的支持行动。这是自选反思示例，不是治疗方案或提高分数的承诺。"
      },
      {
        "en": "Answers stay in the current page’s memory. They are not placed in the URL, sent in scoring requests or saved as a draft; reload, leaving the page or changing language clears the attempt. Public links share the three guides, not private responses. If you repeat the form, record the version and relevant circumstances privately; a changed mean alone cannot establish improvement, deterioration or the cause of a change.",
        "zh": "答案仅留当前页面内存，不写入网址、不随计分请求上传，也不保存草稿；刷新、离开页面或切换语言会清除本次回答。公开链接分享三篇指南，不分享私人回答。重做时可私下记录版本与相关情境；仅凭均值改变，不能确立改善、恶化或变化原因。"
      }
    ]
  }
];

export const fscrsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Should I answer about the past four weeks?",
      "zh": "应当回答过去四周吗？"
    },
    "answer": {
      "en": "No fixed recall period is imposed by the selected source instructions. Think about your responses when things go wrong and keep the same reference throughout.",
      "zh": "所选来源指导语未规定固定回忆期限，请回想事情不顺时的回应，并全程保持同一参照。"
    }
  },
  {
    "question": {
      "en": "Are the middle choices frequency labels?",
      "zh": "中间选项是发生频率吗？"
    },
    "answer": {
      "en": "No. This edition displays the numbers 2, 3 and 4 between similarity endpoints 1 and 5. It does not relabel them Sometimes or Often.",
      "zh": "不是。本版在符合程度端点1与5之间显示数字2、3、4，不把它们改称有时或经常。"
    }
  },
  {
    "question": {
      "en": "Is Reassured Self reverse-scored?",
      "zh": "自我安抚会反向计分吗？"
    },
    "answer": {
      "en": "No. All three parts keep their own forward-coded responses. Self-support is not subtracted from criticism to produce a net score.",
      "zh": "不会。三部分保留各自正向编码的回答，不以自我支持减去批评产生净分。"
    }
  },
  {
    "question": {
      "en": "Does the largest mean identify my main inner critic?",
      "zh": "最大的均值能确定主要批评家类型吗？"
    },
    "answer": {
      "en": "No. The means describe different sets of statements and do not select a winning identity or a six-voice type.",
      "zh": "不能。均值描述不同题组，不选胜出身份，也不分六种声音类型。"
    }
  },
  {
    "question": {
      "en": "What happens if I skip statement nine?",
      "zh": "第九条跳过会怎样？"
    },
    "answer": {
      "en": "Only Hated Self becomes unscored; its sum and mean are withheld. Complete Inadequate and Reassured parts retain their results, and all guides remain readable.",
      "zh": "只有自我厌弃部分不计分，其原始和与均值均不显示；完整的不足感与安抚部分保留结果，全部指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Can I compare a 1–5 sum with a 0–4 form directly?",
      "zh": "1—5原始和能直接与0—4表单比较吗？"
    },
    "answer": {
      "en": "No. Coding, wording, completeness and reference samples must be checked first. A simple arithmetic offset does not validate a cross-form interpretation. [1][5]",
      "zh": "不能。应先核对编码、题文、完整程度与参照样本；简单算术偏移不能验证跨表单解释。[1][5]"
    }
  },
  {
    "question": {
      "en": "Will this page save a draft?",
      "zh": "本页会保存草稿吗？"
    },
    "answer": {
      "en": "No. Responses remain in page memory only and are cleared when reloading, leaving or changing language. Public guide links contain no answers.",
      "zh": "不会。回答仅留页面内存，刷新、离开或换语言会清除；公开指南链接不含答案。"
    }
  },
  {
    "question": {
      "en": "Does Start take me straight to the first statement?",
      "zh": "点击开始会直接进入第一条吗？"
    },
    "answer": {
      "en": "Yes. No second agreement, registration or payment is required. Sensitive-content and support information can be read without completing the test.",
      "zh": "会。无需第二次同意、注册或付款；敏感内容与支持信息不要求完成测验即可阅读。"
    }
  }
];

export const fscrsLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Gilbert et al. (2004): development study, original abstract",
      "zh": "Gilbert等（2004）：开发研究原始摘要"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/15005905/"
  },
  {
    "title": {
      "en": "Portland Psychotherapy: 0–4 FSCRS form and scoring key for comparison",
      "zh": "Portland Psychotherapy：供版本比较的0—4 FSCRS表单与计分键"
    },
    "url": "https://d3n8a8pro7vhmx.cloudfront.net/portlandpsychotherapy/pages/21/attachments/original/1438799410/Forms_of_self-criticising_and_self_reassuring_scale.pdf"
  }
];
