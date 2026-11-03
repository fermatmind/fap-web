import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const foodChoiceSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Food choice test: what menu presentation attracts you?",
      "zh": "食物选择测试：哪种菜单呈现更吸引你？"
    },
    "paragraphs": [
      {
        "en": "This original twelve-pair activity compares familiar and direct presentation, consistently composed presentation, and an everyday element deliberately paired with a precise detail. Your choices lead to three raw counts and one of seven single or tied readings. It asks about written descriptions of an imagined meal, not what you actually tasted, ordered or could afford.",
        "zh": "十二组原创比较，分别观察熟悉直白、统一精整，以及日常元素与精细细节刻意并置的呈现。回答生成三项原始次数，对应七种单项或并列读法。比较的是设想一餐的文字描述，不是实际尝过、点过或负担得起什么。"
      },
      {
        "en": "Keep one ordinary meal context in mind. Within each comparison, assume both alternatives suit you and have equal ingredients, flavour, portion, price and availability. Only the offered presentation differs. Those assumptions make the task specific; they do not establish that serving details have identical meanings in real life.",
        "zh": "请保持同一个普通用餐场景。每次比较假设两项都适合自己，食材、味道、份量、价格与可获得性相同，只比较给定的呈现。这些约定限定了任务，并不证明现实中各类上桌细节具有相同含义。"
      }
    ]
  },
  {
    "id": "familiar",
    "title": {
      "en": "Familiar and direct: ordinary serving and clear naming",
      "zh": "熟悉直白：日常盛装与直接命名"
    },
    "paragraphs": [
      {
        "en": "These alternatives use an ordinary bowl, plate or cup and a name that directly describes the food. Choosing them records a relative preference for those particular descriptions. It does not establish simpler tastes, frugality, cooking experience or a social background.",
        "zh": "这类选项使用普通碗盘杯具，名称直接说明是什么食物。选择它们，只记录对这些具体描述的相对偏好，不证明口味简单、节俭、烹饪经验或社会背景。"
      },
      {
        "en": "For the vegetable rice bowl, notice whether the ordinary bowl or the plain name was easier to picture. The questionnaire combines those details in one option, so the answer cannot isolate which mattered. You may also prefer a composed fruit plate on another occasion without contradicting the rice choice.",
        "zh": "以蔬菜饭为例，可回看是普通碗还是直接的菜名更容易想象。选项把这些细节组合在一起，答案无法分离各自影响。另一个场合偏好精整果盘，也不否定这次饭碗选择。"
      }
    ]
  },
  {
    "id": "formal",
    "title": {
      "en": "Formal and composed: coordination within a presentation",
      "zh": "正式精整：一种呈现内部的协调"
    },
    "paragraphs": [
      {
        "en": "The formal alternatives coordinate tableware, arrangement and menu wording. They concern how a dish is introduced rather than a more expensive ingredient or a larger portion. A higher count is not a culinary standard, an etiquette score or evidence that you seek an audience’s approval.",
        "zh": "正式选项让餐具、摆放与菜单文字协调，涉及一道菜怎样被介绍，不是使用更贵食材或增加份量。较高次数不是厨艺标准、礼仪分数，也不证明你在寻求他人认可。"
      },
      {
        "en": "In the soup comparison, matching bowl and saucer plus an even garnish form a coordinated option. Ask which detail appealed in the imagined setting. There is no observed guest response here; choosing this option cannot tell us how anyone else would interpret the serving.",
        "zh": "汤的比较中，配套碗碟与均匀点缀构成协调选项。可问设想场景中哪处细节吸引自己。这里没有观察来宾反应，选择它无法告诉我们别人怎样理解这份盛装。"
      }
    ]
  },
  {
    "id": "contrast",
    "title": {
      "en": "Deliberate contrast: two elements inside the same option",
      "zh": "刻意混搭：同一选项内部的两种元素"
    },
    "paragraphs": [
      {
        "en": "A mixed option keeps an everyday vessel or familiar format alongside a precisely arranged detail. The visible contrast is part of one description, not a calculated blend of the other two counts. Selecting it does not measure creativity, sophistication or acceptance of every unfamiliar food.",
        "zh": "混搭选项保留日常餐具或熟悉形态，同时加入精细摆放。可见反差属于同一条描述，不是把另两项次数计算成混合物。选择它不测创造力、鉴赏水平或对所有陌生食物的接受程度。"
      },
      {
        "en": "For example, an everyday soup mug with one carefully arranged garnish is a mixed description. A plain bowl chosen in one question and a coordinated plate chosen in another are separate choices. Keeping that distinction prevents a two-way tie from being renamed as the deliberate-contrast result.",
        "zh": "例如，日常汤杯配一处精细点缀是混搭描述；一题选普通碗、另一题选协调餐盘，则是分开的选择。保留这个区别，就不会把双向并列改名为刻意混搭结果。"
      }
    ]
  },
  {
    "id": "counting",
    "title": {
      "en": "Twelve choices, three counts and balanced opportunities",
      "zh": "十二次选择、三项计数与平衡机会"
    },
    "paragraphs": [
      {
        "en": "Every pair of presentation styles is compared four times. Each style appears eight times, four in each option position. The selected option receives one count, giving twelve counts overall and zero to eight for each style. No response is reverse scored, and there are no bonus or secret items.",
        "zh": "每两种呈现比较四次，每种出现八次，在两个位置各四次。选中项记一次，共十二次；单项范围为零至八。没有反向换算、加分题或隐藏题。"
      },
      {
        "en": "For counts familiar=5, formal=4 and mixed=3, the familiar guide is the single leading reading. Changing one familiar choice to formal gives 4,5,3 and changes the leader. The one-choice gap describes this answer set; it is not a confidence interval, an accuracy claim or a population percentile.",
        "zh": "熟悉5、正式4、混搭3时，熟悉指南是唯一最高读法。把一次熟悉选择改成正式，会得到4、5、3，最高方向随之变化。领先一次只描述这组回答，不是置信区间、准确率或人群百分位。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Seven outcomes, including every highest tie",
      "zh": "七种结果：保留每一个最高并列"
    },
    "paragraphs": [
      {
        "en": "Three single leads, three two-way highest ties and one three-way equality make the seven guide combinations. Counts 5,5,2 retain familiar and formal together. Counts 4,4,4 retain all three. Neither outcome is missing data, and no letter order, option position or random draw breaks the tie.",
        "zh": "三种单项最高、三种双向最高并列与一种三向相同，共七种指南组合。5、5、2保留熟悉与正式，4、4、4保留全部三种；两者都不是资料缺失，也不按字母、选项位置或随机抽取破并列。"
      },
      {
        "en": "An equality of counts does not demonstrate a balanced personality or indecision. Different choices can reach the same totals. Review the individual dishes and descriptions instead of assuming that two people opening the same guide had identical reasons for choosing.",
        "zh": "计数相等不证明性格平衡，也不证明犹豫不决。不同答案可以达到相同次数，应回看具体菜肴和描述，不因两个人打开相同指南，就假定其选择原因相同。"
      }
    ]
  },
  {
    "id": "research",
    "title": {
      "en": "Food and status research: background and this original task",
      "zh": "食物与地位研究：背景问题与本站原创任务"
    },
    "paragraphs": [
      {
        "en": "Bellezza and Berger’s study examined particular menu preferences alongside separately measured social position. Its food task differs from these twelve presentation pairs. The article provides context for discussing food signals; it does not validate this activity as a classifier of an individual’s background. [1] [2]",
        "zh": "Bellezza与Berger的研究把特定菜单偏好与另外测量的社会位置联系起来，其食物任务不同于本站十二组呈现比较。论文为讨论食物线索提供背景，没有将本活动验证为个人背景分类器。[1] [2]"
      },
      {
        "en": "Here, the labels familiar, formal and mixed are editorial definitions of the offered descriptions. They do not rename low, middle and high social groups. No income, education, occupation or family information is collected to create such a classification.",
        "zh": "这里的熟悉、正式和混搭，是对所给描述的编辑定义，不是给低、中、高社会群体换名字。题目没有收集收入、教育、职业或家庭信息，也没有据此建立分类。"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Written choices, imagined settings and actual meals",
      "zh": "文字选择、设想情境与真实用餐"
    },
    "paragraphs": [
      {
        "en": "A familiar dish name can evoke a home meal for one reader and a restaurant for another. Even when ingredients and price are held equal in the instructions, imagined settings can differ. This task has no photographs, tasting procedure, audience ratings or purchase records to resolve those differences.",
        "zh": "熟悉菜名可能让一人想到家常饭，另一人想到餐厅。即使说明要求设想食材价格相同，读者想到的场景仍可能不同。本任务没有照片、试吃程序、受众评分或购买记录来分离这些差异。"
      },
      {
        "en": "If a comparison is hard to imagine, choose the closer description only if you want to continue. There is no unscored option in this paired-choice form, and an unfinished attempt produces no interpretation. Stopping is an available endpoint; completing the activity requires no tasting or spending.",
        "zh": "若某组难以想象，可以在愿意继续时选较接近的一条。本二选一题本没有不评分选项，未完成不生成解读；退出也是可以选择的结束点，完成活动不要求试吃或消费。"
      }
    ]
  },
  {
    "id": "limits",
    "title": {
      "en": "What transparent counting can and cannot establish",
      "zh": "计分透明能说明什么"
    },
    "paragraphs": [
      {
        "en": "The counts can be reproduced from the selected alternatives and the published rule. That verifies arithmetic, not reliability or construct validity. This original form has no established retest precision, normative sample, classification accuracy or cross-language measurement equivalence.",
        "zh": "次数可以按所选选项与公开规则复算，验证的是算术，不是信度或构念效度。本原创题本尚未建立重测精度、人群常模、分类准确率或跨语言测量等值。"
      },
      {
        "en": "Equal exposure reduces a simple opportunity imbalance but cannot remove wording effects, familiarity with a dish or the limits of an imagined comparison. A low count means that those alternatives were chosen less often within this set, not that a preference or ability is absent.",
        "zh": "出现机会相同，减少了简单的机会不平衡，却不能消除措辞、菜肴熟悉程度或设想比较的局限。低次数表示在本组里较少选中相应选项，不表示缺少某种偏好或能力。"
      }
    ]
  },
  {
    "id": "reading",
    "title": {
      "en": "How to read a complete result guide",
      "zh": "怎样阅读完整结果指南"
    },
    "paragraphs": [
      {
        "en": "Start with all three raw counts, then open the matching single or tied guide. Each guide includes its meaning, a fictional scene, distinctions from nearby outcomes, counterexamples, a possible observation, scoring and limits. The public text is a general reading, not another visitor’s private result.",
        "zh": "先看三项原始次数，再阅读对应的单项或并列指南。每篇包含含义、虚构情境、相邻结果区别、反例、可选观察、计分与边界。公开正文是一般读法，不是其他访客的私人结果。"
      },
      {
        "en": "If a scene sounds familiar, identify the actual selected detail that supports it and another occasion that does not. A plausible story should remain a question until your own examples support it. The guide does not determine why you chose an option or how other people see you.",
        "zh": "若某个情境让你有共鸣，可找出支持它的实际选择，再找一个不符合的场合。一个听起来合理的故事，在自身例子支持之前仍应保留为问题。指南不裁定你为何选择，也不决定别人怎样看你。"
      }
    ]
  },
  {
    "id": "application",
    "title": {
      "en": "A small optional observation, without changing your diet",
      "zh": "一个可选的小观察，无需改变饮食"
    },
    "paragraphs": [
      {
        "en": "You may privately note one vessel, arrangement or phrase that drew your attention and the occasion you imagined. Compare two descriptions of the same food in your own words if that is useful. No change to ingredients, eating habits or budget is required, and the activity makes no meal recommendation.",
        "zh": "可以私下记下一种吸引注意的餐具、摆放或措辞，以及想到的场合；有用时用自己的话比较同一种食物的两种介绍。无需改变食材、饮食习惯或预算，本活动不推荐吃什么。"
      },
      {
        "en": "You can finish after reading. All seven guides stay openly available without a purchase, account or email. Optional copying shares the public entry only; your answers and counts are not added to its URL. Temporary tab saving is a separate opt-in choice during answering.",
        "zh": "阅读后可以直接结束。七份指南持续公开，无需购买、账号或邮箱。可选复制只分享公开入口，回答与次数不写进链接；临时标签页保存是作答中另行选择的可选功能。"
      }
    ]
  }
];
export const foodChoiceFaq = [
  {
    "question": {
      "en": "What am I comparing in these twelve questions?",
      "zh": "十二道题比较什么？"
    },
    "answer": {
      "en": "Serving arrangements and menu language for an imagined meal, assuming equal food, flavour, portion, price and availability within each pair. The form does not compare actual tasted dishes.",
      "zh": "比较设想用餐的盛装与菜单语言，每对假设食物、味道、份量、价格及可获得性相同，不比较实际尝过的菜。"
    }
  },
  {
    "question": {
      "en": "Is formal presentation scored as better than familiar presentation?",
      "zh": "正式呈现会比熟悉呈现得分更高吗？"
    },
    "answer": {
      "en": "No. Each selected alternative adds exactly one count to its own style. There are no quality points, luxury bonuses or correct answers.",
      "zh": "不会。每个所选选项只给自身方向记一次，没有质量分、奢华加分或正确答案。"
    }
  },
  {
    "question": {
      "en": "How many times can one style be chosen?",
      "zh": "每种呈现最多选中几次？"
    },
    "answer": {
      "en": "Each appears in eight of twelve pairs, four in each option position. Its count ranges from zero to eight, while the three counts always total twelve after a complete attempt.",
      "zh": "每种在十二组中出现八次，两个位置各四次，次数范围零至八；完整作答后三项合计十二。"
    }
  },
  {
    "question": {
      "en": "What does 4–4–4 mean?",
      "zh": "4—4—4是什么意思？"
    },
    "answer": {
      "en": "All three styles were selected four times. It is a complete three-way equality with its own guide, not a missing answer or a balanced-personality score.",
      "zh": "三种呈现各选四次，是有独立指南的完整三向相同结果，不是缺答，也不是性格平衡分。"
    }
  },
  {
    "question": {
      "en": "Can a one-choice lead change after one edit?",
      "zh": "只领先一次，改一题会变吗？"
    },
    "answer": {
      "en": "Yes. For example, 5,4,3 becomes 4,5,3 if a familiar choice changes to formal. That sensitivity is arithmetic; no statistical reliability or confidence is inferred from the gap.",
      "zh": "会。例如把一次熟悉改为正式，5、4、3变为4、5、3。这是算术变化，不从差距推断统计信度或置信度。"
    }
  },
  {
    "question": {
      "en": "Is this a taste, health or nutrition assessment?",
      "zh": "这是味觉、健康或营养评估吗？"
    },
    "answer": {
      "en": "No. Written presentation choices do not measure sensory ability, dietary adequacy, allergies, eating difficulties or nutrient needs. No eating or purchase task is required.",
      "zh": "不是。文字呈现选择不测感官能力、膳食充足性、过敏、进食困难或营养需要，也不要求进食或购买。"
    }
  },
  {
    "question": {
      "en": "Does a familiar result mean I avoid new foods?",
      "zh": "熟悉结果意味着不愿尝新吗？"
    },
    "answer": {
      "en": "The familiar options concern ordinary serving and direct names, not willingness to try every unfamiliar ingredient. The form does not measure food neophobia or assign an adventurousness level.",
      "zh": "熟悉选项涉及普通盛装与直白命名，不涉及对所有陌生食材的尝试意愿；本题本不测食物新奇恐惧，也不分配冒险程度。"
    }
  },
  {
    "question": {
      "en": "Are Chinese and English scores interchangeable?",
      "zh": "中英文分数可以互换吗？"
    },
    "answer": {
      "en": "They use the same item structure and counting rule, but measurement equivalence has not been established. Check the wording and imagined setting before interpreting a difference.",
      "zh": "两者使用相同题目结构与计数规则，但尚未建立测量等值。解释差异前应核对题文与设想场景。"
    }
  },
  {
    "question": {
      "en": "Can I skip a pair and still receive a result?",
      "zh": "能跳过一组直接看结果吗？"
    },
    "answer": {
      "en": "This form requires a valid selection for all twelve pairs before personal counts appear. You may stop anytime and read every public guide without completing an attempt.",
      "zh": "个人计数需要十二组均有有效选择。可以随时停止，不完成也能阅读全部公开指南。"
    }
  },
  {
    "question": {
      "en": "Does Start test open another agreement screen?",
      "zh": "开始测试会再打开同意页面吗？"
    },
    "answer": {
      "en": "No. It opens the first pair directly. Optional temporary tab saving is not a condition of answering or seeing a complete result.",
      "zh": "不会，直接打开第一组题目。可选临时标签页保存不是作答或查看完整结果的条件。"
    }
  }
];
export const foodChoiceSummaries: Record<string, Text> = {
  "familiar": {
    "en": "Read how ordinary serving and direct names led this set, with a rice-bowl example and another occasion that may differ.",
    "zh": "阅读普通盛装与直白命名在本组领先的含义，以饭碗为例，并对照可能不同的另一个场合。"
  },
  "formal": {
    "en": "Explore coordinated tableware, arrangement and wording through an imagined gathering, without inferring status or audience approval.",
    "zh": "通过设想聚会理解餐具、摆放与措辞协调，不推断地位或他人认可。"
  },
  "mix": {
    "en": "Understand a precise detail beside an everyday element inside one description, separately from a tie between other styles.",
    "zh": "理解同一描述里精细细节与日常元素并置，并与其他风格次数并列区分。"
  },
  "familiar-formal": {
    "en": "Read a shared lead for plain and coordinated alternatives, preserving both counts without calling the result deliberate contrast.",
    "zh": "阅读直白与协调选项共同领先，保留两项次数，不将其改称刻意混搭。"
  },
  "familiar-mix": {
    "en": "Compare an everyday presentation with an everyday base plus a precise detail; the guide explores what their shared lead leaves unresolved.",
    "zh": "比较日常呈现与日常底色加入精细细节，理解共同领先仍无法确定什么。"
  },
  "formal-mix": {
    "en": "Distinguish consistent coordination from a visible contrast, using a fictional fruit-serving scene and alternative explanations.",
    "zh": "用虚构水果上桌场景及其他可能解释，区分整体协调与保留明显反差。"
  },
  "all-three": {
    "en": "Read a complete 4–4–4 outcome: no sole leader, no random selection, and different possible choices behind equal totals.",
    "zh": "阅读完整4—4—4结果：无唯一最高、不随机选择，相同总数背后可以是不同答案。"
  }
};
