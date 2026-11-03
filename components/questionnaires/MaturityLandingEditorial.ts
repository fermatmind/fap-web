import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Additional entry context; the original source package and full reports remain unchanged. */
export const maturityLandingSections: QuestionnaireSection[] = [
  {
    "id": "maturity-four-practices",
    "title": {
      "zh": "四部分分别回看什么，为什么不能互相替代",
      "en": "What each part reviews and why the four are not interchangeable"
    },
    "paragraphs": [
      {
        "zh": "“情绪与回应之间”关注辨认感受、考虑回应时机与表达方式；“承诺、跟进与修订”关注承担前的余量、范围核对、变化说明与后续行动。暂缓回复不自动等于完成了承诺；按时交付也不能说明一个人怎样处理感受。两组讨论不同的具体行为，不选最高者作为你的成熟类型。",
        "en": "Between a feeling and a response concerns identifying feelings, timing and expression. Commitments, follow-through and revision concerns available capacity, scope, explaining changes and subsequent action. Delaying a reply does not itself fulfill a promise, and delivering on time does not reveal how someone handles feelings. These review distinct practices; the highest part is not selected as a maturity type."
      },
      {
        "zh": "“核对视角与影响”关注原话与推测、信息来源和受影响者的条件；“自主选择与适当求助”关注自己的理由、建议是否适用以及愿意接受的协助。理解对方不要求同意，自己作决定也不要求拒绝帮助。四部分可以同时出现，不是四个年龄、发展阶段或固定人格。",
        "en": "Checking perspectives and effects concerns words versus inferences, information sources and affected people’s conditions. Self-directed choice and appropriate help concerns your reasons, relevant advice and welcome assistance. Understanding does not require agreement, and deciding for yourself does not require refusing help. All four can coexist; they are not ages, developmental stages or fixed personalities."
      }
    ]
  },
  {
    "id": "maturity-worked-means",
    "title": {
      "zh": "具体算例：四条有效评分、资料不足与相同均分",
      "en": "Worked examples: four ratings, insufficient information and equal means"
    },
    "paragraphs": [
      {
        "zh": "一组六条选择为4、3、不适用、5、4、不适用，有效四条，原始和16，均分16÷4＝4.0，同时显示4/6条。若另一组六条为2、3、不适用、不适用、4、不适用，只有三条有效，虽然能算出9÷3，页面仍显示资料不足，不给个人均分。四条门槛是本站完整性规则，不是经研究验证的成熟分界。",
        "en": "For six responses of 4, 3, NA, 5, 4, NA, four ratings sum to sixteen, giving 16÷4=4.0 and a rated count of 4/6. Another part with 2, 3, NA, NA, 4, NA has only three ratings. Although 9÷3 is arithmetically possible, the page marks insufficient information and provides no personal mean. Four is this website’s completeness rule, not a validated maturity boundary."
      },
      {
        "zh": "六条都选3，与5、4、3、2、1、不适用都得到3.0，但前者有六条有效、后者五条，条目模式也不同。因此要回到具体题目与机会理解，不能只看同一个小数。四项不相加，也不合成百分比、心理年龄、整体成熟总分或人群排名；一组不足不抹掉其他组的结果。",
        "en": "Six ratings of three and the pattern 5, 4, 3, 2, 1, NA both yield 3.0, but one has six ratings and the other five, with different item patterns. Read the particular items and opportunities rather than the decimal alone. The parts are not added into a percentage, mental age, overall maturity total or population rank; an insufficient part does not erase the others."
      }
    ]
  },
  {
    "id": "maturity-opportunity-and-missing",
    "title": {
      "zh": "从不、没有机会和不愿回答，分别怎样理解",
      "en": "Never, no opportunity and preferring not to answer"
    },
    "paragraphs": [
      {
        "zh": "有相关机会而没有采取题述做法，可以选“从不”（1）；没有遇到该情境，不应为了填题而猜“从不”或“有时”。本页将没有机会、资料不足与不愿回答放在同一个非数值选项中，所以不能从缺答反推你是回避、能力不足、缺乏责任或没有某种经历。",
        "en": "If a relevant opportunity occurred and the described practice did not, Never (1) may fit. If the situation did not arise, do not guess Never or Sometimes just to fill it in. No opportunity, insufficient information and preferring not to answer share one non-numeric option, so missingness cannot reveal avoidance, lack of ability or responsibility, or an absent experience."
      },
      {
        "zh": "24题都需要选择一种回应，但非数值选项同样是有效的作答选择，只是不进入该组的和与均分。全部选资料不足时，本次作答仍可结束，四份完整指南照常可读，不补成0或中间分。你无需说明跳过的原因，也不用披露发生过什么来证明选择合理。",
        "en": "Every item needs a selection, but the non-numeric option is also a valid response selection; it simply does not enter that part’s sum or mean. Selecting it throughout still completes an attempt, with all four guides readable and no substitution of zero or a midpoint. You need not explain the omission or disclose events to justify it."
      }
    ]
  },
  {
    "id": "maturity-research-models",
    "title": {
      "zh": "成熟度研究怎样界定问题，与本站四部分有什么关系",
      "en": "How maturity research frames questions and relates to these four parts"
    },
    "paragraphs": [
      {
        "zh": "Cauffman与Steinberg（2000）在千余名12—48岁参与者中，研究责任、视角、节制与假设性风险或反社会决策的关系。研究对象、指标和任务都有具体范围；这些群体结果不能从本页24条日常频率推导个人的发育年龄、决策能力或法律责任，更不是本站四部分的效度研究。[1]",
        "en": "Cauffman and Steinberg (2000) studied responsibility, perspective and temperance in relation to hypothetical risky or antisocial decisions among more than a thousand participants aged twelve to forty-eight. That study has particular participants, measures and tasks. Its group findings cannot turn these twenty-four everyday-frequency items into an individual developmental age, decision-making ability or legal judgment, nor validate this four-part form.[1]"
      },
      {
        "zh": "Greenberger与Sørensen（1974）提出的心理社会成熟度概念，涉及个人独立运作、人际互动与社会凝聚三个一般领域，并讨论九项属性及测量问题。这说明“成熟”有不同研究问题与组织方式，不能将一个模型的名称直接贴到另一套题。本站四部分是原创反思主题，未建立本题本的信度、效度、常模或跨语言测量等价性。[2]",
        "en": "Greenberger and Sørensen (1974) framed psychosocial maturity in terms of functioning on one’s own, interacting with others and contributing to social cohesion, discussing nine attributes and measurement problems. Maturity therefore involves different research questions and organizations; one model’s name does not identify another questionnaire. These four original reflection topics have no established form-specific reliability, validity, norms or cross-language measurement equivalence.[2]"
      }
    ]
  },
  {
    "id": "maturity-context-and-counterexamples",
    "title": {
      "zh": "较高频率是否总是更好？暂停、承诺与求助的反例",
      "en": "Is higher frequency always better? Pauses, commitments and help in context"
    },
    "paragraphs": [
      {
        "zh": "在不紧急的分歧里说明稍后再谈，与沉默不回、无限拖延或惩罚对方并不是一回事；也不能要求所有情境都先暂停。类似地，认真跟进约定可以包括发现条件改变后重新协商，而非不顾余量承受一切。题目自报频率并没有观察具体执行质量，不能用“几乎总是”证明每次做法都合适。",
        "en": "Stating that you will return to a non-urgent disagreement differs from silent non-response, indefinite delay or punishment; pausing is not required in every situation. Following through may include renegotiating when conditions change rather than accepting every demand beyond your capacity. Frequency ratings do not observe execution quality, so Almost always does not establish that each action was appropriate."
      },
      {
        "zh": "接受交通、沟通或生活协助可以与自己作选择同时存在；听懂一个解释也可以选择不同意。现实依赖、资源限制和表达空间需要单独考虑，不能被均分叫作不成熟。一个反例可能比贴标签更有用：在熟悉任务中清楚表达，与在不便坦诚的环境中少表达，不足以说明人格好坏。",
        "en": "Receiving transport, communication or everyday support can coexist with making your own choices; understanding an explanation can coexist with disagreement. Practical dependence, resource constraints and room to speak require separate attention and are not immaturity inferred from a mean. A counterexample can be more useful than a label: speaking clearly on a familiar task versus speaking less where candor is difficult does not establish personal merit."
      }
    ]
  },
  {
    "id": "maturity-everyday-review",
    "title": {
      "zh": "把结果用于一次普通回顾：从描述到可观察的小行动",
      "en": "Using a result for an ordinary review: descriptions and an observable action"
    },
    "paragraphs": [
      {
        "zh": "选一个自愿、低风险的近期场景，例如共同准备一次活动。先写清发生了什么、自己作了什么，再分开看四个问题：我怎样识别感受？怎样确认和修订约定？核对了哪些事实或推测？哪些决定想保留、哪些帮助愿意接受？不要求四项都做到，也不用给他人打分。",
        "en": "Choose an optional, low-stakes recent situation, such as preparing a shared activity. Describe what happened and what you did, then consider four questions separately: How did I identify feelings? How did I confirm or revise the agreement? Which facts or assumptions did I check? Which decisions would I retain, and which help would I welcome? You need not perform all four or score another person."
      },
      {
        "zh": "如果想试一项调整，可以说“我现在只能完成这一部分，剩下的我们重新约时间”，或“我听到的是这句话，我的理解对吗？”之后看安排是否更清楚、对方实际怎样回应，也记录一次不奏效的情境。这是可选的沟通尝试，不是成熟等级训练，也不保证关系或情绪改善。",
        "en": "If you want to try an adjustment, you might say: I can complete this part now; can we reschedule the rest? Or: This is what I heard; have I understood you? Afterwards, observe whether the arrangement became clearer and how the other person responded, including an instance where it did not work. These are optional communication attempts, not maturity-level training or guaranteed relationship or emotional improvement."
      }
    ]
  },
  {
    "id": "maturity-retest-and-related-tests",
    "title": {
      "zh": "重测、EQ与心理年龄：哪些比较有意义",
      "en": "Retakes, EQ and mental age: interpreting comparisons carefully"
    },
    "paragraphs": [
      {
        "zh": "重测先核对同一版本、同样四周参照、各组有效条数与实际改变的题目。均分从3.0变3.5，可能涉及机会、记忆或不同条目进入均分，不能仅据小数断言成长或退步。本站没有可靠改变阈值，连续做两次也不能证明治疗效果、发展进度或稳定人格改变。",
        "en": "On a retake, check the edition, four-week reference, rated counts and specific changed items. A shift from 3.0 to 3.5 can involve opportunities, recall or different items entering the mean, without establishing growth or decline from the decimal alone. There is no reliable-change threshold; two attempts do not establish treatment effects, developmental progress or stable personality change."
      },
      {
        "zh": "本页与EQ自评、情绪调节策略、人格特质和娱乐心理年龄问卷可能有话题重叠，但题目、构念与计分不同。四个均分不换算成EQ、IQ、大五、依恋、年龄或发展阶段。可以把一项描述转成后续观察问题；若选择另一测评，需要独立完整作答，不用本页补出其他结果。",
        "en": "Topics may overlap with EQ self-report, emotion-regulation strategies, traits or recreational mental-age quizzes, but items, constructs and scoring differ. These means are not converted into EQ, IQ, Big Five, attachment, age or developmental stages. You may turn a description into a further observation question; another assessment requires its own complete responses rather than a result filled in from this page."
      }
    ]
  }
];

