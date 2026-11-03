import type { Text } from "@/lib/questionnaires/types";

export const genderExperiencesSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "gender-purpose",
    "title": {
      "en": "Gender experiences: four topics for a private adult reflection",
      "zh": "性别经历回顾：分别理解四个主题"
    },
    "paragraphs": [
      {
        "en": "Sixteen original statements invite adults to recall their own past four weeks: words for their gender, bodily experience, forms of address and social expectations, and feelings in everyday settings. Each topic contains four statements. The record retains the selected description for every statement, alongside four complete public guides.",
        "zh": "十六条原创陈述，供成年人回顾本人过去四周描述性别的词语、身体体验、称呼与社会期待，以及日常情境中的感受。每个主题四条，记录保留每条所选描述，并提供四篇完整公开指南。"
      },
      {
        "en": "These topics organize experiences rather than establish four independent psychological dimensions or steps towards an identity. Comfort, discomfort and uncertainty may coexist. You can read all guides without answering, leave a description unknown or private, or stop. No personal name, body detail or narrative is requested.",
        "zh": "这些主题用于整理经历，不确立四个独立心理维度，也不构成走向某种身份的步骤。自在、不自在与不确定可以同时存在。可以不答题阅读全部指南，保留未知或私人经历，或随时停止；无需提供实际姓名、身体细节或个人故事。"
      }
    ]
  },
  {
    "id": "words-and-identity",
    "title": {
      "en": "Words for yourself do not require a public declaration",
      "zh": "描述自己的词语，无需转化为公开声明"
    },
    "paragraphs": [
      {
        "en": "The first topic distinguishes an outside description that feels inaccurate, questions about suitable words, ease with a private description and tension between personal experience and an expected description. Being unsure about a word does not reveal a hidden answer. Familiarity with a term and comfort using it publicly are different questions.",
        "zh": "第一组分别涉及他人的描述与自身感受不符、对适用词语的疑问、私下描述自己时的自在感，以及个人经历与外界期待之间的张力。不确定某个词，不意味着存在一个等待揭晓的答案；熟悉一个词，与是否愿意公开使用它，是不同的问题。"
      },
      {
        "en": "The result cannot infer gender from interests, clothing, mannerisms, relationships or a pattern of selections. Gender identity, expression and sexual orientation are different concepts. No label has to be adopted or rejected to complete the reflection, and no preferred identity is treated as a successful outcome.",
        "zh": "结果不能通过兴趣、服装、举止、关系或所选类别的组合推断性别。性别认同、性别表达与性取向属于不同概念。完成回顾不要求接受或放弃任何标签，也不把某种身份当作理想结果。"
      }
    ]
  },
  {
    "id": "body-and-feelings",
    "title": {
      "en": "Bodily comfort and discomfort remain separate descriptions",
      "zh": "身体的自在与不自在，分别保留其语境"
    },
    "paragraphs": [
      {
        "en": "The bodily-experience statements concern feeling out of step with an aspect of the body, feeling at home in another aspect, discomfort with a gendered description and uncertainty about how to describe the connection. These statements describe recalled experiences; they do not examine anatomy, appearance, hormones or physical health.",
        "zh": "身体体验陈述分别涉及某些身体感受与性别经历不协调、对某些方面感到自在、对带有性别意味的身体描述感到不适，以及不知如何描述这种联系。它们回顾主观经历，不检查解剖特征、外貌、激素或身体健康。"
      },
      {
        "en": "Comfort with one statement does not cancel discomfort with another. Neither has reverse-scored points. You are not asked to inspect, photograph, measure or compare your body, change your appearance or identify a medical option. A category record cannot determine whether any procedure is needed or appropriate.",
        "zh": "一条陈述中的自在感，不会抵消另一条中的不适，两者均不作反向计分。无需检查、拍摄、测量或比较身体，不必改变外表或寻找医疗选项。类别记录不能判断是否需要某项医疗措施，也不能判断其适用性。"
      }
    ]
  },
  {
    "id": "address-and-context",
    "title": {
      "en": "Address and social expectations depend on the setting",
      "zh": "称呼与社会期待，需要结合具体情境"
    },
    "paragraphs": [
      {
        "en": "The address topic separates how a form of address feels, comfort in a familiar setting, expectations about participation and differences between settings. A comfortable exchange in one place can coexist with an uncomfortable exchange elsewhere. This does not establish what another person intended or how they would respond to a request.",
        "zh": "称呼主题区分对称呼的感受、熟悉环境中的自在感、他人对参与方式的期待，以及不同场景之间的差异。在一处自在、在另一处不自在可以同时存在，但这不能判断别人当时的意图，也不能预测对方会如何回应请求。"
      },
      {
        "en": "The everyday-context topic includes an interrupted activity, distress about a mismatch, feeling at ease in a familiar place and wanting privacy. Keeping a question private is not evidence of shame, avoidance or a particular identity. No trial of a name or pronoun, disclosure, confrontation or test of someone else’s reaction is required.",
        "zh": "日常背景主题涉及活动被顾虑打断、因经历与他人对待方式不协调而难受、在熟悉地方自在，以及希望保留隐私。想把问题留在私下，不证明羞耻、回避或某种身份。无需试用姓名或代词、披露身份、与人对质，或测试他人的反应。"
      }
    ]
  },
  {
    "id": "categories-without-points",
    "title": {
      "en": "Six descriptions are categories, not a frequency scale",
      "zh": "六种描述是类别，不是频率量表"
    },
    "paragraphs": [
      {
        "en": "Choose whether a statement does not describe, partly describes or describes your past four weeks; alternatively choose cannot judge, no relevant experience or prefer not to answer. The final three remain distinct. They are not treated as zero, disagreement or missing evidence that you should supply.",
        "zh": "可以选择陈述不符合、部分符合或符合过去四周的情况，也可以选择无法判断、没有相关经历或不愿回答。后三类分别保留，不当作零分、不赞同，或需要补交的证据。"
      },
      {
        "en": "For example, one topic answered partly, fits, unsure and withheld has category counts 0, 1, 1, 1, 0 and 1 in the displayed order. They add to four statements, not four days, episodes or symptoms. Counts do not express how often, how intensely or for how long an experience occurred.",
        "zh": "例如，同一主题依次选择部分符合、符合、无法判断与不愿回答，按展示顺序的六类计数为0、1、1、1、0、1，合计四条陈述，而不是四天、四次事件或四种症状。计数不表示经历发生的频率、强度或持续时间。"
      }
    ]
  },
  {
    "id": "records-and-guides",
    "title": {
      "en": "Read individual statements before the topic counts",
      "zh": "先阅读逐条描述，再理解主题计数"
    },
    "paragraphs": [
      {
        "en": "Completion produces four separate records and links to the same four public guides available before answering. Each record retains its four statements and the selected labels. A guide explains a topic with examples and distinctions; it does not infer a personal identity or reveal private answers.",
        "zh": "完成后得到四份分别呈现的记录，以及与作答前相同的四篇公开指南。每份记录保留四条陈述及所选标签。指南通过例子与概念区分解释主题，不推断个人身份，也不展示私人答案。"
      },
      {
        "en": "There is no total, mean, leading theme, identity percentage or severity band. An entirely uncertain, inapplicable or withheld record is valid, and support does not depend on completing it. Differences between two attempts may involve context, recall or how a statement was understood; this form cannot quantify identity change.",
        "zh": "没有总分、均值、主导主题、身份百分比或严重程度分档。全部选择未知、不适用或保留回答，也能形成有效记录；获得支持无需先完成记录。两次回答差异可能涉及情境、回忆或对陈述的理解，本题本不能量化身份变化。"
      }
    ]
  },
  {
    "id": "evidence-and-scope",
    "title": {
      "en": "Gender diversity, clinical terms and this original reflection",
      "zh": "区分性别多样性、临床术语与本原创回顾"
    },
    "paragraphs": [
      {
        "en": "WHO explains that ICD-11 moved gender incongruence outside the chapter on mental and behavioural disorders; transgender and gender-diverse identities are not conditions of mental ill-health. Its classification is health background, not a key for identifying someone through these sixteen statements. [1]",
        "zh": "WHO说明，ICD-11将性别不一致移出了精神与行为障碍章节；跨性别与性别多样身份本身不属于心理疾病。该分类是健康背景，不能用来把这十六条陈述变成身份识别规则。[1]"
      },
      {
        "en": "This is a FermatMind original reflection, not the UGDS, GIDYQ, a diagnostic interview or a WPATH assessment. Reliability, validity, norms and English–Chinese measurement equivalence have not been established for it. Four weeks is a recall frame, not a diagnostic duration, and category counts cannot decide medical need, eligibility or a care pathway.",
        "zh": "这是费马原创回顾，不是UGDS、GIDYQ、诊断访谈或WPATH评估。本题本尚未建立信度、效度、常模与中英文测量等值证据。四周是回忆范围，不是诊断所需时长；类别计数不能决定医疗需要、资格或照护路径。"
      }
    ]
  },
  {
    "id": "privacy-and-support",
    "title": {
      "en": "Private reflection and support are independent choices",
      "zh": "私人回顾与寻求支持，分别由本人选择"
    },
    "paragraphs": [
      {
        "en": "Responses remain in the current page’s memory. This exercise does not save them to browser storage, submit them as answers or put them in the URL. Reloading, leaving or using exit clears the record. Copy public entry shares only the public title and link; it does not copy a personal record.",
        "zh": "回答仅留当前页面内存。本练习不把回答保存到浏览器存储、不作为答案提交，也不写入网址。刷新、离开或退出会清除记录。“复制公开入口”只复制公开标题与链接，不复制个人记录。"
      },
      {
        "en": "If you want support, you can speak with a qualified professional who respects privacy and personal choices, without first having a label or completing a questionnaire. You decide how much to share. No identity disclosure or social, bodily or medical change is a condition of this reflection; it cannot assess personal safety or replace individual care.",
        "zh": "如果希望得到支持，可以在尚无标签、尚未完成问卷时，与尊重隐私和个人选择的合格专业人士交流，由本人决定分享多少。回顾不以披露身份，或作出社交、身体、医疗方面的改变为条件；它不能评估个人安全或替代个体化照护。"
      }
    ]
  }
];

