import type { Questionnaire } from "@/lib/questionnaires/types";
export const sd4LandingSections: Questionnaire["guide"] = [
  {
    "id": "sd4-purpose",
    "title": {
      "en": "What SD4 assesses: four research dimensions, read separately",
      "zh": "SD4测什么：分别阅读四个研究维度"
    },
    "paragraphs": [
      {
        "en": "The Short Dark Tetrad is a self-report research instrument for Machiavellianism, narcissism, psychopathy and sadism. [1] This page retains its twenty-eight English statements and four seven-item groups. The Chinese is a working translation. You receive four raw means where the corresponding ratings are complete, alongside four full explanations, rather than a single darkness score or a personality type.",
        "zh": "简式黑暗四特质量表（Short Dark Tetrad）是关于马基雅维利主义、自恋、精神病态与施虐的自报研究工具。[1] 本页保留二十八条英文陈述及四组各七题，中文为工作译文。相应作答完整时呈现四项原始均值，并提供四篇完整解释，不生成单一黑暗分或人格类型。"
      },
      {
        "en": "Read each name as the label for a specific set of statements. Agreement with a broad belief, a self-description or a remembered event supplies different information; an average does not reconstruct the event or independently verify the belief. The public explanations are available before answering and remain available even if every item is left unscored.",
        "zh": "每个名称对应一组具体陈述。认同广义观念、自我描述或回忆事件，提供的信息不同；均值不会还原事件或独立验证观念。公开解释在作答前即可阅读，即使每条都选未评分也仍然开放。"
      }
    ]
  },
  {
    "id": "sd4-response",
    "title": {
      "en": "How to answer: agreement, no imposed recall window and optional missingness",
      "zh": "怎样作答：认同程度、原题时间范围与可选未评分"
    },
    "paragraphs": [
      {
        "en": "Answer for yourself as an adult, using the five published agreement anchors from strongly disagree to strongly agree. The midpoint, 3, means Neutral. There is no shared past-month, past-year or workplace reference in the original form: use each statement’s own wording rather than forcing every item into an added time window. There are no correct responses to optimize for an employer or an ideal result.",
        "zh": "仅由成年人为自己作答，使用发表版从非常不同意到非常同意的五个认同选项。中点3表示中立。原题本没有统一的近一个月、近一年或工作情境参照，应按各条本身措辞回答，不把每题强行放进附加时段。无需为雇主或理想结果寻找正确答案。"
      },
      {
        "en": "The website adds an unscored option so you can decline a sensitive statement without explaining why. It is separate from Neutral and receives no numeric value. All twenty-eight items need a choice to finish, but not all need numeric ratings. One unscored item withholds only its seven-item group’s mean; the other complete groups and all four guides remain available.",
        "zh": "网站附加未评分选项，便于不愿回答敏感陈述时直接保留，不必说明理由。它与中立不同，没有数值。二十八题均需选择才完成，但不要求全部选数字。一条未评分只让所属七题组不显示均值；其他完整组及四篇指南仍可阅读。"
      }
    ]
  },
  {
    "id": "sd4-planning-selfview",
    "title": {
      "en": "Machiavellianism and narcissism: distinguish tactics from self-view",
      "zh": "马基雅维利主义与自恋：区分策略观念和自我看法"
    },
    "paragraphs": [
      {
        "en": "The first group includes privacy, influential allies, timing of conflict, planning, flattery and reactions to a successful plan. An item about strategic restraint is not a record of an actual manipulation. You might endorse planning while rejecting flattery; inspect that difference before attaching the research label to an everyday decision. The mean cannot infer a colleague’s intentions or whether your account of a situation is correct.",
        "zh": "第一组包含隐私、重要人物的支持、冲突时机、计划、奉承及对计划成功的反应。关于策略克制的陈述不是实际操纵的记录。可能认同计划而不认同奉承，应先看这种差异，再将研究名称与日常决定联系。均值不能推断同事意图或自己的情境理解是否正确。"
      },
      {
        "en": "The second group concerns perceived distinctiveness, recognition, persuasion, visibility and anticipated success. It records your agreement with those self-views, not independent evidence of leadership, talent or what everyone thinks of you. Enjoying an occasional public role and believing a group depends on your presence are different statements; averaging them should not erase their particular meanings.",
        "zh": "第二组关注自己感到特别、得到认可、说服力、可见度与预期成功。它记录对这些自我看法的认同，不是领导能力、才华或所有人如何看你的独立证据。偶尔喜欢公开展示与认为小组依赖自己在场，是不同陈述，不应让均值抹去具体含义。"
      }
    ]
  },
  {
    "id": "sd4-risk-cruelty",
    "title": {
      "en": "Psychopathy and sadism: read the content before interpreting the name",
      "zh": "精神病态与施虐：先读题意，再理解名称"
    },
    "paragraphs": [
      {
        "en": "The third group mixes reported impulsive action, opposition to rules, risk and past conflict or legal experience. A single mean does not indicate when an event occurred, what constraints existed or what anyone else observed. These sensitive questions may remain unscored. The research term is not a determination of criminality, dangerousness, responsibility or a clinical condition.",
        "zh": "第三组混合自报的冲动行动、反对规则、风险及过去冲突或法律经历。单一均值不说明事件何时发生、有哪些限制或别人观察到什么。敏感问题可以保留未评分。研究名称不判定犯罪、危险性、责任或临床状况。"
      },
      {
        "en": "The fourth group includes reactions to observed or fictional violence, another person’s misfortune, suffering and hurtful words. Media enjoyment, a general belief and a reported online comment are not the same action. Do not turn their shared average into proof of a real harmful act, a sexual interest or someone’s safety. No behavioral experiment, provocation or disclosure is needed to understand the guide.",
        "zh": "第四组包含对旁观或虚构暴力、他人失利、痛苦及伤人言语的反应。喜欢某类媒体、广义观念及报告一次线上评论，不是同一行动。不能将共同均值当成实际伤害、性兴趣或某人安全与否的证明。理解指南不需要行为实验、试探或披露。"
      }
    ]
  },
  {
    "id": "sd4-arithmetic",
    "title": {
      "en": "SD4 scoring: seven direct ratings and two-decimal display",
      "zh": "SD4怎样计分：七条同向评分、显示两位小数"
    },
    "paragraphs": [
      {
        "en": "All twenty-eight items are directly keyed; none is reversed. [1] For each complete group, add its seven ratings and divide the unrounded sum by seven. The report displays two decimal places. Ratings 1, 1, 2, 3, 4, 4, 5 sum to 20 and display 20/7 = 2.86. A different pattern can produce the same sum, so the number does not preserve the individual responses.",
        "zh": "二十八题均为同向计分，没有反向题。[1] 每个完整组将七条评分相加，直接用未舍入原始和除以七，报告显示两位小数。1、1、2、3、4、4、5相加为20，20/7显示2.86。另一种作答分布也能有相同原始和，因此数字不保留逐题差异。"
      },
      {
        "en": "Six ratings of 5 and one unscored response do not produce a mean, even though the numeric sum is 30. The missing rating is not imputed from the other six or changed to 0 or 3. This website’s complete-seven rule is a reporting extension, not a missing-data method validated by the instrument’s authors. It is applied independently to all four groups.",
        "zh": "六条5及一条未评分，即使数字和为30，也不生成均值。缺失不由其他六条估算，也不改成0或3。网站要求七条完整是报告扩展规则，不是原作者验证的缺失处理方法；四组分别应用该规则。"
      }
    ]
  },
  {
    "id": "sd4-research",
    "title": {
      "en": "Scientific evidence: published research and what it does not establish here",
      "zh": "科学证据：发表研究与本站尚未建立的解释"
    },
    "paragraphs": [
      {
        "en": "The original development paper reports three studies, with 2,527 participants in total. Exploratory analyses refined an initial item pool, and a later confirmatory analysis examined the four-factor structure. The authors studied subscale relationships with other measures while recognizing overlap among the four constructs. [4] These are instrument-development findings, not an accuracy percentage for a particular visitor or a clinical cutoff.",
        "zh": "原始开发论文报告三项研究，总样本2,527人。探索性分析逐步精简初始题池，后续验证性分析考察四因素结构；作者研究各分量表与其他测量的关系，同时承认四个构念间存在重叠。[4] 这些属于工具开发结果，不是某位访客的准确率或临床界线。"
      },
      {
        "en": "Scientific evaluation must distinguish consistency, construct interpretation, the sampled population and the proposed use. Preserving English items does not establish equivalent measurement in a new Chinese translation or norms for this website’s visitors. The published article also distinguishes brief subclinical measurement from clinical assessment. [4] This edition does not claim its own Chinese validation, population percentiles, selection validity or a reliable-change threshold.",
        "zh": "科学评价需要区分一致性、构念解释、研究样本与拟议用途。保留英文题目，不确立新的中文译文测量等值或本站访客常模。发表论文也区分简短的亚临床测量与临床评估。[4] 本版不声称已具备自身中文验证、人群百分位、筛选效度或可靠变化门槛。"
      }
    ]
  },
  {
    "id": "sd4-comparisons",
    "title": {
      "en": "Why the four means are not a total, a winner or an SD3 conversion",
      "zh": "为什么四项均值不合成总分、不选主型，也不换算SD3"
    },
    "paragraphs": [
      {
        "en": "Equal numeric ranges do not make the four item sets interchangeable. A 3.00 is the mean of responses in a group, not the population average or a level that makes someone a member of a category. A larger value in one group does not create a validated main personality type. This page shows no darkness total, normative rank, pass mark or relationship-safety classification.",
        "zh": "数值范围相同，不表示四组题可以互换。3.00是某组回应的均值，不是人群平均或使人归入某类别的等级。某项更大，不会产生经验证的主要人格类型。本页不显示黑暗总分、常模排名、通过线或关系安全分类。"
      },
      {
        "en": "SD4, the twenty-seven-item SD3, the Dirty Dozen and the separate FermatMind Mini reflection have different item sets and reporting rules. Likewise, shared terminology with Big Five or HEXACO does not supply a score-conversion formula. If you compare readings, first identify the instrument, language, anchors and actual statements; a familiar label alone cannot make two results equivalent.",
        "zh": "SD4、二十七题SD3、Dirty Dozen及独立的费马Mini观察，题组与报告规则不同。与大五或HEXACO有相近术语，也不提供分数转换公式。比较读法时应先确认工具、语言、选项及具体陈述；熟悉的名称本身不能使两个结果等同。"
      }
    ]
  },
  {
    "id": "sd4-privacy-practice",
    "title": {
      "en": "Private reflection, complete guides and direct entry",
      "zh": "私人反思、完整指南与直接作答"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one statement and privately distinguish what you believed, what you actually did and what evidence supports your interpretation. You do not need to answer for a partner, ask people to judge your character or seek proof that a label fits. A change on retest can reflect wording interpretation or response differences; this page cannot quantify lasting personality change from two means.",
        "zh": "如有帮助，可选一条陈述，私下区分自己相信什么、实际做过什么，以及哪些证据支持自己的解释。无需替伴侣作答、请别人评判品格或求证名称是否符合。重测变化可能涉及措辞理解或回应差异，本页不能凭两个均值量化持久人格改变。"
      },
      {
        "en": "Start opens the first item directly, without a required agreement checkbox. All twenty-eight items and four eight-section guides are free without registration. Answers remain in current page memory: there is no draft saving, personal-result URL, personal-result sharing or quiz-flow statistics. Refreshing, changing language or leaving discards the attempt. Public guide links contain no answers or scores.",
        "zh": "点击开始直接进入第一题，没有必选同意框。二十八题及四篇各八节的指南免费，无需注册。答案仅留当前页面内存，不保存草稿、不生成个人结果网址、不分享个人结果、不发送测试流程统计。刷新、换语言或离开会丢弃作答；公开指南链接不含答案或分数。"
      }
    ]
  }
];
export const sd4LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does “Short Dark Tetrad” mean?",
      "zh": "Short Dark Tetrad是什么意思？"
    },
    "answer": {
      "en": "It names a brief self-report instrument with four seven-item research subscales. The name refers to the measured content, not a dark identity assigned to a respondent. All four explanations are available without producing a personal mean.",
      "zh": "它是包含四个七题研究分量表的简短自报工具名称。名称指测量内容，不是赋予作答者的黑暗身份。不生成个人均值也能阅读全部四篇解释。"
    }
  },
  {
    "question": {
      "en": "Are any SD4 items reverse-scored?",
      "zh": "SD4有反向题吗？"
    },
    "answer": {
      "en": "No. All twenty-eight published items in this edition are directly scored from 1 to 5. [1] Do not import reverse keys from another questionnaire or turn disagreement with an unpleasant statement into a high score.",
      "zh": "没有。本版二十八条发表题全部直接按1至5计分。[1] 不要套入其他问卷的反向键，也不要将不同意不愉快陈述反记成高分。"
    }
  },
  {
    "question": {
      "en": "Why does the report show 2.86 rather than 2.9?",
      "zh": "报告为什么显示2.86而不是2.9？"
    },
    "answer": {
      "en": "It divides the complete subscale’s raw sum by seven and displays two decimals. A sum of20 gives20/7=2.86. This is display precision, not a claim that a difference of0.01 is psychologically meaningful.",
      "zh": "报告将完整分量表原始和除以七，并显示两位小数。和20得到20/7=2.86。这是显示精度，不表示0.01的差异具有心理学意义。"
    }
  },
  {
    "question": {
      "en": "Does 3.00 mean average darkness?",
      "zh": "3.00表示平均黑暗程度吗？"
    },
    "answer": {
      "en": "No. Three is the Neutral response anchor, and3.00 can arise from many response patterns. It is not a population norm, a percentile or a cutoff for assigning any identity.",
      "zh": "不是。3是中立选项，3.00也可由多种回答分布产生。它不是人群常模、百分位或分配任何身份的界线。"
    }
  },
  {
    "question": {
      "en": "Can enjoying a violent game establish real-world cruelty?",
      "zh": "喜欢暴力游戏能证明现实中的残酷吗？"
    },
    "answer": {
      "en": "No. The sadism set includes different media, observational, belief and verbal contents. One endorsement or a shared mean cannot establish an actual harmful action, motive or sexual interest. Read the specific statements rather than treating the name as evidence.",
      "zh": "不能。施虐题组包含不同的媒体、旁观、观念及言语内容。某条认同或共同均值，不能确立实际伤害、动机或性兴趣。应阅读具体陈述，不把名称当成证据。"
    }
  },
  {
    "question": {
      "en": "Does the published research validate the Chinese wording here?",
      "zh": "发表研究能验证本站中文措辞吗？"
    },
    "answer": {
      "en": "No. Original instrument evidence and a new translation are distinct. This Chinese version is a working translation without established measurement equivalence or local norms. The same arithmetic does not make language scores interchangeable.",
      "zh": "不能。原工具证据与新译文是不同问题。本中文版本是工作译文，尚未建立测量等值或本地常模。计算相同，不使不同语言的分数可互换。"
    }
  },
  {
    "question": {
      "en": "Can I answer about someone else or judge a relationship?",
      "zh": "能替别人回答或据此判断关系吗？"
    },
    "answer": {
      "en": "No. This page is for adult self-report. Guessed responses cannot establish another person’s traits, motives or safety, and a low mean does not certify harmlessness. It is not a partner-selection or hiring instrument.",
      "zh": "不能。本页供成年人自报。猜测回应不能确立他人的特质、动机或安全性，均值较低也不认证无害。它不是伴侣选择或招聘工具。"
    }
  },
  {
    "question": {
      "en": "Do I need to complete another test to read everything?",
      "zh": "必须继续其他测试才能看完整内容吗？"
    },
    "answer": {
      "en": "No. All four eight-section public guides are already open. The Mini version is separate and optional, and no score conversion is offered. You may read without answering, finish with unscored items or leave without saving anything.",
      "zh": "不需要。四篇各八节的公开指南已完整开放。Mini是独立可选版本，不提供分数转换。可以不作答直接读、保留未评分完成，或离开而不保存任何内容。"
    }
  }
];
export const sd4LandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Author-hosted original SD4 development paper: methods, factor structure and limits",
      "zh": "作者托管的SD4原始开发论文：方法、因素结构与限制"
    },
    "url": "https://www.erinbuckels.com/uploads/EJPA.SD4.with.pagination.pdf"
  }
];
