import type { Questionnaire } from "@/lib/questionnaires/types";
export const connectionCheckInSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "What the connection and belonging check-in records",
      "zh": "联系与归属回顾记录什么"
    },
    "paragraphs": [
      {
        "en": "This original adult reflection organises twenty-one observations from the past four weeks. Seven statements concern unwanted distance, seven concern listening and support wanted, and seven concern finding a place to belong. The three topics may overlap; they are not separate diagnoses or an established three-factor psychological model.",
        "zh": "本原创成人回顾整理过去四周的二十一条观察：七条涉及不想要的疏远感，七条涉及想要的倾听与支持，七条涉及寻找归属的位置。三个主题可能重叠，不是不同诊断，也不是已经建立的三因素心理模型。"
      },
      {
        "en": "The result preserves each selected category and groups those labels into three records. It answers which descriptions you noticed and how you categorised them. It cannot establish why an experience occurred, how others feel about you or whether your relationships meet an external standard.",
        "zh": "结果保留每条所选类别，并按三个主题整理记录，回答注意到哪些描述、如何归类这些观察。它不能确定经历发生的原因、别人如何看待你，或你的关系是否符合某个外在标准。"
      }
    ]
  },
  {
    "id": "concepts",
    "title": {
      "en": "Loneliness, social isolation and chosen time alone",
      "zh": "孤独感、社会隔离与主动独处"
    },
    "paragraphs": [
      {
        "en": "WHO distinguishes loneliness as a distressing subjective gap in wanted or needed connection, and social isolation as an objective lack of roles, relationships and interactions. Its broader account of social connection also considers structure, support exchanged and interaction quality. These distinctions supply context, not validation of our original statements. [1]",
        "zh": "世界卫生组织区分两类情况：孤独感涉及想要或需要的连接与实际连接之间令人不适的主观落差；社会隔离涉及角色、关系与互动的客观不足。其社会连接概念也关注结构、支持交换与互动质量。这些区分提供背景，不验证本原创题目。[1]"
      },
      {
        "en": "A person can enjoy an evening alone and still want more company at another time. Someone with regular meetings may want more listening or a more welcoming place. In this exercise, those examples invite context-specific reflection; a calendar, living arrangement or contact count is not itself a loneliness result.",
        "zh": "一个人可以享受独处的夜晚，又在另一个时刻想要更多陪伴；经常开会的人，也可能想得到更多倾听，或找到更愿意接纳自己的场所。在本练习中，这些例子用于具体情境的回顾；日程、居住方式或联系人数本身都不是孤独结果。"
      }
    ]
  },
  {
    "id": "three-topics",
    "title": {
      "en": "Read the three topics without ranking your needs",
      "zh": "分别阅读三个主题，不给需要排序"
    },
    "paragraphs": [
      {
        "en": "Unwanted distance concerns occasions when available contact felt different from what you wanted. Listening and support wanted concerns the response you hoped for, such as having room to finish a thought. Finding a place to belong concerns how you experienced participation and having a place within a setting.",
        "zh": "不想要的疏远感关注可获得的联系与自己想要的联系存在落差的时刻；想要的倾听与支持关注期待怎样的回应，例如有空间把想法说完；寻找归属的位置关注参与某个环境、在其中拥有位置的体验。"
      },
      {
        "en": "One event can relate to more than one topic. A conversation may include company without the listening you wanted, or a group may offer activities while still feeling unfamiliar. Reading these possibilities does not assign blame to a friend or group, and the record does not choose a primary problem to fix.",
        "zh": "同一件事可能涉及多个主题：一次谈话可以提供陪伴，却没有自己期待的倾听；一个群体可以提供活动，却仍让人感到陌生。阅读这些可能性不归责朋友或群体，记录也不挑选必须解决的首要问题。"
      }
    ]
  },
  {
    "id": "answering",
    "title": {
      "en": "Use the four-week period and your own experience",
      "zh": "结合四周时间范围与本人经历作答"
    },
    "paragraphs": [
      {
        "en": "Recall the past four weeks rather than an ideal social life or only the most recent difficult day. Select how often you noticed the description. These labels do not specify an exact number of days or incidents, so do not convert Sometimes into a fixed weekly frequency.",
        "zh": "请回想过去四周，不以理想社交生活或最近一次难受的日子代替整个时间范围。选择多常注意到描述中的情况。类别没有规定确切天数或事件数量，因此不把“有时”换算成每周固定次数。"
      },
      {
        "en": "Access, schedules, language, caring responsibilities and the kinds of settings available can matter when recalling an example. This form does not separate their contributions or infer a cause from a response. You may leave any statement unscored, stop midway or read the guides without answering.",
        "zh": "回想实例时，可留意可及性、时间安排、语言、照顾责任及能够参与的环境。本题组不分离这些因素各自的影响，也不从一个回答推断原因。可以将任意一条明确保留为未计分、中途离开，或直接阅读指南。"
      }
    ]
  },
  {
    "id": "record-example",
    "title": {
      "en": "How seven statements become six category counts",
      "zh": "七条陈述怎样形成六类计数"
    },
    "paragraphs": [
      {
        "en": "Each theme retains seven responses. For a hypothetical set of Did not notice, Rarely, Sometimes, Sometimes, Often, Very often and Unscored, the six category counts are 1, 1, 2, 1, 1 and 1. Their sum is seven statements, not seven events or a seven-point score.",
        "zh": "每主题保留七条回答。假设依次选择没有注意到、很少、有时、有时、较常、经常和未计分，六类计数就是1、1、2、1、1、1，合计七条陈述，不是七次事件或七分。"
      },
      {
        "en": "The numbers used internally to identify options are not weights. Selecting Very often does not add four points; it places that statement in its labelled category. There is no summed loneliness score, average, highest topic, percentage, population comparison or threshold in this edition.",
        "zh": "内部用于识别选项的数字不是权重。选择“经常”不增加四分，而是将该条陈述记入对应类别。本版本没有孤独总分、均值、最高主题、百分比、人群比较或阈值。"
      }
    ]
  },
  {
    "id": "unscored-detail",
    "title": {
      "en": "Unscored is different from did not notice",
      "zh": "未计分与没有注意到如何区分"
    },
    "paragraphs": [
      {
        "en": "Did not notice is an observation about the described experience. Unscored instead includes having no relevant experience, being unable to recall or preferring not to answer. These different reasons share one label here; the output cannot tell which reason applies or treat them as absence of a need.",
        "zh": "“没有注意到”是对所描述经历的观察；“未计分”包括没有相关经历、无法回想或不愿回答。这些不同原因在本题组共用一个标签，输出无法进一步区分原因，也不能据此认为没有需要。"
      },
      {
        "en": "Seven unscored answers in a theme remain seven unscored answers. They are not replaced with zero, the least frequent category or an estimated value. All twenty-one statements can be explicitly left unscored and still produce a complete record with the same public guides and support information.",
        "zh": "一个主题七条全部未计分，结果就保留七条未计分，不替换为零、最低频率类别或估计值。二十一条均明确选择未计分，也可以形成完整记录，并阅读同样的公开指南与支持说明。"
      }
    ]
  },
  {
    "id": "evidence-scope",
    "title": {
      "en": "Original observations, published scales and evidence",
      "zh": "原创观察、已发表量表与研究证据"
    },
    "paragraphs": [
      {
        "en": "This is not an administration, translation or shortened form of the UCLA Loneliness Scale, the De Jong Gierveld scale or another published instrument. Shared subject matter does not supply an equivalent item set, scoring key, reference population or interpretation. Do not convert the category records into a published scale’s total.",
        "zh": "本页不是UCLA孤独量表、De Jong Gierveld量表或其他发表工具的施测、翻译或短版。讨论相似主题，不代表题目、计分键、参照人群或解释等值，不应将类别记录换算成已发表量表总分。"
      },
      {
        "en": "This original edition has no established norms, reliability estimates, validated decision cutoffs or demonstrated English–Chinese measurement equivalence. Both languages present the same intended topics and recording rules; that editorial alignment does not demonstrate psychometric equivalence. Repeated records cannot by themselves prove a clinical change.",
        "zh": "本原创版本尚无常模、信度估计、经验证的决策界点或中英文测量等值证据。两种语言提供相同设计主题与记录规则，但编辑层面的对齐不证明心理测量等值。重复记录本身也不能证明临床变化。"
      }
    ]
  },
  {
    "id": "optional-use",
    "title": {
      "en": "Use a specific example while keeping choice and privacy",
      "zh": "保留选择与隐私，用具体例子理解记录"
    },
    "paragraphs": [
      {
        "en": "If useful, privately choose one statement and recall where it did and did not fit. For example, wanting a conversation could mean wanting company, wanting someone to listen or wanting a different setting; the statement does not decide between these explanations. No written disclosure is requested.",
        "zh": "如有帮助，可以私下选择一条陈述，回想符合与不符合的场景。例如想要一次谈话，可能涉及想要陪伴、想被倾听或想换个环境；一条陈述不能替你判定是哪种解释。页面不要求提交书面私人经历。"
      },
      {
        "en": "You do not have to reconnect, reconcile or join a group because of a record. Support is available to discuss without completing this form or reaching any count. Answers stay in page memory and clear when you exit, retake, reload or leave. Copy public entry shares only the title and public address.",
        "zh": "不必因为记录而重新联系、和解或加入群体。无需完成本题组或达到某个计数，也可以询问支持。回答仅留页面内存，退出、重做、刷新或离页后清除；复制公开入口只分享标题与公开地址。"
      }
    ]
  }
];
export const connectionCheckInFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a scored loneliness test?",
      "zh": "这是计分式孤独测试吗？"
    },
    "answer": {
      "en": "No. It organises selected labels into three categorical records without a total, grade or cutoff.",
      "zh": "不是。它把所选标签整理为三个类别记录，不生成总分、等级或界点。"
    }
  },
  {
    "question": {
      "en": "What does 2 / 7 mean?",
      "zh": "2 / 7代表什么？"
    },
    "answer": {
      "en": "Two of seven statements were assigned that label. It is not two events, two days or a risk probability.",
      "zh": "表示七条陈述中两条选了该类别，不是两次事件、两天或风险概率。"
    }
  },
  {
    "question": {
      "en": "Can I leave every statement unscored?",
      "zh": "可以全部未计分吗？"
    },
    "answer": {
      "en": "Yes. Explicit unscored responses form a complete record without implying an absence of difficulty.",
      "zh": "可以。明确选择未计分能形成完整记录，不表示没有困难。"
    }
  },
  {
    "question": {
      "en": "Do three topics mean three independent dimensions?",
      "zh": "三个主题就是三个独立维度吗？"
    },
    "answer": {
      "en": "No. These are overlapping editorial groupings, without established factor-structure evidence.",
      "zh": "不是。它们是可以重叠的编辑分组，尚无已建立的因素结构证据。"
    }
  },
  {
    "question": {
      "en": "Can I compare this with a UCLA score?",
      "zh": "可以与UCLA分数比较吗？"
    },
    "answer": {
      "en": "No. The item set and output differ; this form supplies no conversion to any published scale.",
      "zh": "不能。题目与输出不同，本题组没有向任何已发表量表的换算。"
    }
  },
  {
    "question": {
      "en": "Does a later record prove improvement?",
      "zh": "之后的记录能证明改善吗？"
    },
    "answer": {
      "en": "Not by itself. Compare the period, opportunities, individual statements and missing information; no measurement-error estimate is established here.",
      "zh": "单凭记录不能。应结合时间范围、机会、逐条陈述与信息缺口阅读，本版本尚无测量误差估计。"
    }
  },
  {
    "question": {
      "en": "Do I need to disclose a relationship or join a group?",
      "zh": "需要披露关系经历或加入群体吗？"
    },
    "answer": {
      "en": "No. You can keep boundaries, leave the exercise and read all three complete guides privately.",
      "zh": "不需要。可以保留边界、退出练习，并私下阅读三篇完整指南。"
    }
  },
  {
    "question": {
      "en": "Does beginning require an agreement checkbox?",
      "zh": "开始前需要勾选同意吗？"
    },
    "answer": {
      "en": "No. Begin original observations opens the first statement directly; instructions and support remain readable.",
      "zh": "不需要。点击开始原创观察直接进入第一条，作答说明与支持信息仍可阅读。"
    }
  }
];