export const genderExperiencesFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who is this reflection for, and how long does it take?",
      "zh": "适合谁阅读，约需多久？"
    },
    "answer": {
      "en": "Adults may use the sixteen original statements to recall their own past four weeks. Allow about five minutes at your own pace. All four guides are free to read without registration or answers. It is not a questionnaire to complete about someone else.",
      "zh": "供成年人回顾本人过去四周，十六条原创陈述约需五分钟，可按自己的节奏进行。无需注册或作答，即可免费阅读四篇指南；不用于代替他人填写。"
    }
  },
  {
    "question": {
      "en": "Are these response options a score from low to high?",
      "zh": "这些选项是从低到高的分数吗？"
    },
    "answer": {
      "en": "No. They are six different descriptions. Fits is not an identity point; unsure, no relevant experience and prefer not to answer remain separate. The result counts selected categories within each four-statement topic without assigning points or ranking themes.",
      "zh": "不是。六个选项是不同描述。“符合”不是身份点数；无法判断、没有相关经历与不愿回答分别保留。结果只在各主题四条陈述中统计类别，不赋点数或给主题排名。"
    }
  },
  {
    "question": {
      "en": "Do comfortable and uncomfortable experiences contradict each other?",
      "zh": "自在和不自在同时出现，是否矛盾？"
    },
    "answer": {
      "en": "They can refer to different aspects or settings. This form retains both without reversing or cancelling either answer. Neither a mixed record nor an entirely comfortable record establishes or rules out a gender identity.",
      "zh": "它们可能涉及不同方面或情境。题本分别保留，不反向换分或互相抵消。混合记录或全部自在的记录，都不能确立或排除某种性别身份。"
    }
  },
  {
    "question": {
      "en": "Is this the same as a gender dysphoria screening test?",
      "zh": "这是性别烦躁筛查量表吗？"
    },
    "answer": {
      "en": "No. It is an original category record, not a validated screening instrument or diagnostic interview. Its four-week recall and topic counts do not apply clinical duration, impairment or diagnostic criteria. Personal concerns can be discussed with a qualified professional independently of the record.",
      "zh": "不是。这是原创类别记录，不是经验证的筛查工具或诊断访谈。四周回忆与主题计数不套用临床持续时间、功能影响或诊断标准。个人顾虑可以独立于记录，与合格专业人士交流。"
    }
  },
  {
    "question": {
      "en": "Can clothing, interests or relationships determine the result?",
      "zh": "服装、兴趣或关系能决定结果吗？"
    },
    "answer": {
      "en": "The exercise does not classify identity from any of them. It records only your selections for the sixteen statements. Gender identity, expression and sexual orientation are different concepts, and no combination of selections creates an identity verdict.",
      "zh": "本练习不从这些方面判定身份，只记录本人对十六条陈述的选择。性别认同、性别表达与性取向属于不同概念，任何选项组合都不产生身份结论。"
    }
  },
  {
    "question": {
      "en": "Can I leave every experience unknown or private?",
      "zh": "能否把全部经历保留为未知或私人回答？"
    },
    "answer": {
      "en": "Yes. Each statement offers cannot judge, no relevant experience and prefer not to answer. An entirely unscored record remains valid and all four guides stay available. There is no requirement to explain or replace these choices.",
      "zh": "可以。每条均可选无法判断、没有相关经历或不愿回答。全部未计分的记录仍然有效，四篇指南仍可阅读，无需解释或更换这些选择。"
    }
  },
  {
    "question": {
      "en": "Does a different retake mean my identity changed?",
      "zh": "重做时回答不同，是否说明身份改变？"
    },
    "answer": {
      "en": "This record cannot establish that. Context, recall and the meaning given to a statement may differ. It has no test–retest evidence or identity-change measure, and repeated completion is not a route to a preferred label or a treatment decision.",
      "zh": "本记录不能判断。情境、回忆和对陈述的理解可能不同。题本没有重测证据或身份变化指标，反复完成也不能用于取得理想标签或作出治疗决定。"
    }
  },
  {
    "question": {
      "en": "Will the record tell me what to do next?",
      "zh": "记录会告诉我下一步必须做什么吗？"
    },
    "answer": {
      "en": "It offers public explanations, not a required course of action. No name or pronoun trial, disclosure, body check or medical step is requested. You may stop, read privately or seek support on your own terms without waiting for a count or a label.",
      "zh": "它提供公开解释，不规定行动路线。不要求试用姓名或代词、披露身份、检查身体或采取医疗措施。可以停止、私下阅读，或按个人意愿寻求支持，无需等待某个计数或标签。"
    }
  }
];

export const genderExperiencesReadingSummaries: Record<string, Text> = {
  "own-words-reading": {
    "en": "Distinguish private wording, outside descriptions and uncertainty without turning a term into a required identity or declaration.",
    "zh": "区分私下用词、外界描述与不确定，不把词语变成必须接受的身份或公开声明。"
  },
  "embodied-experience-reading": {
    "en": "Read bodily comfort, discomfort and unknown connections separately, without inspection, comparison or a medical inference.",
    "zh": "分别理解身体的自在、不自在与未知联系，无需检查、比较或推断医疗需要。"
  },
  "social-address-reading": {
    "en": "Consider address, participation expectations and differences between settings without predicting others’ intentions or requiring disclosure.",
    "zh": "结合场景理解称呼、参与期待与感受差异，不预测他人意图，也不要求披露身份。"
  },
  "daily-context-reading": {
    "en": "Keep attention, distress, ease and privacy in their own contexts, without a severity ladder or a prescribed next step.",
    "zh": "在各自背景中理解注意占用、难受、自在与隐私选择，不建立严重程度阶梯或指定下一步。"
  }
};
