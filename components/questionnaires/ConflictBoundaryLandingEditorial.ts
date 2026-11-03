import type { Questionnaire } from "@/lib/questionnaires/types";

export const conflictBoundaryLandingSections: Questionnaire["guide"] = [
  {
    "id": "conflict-boundary-four-domains",
    "title": {
      "en": "Four groups describe actions, not four kinds of people",
      "zh": "四组整理具体行动，不把人分成四种类型"
    },
    "paragraphs": [
      {
        "en": "The first six statements concern pressure during disagreement; the next six concern responses to another person’s no or pause. The third group concerns responses when an impact is raised, and the last concerns follow-through after an attempted repair. These are selected, original descriptions of your own past three months. A group name organizes the statements; it does not establish a latent personality trait.",
        "zh": "前六条涉及分歧中的加压，接下来的六条涉及怎样面对他人的拒绝与暂停；第三组涉及影响被指出后的回应，最后一组涉及修复之后的跟进。它们是对本人过去三个月的选定原创描述。组名用于整理题目，不代表已经确立潜在人格特质。"
      },
      {
        "en": "Read each statement before deciding how well it fits. The form asks for agreement on a five-point scale, not a count of incidents, and it does not collect the other person’s account. A number cannot reconstruct what happened, its seriousness, the opportunities to act differently or the conditions in a relationship.",
        "zh": "先读完整陈述，再判断符合程度。这里使用五点符合度，不统计事件次数，也不收集另一方陈述。数字无法还原具体经过、严重程度、采取其他行动的机会或关系条件。"
      }
    ]
  },
  {
    "id": "conflict-boundary-pressure",
    "title": {
      "en": "Disagreement: a clear position and pressure for an immediate response",
      "zh": "分歧：表达立场与催促即时回应"
    },
    "paragraphs": [
      {
        "en": "This group asks about stronger wording, repeated contact, bringing unrelated history into an argument, requiring an answer now, escalating questions and restarting before an agreed pause ends. Those actions are more specific than saying that someone is assertive or difficult. The CCI assertiveness resource distinguishes clear, direct expression that respects others. [1] That distinction is background, not validation of this questionnaire.",
        "zh": "本组询问加强措辞、短时重复联系、翻出无关旧事、要求立即回答、加重追问，以及在约定暂停结束前重启争论。这些行动比“很坚定”或“难相处”更具体。CCI的坚定表达资料强调清楚、直接地表达，同时尊重他人。[1] 这一概念区别提供背景，不验证本问卷。"
      },
      {
        "en": "In an invented work example, stating a deadline once and explaining its consequence differs from sending repeated messages to force an answer during an agreed pause. Record what you actually did and what was explicitly agreed. This example does not decide whether any particular real interaction was abusive, justified or safe.",
        "zh": "以虚构工作情境为例，说明一次截止时间及其影响，与在约定暂停期间反复发消息迫使回应，是不同的行动。可回看自己实际做了什么、双方明确约定了什么。这个例子不裁定任何真实互动是否构成侵害、是否正当或安全。"
      }
    ]
  },
  {
    "id": "conflict-boundary-boundaries",
    "title": {
      "en": "Boundaries: what happens after a no, hesitation or pause",
      "zh": "面对边界：拒绝、犹豫与暂停之后做了什么"
    },
    "paragraphs": [
      {
        "en": "Six statements cover continued persuasion after a no, pressing for a conclusion after a pause request, demanding explanations, invoking a relationship or past effort to reconsider a boundary, continuing without checking hesitation, and changing channels after one is explicitly paused. The focus is your response to the other person’s expressed limit, not how easily you can state your own.",
        "zh": "六条陈述涉及拒绝后的继续劝说、暂停请求后的催促结论、要求解释、用关系或既往付出促使对方改变边界、面对犹豫仍继续而不核对，以及在一个渠道明确暂停后换渠道联系。这里观察的是自己怎样回应他人表达的限制，不是自己能否轻松提出边界。"
      },
      {
        "en": "An original example is moving from a paused chat to another messaging service to continue the same demand. The relevant detail is the stated pause and your subsequent action. A low average does not establish that all boundaries were respected; a high average does not determine another person’s experience or replace an account of a specific event.",
        "zh": "原创例子是：一个聊天渠道已被明确暂停，却换到另一通信工具继续提出同一要求。需要核对的是暂停如何表达、自己随后做了什么。低均值不能证明所有边界都得到尊重，高均值也不能代替另一方体验或具体事件陈述。"
      }
    ]
  },
  {
    "id": "conflict-boundary-impact",
    "title": {
      "en": "Impact: distinguish an intention from the response to consequences",
      "zh": "回应影响：把意图与后果被指出后的回应分开"
    },
    "paragraphs": [
      {
        "en": "The third group concerns denying an impact before checking facts, using lack of intent to dismiss consequences, focusing first on the other person’s reaction, adding a counter-accusation to an apology, requiring feelings to be justified and describing personal difficulties without discussing one’s actions. It records reported responses, not a finding about motives or legal responsibility.",
        "zh": "第三组涉及未核对事实就否认影响、用无意如此否定后果、首先归因于他人反应、在道歉中加入反指责、要求对方证明感受合理，以及详述自身困难却少谈自己的行动。它记录自报回应，不判定动机或法律责任。"
      },
      {
        "en": "In an invented example, “I did not intend that” and “What did my message actually say?” answer different questions. Reviewing the wording and the reported impact can make an observation more concrete. You do not need to obtain forgiveness, demand further disclosure or insist on a conversation to complete this private reflection.",
        "zh": "以虚构例子说明，“我不是故意的”与“我的消息实际说了什么”回答不同问题。核对措辞和已被指出的影响，可以让观察更具体。完成这份私人回顾不需要获得原谅、要求进一步披露，或坚持让对方继续谈话。"
      }
    ]
  },
  {
    "id": "conflict-boundary-repair",
    "title": {
      "en": "Repair: an apology, a commitment and follow-through are different records",
      "zh": "修复跟进：道歉、承诺与兑现是不同记录"
    },
    "paragraphs": [
      {
        "en": "The final group asks about promises without an action or time, recurrence without reviewing the promise, initial effort that fades, missing an agreed update, ending discussion by saying an apology was already made, and leaving the adjustment method unchanged after recurrence. These six statements describe gaps in reported follow-through; they are not a scale of sincerity or moral worth.",
        "zh": "最后一组询问没有行动或时间的承诺、重复发生却不回看承诺、起初投入随后减少、没有约定的更新、用“已经道歉”结束讨论，以及重复出现问题后仍不调整方法。这六条描述自报跟进中的缺口，不测真诚程度或道德价值。"
      },
      {
        "en": "For an original example, “I will send the revised file by Thursday” identifies an action and time, while “I will do better” does not. Whether that file was sent is another observation. Neither a promise nor a changed questionnaire average demonstrates that harm has been repaired, trust restored or future safety established.",
        "zh": "以原创例子说明，“周四前发送修改后的文件”说明了行动与时间，“我以后会改好”则没有。文件是否真正发出又是另一项观察。承诺或问卷均值改变，都不能证明伤害已经修复、信任恢复或未来安全得到保证。"
      }
    ]
  },
  {
    "id": "conflict-boundary-missing",
    "title": {
      "en": "Three, a skipped answer and an unanswered statement have different meanings",
      "zh": "3分、明确跳过与尚未选择，是三种不同状态"
    },
    "paragraphs": [
      {
        "en": "One through five are numeric responses; three means uncertain or depends on context and still enters the calculation. Prefer not to answer is unscored. Each statement needs either a number or that explicit skip before completion, but you may exit at any time. A skipped answer is never replaced with zero, three or an inferred response.",
        "zh": "1至5都是数字回答；3表示不确定或取决于情境，仍进入计算。“不想回答”不计分。完成时每条需有一个数字或明确跳过，但可随时退出。跳过不会被替换为0、3或推测答案。"
      },
      {
        "en": "Each group needs at least four numeric responses out of six. For 1, 2, 4, 5 and two skips, the numeric sum is twelve, the rated count four and the mean 3.0000. With only three numeric responses, that group has insufficient information; another eligible group can still be shown. Skipping all twenty-four yields no personal group readings.",
        "zh": "每组六条至少需四个数字回答。例如1、2、4、5加两条跳过，数字合计12、计入四条、均值3.0000；只有三个数字时该组资料不足，其他符合条件的组仍可显示。24条全部跳过不会产生个人分组读数。"
      }
    ]
  },
  {
    "id": "conflict-boundary-evidence",
    "title": {
      "en": "What the arithmetic establishes, and what still needs measurement research",
      "zh": "可复算计分，与仍待研究的测量质量"
    },
    "paragraphs": [
      {
        "en": "The mean is the numeric sum divided by the number rated, rounded to four decimal places. All statements count forward; groups remain separate. There is no combined danger score, winner, severity band, population percentile or validated change threshold. Four decimal places describe display rounding, not proven psychological precision.",
        "zh": "均值为数字合计除以计入条数，显示四位小数。所有题目正向计入，四组分别保留；没有总危险分、胜出组、严重程度分档、人群百分位或经过验证的变化阈值。四位小数说明显示舍入，不证明心理测量精度。"
      },
      {
        "en": "This original form has not established reliability, validity, norms or fairness in a target population. Public resources on assertiveness and support do not provide those missing studies. A more complete personal reading considers which items were answered, skipped or uncertain and checks an actual example; the questionnaire cannot independently corroborate the account.",
        "zh": "这份原创题本尚未在目标人群中确立信度、效度、常模或公平性。坚定表达及支持资源不能代替这些研究。较完整的个人阅读应同时看哪些条目已回答、跳过或不确定，并核对实际例子；问卷无法独立证实自报经过。"
      }
    ]
  },
  {
    "id": "conflict-boundary-safety",
    "title": {
      "en": "Private reflection without an obligation to confront or disclose",
      "zh": "私人回顾，不要求对质或披露"
    },
    "paragraphs": [
      {
        "en": "Answers and results stay in current-page memory. There is no draft, personal-result link or answer upload; reloading, changing language or leaving clears the attempt. Optional aggregate activity measurement is off by default and is separate from answering. Public guides remain available without submitting a personal record.",
        "zh": "回答与结果留在当前页面内存，不保存草稿、不生成个人结果链接、不上传逐题答案；刷新、换语言或离开会清除本次作答。可选汇总使用统计默认关闭，与答题分开。无需提交个人记录也能阅读公开指南。"
      },
      {
        "en": "Actual threats, violence, coercion or stalking require attention to the situation rather than a questionnaire threshold. The NHS guidance notes that help need not wait for an emergency. [2] This page supplies no safety clearance, diagnosis or determination about a relationship. Reading or sharing results is not a condition for seeking appropriate local support.",
        "zh": "真实威胁、暴力、胁迫或跟踪需要根据实际情况处理，不能等待问卷达到阈值。NHS资料指出，寻求帮助不必等到紧急情况。[2] 本页不提供安全证明、诊断或关系裁决；阅读或分享分数不是获得适当本地支持的条件。"
      }
    ]
  }
];

