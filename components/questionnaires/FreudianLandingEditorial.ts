import type { Questionnaire } from "@/lib/questionnaires/types";

export const freudianLandingSections: Questionnaire["guide"] = [
  {
    "id": "freud-edition",
    "title": {
      "zh": "弗洛伊德人格测试是什么？先区分历史理论与本页版本",
      "en": "What is a Freudian personality test? Separate history from this edition"
    },
    "paragraphs": [
      {
        "zh": "“弗洛伊德人格测试”在网上可指不同题本：历史风格、自述隐喻或理论知识练习，名称相同不意味着测量对象相同。本页使用48条原创近期行为提问，回看近四周，八个主题各六条。结果分别呈现各主题的频率汇总及八份完整指南，不生成单一类型、发育阶段或诊断结论。",
        "en": "The name Freudian personality test can refer to historical-style inventories, metaphor-based reflections or theory quizzes. A shared name does not establish a shared measure. This edition uses forty-eight original prompts about the past four weeks, six in each of eight themes. It presents separate frequency summaries and eight full guides, without assigning a single type, developmental stage or diagnosis."
      },
      {
        "zh": "本页八个旧名称注明来自Ryan Smith于2014年发表的个人解释；这些引述与本站新写的日常行为题目是不同内容。弗洛伊德的本我、自我、超我理论也不是本页八个主题的计分轴。阅读历史时应区分观点出处、操作定义与验证证据，不能仅凭一个熟悉的理论名称确认某份问卷有效。",
        "en": "The eight old names are attributed to Ryan Smith’s personal interpretation published in 2014; those quotations are distinct from the new everyday-action prompts here. Freud’s id, ego and superego are not this bank’s eight scoring axes either. Distinguish attribution, operational definitions and validation evidence rather than infer validity from a familiar theoretical name."
      }
    ]
  },
  {
    "id": "freud-eight-observations",
    "title": {
      "zh": "八个主题观察哪些近期动作？",
      "en": "Which recent actions do the eight themes cover?"
    },
    "paragraphs": [
      {
        "zh": "寻求支持观察请求确认、采用安排和等待方向；谨慎的自立姿态观察核对帮助、独自处理及简短或带刺回应。自发展开新方向涉及开启活动、变更计划和跟进新可能；细致维持结构涉及核对细节、固定步骤与整理材料。每个标题只概括本组六条，不自动代表依赖、信任、创造力或工作质量。",
        "en": "Seeking Support covers reassurance, accepting plans and waiting for direction. Guarded Self-Reliance covers checking offers, handling tasks alone and brief or cutting replies. Spontaneous Branching covers starts, plan changes and fresh possibilities; Tight Structure covers details, exact steps and materials. Each heading summarizes its six prompts rather than establish dependency, trust, creativity or work quality."
      },
      {
        "zh": "直接主张自己的位置涉及争取角色、说明贡献和提出优先方案；用论证表达主张涉及追问理由、核对标准与提出反例。外显地建立连接观察故事、手势和明显热情；保留私人的想象空间观察独处、私下展开想法和回应前的停顿。这些动作可以在同一人、同一项目的不同环节并存，不是四对互斥人格。",
        "en": "Overt Assertion covers visible roles, contributions and advocating a proposal; Argument-Led Assertion covers reasons, standards and counterexamples. Expressive Connection covers stories, gestures and visible enthusiasm; Private Imaginative Distance covers solitude, private ideas and pauses before responding. Actions can coexist across one person’s project; the eight themes are not four mutually exclusive personality pairs."
      }
    ]
  },
  {
    "id": "freud-context",
    "title": {
      "zh": "从动作到解释：先补具体情境",
      "en": "From action to interpretation: restore the situation"
    },
    "paragraphs": [
      {
        "zh": "另设一位成年人在准备共同展览时，请同事确认开场顺序，随后自己完成讲稿。请求确认可能对应寻求支持，也可能是对分工的合理核实；公开介绍时表达鲜明，之后独自整理草稿，也能同时对应不同主题。只知道动作出现频率，仍不知道是否有用、如何被别人理解或为什么发生。",
        "en": "Imagine an adult checking an exhibition’s opening order with a colleague before writing the script independently. Reassurance may also be sensible verification of a shared plan. An animated introduction followed by private drafting can involve different themes. Frequencies alone do not establish usefulness, other people’s reactions or why an action occurred."
      },
      {
        "zh": "可分别记录“发生了什么”“当时有哪些要求”“之后产生什么结果”。例如一次额外核对发现缺页，与未改变任何内容却推迟交接，表面动作相似，作用却不同。把例子说清比给自己补上一个隐藏心理原因更贴近本题本提供的信息。",
        "en": "Separate what happened, the requirements at the time and what followed. An extra check that finds a missing page differs from one that changes nothing while delaying handover. Describing the episode preserves more relevant information than supplying a hidden psychological explanation that the items do not establish."
      }
    ]
  },
  {
    "id": "freud-arithmetic",
    "title": {
      "zh": "六条怎样计分？原始和、两位小数与有序回答",
      "en": "How are six items scored? Sums, two decimals and ordered responses"
    },
    "paragraphs": [
      {
        "zh": "从不、很少、有时、经常、非常经常依次编码为1—5，所有条目正向相加。某主题六条均有效时，原始和范围6—30，用未舍入总和除6显示两位小数。另设2、4、5、4、3、5，总和23，均分3.83；它不是83%的人格浓度或超过83%的人。",
        "en": "Never through Very often are directly coded one to five. All items are summed in the same direction. Six valid ratings give a raw sum from six to thirty; divide the unrounded sum by six for a two-decimal display. Ratings 2, 4, 5, 4, 3 and 5 total twenty-three and display 3.83, without representing an 83% trait concentration or percentile."
      },
      {
        "zh": "频率类别有顺序，但本版没有证明相邻类别之间心理距离相等。六条都选3与1、1、1、5、5、5的总和都为18，显示均分3.00，却反映很不一样的回答分布。小数使算法可复算，不能补回平均时丢失的条目差异，也不意味着测量精度达到百分之一。",
        "en": "Frequency categories are ordered, without established equal psychological intervals here. Six threes and 1, 1, 1, 5, 5, 5 both total eighteen and display 3.00 despite different response distributions. Decimals make the arithmetic reproducible; they restore neither compressed item differences nor hundredth-unit measurement precision."
      }
    ]
  },
  {
    "id": "freud-na",
    "title": {
      "zh": "NA怎样处理？未知与低频率分开保留",
      "en": "How is NA handled? Keep missing information separate from low frequency"
    },
    "paragraphs": [
      {
        "zh": "48条都需要选择一项，NA是独立选项，适合情境未发生、含义不清或不愿回答时使用。每主题要求六条有效频率评分；任一NA使所属主题的个人原始和与均分显示资料不足，其他完整主题仍可呈现。NA不按0分、不按中间项，也不根据剩余五条估算。",
        "en": "Every item needs a selection, including the separate NA option for an unencountered, unclear or unwanted question. A theme requires all six frequency ratings. Any NA withholds that theme’s personal sum and mean while complete themes can still appear. NA is neither zero nor the midpoint and is not estimated from the other five items."
      },
      {
        "zh": "如果全部选NA，答题流程可以完成，但八个主题都保留资料不足，八份通用完整指南仍开放。若只是少选了某道题，属于尚未完成，不能把没有回答自动当作NA。低频率则是对实际经历给出的选择，和不知道或不愿判断具有不同含义。",
        "en": "An all-NA submission can complete the flow with all eight themes insufficient and all eight general guides available. An item with no selection is an incomplete response, not automatic NA. A low frequency is a chosen report about experience, distinct from not knowing or declining to judge."
      }
    ]
  },
  {
    "id": "freud-evidence",
    "title": {
      "zh": "历史影响与现代测量：分别需要什么证据？",
      "en": "Historical influence and measurement: what evidence is needed?"
    },
    "paragraphs": [
      {
        "zh": "APA的高中人格教学材料将精神动力理论置于历史背景，并提示其许多方面缺少实证支持；OpenStax也区分理论影响与现代研究支持。[3][2] 这些讨论帮助理解一套观念怎样进入心理学史，不为本页48条、四周时段、八个分组或双语等值性提供验证。",
        "en": "APA’s personality teaching unit places psychodynamic theories in historical context and notes limited empirical evidence for many aspects. OpenStax likewise distinguishes influence from modern support.[3][2] Such discussions contextualize a tradition without validating these forty-eight prompts, four-week frame, eight groups or bilingual equivalence."
      },
      {
        "zh": "评价一个具体题本，需要与用途和人群对应的信度、效度及可推广性证据；APA教学材料也分别讨论这些概念。[3] 本版尚无独立心理测量验证，透明计分只是可核对的描述规则。心理动力治疗、投射测验、防御机制研究与本页近期频率清单是不同对象，不能把其中一项研究直接套作另一项的证明。",
        "en": "A particular instrument needs evidence about reliability, validity and generalizability for its intended population and use, concepts separately discussed in the APA unit.[3] This edition has no independent psychometric validation. Transparent scoring establishes a checkable descriptive rule. Psychodynamic therapy, projective testing, defense research and this recent-frequency checklist are distinct objects; evidence about one cannot simply validate another."
      }
    ]
  },
  {
    "id": "freud-read-guides",
    "title": {
      "zh": "怎样读八份完整结果？分别核对，不选胜出者",
      "en": "How should you read all eight guides? Check each without a winner"
    },
    "paragraphs": [
      {
        "zh": "八份指南各含历史范围、较高读法、较低读法、混合情境、算例、反例、可选下一步和方法八节。较高或较低仅指本组动作的自报频率，没有设置人群高低分界。所有指南都可公开阅读，作答后也不因某主题均分较低或资料不足而锁住。",
        "en": "Each guide has eight sections: historical scope, higher and lower readings, mixed contexts, a worked example, counterexample, optional next step and method. Higher and lower refer to reported frequencies for that item set, without population-based bands. Every guide is public and remains available after responding, including low-frequency or insufficient themes."
      },
      {
        "zh": "各主题分别显示不等于已经证明统计独立，也不能按最大的均分挑出“真实人格”。一位参与者可能频繁寻求支持，同时频繁私下准备想法；两种动作并不互相抵消。可先读六条实际内容，再选一份与近期具体事件有关的指南，保留与自己经历不符的部分。",
        "en": "Separate displays do not establish statistical independence or make the largest mean a true personality. Frequent support-seeking and frequent private preparation can coexist without cancelling each other. Review the six actual prompts, then choose a guide relevant to an episode while retaining descriptions that do not fit your experience."
      }
    ]
  },
  {
    "id": "freud-use",
    "title": {
      "zh": "从结果到观察：一个场景、一个可选尝试",
      "en": "From result to observation: one episode and one optional attempt"
    },
    "paragraphs": [
      {
        "zh": "可以选一次普通讨论，写下自己先做了什么、是否听见其他需要，以及下一步是否更清楚。若某个追问延长讨论，可尝试提前说明问题想帮助哪个决定；若独自准备有帮助，也可以保留原做法。练习不要求降低或提高任何主题，不用分数变化判定成长、健康或治疗效果。",
        "en": "Choose an ordinary discussion and note your first action, other needs you noticed and whether the next step became clearer. If a question prolonged discussion, try stating which decision it should help. If private preparation worked, retaining it is also an option. No theme needs to rise or fall, and a changed score does not establish growth, health or treatment benefit."
      },
      {
        "zh": "点击开始直接进入题目，无额外同意页。预计约10分钟不是限时；需要暂停时可主动保存本标签页进度，最多24小时，完成或重测清除。默认不保存，分享只复制公开标题和链接，不含个人回答或均分。无需向页面输入童年经历、私人聊天或身份资料。",
        "en": "Start opens the questions directly without another agreement page. About ten minutes is an estimate, not a deadline. Optional saving retains progress in this tab for up to twenty-four hours and clears on completion or retake. Nothing is saved by default. Sharing copies only the public title and link, without answers or means; no childhood history, private messages or identifying details are requested."
      }
    ]
  }
];

