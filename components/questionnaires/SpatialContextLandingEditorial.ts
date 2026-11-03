import type { Text } from "@/lib/questionnaires/types";

export const spatialContextSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Spatial thinking in daily life: what these four prompts record",
      "zh": "日常空间关系：四条描述记录什么"
    },
    "paragraphs": [
      {
        "en": "Four original prompts invite adults to recall ordinary opportunities during their own past four weeks: trying to anticipate an object’s orientation after an imagined turn, uncertainty about left and right after a turn, keeping relative positions in mind and difficulty retaining a relation while imagining movement.",
        "zh": "四条原创描述，供成年人回顾本人过去四周的普通机会：尝试推想物品转动后的朝向、对转动后的左右不确定、在心里保留相对位置，以及推想移动时难以维持两个部分之间的关系。"
      },
      {
        "en": "Completion produces one private category record and access to the same complete public guide available before answering. The exercise describes remembered thinking. It asks for no spatial solution, object manipulation, drawing, new puzzle or demonstration of ability.",
        "zh": "完成后得到一份私人类别记录，并可阅读与作答前相同的完整公开指南。本练习描述回忆中的思考，不要求提交空间答案、操作物体、绘图、新做谜题或演示能力。"
      }
    ]
  },
  {
    "id": "orientation",
    "title": {
      "en": "Orientation and relative position describe different relations",
      "zh": "朝向与相对位置，是不同的关系"
    },
    "paragraphs": [
      {
        "en": "Orientation concerns which way an object faces. Relative position concerns where one part is in relation to another. Imagining a turn can make either relation worth considering, but recalling an attempt to think it through does not establish that the imagined outcome was correct.",
        "zh": "朝向涉及物品面向哪里，相对位置涉及一个部分处于另一个部分的什么位置。推想转动时，两者都可能需要考虑；但记得曾尝试推想，不证明想出的结果正确。"
      },
      {
        "en": "Left and right depend on the reference being used. These recollection prompts supply no fixed coordinate system, drawing or keyed arrangement against which to check your thought. A label describing uncertainty therefore remains an experience report rather than a recorded spatial error.",
        "zh": "左右需要明确所用参照。本组回忆描述没有固定坐标系、图形或可核对的标准摆放，无法据此检查思考结果。因此，描述不确定的标签属于体验报告，不是一次已核实的空间错误。"
      }
    ]
  },
  {
    "id": "representation",
    "title": {
      "en": "Spatial relations, mental pictures and external diagrams",
      "zh": "区分空间关系、脑中画面与外部示意图"
    },
    "paragraphs": [
      {
        "en": "Thinking about a relation can involve words, an abstract relation, a sketch-like impression or a vivid picture. The prompts do not require any one of these descriptions. They cannot determine imagery vividness, aphantasia, vision or which representation someone actually used successfully.",
        "zh": "思考一种关系可以涉及语言、抽象联系、草图般印象或生动画面，题目不要求某一种方式。它不能确定意象生动性、心盲症、视力，或某个人实际成功使用了何种表征。"
      },
      {
        "en": "Using a drawn plan is an external aid; describing an internal picture is another question. Neither is interchangeable with reporting a recent attempt to consider relative positions. The existing imagery and visual-arrangements resources keep their own questions and methods, without transferring answers or creating a combined cognitive style.",
        "zh": "使用画出来的平面图属于外部辅助，描述脑中的画面属于另一个问题。两者都不能替代对近期空间思考尝试的回顾。既有视觉意象与视觉安排资源保留各自问题和方法，不转移回答，也不生成联合认知风格。"
      }
    ]
  },
  {
    "id": "attempts-and-difficulty",
    "title": {
      "en": "An attempt, uncertainty and difficulty may coexist",
      "zh": "尝试、不确定与困难，可以并存"
    },
    "paragraphs": [
      {
        "en": "A person might try to anticipate an orientation while finding one relation difficult to hold in mind. Both descriptions can fit the same occasion. The record keeps each selection without treating the difficulty statement as a reverse-scored version of an attempt or subtracting one from the other.",
        "zh": "一个人可能尝试推想朝向，同时觉得某种关系难以在心里保留。两种描述可以符合同一次机会。记录逐条保留选择，不把困难陈述当成尝试陈述的反向题，也不让两者相减。"
      },
      {
        "en": "Noticing difficulty does not measure its size or identify a cause. Familiarity, task conditions, opportunities and recall may differ between occasions, but this form cannot determine their contribution. There is no preferred pattern that proves strong spatial ability or a pattern that establishes a deficit.",
        "zh": "注意到困难不能测量困难大小或识别原因。熟悉程度、任务条件、机会与回忆在不同场合可能不同，但题本不能确定各自影响。不存在能证明空间能力强的理想答法，也没有确立缺陷的答案组合。"
      }
    ]
  },
  {
    "id": "category-counts",
    "title": {
      "en": "Read six category counts across four descriptions",
      "zh": "四条描述的六类计数，怎样阅读"
    },
    "paragraphs": [
      {
        "en": "Five labels run from not noticing a description on relevant occasions to noticing it very often. A sixth leaves the item unscored because there was no relevant occasion, recall is unclear or you prefer not to answer. These three reasons share one unscored option; the website cannot separate them afterwards.",
        "zh": "五个标签从有相关机会时未注意到，到经常注意到。第六个选项用于没有相关机会、回忆不清或不愿回答时保留未计分。后三种原因共用一个选项，网站无法在之后将它们分开。"
      },
      {
        "en": "For example, one sometimes, one often and two unscored produce counts 0, 0, 1, 1, 0 and 2 in displayed order. They add to four statements, not four tasks, days or successful rotations. Category identifiers are not points. No sum, mean, percentage of ability, leading style or pass mark is calculated.",
        "zh": "例如，一条有时、一条较常、两条未计分，按展示顺序计数为0、0、1、1、0、2，合计四条陈述，而不是四个任务、四天或四次成功旋转。类别标识不是点数，不计算总分、均值、能力百分比、主导风格或及格线。"
      }
    ]
  },
  {
    "id": "method-evidence",
    "title": {
      "en": "A recollection differs from a timed mental-rotation task",
      "zh": "回忆描述与计时心理旋转任务的区别"
    },
    "paragraphs": [
      {
        "en": "Shepard and Metzler’s 1971 research abstract describes the time taken to recognize whether perspective drawings depict the same three-dimensional shape at different orientations. Its observations concern performance on specified stimuli. These four prompts collect neither a keyed judgment nor a response-time measure. [1]",
        "zh": "Shepard与Metzler于1971年发表的研究摘要，描述辨认不同朝向的透视图是否呈现同一三维形状所需的时间。研究观察针对明确刺激材料上的表现。本页四条描述既不收集可核答案，也不测量反应时。[1]"
      },
      {
        "en": "That method distinction does not validate this original form. Reliability, validity, norms and English–Chinese measurement equivalence have not been established for it. A laboratory finding, a commercial test norm or another questionnaire’s accuracy cannot be assigned to these new recollection labels.",
        "zh": "这种方法区分不等于验证本原创题本。它尚未建立自身信度、效度、常模与中英文测量等值证据。实验室发现、商业测验常模或另一份问卷的准确度，都不能套用到这组新的回忆标签。"
      }
    ]
  },
  {
    "id": "practical-use",
    "title": {
      "en": "Use actual task requirements rather than a label",
      "zh": "实际任务按真实要求处理"
    },
    "paragraphs": [
      {
        "en": "For an ordinary arrangement, a written sequence, diagram or suitable object may help clarify requirements. Choose an aid by the task rather than by a label from this page. Remembering that a relation felt clear does not verify that parts fit, a route is safe or a practical plan will work.",
        "zh": "普通安排中，文字顺序、示意图或合适物品可以帮助澄清要求。应按任务选择辅助，而不是依据本页标签。记得某种关系想得清楚，不能核实部件能否拼合、路线是否安全或实际计划是否可行。"
      },
      {
        "en": "No training assignment, repeated practice or improvement target follows from a count. The record cannot rank people for education, employment, navigation or a profession. It also provides no reason to abandon an aid that is useful in a real setting.",
        "zh": "计数不附带训练任务、重复练习或改善目标。记录不能用于教育、招聘、导航或专业资格排名，也不构成放弃实际情境中有用辅助的理由。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Private recollection, optional answers and public reading",
      "zh": "私人回顾、自愿回答与公开阅读"
    },
    "paragraphs": [
      {
        "en": "Responses remain only in the current page memory. There is no draft storage, answer submission, questionnaire analytics or private result address. Reloading, leaving, exit or retake clears the previous record. Copy public entry copies only the public title and link, without selected labels.",
        "zh": "回答只留当前页面内存，不存草稿、不提交答案、不作问卷分析，也没有私人结果地址。刷新、离开、退出或重做会清除原记录。“复制公开入口”只复制公开标题与链接，不含所选标签。"
      },
      {
        "en": "You may leave every item unscored or read the complete guide without answering or registering. No explanation of a difficulty is required. A different answer on another occasion may reflect opportunity, recall or interpretation; this form has no measure of ability change or test–retest threshold.",
        "zh": "可以将全部条目保留为未计分，也可以不答题、不注册就阅读完整指南，无需解释困难。另一次回答不同，可能涉及机会、回忆或理解差异；题本没有能力变化指标或重测阈值。"
      }
    ]
  }
];

