import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Bespoke unofficial fan-reading supplement; source-bound items and reports stay intact. */
export const myHeroAcademiaLandingSections: QuestionnaireSection[] = [
  {
    "id": "mha-edition",
    "title": {
      "zh": "这份MHA角色测试探索什么？从学习与共同活动出发",
      "en": "What does this MHA character quiz explore? Learning and shared activities"
    },
    "paragraphs": [
      {
        "zh": "本卷围绕桌游入门、模型试做、材料分配、轮流使用设备和活动复盘等普通情境，比较一次选择中你更想先照顾的部分。它既不是动漫知识考试，也不是在虚构战场中挑选作战方式。角色名称让六种参与角度便于记忆，但题目没有覆盖人物的全部性格，更没有覆盖一个人的全部生活。",
        "en": "This form uses ordinary situations: learning a tabletop game, trying a model, sharing materials, taking turns with equipment and reviewing an event. It compares the part you would prioritise in a particular choice. It is neither anime trivia nor a choice of battle tactics. Names make six participation angles memorable; the items cover neither a character’s entire personality nor a person’s whole life."
      },
      {
        "zh": "2019年《英雄崛起》官方角色页核对了本版六位人物的名称与有限背景，其中“个性”指作品设定中的特殊能力。[1] 本站观察、挑战、自选、支持、安排和跟进的映射是另行创作的同人解释，不是官方心理分类。该资料也不用于宣称当前终章中的职业、关系或人物结局。",
        "en": "The official 2019 Heroes Rising character page identifies the six characters and supplies limited fictional context, using Quirk for a power within the story.[1] The observation, challenge, choice, support, arrangement and follow-through mappings here are independently authored fan interpretations, not official psychological categories. That source is not used to assert current end-of-story careers, relationships or outcomes."
      }
    ]
  },
  {
    "id": "mha-observe-challenge",
    "title": {
      "zh": "绿谷与爆豪：观察问题和自设挑战有什么不同？",
      "en": "Deku and Bakugo: how do observation and a personal challenge differ?"
    },
    "paragraphs": [
      {
        "zh": "绿谷角度侧重先弄清细节和待答问题：观察熟手怎样作决定，问清伙伴究竟需要设备做什么，或者记录一次试用仍没回答的问题。它不是“聪明人”称号，也不表示犹豫、焦虑或必须牺牲自己。一个实用的反例是：你已经明白任务，只想直接练习，此时不需要为了符合角色而继续分析。",
        "en": "The Deku angle concerns useful details and unanswered questions: observing an experienced player’s decisions, asking why someone needs equipment or recording what a trial leaves unresolved. It is not a label for intelligence, hesitation, anxiety or self-sacrifice. A practical counterexample is already understanding a task and wanting to practise; there is no need to keep analysing to fit a character."
      },
      {
        "zh": "爆豪角度侧重自己愿意争取的具体标准：首轮掌握一个步骤，下一版改进一处可见表现，等待设备时练另一个小目标。它与绿谷角度可以互相支持，观察能帮助目标更明确，尝试也会产生新问题。本卷不把自设挑战等同攻击性、欺凌、胜负优越或勇敢程度，也不鼓励超出身体和资源条件的冒险。",
        "en": "The Bakugo angle concerns a specific standard you willingly pursue: mastering one step, improving a visible feature in the next model or practising another target while waiting for equipment. It can support the Deku angle: observation clarifies a target and an attempt raises new questions. This form equates personal challenge with neither aggression, bullying, superiority nor bravery and encourages no risk beyond physical or practical limits."
      }
    ]
  },
  {
    "id": "mha-route-support",
    "title": {
      "zh": "轰与丽日：保留自己的路径和减轻实际负担",
      "en": "Todoroki and Uraraka: choosing a route and reducing practical burdens"
    },
    "paragraphs": [
      {
        "zh": "轰角度侧重重新确认“这是我愿意采用的方法吗”：热门教程可以先试，也可以换路；别人期待你继续上次分工时，可以重新决定；展示技能时不必表演他人预设的样子。这不是冷漠、家庭创伤或天赋的判断。选择自己的路径仍可以听取反馈，独立选择不等于必须拒绝合作或建议。",
        "en": "The Todoroki angle concerns checking whether a method is one you want: trying a popular tutorial while retaining alternatives, reconsidering a repeated role or choosing what to show without performing an expected persona. It establishes neither emotional coldness, family trauma nor talent. Choosing a route can include feedback; independence does not require rejecting collaboration or advice."
      },
      {
        "zh": "丽日角度侧重参加活动需要付出的实际成本：简化材料、缩小模型、减少准备负担，让第一步更容易处理。它不是替每个人包办，也不是付出越多就越有价值。先问别人需要什么，再提供他们愿意接受的帮助；如果一个复杂版本对参与者很有意义，简化未必是这次最合适的支持。",
        "en": "The Uraraka angle concerns practical participation costs: simplifying materials, reducing a model’s scope or making preparation and the first step manageable. It does not require doing everything for others or earning worth by giving more. Ask what help someone wants before offering it. If a complex version matters to participants, simplification may not be the support they want this time."
      }
    ]
  },
  {
    "id": "mha-arrange-follow",
    "title": {
      "zh": "饭田与切岛：共同安排和并肩跟进不是一回事",
      "en": "Iida and Kirishima: arrangements and following through are different contributions"
    },
    "paragraphs": [
      {
        "zh": "饭田角度侧重使共同条件可理解、可比较：试两版规则前约好起点，借设备时商量轮流方式，复盘时确认是否按同样条件进行。清楚的约定可以修改，也需要听见不同需求。这个角度不等于服从权威、僵化或道德更高；如果规则造成不合理负担，说明问题和协商调整同样重要。",
        "en": "The Iida angle concerns shared conditions people can understand and compare: agreeing starting points for two rule versions, arranging turns with equipment or checking consistent trial conditions. Agreements can be revised and need to accommodate different needs. This is neither obedience, rigidity nor moral superiority. If a rule creates an unreasonable burden, explaining it and negotiating change matter too."
      },
      {
        "zh": "切岛角度侧重可见而自愿的共同投入：接下一份能完成的任务，伙伴仍想参加时陪着试第一轮，让别人知道约好的部分自己会跟进。这和饭田的分工说明不同，也和丽日的减轻负担不同。它不评男子气概、体能、绝对忠诚或无限坚持；资源不足时，及时说明并重新约定比硬撑更有帮助。",
        "en": "The Kirishima angle concerns visible, voluntary involvement: taking a manageable task, trying a first round together if a partner still wants to join or making follow-through clear. That differs from Iida’s arrangements and Uraraka’s burden reduction. It grades neither masculinity, strength, absolute loyalty nor endless persistence. When resources run short, explaining and renegotiating can help more than pushing through."
      }
    ]
  },
  {
    "id": "mha-counts",
    "title": {
      "zh": "24次选择、16次出现与全部最高并列",
      "en": "Twenty-four selections, sixteen appearances and every highest tie"
    },
    "paragraphs": [
      {
        "zh": "每题四选一，六位角色轮流缺席。每位全卷出现16次，在A、B、C、D各4次。选中加1，六项之和24，单项范围0—16。按页面次序得到6、6、3、3、3、3时，绿谷与爆豪同为最高，两份七节报告都会显示；不加赛、不随机选一位，也不按字母或名单顺序设定主型。",
        "en": "Each item offers four choices with rotating omissions among six characters. Each appears sixteen times, four in each A–D position. A choice adds one count, the six sum to twenty-four and each ranges from zero to sixteen. Page-order counts of 6, 6, 3, 3, 3, 3 retain Deku and Bakugo, each with a seven-section report. There is no runoff, random winner or alphabetic or list-order primary type."
      },
      {
        "zh": "六项各4次同样有效，显示六份指南共42节。6÷24描述全部选择中某项的份额，6÷16描述该角色出现时的选择份额；二者都不是“你有多像这个人物”的概率、能力百分比或人群百分位。出现次数平衡是题目安排的性质，不足以证明选项吸引力相同或完成心理测量验证。",
        "en": "Six counts of four are valid too, displaying forty-two sections across six guides. Six divided by twenty-four describes a share of all selections; six divided by sixteen describes selections among that character’s appearances. Neither gives a resemblance probability, ability percentage or population percentile. Balanced exposure is an item-design property, not evidence of equal option appeal or psychometric validation."
      },
      {
        "zh": "低计数只表示在这组受限选项中较少把某个角度放在第一位；角色未出现不记拒绝，差一次也没有经过验证的显著性阈值。近分可以阅读比较，但不会被自动改成并列或“隐藏第二人格”。结果变化时先看哪些题、哪些活动和条件变了，不只比较角色名称。",
        "en": "A lower count means prioritising an angle less often within restricted options. Absence records no rejection, and a one-count gap has no validated significance threshold. Nearby guides can be compared without automatically inventing a tie or hidden second personality. If results change, examine items, activities and conditions rather than compare names alone."
      }
    ]
  },
  {
    "id": "mha-one-project",
    "title": {
      "zh": "同一个学习项目可以同时需要六种贡献",
      "en": "One learning project can need all six contributions"
    },
    "paragraphs": [
      {
        "zh": "以一起制作小模型为例：先观察示例与问题，确定自己愿意改善的一处，保留选择方法的空间，缩小材料负担，约好比较条件，再一起完成可承担的部分。六种贡献可以配合，也会随着项目阶段变化。题目一次只让你优先选一个，不能据此断言你不会采用其他做法。",
        "en": "For a shared model project, people might examine an example, choose a feature to improve, retain alternative methods, reduce material demands, agree comparison conditions and finish manageable parts together. These contributions can cooperate and change with the project stage. One item asks for one priority, not proof that you would never use another approach."
      },
      {
        "zh": "挑一次真实活动，分别记录一个符合指南和一个不符合的例子，再问参与者是否愿意尝试一个小调整。例如先核对困难在哪里，而不是直接加码挑战；或在继续练之前确认双方都愿意。观察任务是否更清楚、负担是否合适。这些是可选反思，不是本测验已经验证有效的教学方案，也不能按角色为学生分组或决定谁更有潜力。",
        "en": "Choose one actual activity and record a fitting example and a counterexample, then ask whether participants want a small adjustment. You might clarify the difficulty before raising a target or check willingness before another practice round. Observe task clarity and manageable demands. These optional prompts are not teaching methods validated by this quiz and do not justify grouping students or ranking potential by character."
      }
    ]
  },
  {
    "id": "mha-evidence-privacy",
    "title": {
      "zh": "人物背景、同人解释与测量证据分开阅读",
      "en": "Separate character context, fan interpretation and measurement evidence"
    },
    "paragraphs": [
      {
        "zh": "官方角色页提供虚构背景，[1] 本站独立创作题目、六种映射与报告。目前没有本题本信度、效度、常模或中英文测量等价研究。清楚说明规则有助于理解输出，但不证明结果能测学习能力、智力、英雄品质或心理疾病；不能把人物家庭经历、伤害行为和性别表达转移到用户身上，也不能换算MBTI或职业适配。",
        "en": "The official character page supplies fictional context,[1] while FermatMind separately authored the items, six mappings and reports. This form has no established reliability, validity, norms or English–Chinese measurement equivalence. Clear rules explain output without establishing learning ability, intelligence, heroism or mental illness. Character family histories, harmful actions and gender expression are not assigned to users, nor are results converted into MBTI or career suitability."
      },
      {
        "zh": "24题、六项计数与六份七节全文全部免费。答案在浏览器计分；主动保存才建立本标签页草稿，24小时失效，完成、清除或重测即删除。分享只带公开指南链接，不含个人答案或计数。是否与朋友讨论完全自愿；相同角色不证明关系契合，不同角色也不预示冲突。",
        "en": "All twenty-four items, six counts and six seven-section guides are free. Answers are scored in the browser; only explicit saving creates a tab draft, expiring after twenty-four hours and cleared on completion, clearing or retake. Sharing includes a public guide link without personal answers or counts. Discussion with friends is voluntary. Matching characters establishes no compatibility, and different ones predict no conflict."
      }
    ]
  }
];

