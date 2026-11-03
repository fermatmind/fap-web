import type { Questionnaire } from "@/lib/questionnaires/types";

export const selfEsteemLandingSections: Questionnaire["guide"] = [
  {
    "id": "rses-global-regard",
    "title": {
      "en": "What does the Rosenberg Self-Esteem Scale measure?",
      "zh": "罗森伯格自尊量表测什么？总体自我评价"
    },
    "paragraphs": [
      {
        "en": "The Rosenberg Self-Esteem Scale (RSES) asks about your general attitude toward yourself. Its ten statements address personal worth, good qualities, satisfaction and negative evaluations of oneself. This page uses the University of Maryland displayed English order and a separately identified FermatMind working translation into Chinese. The result is one raw total and one complete seven-section guide, rather than a set of personality types or separate competence, appearance and relationship scores.",
        "zh": "罗森伯格自尊量表（RSES）询问对自己的总体态度，十条陈述涉及个人价值感、良好品质、满意与负面自我评价。本页使用马里兰大学所展示的英文题序，并单独标明费马中文工作译文。结果提供一个原始总分与一份七节完整指南，不派人格类型，也不另算能力、外貌或关系分数。"
      },
      {
        "en": "An opinion about yourself is different from an observation of what you can do. Feeling able to handle a specific task concerns that task; a global self-evaluation reaches beyond it. Neither response establishes actual skill or another person’s opinion. Read the complete statements in their own terms, without treating the total as a measurement of how valuable a person deserves to be.",
        "zh": "对自己的看法，与实际能完成什么的观察不同。认为能处理某项任务，针对的是具体任务；总体自我评价涉及更广泛的自我看法。两种回答都不能证明实际技能或他人的评价。请按完整陈述本身作答，不把总分理解为一个人应有多少价值。"
      }
    ]
  },
  {
    "id": "rses-response-format",
    "title": {
      "en": "Ten statements, four scored choices, optional skipping",
      "zh": "十条陈述、四档计分与自愿跳题"
    },
    "paragraphs": [
      {
        "en": "Answer with Strongly agree, Agree, Disagree or Strongly disagree, considering how you generally feel about yourself. The source instruction does not impose a seven-day or thirty-day recall window. About two minutes is an editorial estimate, not a timer. Start opens the first statement directly: no additional agreement, account or payment is needed to answer or read the full guide.",
        "zh": "请根据一般如何看待自己，在非常同意、同意、不同意、非常不同意四档中选择。源说明没有规定过去七天或三十天的回顾窗口。约两分钟是编辑用时估计，不是计时限制。点击开始直接进入第一条，无需再次同意、账户或付款即可作答并阅读完整指南。"
      },
      {
        "en": "The separate prefer-not-to-answer choice is this website’s unscored addition, not a fifth point on the RSES agreement scale. You can decline a statement without explaining why. A total is shown only when all ten statements have scale responses. Leaving a question unselected is an unfinished attempt; selecting the unscored choice completes that question but leaves insufficient information for a total.",
        "zh": "单独的“不愿回答”是网站增加的未评分选项，不是RSES同意量表的第五档。可以不解释理由而跳过某条。只有十条均有量表回答才显示总分；未选择表示尚未完成该题，选择未评分选项则完成该题，但总分资料不足。"
      }
    ]
  },
  {
    "id": "rses-key-order",
    "title": {
      "en": "Reverse scoring: follow this edition’s item order",
      "zh": "反向计分：必须对应本版题序"
    },
    "paragraphs": [
      {
        "en": "In this edition, items 1, 2, 4, 6 and 7 contribute 3, 2, 1 or 0 for Strongly agree through Strongly disagree. Items 3, 5, 8, 9 and 10 contribute 0, 1, 2 or 3 in the same response order. Add the ten contributions for an integer total from 0 to 30. The five reverse keys align the direction of the statements; they are not a lie-detection or attention-check score.",
        "zh": "本版第1、2、4、6、7题，按非常同意至非常不同意依次计3、2、1、0分；第3、5、8、9、10题在相同选项顺序下计0、1、2、3分。十条贡献相加，得到0—30的整数总分。五个反向键用于统一陈述的计分方向，不构成测谎或注意力检查分数。"
      },
      {
        "en": "Other forms rearrange the statements, so a key such as “reverse item 2” cannot be copied by number alone. A 10–40 form can be converted by subtracting ten only when the same ten answers use otherwise equivalent four-choice scoring with one extra point per item. That arithmetic does not prove translation equivalence, and it does not convert a different questionnaire or a five- or seven-choice version.",
        "zh": "其他题表会重排陈述，因此不能只凭题号复制“第2题反向”等规则。同样十条回答采用其余规则等价、每条多计一分的四档10—40计分时，减十才可换成0—30。算术换算不证明译本等价，也不能换算另一份问卷或五档、七档版本。"
      }
    ]
  },
  {
    "id": "rses-worked-total",
    "title": {
      "en": "Worked total: show the contributions, then add",
      "zh": "总分算例：先列贡献，再相加"
    },
    "paragraphs": [
      {
        "en": "For a new worked example, the ten already reverse-adjusted contributions are 3, 1, 2, 0, 1, 3, 2, 2, 0 and 3. Their sum is 17. Do not reverse those contributions a second time or divide them into invented positive and negative subscale reports. The number identifies an answer total, not a severity band or a recommended treatment.",
        "zh": "另举算例：十题已经完成反向处理的贡献依次为3、1、2、0、1、3、2、2、0、3，相加为17。不要把已经定向的贡献再次反向，也不据此另造正面、负面两个分量表报告。这个数字标明回答总和，不是严重程度分档或治疗建议。"
      },
      {
        "en": "Answering Agree to every statement yields 15; answering Strongly agree to every statement also yields 15, because five statements reverse direction. These are different patterns with the same sum, not evidence that either respondent is dishonest. Ten valid contributions of zero yield a real total of 0. Nine zero contributions plus one skipped item yield no total: zero and missing information are different states.",
        "zh": "每题都选同意得到15，每题都选非常同意也得到15，因为其中五条反向。这是不同回答模式得到相同总和，不是任何一方不诚实的证据。十条有效贡献全为零，真实总分为0；九条贡献为零而一条跳过，则不产生总分。有效零分与资料缺失必须区分。"
      }
    ]
  },
  {
    "id": "rses-score-interpretation",
    "title": {
      "en": "How to read a 0–30 result without universal bands",
      "zh": "如何理解0—30结果：保留连续读法"
    },
    "paragraphs": [
      {
        "en": "A higher total represents more positive self-reported global regard across the ten statements, after reversing the negative wording. The same total can conceal different answers and does not identify their causes. The midpoint 15 is an arithmetic property of the scoring range, not an established population average, clinical boundary or a balanced personality category.",
        "zh": "完成负向陈述反向处理后，较高总分表示在十条陈述中报告了较多正向的总体自我评价。相同总分可能包含不同回答，也不识别形成这些回答的原因。15是计分范围的算术中点，不是已建立的人群平均、临床边界或“均衡型人格”。"
      },
      {
        "en": "This page does not apply a universal normal range, percentile or high/low label. Comparing a person with a research sample requires an appropriate version, language, population and scoring method. All 31 possible complete totals lead to the same full explanation, including context, missing answers and optional reflection. Reading that public guide before answering does not change the scoring rule.",
        "zh": "本页不套用通用正常区间、百分位或高低标签。将个人与研究样本比较，需要合适的版本、语言、人群与计分方法。全部31种可能的完整总分都对应同一份完整说明，包含情境、缺答与可选反思。先阅读公开指南，不改变实际计分规则。"
      }
    ]
  },
  {
    "id": "rses-research-language",
    "title": {
      "en": "Research across languages: support and limits",
      "zh": "跨语言研究：支持与适用限制"
    },
    "paragraphs": [
      {
        "en": "Schmitt and Allik’s 2005 study administered the RSES in 28 languages to 16,998 participants in 53 nations. Its abstract reports broadly similar factor structure but also different interpretations of negative items that limit direct cross-cultural comparisons. [5] International use therefore supports investigating the construct across settings; it does not establish a single world ranking or validate this new Chinese wording.",
        "zh": "Schmitt与Allik在2005年研究中，向53国的16,998名参与者施测28种语言的RSES。摘要报告因子结构总体相似，同时指出负向条目的理解差异限制直接跨文化比较。[5] 国际使用支持在不同环境中研究这一构念，不建立统一世界排名，也不验证本页新的中文措辞。"
      },
      {
        "en": "Sinclair and colleagues’ 2010 abstract reports psychometric and normative analyses in 503 US adults, including differences across demographic groups. [6] Those data belong to that sample and analysis. This page does not import its norms or derive research subcomponents as personal scores. The Chinese text remains a working translation; software arithmetic checks are separate from reliability, validity and cross-language measurement studies.",
        "zh": "Sinclair等2010年论文摘要报告503名美国成人的心理测量与常模分析，包括人口群体之间的差异。[6] 数据属于该样本和分析，本页不直接移用常模，也不将研究中的子成分生成个人分数。中文仍为工作译文；软件算术检查与信度、效度及跨语言测量研究是不同工作。"
      }
    ]
  },
  {
    "id": "rses-context-retake",
    "title": {
      "en": "Retaking: compare the answers and circumstances",
      "zh": "重测：同时比较回答与作答情境"
    },
    "paragraphs": [
      {
        "en": "When retaking, record the edition, language and circumstances before comparing the number. The general instruction is not a precise recent symptom window. Differences in how a statement is understood or which experiences come to mind can affect self-report. This version does not provide a reliable-change threshold, and a difference of one or several points alone cannot establish meaningful improvement or decline.",
        "zh": "重测时，在比较数字前先记录版本、语言与作答情境。一般性的作答说明不是精确的近期症状回顾窗口。对陈述的理解、想到哪些经历，都可能影响自报。本版没有提供可靠变化阈值，单独一分或几分的差异，不能确立有意义的改善或恶化。"
      },
      {
        "en": "Instead of trying to reach a preferred total, choose one statement and privately note an example that fits and one that qualifies it. A fictional learner can be disappointed with a presentation while recognizing valued qualities in other areas. This is a way to clarify the scope of a statement, not a prescribed intervention or a promise of a higher score. No real incident or private note needs to be submitted.",
        "zh": "与其反复作答追求理想总分，可以私下选一条陈述，记一个符合的例子与一个限定。虚构例子中，一位学习者可以对演讲表现失望，同时认可自己在其他方面的品质。这是在澄清陈述范围，不是指定干预或提分承诺，也无需提交真实事件或私人笔记。"
      }
    ]
  },
  {
    "id": "rses-reading-privacy",
    "title": {
      "en": "Complete reading, source identification and privacy",
      "zh": "完整读法、来源识别与隐私"
    },
    "paragraphs": [
      {
        "en": "The full guide explains the construct, arithmetic, score range, missing information, context, reflection and source. The original English instrument, Chinese working translation and website-added skipping policy are identified separately. Existing University of Maryland source links remain available. The ten statements and seven-section report are preserved; the explanations here add reading context rather than changing the instrument.",
        "zh": "完整指南分别说明构念、算术、范围、缺答、情境、反思与来源。原英文工具、中文工作译文、网站增设的跳题政策分别标明，既有马里兰大学来源链接保留。十条陈述与七节报告保持原样，这里的解释补充阅读背景，不改变工具本身。"
      },
      {
        "en": "Answers are calculated in the current browser. Temporary saving is optional and expires after 24 hours in this tab; completion, clearing or restarting removes that progress. Public guide links do not contain answers or a raw total. The score is for self-reflection, not a diagnosis or qualification. Concerns affecting daily life can be discussed with a qualified professional independently of whether a numerical score is available.",
        "zh": "答案在当前浏览器计算，临时保存为自愿选项，在本标签页24小时后失效；完成、清除或重测会删除进度。公开指南链接不包含答案或原始总分。分数用于自我反思，不是诊断或资格判定。影响日常生活的困扰，可以独立于是否有数字分数，与合格专业人员讨论。"
      }
    ]
  }
];

