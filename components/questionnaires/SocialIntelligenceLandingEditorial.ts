import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplement; source-bound IPIP items, keys and full report remain unchanged. */
export const socialIntelligenceLandingSections: QuestionnaireSection[] = [
  {
    "id": "social-item-scope",
    "title": {
      "zh": "四条题目分别问什么？共同构成一项自述",
      "en": "What do the four items ask? One combined self-report"
    },
    "paragraphs": [
      {
        "zh": "公开IPIP-VIA-R题目键把这四条列在Social/Personal/Emotional Intelligence（SOC，新标识SIQ）之下，两条正向、两条反向。[1] 本页按感知感受、新情境、措辞、预测反应的顺序呈现，四条合成一个分数。四个话题帮助理解题意，不是四个独立分量表，也没有分别给每种能力打分。",
        "en": "The public IPIP-VIA-R key places these four items under Social/Personal/Emotional Intelligence (SOC, newer label SIQ), with two positive and two negative keys.[1] This page presents sensing feelings, new situations, choosing words and anticipating reactions in that order, combining them into one score. These topics explain item content; they are not four separately scored subscales or ability grades."
      },
      {
        "zh": "例如觉得自己通常能察觉同伴情绪，却在陌生小组中不知道如何加入，并不矛盾；熟悉的人、活动规则与可用信息不同。也可能措辞让人舒服，但没有真正理解对方希望怎样处理。四条评分应各自依据经历，不必为了形成“擅长社交”的一致形象而选同一个方向。",
        "en": "You may feel able to sense a familiar person’s feelings yet unsure how to join a new group. Familiarity, activity rules and available information differ. Words may also put someone at ease without identifying what they want done. Rate each statement against experience rather than forcing a consistently sociable-looking pattern."
      }
    ]
  },
  {
    "id": "social-inference-check",
    "title": {
      "zh": "感觉知道与核实知道：观察、推测、询问",
      "en": "Feeling certain and checking an inference: observe, interpret, ask"
    },
    "paragraphs": [
      {
        "zh": "朋友回复很短，可以观察到的是文字简短；“他对我生气了”是推测。还可能是忙、疲惫、输入不方便或习惯简洁。较有把握地给自评高分，不会自动排除这些解释。本卷没有对方的独立回答、情绪识别任务或正确答案，无法核对你的猜测命中率。",
        "en": "A short reply establishes brevity; “they are angry with me” is an interpretation. Being busy, tired, unable to type or simply concise remain alternatives. Confidence in a high self-rating does not rule them out. This form contains no independent account from the other person, emotion-recognition task or answer key with which to check inference accuracy."
      },
      {
        "zh": "在对方愿意时，可以问“你现在方便聊吗，还是稍后再说？”并接受暂时不解释。把对方的实际回应与原先推测比较，比用一个总分断言自己会读心更具体。这样的例子是可选的观察方法，不是本卷验证过的训练方案，也不要求对方披露感受或充当你的评分员。",
        "en": "If the person is willing, ask whether now or later is a better time, accepting that no explanation may follow. Comparing their response with your initial interpretation gives a specific observation. This is an optional reflection prompt, not a training programme validated by this form, and asks for neither emotional disclosure nor someone to act as your assessor."
      }
    ]
  },
  {
    "id": "social-worked-score",
    "title": {
      "zh": "反向计分算例：7分与1.75怎样得到？",
      "en": "Reverse-scoring example: how do 7 and 1.75 arise?"
    },
    "paragraphs": [
      {
        "zh": "按本页顺序，设四条原始评分为1、5、3、4。第1、3条直接取1、3，第2、4条按6减原评分，分别得到1、2；定向后为1、1、3、2，总和7，7÷4＝1.75。IPIP通用计分说明也区分正向、反向后再求和。[3] 反向处理是统一题意方向，不是惩罚负面回答。",
        "en": "In presentation order, suppose the raw ratings are 1, 5, 3, 4. Items one and three retain 1 and 3; items two and four use six minus the rating, giving 1 and 2. The keyed values are 1, 1, 3, 2: a sum of 7 and 7÷4=1.75. IPIP’s general instructions likewise distinguish positive and negative keys before summing.[3] Reversal aligns item direction rather than penalising negative answers."
      },
      {
        "zh": "结果先显示4—20原始总分，描述性均分用未舍入总和除以4并保留两位小数。1.75不能由其他页面已四舍五入的一位小数反推。总分范围只是四题计分的上下界；7分不是7%的社交能力，1.75也不对应人群排名、诊断概率或某个固定类型。",
        "en": "Results show the raw 4–20 total first. The descriptive mean divides the unrounded sum by four and displays two decimals. A previously rounded one-decimal value cannot reconstruct 1.75. The total’s endpoints follow from four-item arithmetic: 7 is not 7 percent social ability, and 1.75 supplies no population rank, diagnostic probability or fixed type."
      }
    ]
  },
  {
    "id": "social-neutral-missing",
    "title": {
      "zh": "同为12分，回答可以不同；NA也不等于中间项",
      "en": "Different answers can give 12; NA is not the midpoint"
    },
    "paragraphs": [
      {
        "zh": "四条全部选1、全部选3或全部选5，反向后都得到12分、3.00均分。它们分别涉及不同的自我描述，却被同一个总和压缩；12不是理想平衡，更不能仅凭数轴中点称为“普通人的水平”。应同时回看具体条目和支持、反驳这些看法的经历。[4]",
        "en": "Selecting 1 throughout, 3 throughout or 5 throughout each gives 12 and a mean of 3.00 after reversal. Different self-descriptions are compressed into the same sum. Twelve certifies no ideal balance or average-person standing merely because it is the arithmetic midpoint. Review the items alongside experiences supporting and contradicting your ratings.[4]"
      },
      {
        "zh": "3表示描述介于符合与不符合之间，仍是有效数字评分；NA表达无法判断或不愿回答，两者意义不同。任一条选NA，本次可完成，但不生成个人总分或均分，也不按其余三条估算。九节完整指南继续可读；选择NA不是错误，也不代表理解他人的能力较低。",
        "en": "A 3 is a valid numerical judgement of neither inaccurate nor accurate. NA means cannot judge or prefer not to answer. Any NA permits completion without a personal total or mean, and the other three items are not used to estimate it. The nine-section guide remains available. NA is neither an error nor evidence of lower ability to understand others."
      }
    ]
  },
  {
    "id": "social-evidence-edition",
    "title": {
      "zh": "公有领域题目与测量证据：分别核对",
      "en": "Public-domain items and measurement evidence: separate questions"
    },
    "paragraphs": [
      {
        "zh": "IPIP允许其题目、量表与题库用于商业及非商业用途。[2] 这说明使用许可，不证明本站中文试译、网页呈现、NA选项或四题独立施测已经验证。原键页面报告德国和英国样本中的重测与内部一致性指标；这些研究背景不能转成本站用户的准确率，或作为本版中文常模。[1]",
        "en": "IPIP permits commercial and non-commercial use of its items, scales and inventories.[2] That establishes permission, not validation of this trial Chinese translation, web presentation, NA option or separate four-item administration. The original key reports retest and internal-consistency indices in German and UK samples. Those findings are background, not an accuracy rate for this visitor or Chinese norms for this edition.[1]"
      },
      {
        "zh": "本页与本站96题品格优势问卷中的社交智能部分共用四条题目及键向，便于核对来源和运算。单独作答与在24种品格主题中作答，前后语境不同；相同题目不保证两次回答或解释等价。比较时保留版本、语言、时间与具体回答，不把不同场合下的分数差直接称为成长或退步。",
        "en": "This entry shares four items and scoring keys with the social-intelligence facet of our 96-item character-strengths form. That supports checking provenance and arithmetic. Answering alone differs in context from answering among 24 strengths, so identical items do not guarantee equivalent responses or interpretations. Retain version, language, timing and actual answers when comparing, rather than labelling a difference growth or decline."
      }
    ]
  },
  {
    "id": "social-context-boundaries",
    "title": {
      "zh": "陌生情境、外向与体贴：需要分开理解",
      "en": "Unfamiliar situations, extraversion and consideration: distinguish them"
    },
    "paragraphs": [
      {
        "zh": "新活动没有说明流程、使用不熟悉的语言、线上缺少语气、角色权力不对等，都可能让人难以判断怎样回应。这里举的是需要核查的情境，不是对某种文化、身份或神经类型的测量结论。四题不能诊断社交焦虑、自闭症或其他状况，也不应作为招聘、晋升或关系裁决的依据。",
        "en": "Unclear activity rules, an unfamiliar language, missing tone online or unequal authority can complicate decisions about responding. These are contexts to examine, not measured conclusions about a culture, identity or neurotype. Four items diagnose neither social anxiety, autism nor another condition, and should not determine hiring, promotion or relationship judgements."
      },
      {
        "zh": "主动说话多，不证明判断更准确；安静、等待或请别人说明，也不证明理解较差。“知道说什么让人感觉好”不要求讨好、隐瞒分歧或负责他人的情绪。一次有帮助的沟通也可以是礼貌拒绝、清楚说明限制，或在得到允许后提出不同看法。",
        "en": "Speaking often does not establish accurate judgement; quietness, waiting or asking for clarification establishes no deficit. Knowing words that help someone feel good creates no duty to appease, conceal disagreement or take responsibility for their emotions. Helpful communication may include a respectful refusal, a clear limit or a different view offered with permission."
      }
    ]
  },
  {
    "id": "social-reading-use",
    "title": {
      "zh": "怎样使用完整指南？从一项可核对的经历开始",
      "en": "How can the full guide help? Start with one checkable interaction"
    },
    "paragraphs": [
      {
        "zh": "本页仅有一份九节完整指南，分别说明版本、计分、较高较低、混合与缺答、例子、模型区别、证据及隐私。较高和较低是回答方向的说明，不是分档；不会解锁隐藏的社交类型或能力等级。可以先阅读，不需要多答一轮或追求更高分才获得全文。",
        "en": "There is one complete nine-section guide covering edition, scoring, higher and lower readings, mixed or missing answers, examples, model distinctions, evidence and privacy. Higher and lower explain response direction without creating bands. There are no hidden social types or ability levels to unlock. Read first if you wish; another attempt or a higher score is unnecessary."
      },
      {
        "zh": "选一次低风险、双方愿意回顾的交往，区分当时看到什么、自己推测什么、后来知道什么；找一例符合自评，也找一例不符合。记录可以留在自己的私人笔记中，无需提交网站。重测差异没有本版可靠变化阈值；更具体的目标是澄清一次误会或确认一个安排，而不是证明分数提高了。",
        "en": "Choose a low-stakes interaction both people are willing to revisit. Separate what you observed, inferred and later learned, finding an example that fits your self-rating and one that does not. Any notes can remain private, without submission here. This edition has no established reliable-change threshold; clarifying a misunderstanding or confirming an arrangement is a more specific aim than proving a score increase."
      }
    ]
  }
];

