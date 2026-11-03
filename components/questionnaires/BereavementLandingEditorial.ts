import type { Questionnaire } from "@/lib/questionnaires/types";
export const bereavementSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "After a bereavement: what this personal reflection records",
      "zh": "重要的人去世之后：个人回顾记录什么"
    },
    "paragraphs": [
      {
        "en": "Sixteen original adult observations organise five topics: missing the person, changed roles and descriptions, distance from reminders, future plans and activities, and feelings and receiving support. The first topic contains four observations and the others contain three each. They are overlapping reading categories, not a sequence to complete.",
        "zh": "十六条原创成人观察整理五个主题：想念去世的人、变化的角色与自我描述、与提醒材料保持距离、之后的计划与活动，以及感受与接受支持。第一主题四条，其余各三条。它们是可以重叠的阅读分类，不是需要依次完成的阶段。"
      },
      {
        "en": "The result keeps the label selected for every observation and shows six category counts within each topic. All five complete guides are available before answering. The record describes what you noticed; it does not measure the importance of the person, how much you loved them or how well you are grieving.",
        "zh": "结果保留每条观察所选标签，并展示各主题的六类计数；五篇完整指南在作答前就可阅读。记录描述自己注意到什么，不衡量那个人的重要程度、爱得多少或哀伤表现好坏。"
      }
    ]
  },
  {
    "id": "grief-varies",
    "title": {
      "en": "Different feelings do not form a required order",
      "zh": "不同感受不构成规定顺序"
    },
    "paragraphs": [
      {
        "en": "NHS guidance notes that grief affects people differently and that feelings can appear unexpectedly. It also explains that experiences described as stages may not all occur or follow a particular order. These points offer background for understanding variation, not a method for assigning this form’s five topics to grief stages. [1]",
        "zh": "NHS说明，哀伤对不同人的影响不同，感受可能意外出现；被称为阶段的体验也不一定全部发生或按某种顺序发生。这些说明帮助理解差异，不是把本题组五个主题分配到哀伤阶段的方法。[1]"
      },
      {
        "en": "In this reflection, someone can miss the person during an ordinary moment, find a role difficult to describe and feel uncertain about receiving support in the same period. A category changing on a later visit does not show movement forward or backward through a set of stages.",
        "zh": "在本回顾中，一个人可以在普通时刻想念对方，同时难以描述变化后的角色，又对接受支持感到不确定。之后某个类别发生变化，不表示在一套阶段中前进或退步。"
      }
    ]
  },
  {
    "id": "topics-and-examples",
    "title": {
      "en": "Read the five topics through specific situations",
      "zh": "结合具体场景阅读五个主题"
    },
    "paragraphs": [
      {
        "en": "Missing the person concerns moments such as wanting to share an ordinary event. Changed roles concerns how decisions, responsibilities or descriptions of your place now feel different. Distance from reminders concerns occasions when objects, places or conversations felt difficult to approach.",
        "zh": "想念去世的人关注想分享普通事情等时刻；变化的角色关注决定、责任或对自身位置的描述怎样变得不同；与提醒保持距离关注当时觉得难以接近物品、场所或谈话的经历。"
      },
      {
        "en": "Future plans concerns imagining activities without the person, while feelings and support concerns noticing feelings and finding words for wanted comfort. A response cannot tell why a situation was difficult or prescribe approaching a reminder, sorting belongings or resuming an activity. You may keep your boundaries.",
        "zh": "之后的计划关注想象没有对方参与的活动，感受与支持关注留意情绪、为想要的安慰找到说法。一个回答不能确定某个场景困难的原因，也不分配接近提醒、整理遗物或恢复活动的任务；可以保留自己的边界。"
      }
    ]
  },
  {
    "id": "recall-period",
    "title": {
      "en": "The four-week recall window and optional elapsed time differ",
      "zh": "四周回顾窗口与可选经过时间的区别"
    },
    "paragraphs": [
      {
        "en": "Recall the past four weeks after the death. If the death was more recent, consider only the days since it happened. Where several losses are relevant, you can privately choose one without naming the person. The window organises recall rather than determining how long grief should last.",
        "zh": "回顾过去四周中离世之后的日子；若离世更近，只看发生之后的时间。涉及多次失去时，可以私下选一次，无需说出姓名。这个窗口用来组织回忆，不规定哀伤应持续多久。"
      },
      {
        "en": "Elapsed timing is optional: less than three months, three to twenty-four months, more than twenty-four months, cannot place the timing or prefer not to answer. It defaults to withholding. Changing that background leaves the observation counts, public guides and support access unchanged; the periods are not diagnostic cutoffs.",
        "zh": "经过时间是可选背景，包括不足三个月、三至二十四个月、超过二十四个月、无法判断时间及不愿回答，默认保留回答。改变时间背景不改变观察计数、公开指南或支持获取条件，这些时段不是诊断界点。"
      }
    ]
  },
  {
    "id": "count-example",
    "title": {
      "en": "How selected labels become six category counts",
      "zh": "所选标签怎样形成六类计数"
    },
    "paragraphs": [
      {
        "en": "For a hypothetical four-observation topic, selecting Did not notice, Sometimes, Sometimes and Unscored gives counts of 1, 0, 2, 0, 0 and 1 in the six displayed categories. Their sum is four observations, not four events, days or points. Labels such as Sometimes have no fixed day-count definition here.",
        "zh": "假设一个四条观察的主题依次选择没有注意到、有时、有时和未计分，六个展示类别的计数为1、0、2、0、0、1，合计四条观察，不是四次事件、四天或四分。本题组没有把“有时”等标签定义为固定天数。"
      },
      {
        "en": "Selecting Very often places an observation in that category; it does not add four points. Topics contain different numbers of observations and are not ranked by their counts. The output calculates no grief total, average, severity band, risk percentage, highest theme or recovery progress.",
        "zh": "选择“经常”将该条观察归入对应类别，不增加四分。各主题条数不同，不按计数排名。输出不计算哀伤总分、平均值、严重程度分档、风险百分比、最高主题或康复进度。"
      }
    ]
  },
  {
    "id": "missing-information",
    "title": {
      "en": "Unscored preserves a gap in information",
      "zh": "未计分保留信息缺口"
    },
    "paragraphs": [
      {
        "en": "Did not notice describes your observation of the stated experience. Unscored instead covers no relevant experience, unclear recall or choosing not to answer. These reasons share one category in this edition, so the result cannot distinguish them or replace them with Did not notice.",
        "zh": "“没有注意到”描述对所述体验的观察；“未计分”则包括没有相关经历、回想不清或选择不回答。本版将这些原因放在同一个类别，结果无法进一步区分，也不把它替换为没有注意到。"
      },
      {
        "en": "All sixteen explicit unscored choices can form a complete record with no personal finding. All five guides and the support information remain available. A low count or an entirely unscored topic does not establish that you are unaffected, need no support or cared less about the person.",
        "zh": "十六条均明确选择未计分，也能形成完整记录，但不提供个人发现。五篇指南及支持说明仍可阅读；计数少或主题全部未计分，不能说明自己不受影响、不需要支持或较少在意对方。"
      }
    ]
  },
  {
    "id": "clinical-distinction",
    "title": {
      "en": "Original observations and a clinical grief assessment",
      "zh": "原创观察与专业哀伤评估的区别"
    },
    "paragraphs": [
      {
        "en": "The American Psychiatric Association describes prolonged grief disorder using persistent symptoms, distress or difficulties in functioning, elapsed time and social, cultural or religious context. Elapsed time alone is not the full assessment. This page does not administer those criteria or decide whether a person has the disorder. [2]",
        "zh": "美国精神医学学会对延长哀伤障碍的说明涉及持续症状、痛苦或日常功能困难、经过时间，以及社会、文化或宗教情境。仅有经过时间不是完整评估；本页不施测这些标准，也不判定个人是否存在该障碍。[2]"
      },
      {
        "en": "These sixteen original bilingual observations are not the Inventory of Complicated Grief, PG-13 or another published grief scale. There are no established norms, reliability estimates, diagnostic thresholds or demonstrated English–Chinese measurement equivalence for this edition. External guidance does not validate the five topics or category rules.",
        "zh": "这十六条原创双语观察不是复杂哀伤量表、PG-13或其他发表哀伤工具。本版本尚无已建立常模、信度估计、诊断阈值或经验证的中英文测量等值，外部指导不验证五个主题或类别记录规则。"
      }
    ]
  },
  {
    "id": "choice-privacy",
    "title": {
      "en": "Keep support, choice and privacy independent of the record",
      "zh": "支持、选择与隐私不依赖记录"
    },
    "paragraphs": [
      {
        "en": "You can ask a qualified professional or a suitable bereavement service about support without finishing the exercise, reaching a count or waiting for a date. If useful, privately choose one observation to describe what you would like help with. No narrative, name, death details or reminder exposure is requested.",
        "zh": "无需完成练习、达到某种计数或等到某个日期，也可以向合格专业人士或适合自己的丧失支持服务询问信息。如有帮助，可私下选一条观察描述自己希望获得什么帮助。页面不要求叙述、姓名、离世经过或接触提醒材料。"
      },
      {
        "en": "Answers and optional timing stay in current-page memory. Exit, retake, reload and leaving clear both; no draft or personal result address is created. Copy public entry shares only the public title and address. Repeated category records do not by themselves prove recovery, deterioration or the effect of a treatment.",
        "zh": "回答与可选时间仅留当前页面内存，退出、重做、刷新或离页会一并清除，不创建草稿或个人结果地址。复制公开入口只分享公开标题与地址。重复类别记录本身不能证明康复、恶化或某项治疗的效果。"
      }
    ]
  }
];
export const bereavementFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Are the five topics five stages of grief?",
      "zh": "五个主题就是哀伤的五个阶段吗？"
    },
    "answer": {
      "en": "No. They are overlapping groups of observations, without a sequence or stage assignment.",
      "zh": "不是。它们是可以重叠的观察分组，没有先后顺序或阶段判定。"
    }
  },
  {
    "question": {
      "en": "What if the death happened less than four weeks ago?",
      "zh": "离世不足四周时怎样回顾？"
    },
    "answer": {
      "en": "Consider only the days since the death. The four-week window does not require waiting before answering or asking for support.",
      "zh": "只回顾离世之后的日子。四周窗口不要求等待后才能作答或询问支持。"
    }
  },
  {
    "question": {
      "en": "Can I answer without choosing a time period?",
      "zh": "不选择经过时间也能作答吗？"
    },
    "answer": {
      "en": "Yes. Prefer not to answer is the default. Begin original observations opens the first observation directly.",
      "zh": "可以。时间默认不愿回答，点击开始原创观察直接进入第一条。"
    }
  },
  {
    "question": {
      "en": "Why does one topic have four observations and the others three?",
      "zh": "为什么一个主题四条，其余各三条？"
    },
    "answer": {
      "en": "That is the original bank’s grouping. Counts use each topic’s own denominator and are not comparable severity scores.",
      "zh": "这是原题组的分组设计。计数使用各主题自己的分母，不是可比较的严重程度分数。"
    }
  },
  {
    "question": {
      "en": "Does Very often add four points?",
      "zh": "“经常”会增加四分吗？"
    },
    "answer": {
      "en": "No. It records one observation in the Very often category. Option identifiers are not scoring weights.",
      "zh": "不会。它将一条观察记入经常类别，选项标识不是计分权重。"
    }
  },
  {
    "question": {
      "en": "Does changing the timing change my results?",
      "zh": "改变时间背景会改变结果吗？"
    },
    "answer": {
      "en": "No. Identical observation choices always produce identical category counts for every timing option.",
      "zh": "不会。同样的观察选择，在任何时间选项下都产生相同类别计数。"
    }
  },
  {
    "question": {
      "en": "Can an entirely unscored record be completed?",
      "zh": "全部未计分也能完成吗？"
    },
    "answer": {
      "en": "Yes. All sixteen observations can be explicitly unscored, preserving missing information rather than inferring no difficulty.",
      "zh": "可以。十六条均可明确选择未计分，保留信息缺口，不推断没有困难。"
    }
  },
  {
    "question": {
      "en": "Does a later record establish recovery or treatment benefit?",
      "zh": "之后的记录能确定康复或治疗获益吗？"
    },
    "answer": {
      "en": "No. Context, opportunities and recall can differ, and this edition has no validated change threshold or causal evaluation method.",
      "zh": "不能。情境、机会与回忆可能不同，本版没有经验证的变化界点或因果评估方法。"
    }
  }
];