export const selfEsteemLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is self-esteem the same as confidence in a skill?",
      "zh": "自尊与某项技能的信心相同吗？"
    },
    "answer": {
      "en": "No. RSES concerns general self-regard. A judgment about a particular task, actual performance and other people’s evaluation are different observations. This page does not calculate separate skill scores.",
      "zh": "不同。RSES讨论总体自我评价；对具体任务的判断、实际表现与他人的评价是不同观察，本页不另算技能分数。"
    }
  },
  {
    "question": {
      "en": "Which items are reversed in this edition?",
      "zh": "本版哪些题反向？"
    },
    "answer": {
      "en": "Items 3, 5, 8, 9 and 10 in the selected UMD order. Reordered forms can assign different numbers to the same statements; match the wording and edition before using a key.",
      "zh": "所选UMD题序的第3、5、8、9、10题。重排题表可能给同样的陈述不同题号，应先核对措辞与版本，再使用反向键。"
    }
  },
  {
    "question": {
      "en": "Can I subtract ten from any self-esteem test score?",
      "zh": "任何自尊测试分数都能减十换算吗？"
    },
    "answer": {
      "en": "No. Subtracting ten only converts otherwise equivalent ten-item four-choice scoring with one extra point per item. It cannot convert a different bank, response format or establish translation equivalence.",
      "zh": "不能。只有其他规则等价、十条四档且每条多计一分的编码，才适用减十。它不能换算另一份题本或选项格式，也不建立译本等价。"
    }
  },
  {
    "question": {
      "en": "Why do all Agree and all Strongly agree both yield 15?",
      "zh": "为什么全选同意与全选非常同意都是15？"
    },
    "answer": {
      "en": "Five statements score forward and five in reverse. The patterns produce the same sum for different reasons. The total is not an automatic consistency or dishonesty detector.",
      "zh": "五条正向、五条反向，因此两种不同回答模式会得到相同总和；总分不是自动的一致性或不诚实检测器。"
    }
  },
  {
    "question": {
      "en": "Does one skipped item count as zero?",
      "zh": "跳过一题计零分吗？"
    },
    "answer": {
      "en": "No. It withholds the total even if all other contributions are zero. Ten valid zero contributions yield 0; missing a contribution leaves insufficient information. The complete guide stays readable.",
      "zh": "不计。即使其余贡献全为零，跳过一题仍不出总分。十条有效零贡献得到0，缺少贡献则资料不足，完整指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Does a score of 15 establish normal self-esteem?",
      "zh": "15分能确立正常自尊吗？"
    },
    "answer": {
      "en": "No. It is the mathematical midpoint of this 0–30 range, not a universal population average or clinical cutoff. This page gives the raw total and a continuous guide without bands.",
      "zh": "不能。它是0—30范围的数学中点，不是通用人口平均或临床界值。本页提供原始总分及连续读法，不分档。"
    }
  },
  {
    "question": {
      "en": "Does a cross-national study validate this Chinese translation?",
      "zh": "跨国研究能验证本页中文吗？"
    },
    "answer": {
      "en": "No. The cited studies concern specified languages, samples and analyses. A new working translation and added skipping policy need their own measurement evidence; correct software arithmetic is not that evidence. [5][6]",
      "zh": "不能。所引研究对应特定语言、样本与分析，新工作译文及新增跳题政策需要自身测量证据，软件算术正确不能代替。[5][6]"
    }
  },
  {
    "question": {
      "en": "Will Start ask me to agree again or sign in?",
      "zh": "点击开始后还要再次同意或登录吗？"
    },
    "answer": {
      "en": "No. Start opens statement one directly. All ten statements and the full guide are free. Optional temporary saving is separate from answering and does not require an account.",
      "zh": "不需要。开始直接打开第一条，十条题目及完整指南免费；可选临时保存与作答分开，不要求账户。"
    }
  }
];

export const selfEsteemLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Schmitt & Allik (2005): RSES across 53 nations — study abstract",
      "zh": "Schmitt与Allik（2005）：53国RSES研究摘要"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/16287423/"
  },
  {
    "title": {
      "en": "Sinclair et al. (2010): psychometrics in 503 US adults — study abstract",
      "zh": "Sinclair等（2010）：503名美国成人心理测量研究摘要"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/20164106/"
  }
];