export const freudianLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "八个主题就是弗洛伊德的八个发育阶段吗？",
      "en": "Are these themes Freud’s eight developmental stages?"
    },
    "answer": {
      "zh": "不是。八个旧名称来自一种个人历史解释，本页提问观察近期日常行为；本我、自我、超我和发育阶段也不是这八个计分主题。",
      "en": "No. The old names come from a personal historical interpretation, while these prompts concern recent actions. Id, ego, superego and developmental stages are not these eight scoring themes."
    }
  },
  {
    "question": {
      "zh": "求助、独处或仔细核对，能证明某种心理固着吗？",
      "en": "Do seeking help, solitude or checking establish fixation?"
    },
    "answer": {
      "zh": "不能。动作可能由任务、机会和角色等不同条件产生，频率不足以确定童年或潜意识原因。先回看具体情境。",
      "en": "No. Tasks, opportunities and roles can produce the same action. Frequency cannot establish a childhood or unconscious cause; inspect the situation."
    }
  },
  {
    "question": {
      "zh": "3.00是普通人的平均水平吗？",
      "en": "Is 3.00 the population average?"
    },
    "answer": {
      "zh": "不是。它是回答编码的算术中点，没有人群常模；不同分布也可能得到3.00，不代表相同经历。",
      "en": "No. It is an arithmetic midpoint of response codes, without population norms. Different distributions can yield 3.00 without matching experiences."
    }
  },
  {
    "question": {
      "zh": "所有主题都较常出现，会互相冲突吗？",
      "en": "Can several themes occur frequently together?"
    },
    "answer": {
      "zh": "可以同时出现。它们不是互斥类型，也没有固定总分预算；公开主张、寻求帮助和私下准备可发生在同一任务不同阶段。",
      "en": "Yes. They are not exclusive types or shares of a fixed total. Advocacy, help-seeking and private preparation can occur at different stages of one task."
    }
  },
  {
    "question": {
      "zh": "全部选NA会被判定回答无效吗？",
      "en": "Is choosing NA throughout treated as an invalid answer?"
    },
    "answer": {
      "zh": "不是。48条都有选择时可完成流程，但八个主题均无个人总和或均分；全部指南作为通用说明保留。未选择某题则仍是未完成。",
      "en": "No. Forty-eight selections can complete the flow with every theme insufficient and all guides available as general information. An unselected item remains incomplete."
    }
  },
  {
    "question": {
      "zh": "均分变化0.17能说明行为已经明显改变吗？",
      "en": "Does a 0.17 mean change establish a meaningful behavioral change?"
    },
    "answer": {
      "zh": "不能单凭这一点判断。一条频率编码变动一分就使六条均分约变0.17；本版没有测量误差或有意义变化阈值。",
      "en": "Not by itself. A one-code change on one of six items changes the mean by about 0.17. This edition has no measurement-error estimate or meaningful-change threshold."
    }
  },
  {
    "question": {
      "zh": "可以把结果换算成MBTI或大五人格吗？",
      "en": "Can these results be converted into MBTI or Big Five scores?"
    },
    "answer": {
      "zh": "没有这种换算依据。所问动作、分组和用途不同，相似词语不建立分数对应关系，也不能由本页推算另一个题本结果。",
      "en": "No conversion is established. Items, groups and uses differ; similar vocabulary does not establish a score correspondence or permit inferring another bank’s result."
    }
  },
  {
    "question": {
      "zh": "为什么只问近四周，而不问“我一直是什么人”？",
      "en": "Why ask about four weeks rather than who I have always been?"
    },
    "answer": {
      "zh": "这是本版限定的回顾时段，帮助围绕近期实例作答，不代表四周足以建立稳定人格或解释一生。情境没发生或无法判断时可选NA。",
      "en": "Four weeks is this edition’s chosen recall frame for recent examples, not proof of stable personality or a lifelong explanation. Use NA for unencountered or unjudgeable situations."
    }
  }
];

export const freudianLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "APA TOPSS（2014）：人格测量的信度、效度与精神动力理论教学",
      "en": "APA TOPSS (2014): personality measurement and psychodynamic theory teaching"
    },
    "url": "https://www.apa.org/ed/precollege/topss/lessons/personality.pdf"
  }
];
