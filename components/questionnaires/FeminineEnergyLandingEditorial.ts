import type { Questionnaire } from "@/lib/questionnaires/types";

export const feminineEnergyLandingSections: Questionnaire["guide"] = [
  {
    "id": "expression-concept",
    "title": {
      "zh": "女性气质能量是什么？先确定本页观察的对象",
      "en": "What does feminine energy mean here? Define the observations first"
    },
    "paragraphs": [
      {
        "zh": "在本页，“能量”指一种日常表达的比喻，不是可以由问卷检测的生理量。WHO区分社会建构的性别规范与角色、生理性别和性别认同，并指出社会性别规范会因社会和时间而变化。[1] 这有助于理解为什么某种表达会被文化称为“女性化”，但不能证明它只属于女性，也不能验证本题组。",
        "en": "Here, energy is a metaphor for everyday expression rather than a physiological quantity detectable by a questionnaire. WHO distinguishes socially constructed gender norms and roles from sex and gender identity, noting that gender varies across societies and time.[1] This helps contextualise culturally feminine labels without establishing that an expression belongs exclusively to women or validating this bank."
      },
      {
        "zh": "四组名称是整理20项原创观察的内容标签：亲昵俏皮、鲜明表达、诗意细节、从容主张。它们不构成完整人格理论，也没有被证实为四个相互独立的心理因子。可以使用更贴近自己的语言复盘这些动作，不必认领女王、女神、明暗能量或任何固定身份。",
        "en": "The four names organise twenty original observations: Playful Warmth, Expressive Flair, Poetic Detail and Composed Clarity. They neither constitute a complete personality theory nor establish four independent psychological factors. Use language that fits your own experience without adopting a queen, goddess, light/dark energy or fixed identity."
      }
    ]
  },
  {
    "id": "expression-four-themes",
    "title": {
      "zh": "四组表达各看什么？从行为区分相近主题",
      "en": "What do the four expression themes observe? Distinguish related actions"
    },
    "paragraphs": [
      {
        "zh": "亲昵俏皮看熟悉且双方愿意的互动中，小玩笑、共同暗号与具体感谢；鲜明表达看自选颜色、标题或展示重点是否让个人特点可见。前者侧重共同延续的趣味，后者侧重愿意展示的特点。一个活动标题可以兼有两者，也可以只是清楚说明内容，没有必要每次都俏皮醒目。",
        "en": "Playful Warmth concerns little jokes, shared signs and specific thanks in familiar, mutually wanted exchanges. Expressive Flair concerns making a characteristic visible through a chosen colour, title or highlight. One centres shared play; the other centres a feature you choose to show. An activity title may do both, or simply explain its content without being playful or conspicuous."
      },
      {
        "zh": "诗意细节看留意声音、文字和小物如何承接具体时刻，并为此调整一个细节；从容主张看在自愿小安排中把偏好、标准或范围说清楚。一个纪念卡片可以私下留有意味，一句范围说明也可以低调明确。这里记录表达动作，不以作品质量、外界赞赏或他人服从判定结果。",
        "en": "Poetic Detail concerns noticing how sounds, words or objects hold a moment and adjusting a detail accordingly. Composed Clarity concerns stating preferences, standards or scope in voluntary small arrangements. A memento can hold private meaning, and a scope statement can remain quiet and clear. These observations concern expressive actions rather than artistic quality, praise or compliance."
      }
    ]
  },
  {
    "id": "expression-answer-window",
    "title": {
      "zh": "怎样回答20项？固定四周，区分频率与机会",
      "en": "How should you answer the twenty items? Keep the four-week window and opportunities visible"
    },
    "paragraphs": [
      {
        "zh": "先选定过去四周，再按每项描述回忆实际发生过的自愿场面。频率选项从1到5，对应几乎没有至几乎总是；记录已经发生的动作，不把“我希望这样”或“别人喜欢这样”替代经历。同样一句话在熟人聊天与正式流程中可能不同，应按条目给定的场面回答。",
        "en": "Use the past four weeks and recall actual voluntary situations matching each item. Frequency choices run from one to five, from almost never to almost always. Record what happened rather than what you wish had happened or what others might prefer. Familiar conversation and formal procedures offer different settings; follow the situation specified by the item."
      },
      {
        "zh": "“未经历／无法判断”用于缺少相关机会或记忆不足；它不是低频的另一种写法。有合适机会却很少做，与根本没有合适场面，提供的是不同信息。每题都需选择后才生成结果，但选择无法判断同样算完成这一题，不要求编造经历或补足一个漂亮的画像。",
        "en": "Not experienced / cannot judge covers absent opportunities or insufficient recall, not another way to report low frequency. Rarely doing something when an opportunity exists differs from having no fitting situation. Results require a choice for every item; cannot judge completes an item without requiring an invented experience or a flattering self-portrait."
      }
    ]
  },
  {
    "id": "expression-arithmetic",
    "title": {
      "zh": "四组均分怎样计算？有效项、缺失项与一位小数",
      "en": "How are the four means calculated? Rated items, missing information and rounding"
    },
    "paragraphs": [
      {
        "zh": "每组五项，只有1—5的数字回答进入加总与有效项数；无法判断不记0，也不进入分母。每组至少三项有效才显示个人均分，公式是有效分数之和除以有效项数，再四舍五入到一位小数。新算例：2、4、5、无法判断、无法判断，合计11、有效3项，显示3.7；只有2和4两项有效则显示资料不足。",
        "en": "Each five-item group adds only numeric ratings from one to five and counts those rated items. Cannot judge is neither zero nor part of the denominator. A personal mean requires at least three rated items: divide their sum by their count and round to one decimal. A fresh example of two, four, five and two unjudged items totals eleven across three rated items, displaying3.7. Only two and four rated produces insufficient information."
      },
      {
        "zh": "本题没有反向题或权重，四组分别计算，不相加为女性程度总分，也不把最高均分指定为主型。3.7是本组回答的算术摘要，不是人群百分位；一位小数是显示规则，不是测量误差或精度声明。均分相同保留各自结果，接近也无需强行排序。",
        "en": "There are no reverse-scored items or weights in this bank. Groups are calculated separately without a total femininity score or highest-mean primary type. A mean of3.7 summarises these ratings, not a population percentile. One decimal is a display rule rather than an estimate of measurement error or precision. Equal or close means need no forced ranking."
      }
    ]
  },
  {
    "id": "expression-reading",
    "title": {
      "zh": "怎样读完整结果？把均分带回具体表达",
      "en": "How should you read the full results? Return from means to specific expressions"
    },
    "paragraphs": [
      {
        "zh": "先看每组有几项有效，再核对自己回答过哪些动作，最后读对应完整指南。三项有效与五项有效即使均分一样，所依据的材料也不同；不能只看条形或数字就认定哪种表达最能定义自己。四组都资料不足时，仍可阅读全部四份指南，但没有个人均分可解释。",
        "en": "First inspect rated-item counts, then the actions you rated, and finally the corresponding full guide. Equal means based on three and five items have different supporting material. A bar or number cannot by itself define your expression. Even when all groups lack sufficient information, all four guides remain readable without personal means to interpret."
      },
      {
        "zh": "可用一个新虚构例子区分主题：朋友一起安排书签交换，你加入共同懂的小玩笑，选一个醒目的标题，调整纸张颜色以贴近纪念的意味，再说清自己只负责哪一部分。四种动作可以同场出现。复盘时分别问“做了什么、有什么机会、自己想表达什么”，不需要把这件事归入一个女性原型。",
        "en": "In a fresh fictional bookmark exchange, you add a shared joke, choose a noticeable title, adjust paper colour to fit the occasion and state which part you will handle. Four actions can coexist in one event. Revisit what you did, what opportunities existed and what you wanted to express without assigning the event to a feminine archetype."
      }
    ]
  },
  {
    "id": "expression-models",
    "title": {
      "zh": "与女性原型、明暗能量及人格测试怎样区分？",
      "en": "How does this differ from archetypes, light/dark energy and personality tests?"
    },
    "paragraphs": [
      {
        "zh": "同名网络测验可能使用双轴、男女能量比例、明暗类别或若干故事原型；名称相近不代表题目、计分或解释相同。本页只记录20项行为频率，不计算两极平衡、原型隶属或能量阻塞。不要把别处的类别阈值、女性百分比或建议套入本页四组均分。",
        "en": "Online quizzes with similar names may use paired axes, masculine/feminine proportions, light/dark categories or story archetypes. Similar names do not establish identical items, scoring or interpretation. This page records twenty behaviour frequencies without polarity balance, archetype membership or energy blockage. Other sites’ cutoffs, femininity percentages and recommendations do not interpret these four means."
      },
      {
        "zh": "MBTI偏好、大五人格维度和本页表达主题关注的概念不同；相同词语如外向、主张或敏感，不能成为换算依据。WHO的概念说明也不验证这些主题结构。[1] 判断本题组是否具有测量学依据，需要针对这20项、对应语言、人群和用途的研究；当前没有完成信度、效度及常模验证。",
        "en": "MBTI preferences, Big Five traits and these expression themes concern different constructs. Shared words such as outgoing, assertive or sensitive do not justify score conversion. WHO’s conceptual guidance does not validate this theme structure either.[1] Psychometric support requires studies of these twenty items, the relevant language, population and use; reliability, validity and norm validation have not been completed."
      }
    ]
  },
  {
    "id": "expression-small-practice",
    "title": {
      "zh": "怎样使用结果？一次可选的表达比较",
      "en": "How can you use the results? One optional expression comparison"
    },
    "paragraphs": [
      {
        "zh": "选择一个不涉及私人经历的虚构小场面，写两个都可接受的版本。例如感谢借书，一版直接说明帮助在哪里，另一版加一个双方可能理解的小比喻；或给展示标题一版清楚、一版更醒目。比较它们是否符合自己想说的内容，可以选原版、改一点或都不选，不需要公开发布、消费或让别人打分。",
        "en": "Choose a fictional small situation without private history and write two acceptable versions. For thanks after borrowing a book, state the help directly or add a potentially shared little image. For a display title, compare a plain version with a more noticeable one. Choose either, revise or choose neither, without publishing, spending money or requesting ratings."
      },
      {
        "zh": "记录一句具体观察比追求均分升高更有用：例如“这个标题醒目，但没有说明范围”。下次真实场面仍应看自己的意愿与对方回应；玩笑不取代同意，鲜明展示不授权他人评价身体，清楚主张也不要求控制对方。结果提供复盘语言，不承诺关系、魅力或表达训练效果。",
        "en": "Keep a specific observation rather than aiming for a higher mean: a title may be noticeable yet leave scope unclear. In a later real situation, retain your wishes and the other person’s response. A joke does not replace agreement, visible expression invites no body judgement, and clear preferences require no control over others. Results offer reflection language without promising relationship, attraction or training outcomes."
      }
    ]
  },
  {
    "id": "expression-access-retest",
    "title": {
      "zh": "免费范围、隐私与重测怎样理解？",
      "en": "What is free, what is retained and how should a retake be read?"
    },
    "paragraphs": [
      {
        "zh": "开始直接进入20项，不必注册、提交邮箱、付款或先做其他测评。全部四份九节指南在作答前后免费；个人均分仅在完成后且有效项足够时出现。回答在浏览器计算，不因计分上传服务器；只有主动保存才在本标签页临时保留进度，最多24小时，完成、清除或重测即删除。",
        "en": "Start opens the twenty items directly without registration, email, payment or another assessment. All four nine-section guides are free before and after answering; personal means appear only after completion with enough rated items. Scoring occurs in the browser without uploading answers for calculation. Only an actively saved draft remains in this tab for up to twenty-four hours, clearing on completion, clearing or retaking."
      },
      {
        "zh": "分享只包含测试名称、完成自我观察的通用文字与公开链接，不含回答或均分。重测时先比较四周内的机会、记忆和有效项数量，再看各项改变；相同小数可能来自不同回答，均分变化也不能单独证明人格或生理发生改变。本页没有重测信度或可靠变化阈值，不能据此量化成长。",
        "en": "Sharing includes the test name, generic completion wording and a public link, not answers or means. When retaking, compare opportunities, recall and rated-item counts before individual changes. Equal decimals can arise from different ratings, and a changed mean alone establishes no personality or physiological change. This bank has no test–retest reliability or reliable-change threshold for quantifying growth."
      }
    ]
  }
];