export const conflictBoundaryLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a conflict-style or assertiveness inventory?",
      "zh": "这是冲突风格或坚定表达量表吗？"
    },
    "answer": {
      "en": "It is an original four-group behavior reflection, not a licensed conflict-style inventory or an assertiveness scale. It asks about your responses during disagreement, after a boundary, when impact is raised and during repair follow-through.",
      "zh": "这是原创四组行为回顾，不是获许可的冲突风格量表或坚定表达量表。它询问分歧中、面对边界、影响被指出及修复跟进时本人的回应。"
    }
  },
  {
    "question": {
      "en": "Does three mean a medium frequency?",
      "zh": "3分是否表示中等发生频率？"
    },
    "answer": {
      "en": "No. Three is the numeric uncertain or context-dependent option. The response format asks how well statements fit, not how many incidents occurred.",
      "zh": "不是。3是记入数字的不确定或取决于情境选项。题目询问符合程度，不统计发生次数。"
    }
  },
  {
    "question": {
      "en": "Can one skipped statement make the whole result unavailable?",
      "zh": "跳过一题会让全部结果都不可用吗？"
    },
    "answer": {
      "en": "No. Each six-item group is checked separately. Four or more numeric responses allow its mean; fewer withhold that group’s personal reading. All statements still need a numeric choice or an explicit skip to finish.",
      "zh": "不会。每组六题独立检查，至少四个数字可计算该组均值；不足四个则不呈现该组个人读数。完成时所有题目仍需数字选择或明确跳过。"
    }
  },
  {
    "question": {
      "en": "Why do equal means not necessarily describe equal experiences?",
      "zh": "为什么相同均值不代表经历相同？"
    },
    "answer": {
      "en": "Different item patterns and rated counts can produce the same mean. The page also lacks incident counts, an independent account and a measure of seriousness. Read the actual statements and the amount of information alongside the number.",
      "zh": "不同条目组合和计入条数可能产生相同均值。本页也没有事件次数、独立陈述及严重程度测量，需要把具体题目和资料多少与数字一起读。"
    }
  },
  {
    "question": {
      "en": "Can I add the four means to obtain a total?",
      "zh": "可以把四组均值相加成为总分吗？"
    },
    "answer": {
      "en": "The scoring provides no combined total or validated interpretation of one. Adding the means would discard differences between the four selected topics and their missing responses.",
      "zh": "计分没有提供合并总分及其经过验证的解释。相加会丢失四类选定主题及各自缺答情况的区别。"
    }
  },
  {
    "question": {
      "en": "Does a low reading show that a relationship is safe?",
      "zh": "读数较低是否说明关系安全？"
    },
    "answer": {
      "en": "No. A self-report average cannot establish or rule out actual harm or future risk. Use the facts of a situation and appropriate support rather than a numerical clearance.",
      "zh": "不能。自报均值无法判定或排除真实伤害与未来风险，应根据实际情况及适当支持处理，不把数字当作安全许可。"
    }
  },
  {
    "question": {
      "en": "Must I discuss these answers with another person?",
      "zh": "必须与另一个人讨论这些回答吗？"
    },
    "answer": {
      "en": "No. You can reflect privately, skip a statement or leave. The test does not require a confrontation, an apology, forgiveness or disclosure of another person’s experiences.",
      "zh": "不必。可以私下回顾、跳题或离开；测试不要求对质、道歉、原谅或披露另一方经历。"
    }
  },
  {
    "question": {
      "en": "Can a lower retest mean prove that repair worked?",
      "zh": "重测均值降低，能证明修复有效吗？"
    },
    "answer": {
      "en": "No. Context, interpretation, skipped items and self-description can change. No reliable-change threshold or outcome prediction has been established for this form; actual follow-through needs its own evidence.",
      "zh": "不能。情境、理解、跳过条目及自我描述都可能变化。本题本尚未建立可靠变化阈值或结果预测，实际跟进需要独立事实。"
    }
  }
];

export const conflictBoundaryLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "CCI: assertiveness resources—clear expression with respect for others",
      "zh": "CCI：坚定表达资源——清楚表达与尊重他人"
    },
    "url": "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself/Assertiveness"
  },
  {
    "title": {
      "en": "NHS: domestic violence and abuse—recognition and support",
      "zh": "NHS：家庭暴力与侵害的识别及支持"
    },
    "url": "https://www.nhs.uk/live-well/getting-help-for-domestic-violence/"
  }
];