export const maturityLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这四部分与责任、视角、节制三因素研究一样吗？",
      "en": "Are these four parts the same as responsibility, perspective and temperance research?"
    },
    "answer": {
      "zh": "不是。本站整理24条日常频率，研究使用的构念、工具、样本和任务不同；概念有交集不等于本题本经过相同验证。[1][2]",
      "en": "No. These twenty-four everyday-frequency items differ from the research constructs, measures, samples and tasks. Conceptual overlap does not establish equivalent validation.[1][2]"
    }
  },
  {
    "question": {
      "zh": "4、3、不适用、5、4、不适用怎样算？",
      "en": "How is 4,3,NA,5,4,NA calculated?"
    },
    "answer": {
      "zh": "四条有效评分合计16，均分4.0，同时显示4/6有效。两条非数值选择不当0，也不当3补入。",
      "en": "Four ratings sum to sixteen, giving a mean of 4.0 and 4/6 rated items. The two non-numeric responses are replaced by neither zero nor three."
    }
  },
  {
    "question": {
      "zh": "如果一组六条只评了三条呢？",
      "en": "What if I rate only three of a part’s six items?"
    },
    "answer": {
      "zh": "该组显示资料不足，不给个人均分；其他达到四条门槛的组仍可显示，四份完整指南均保留。四条是本站完整性约定，不是成熟分界。",
      "en": "That part remains insufficient without a personal mean. Other parts meeting the four-rating minimum still display theirs, and all four guides remain. Four is a website completeness convention, not a maturity cutoff."
    }
  },
  {
    "question": {
      "zh": "从不与没有相关机会相同吗？",
      "en": "Are Never and no relevant opportunity the same?"
    },
    "answer": {
      "zh": "不同。有机会却没采用题述做法可选从不（1）；没遇到情境选非数值回应。缺答还可能是资料不足或不愿答，不能从中推断个人原因。",
      "en": "No. Never (1) can fit an opportunity without the described practice; no opportunity uses the non-numeric response. Missingness can also mean insufficient information or preferring not to answer and does not reveal a personal cause."
    }
  },
  {
    "question": {
      "zh": "相同的3.0意味着相同表现吗？",
      "en": "Does the same mean of 3.0 indicate identical conduct?"
    },
    "answer": {
      "zh": "不意味着。六条都选3，与5、4、3、2、1、不适用均为3.0，但有效条数、具体题目和机会不同；要结合各条经历读。",
      "en": "No. Six threes and 5, 4, 3, 2, 1, NA both yield 3.0, with different rated counts, items and opportunities. Read them against the particular experiences."
    }
  },
  {
    "question": {
      "zh": "暂停回复、修改承诺会被当成不成熟吗？",
      "en": "Are pausing a reply and revising a commitment treated as immaturity?"
    },
    "answer": {
      "zh": "不能这样判断。适当说明暂停、实际余量和新约定可以是如实处理条件；频率不评行为质量，也不要求总是沉默、坚持原约或顺从。",
      "en": "No such judgment follows. Explaining a pause, available capacity and a revised agreement can accurately reflect conditions. Frequency does not judge conduct quality or require silence, keeping an unworkable promise or compliance."
    }
  },
  {
    "question": {
      "zh": "需要别人帮助，是否就不够自主？",
      "en": "Does needing help mean insufficient autonomy?"
    },
    "answer": {
      "zh": "不等于。自主关注自己的理由与决定空间，可与支持并存。现实资源、照护或沟通协助不由本页均分评定。",
      "en": "No. Self-direction concerns reasons and room to decide and can coexist with support. Resources, care and communication assistance are not judged by this mean."
    }
  },
  {
    "question": {
      "zh": "重测高了0.5，说明成长了吗？",
      "en": "Does an increase of 0.5 on a retake prove growth?"
    },
    "answer": {
      "zh": "不能仅据此认定。先看有效条目是否相同、机会与参照情境是否改变。本页没有可靠改变阈值，也不测治疗效果或发展年龄。",
      "en": "Not from this alone. Compare which items were rated, opportunities and the reference context. This page supplies no reliable-change threshold and measures neither treatment effects nor developmental age."
    }
  },
  {
    "question": {
      "zh": "所有题都选资料不足，或开始后需要再次同意吗？",
      "en": "Can I select insufficient information throughout, and is another agreement needed?"
    },
    "answer": {
      "zh": "可以全部选非数值回应，结束后四份指南仍可读，不补个人均分。开始直接进入24题，无需再次同意、注册或邮箱；保存仅主动开启。",
      "en": "You may select non-numeric responses throughout and still finish with four readable guides and no filled-in personal means. Start opens twenty-four questions directly, without another agreement, signup or email; saving is opt-in."
    }
  }
];