export const spatialContextFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who can use this reflection, and how long does it take?",
      "zh": "适合谁使用，约需多久？"
    },
    "answer": {
      "en": "Adults can use four original prompts to recall their own past four weeks. Allow about two minutes at your own pace. The full guide is free without an account or prior answers.",
      "zh": "供成年人用四条原创描述回顾本人过去四周，约需两分钟，可按个人节奏进行。无需账户或先作答即可免费阅读完整指南。"
    }
  },
  {
    "question": {
      "en": "Does often noticing a difficulty lower my result?",
      "zh": "较常注意到困难，会降低结果吗？"
    },
    "answer": {
      "en": "No. Each selected label is retained as an observation. Difficulty is not reversed, subtracted or combined with attempts into a performance score. There is no higher or lower ability result.",
      "zh": "不会。每个标签作为观察分别保留。困难不反向、不相减，也不与尝试合成为表现分数；没有较高或较低的能力结果。"
    }
  },
  {
    "question": {
      "en": "Is no relevant occasion the same as not noticing?",
      "zh": "没有相关机会，与没有注意到一样吗？"
    },
    "answer": {
      "en": "No. The first uses the unscored option, which also covers unclear recall and withholding. Not noticing is a description chosen for relevant occasions. The result does not replace an unscored item with zero or infer its reason.",
      "zh": "不同。无机会使用未计分选项，该选项也包括回忆不清和保留回答。没有注意到针对有相关机会的情况。结果不把未计分补为零，也不推断其原因。"
    }
  },
  {
    "question": {
      "en": "Can I receive a record with all four items unscored?",
      "zh": "四条全部未计分，也能查看记录吗？"
    },
    "answer": {
      "en": "Yes. All four selections remain visible and the same full guide remains available. This pattern establishes neither low ability nor an absence of practical support needs.",
      "zh": "可以。四条选择分别保留，同一篇完整指南仍然可读。这种组合既不证明能力低，也不证明不需要实际支持。"
    }
  },
  {
    "question": {
      "en": "Do I need to rotate an object, draw or solve a puzzle now?",
      "zh": "现在需要转动物品、绘图或解谜吗？"
    },
    "answer": {
      "en": "No. Use a broad recollection of an existing ordinary occasion, or leave the item unscored. The exercise has no keyed spatial solution, timer or performance demonstration.",
      "zh": "不需要。可以使用对已有普通机会的宽泛回忆，或保留未计分。本练习没有标准空间答案、计时器或表现演示。"
    }
  },
  {
    "question": {
      "en": "Can it identify a visual learner or a fixed cognitive style?",
      "zh": "能确定视觉学习者或固定认知风格吗？"
    },
    "answer": {
      "en": "No. Recalled spatial thinking, internal imagery and using external diagrams are different descriptions. These four labels do not assign a learning style, neurotype or career fit.",
      "zh": "不能。回忆中的空间思考、内在意象与使用外部示意图，是不同描述。四条标签不分配学习风格、神经类型或职业适配。"
    }
  },
  {
    "question": {
      "en": "Can I compare my record with another person’s?",
      "zh": "可以拿记录与别人比较吗？"
    },
    "answer": {
      "en": "The form provides no common task performance or reference population for such a ranking. Different opportunities and interpretations may lead to different labels. Counts describe the four selected statements, not comparative ability.",
      "zh": "题本没有可用于排名的共同任务表现或参照人群。机会与理解不同，都可能带来不同标签。计数描述四条所选陈述，不表示相对能力。"
    }
  },
  {
    "question": {
      "en": "Does a changed retake show that practice worked?",
      "zh": "重做时变了，能说明练习有效吗？"
    },
    "answer": {
      "en": "This form cannot establish a training effect. It has no verified accuracy, speed, training outcome or change threshold. Use the requirements and evidence of a real task when evaluating that task.",
      "zh": "本题本不能确立训练效果。它没有经核实的准确度、速度、训练结果或变化阈值。评价实际任务时，应依据该任务的要求和证据。"
    }
  }
];

export const spatialContextReadingSummaries: Record<string, Text> = {
  "spatial-relationships-reading": {
    "en": "Read orientation, relative position, attempts and uncertainty in context; distinguish recollection labels from checked spatial performance and mental imagery.",
    "zh": "结合语境理解朝向、相对位置、尝试与不确定，区分回忆标签、可核空间表现与内在意象。"
  }
};