export const feminineEnergyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "开始前需要点击同意吗？",
      "en": "Must I agree before starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入题目；草稿保存与匿名使用统计为可选，不是进入题目的条件。",
      "en": "No. Start opens the items directly. Draft saving and anonymous usage counting are optional, not entry requirements."
    }
  },
  {
    "question": {
      "zh": "四组是四种女性人格吗？",
      "en": "Are the four groups four female personalities?"
    },
    "answer": {
      "zh": "不是。它们是本页原创条目的内容分类，既没有按最高均分派型，也未证实为四个独立心理因子。",
      "en": "No. They organise this page’s original items, without highest-mean types or established independent psychological factors."
    }
  },
  {
    "question": {
      "zh": "没有相关机会应选1还是无法判断？",
      "en": "With no relevant opportunity, should I choose one or cannot judge?"
    },
    "answer": {
      "zh": "选未经历／无法判断。1描述有依据的低频，缺少机会或记忆不足不应被当作低频。",
      "en": "Choose not experienced / cannot judge. One describes a supported low frequency; absent opportunities or insufficient recall should not be coded as low frequency."
    }
  },
  {
    "question": {
      "zh": "2、4、5和两项无法判断如何计分？",
      "en": "How are two, four, five and two unjudged items scored?"
    },
    "answer": {
      "zh": "有效项为3，合计11，11除以3四舍五入显示3.7；两项无法判断不进入分子或分母。",
      "en": "Three rated items total eleven. Eleven divided by three rounds to3.7; the two unjudged items enter neither numerator nor denominator."
    }
  },
  {
    "question": {
      "zh": "四组均为3.0表示能量平衡吗？",
      "en": "Do four means of3.0 establish balanced energy?"
    },
    "answer": {
      "zh": "不表示。它只是四组在本次回答中的相同均分；本页没有定义能量平衡指标或理想比例。",
      "en": "No. It is an equal mean across four groups in this attempt. This page defines neither an energy-balance index nor an ideal proportion."
    }
  },
  {
    "question": {
      "zh": "从容主张较高说明内心始终平静吗？",
      "en": "Does higher Composed Clarity mean always feeling calm?"
    },
    "answer": {
      "zh": "不说明。条目观察是否说清偏好、范围或决定；说得清楚时仍然可能紧张，它不直接测量内心情绪状态。",
      "en": "No. Items observe stating preferences, scope or decisions. Clear expression can coexist with nervousness; the group does not directly measure an inner emotional state."
    }
  },
  {
    "question": {
      "zh": "较少使用诗意细节代表审美不足吗？",
      "en": "Does less frequent Poetic Detail imply poor taste?"
    },
    "answer": {
      "zh": "不能这样推断。它记录五项具体行为的频率与机会，不评价作品质量、品位、情感深度或创造能力。",
      "en": "That inference is unsupported. Five items concern specific behaviours and opportunities, not artistic quality, taste, emotional depth or creative ability."
    }
  },
  {
    "question": {
      "zh": "WHO资料证明本测试有效吗？",
      "en": "Does the WHO reference validate this test?"
    },
    "answer": {
      "zh": "不证明。它仅支持社会性别、生理性别及性别认同的概念区分；本题组仍需自身语言、人群与用途对应的测量研究。[1]",
      "en": "No. It supports distinctions among gender, sex and gender identity only. The bank still requires measurement research for its language, population and intended use.[1]"
    }
  }
];