export const socialIntelligenceLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "四条是不是四种社交能力的分数？",
      "en": "Are the four items four ability scores?"
    },
    "answer": {
      "zh": "不是。它们共同组成一项IPIP-VIA-R自述分数，题意涉及四个话题，但没有分别测出四种能力。[1]",
      "en": "No. They combine into one IPIP-VIA-R self-report score. Four item topics do not establish four separately measured abilities.[1]"
    }
  },
  {
    "question": {
      "zh": "觉得自己能读懂别人，就证明猜得准吗？",
      "en": "Does feeling able to read people prove accuracy?"
    },
    "answer": {
      "zh": "不能。本卷记录自评，没有对方独立回答或表现任务的正确答案。可在对方愿意时核对一次具体推测，不能用分数代替询问。",
      "en": "No. The form records self-ratings without an independent account or performance-task answer key. Check a specific inference if the person is willing; a score cannot replace asking."
    }
  },
  {
    "question": {
      "zh": "为什么1、5、3、4得到7分和1.75？",
      "en": "Why do 1, 5, 3, 4 give 7 and 1.75?"
    },
    "answer": {
      "zh": "第2、4条反向后，定向值为1、1、3、2，合计7；7÷4＝1.75。均分从未舍入总和计算，不从一位小数倒推。[3]",
      "en": "Reversing items two and four gives 1, 1, 3, 2, totalling 7; 7÷4=1.75. The mean uses the unrounded sum, not a reconstructed one-decimal value.[3]"
    }
  },
  {
    "question": {
      "zh": "12分代表平均或理想平衡吗？",
      "en": "Does 12 mean average or ideal balance?"
    },
    "answer": {
      "zh": "不代表。全选1、3或5都可得到12，但回答不同。本版没有相应人群常模，不能从数轴中点推出平均水平。[4]",
      "en": "No. Selecting 1, 3 or 5 throughout can each give 12 despite different answers. Without relevant population norms, an arithmetic midpoint establishes no average standing.[4]"
    }
  },
  {
    "question": {
      "zh": "不愿回答时选3，还是选NA？",
      "en": "Should I choose 3 or NA if I prefer not to answer?"
    },
    "answer": {
      "zh": "选NA。3是有效的中间符合度判断，NA保留无法判断或不愿回答。任一NA不生成总分，完整九节指南仍开放。",
      "en": "Choose NA. A 3 is a valid midpoint accuracy judgement; NA preserves inability or unwillingness to judge. Any NA withholds the total while keeping all nine guide sections open."
    }
  },
  {
    "question": {
      "zh": "公有领域许可是否代表本版中英文都已验证？",
      "en": "Does public-domain permission establish validation in both languages?"
    },
    "answer": {
      "zh": "不代表。许可允许使用材料；中文试译、独立四题呈现与中英文测量等价性仍需对应研究。[1][2]",
      "en": "No. Permission allows use of the materials. The trial Chinese translation, separate four-item administration and cross-language equivalence still require appropriate studies.[1][2]"
    }
  },
  {
    "question": {
      "zh": "这能用来判断我外向、讨喜或适合某份工作吗？",
      "en": "Can this establish extraversion, likability or suitability for a job?"
    },
    "answer": {
      "zh": "不能。自评理解他人与外向、他人好感或工作表现不是同一个测量对象。本卷也不评定诊断、IQ、EQ或录用条件。",
      "en": "No. Self-perceived understanding, extraversion, others’ liking and job performance are different targets. This form also assigns no diagnosis, IQ, EQ or hiring qualification."
    }
  },
  {
    "question": {
      "zh": "需要再次同意或填写私人对话才能开始吗？",
      "en": "Must I agree again or enter private conversations to start?"
    },
    "answer": {
      "zh": "不需要。开始直接进入四条题目，不收姓名或对话，也不要求邮箱、注册、付费或其他测试；完整指南可以先读。",
      "en": "No. Start opens four items directly without names, conversations, email, signup, payment or another test. The full guide can be read first."
    }
  }
];