export const myHeroAcademiaLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "MHA、BNHA和《我的英雄学院》在这里指同一作品吗？",
      "en": "Do MHA, BNHA and My Hero Academia refer to the same work here?"
    },
    "answer": {
      "zh": "是。本页对应《我的英雄学院》，提供六位选定人物的活动阅读角度；不是剧情知识考试、全阵容排名或超能力生成器。",
      "en": "Yes. This page concerns My Hero Academia and six selected character-based activity readings, not plot trivia, a whole-cast ranking or a Quirk generator."
    }
  },
  {
    "question": {
      "zh": "为什么没有欧尔麦特、相泽、蛙吹或渡我？",
      "en": "Why are All Might, Aizawa, Tsuyu and Toga absent?"
    },
    "answer": {
      "zh": "本版六位角色各有固定题目映射，其他角色没有被评估。未出现不能解释为与你不相似，也不能与其他平台不同角色集合直接换算。",
      "en": "The six characters have fixed item mappings. Other characters are unassessed, not shown to be unlike you, and results cannot be directly converted into another platform’s cast."
    }
  },
  {
    "question": {
      "zh": "爆豪计数高是否代表我有攻击性？",
      "en": "Does a high Bakugo count establish aggression?"
    },
    "answer": {
      "zh": "不能。本卷爆豪角度只对应自设目标和具体挑战，没有评估攻击、欺凌或愤怒，也不为伤害别人提供理由。",
      "en": "No. This Bakugo angle concerns personal targets and specific challenges. It assesses neither aggression, bullying nor anger and justifies no harm to others."
    }
  },
  {
    "question": {
      "zh": "轰的结果会推断家庭经历吗？",
      "en": "Does a Todoroki result infer family history?"
    },
    "answer": {
      "zh": "不会。本卷只观察是否愿意选择自己的方法、分工与展示方式。人物背景不能成为用户经历、创伤或心理状态的证据。",
      "en": "No. This form concerns choosing a method, role or presentation. Fictional background is not evidence of a user’s history, trauma or mental state."
    }
  },
  {
    "question": {
      "zh": "丽日和切岛的支持方式有什么不同？",
      "en": "How do Uraraka and Kirishima differ in support here?"
    },
    "answer": {
      "zh": "丽日角度侧重减轻材料、时间和步骤的负担；切岛角度侧重明确参与并跟进自己愿意承担的部分。两者可以配合，不是善良程度排名。",
      "en": "Uraraka concerns reducing material, time and step demands; Kirishima concerns visible involvement and following through on a willingly chosen part. They can cooperate and do not rank kindness."
    }
  },
  {
    "question": {
      "zh": "6、6、3、3、3、3会得到哪些报告？",
      "en": "Which guides display for counts of 6, 6, 3, 3, 3, 3?"
    },
    "answer": {
      "zh": "按页面次序，绿谷与爆豪最高并列，两份七节报告共14节完整展示，六项计数也全部保留。",
      "en": "In page order, Deku and Bakugo tie highest, displaying fourteen sections across two complete seven-section guides and retaining all six counts."
    }
  },
  {
    "question": {
      "zh": "六项各4次是否意味着没有结果？",
      "en": "Do six counts of four mean there is no result?"
    },
    "answer": {
      "zh": "不是。六位全部最高并列，六份七节指南共42节都显示，不需要加赛题、强选一个或修改回答。",
      "en": "No. All six tie highest, displaying forty-two sections across six seven-section guides without a runoff, forced winner or changed answers."
    }
  },
  {
    "question": {
      "zh": "可以按角色安排学习方法或判断成绩吗？",
      "en": "Can I assign learning methods or predict grades by character?"
    },
    "answer": {
      "zh": "不能。本卷是活动选择的同人解释，没有测量实际学习表现，也没有验证按角色安排教学更有效。可以讨论具体任务与需要，不据标签分能力。",
      "en": "No. These fan readings of activity choices neither measure learning performance nor validate character-matched teaching. Discuss actual tasks and needs without ranking ability by labels."
    }
  },
  {
    "question": {
      "zh": "开始前需要再同意或做另一项测试吗？",
      "en": "Must I agree again or take another assessment before starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入24题，无需邮箱、注册或前置测评，完整结果免费；也可以先读六份公开指南。",
      "en": "No. Start opens twenty-four items directly without email, signup or a prerequisite assessment. Full results are free, and all six public guides can be read first."
    }
  }
];
