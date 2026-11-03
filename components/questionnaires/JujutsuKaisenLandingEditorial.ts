import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Original six-lens creative-participation supplement; source-bound bank and reports stay intact. */
export const jujutsuKaisenLandingSections: QuestionnaireSection[] = [
  {
    "id": "jjk-edition",
    "title": {
      "zh": "《咒术回战》角色测试探索什么？六种日常选择角度",
      "en": "What does this Jujutsu Kaisen Character Test explore? Six everyday choice lenses"
    },
    "paragraphs": [
      {
        "zh": "官方第一季人物资料可核对本版六个名字：一年级的虎杖悠仁、伏黑惠、钉崎野蔷薇，教师五条悟，以及二年级的禅院真希和狗卷棘。[1] 本版独立编写24道普通学习、手作和共同创作情境，将人物作为阅读入口，分别讨论陪伴尝试、选择承诺、个人表达、转换示例、具体练习与措辞影响。",
        "en": "The official first-season character guide identifies this edition’s six names: first-year students Yuji Itadori, Megumi Fushiguro and Nobara Kugisaki, teacher Satoru Gojo, and second-year students Maki Zenin and Toge Inumaki.[1] FermatMind independently authored twenty-four ordinary learning, craft and shared-creation situations, using the names as lenses for company, chosen commitments, personal expression, alternative examples, concrete practice and the effects of wording."
      },
      {
        "zh": "这些角度不是角色全部性格的缩影，也不是六种独立测得的人格特质。同一活动中，你可能先陪朋友做一步，再核对承诺或练习细节。题目要求选择较想优先采用的回应；没有选中的做法，仍可能是你之后会采用的做法。",
        "en": "These lenses are neither complete character portraits nor six independently measured personality traits. In one activity you might join a friend’s first step, then clarify a commitment or practise a detail. Items ask which response you would prioritise; an unchosen approach may still be something you would do next."
      }
    ]
  },
  {
    "id": "jjk-yuji-megumi",
    "title": {
      "zh": "虎杖与伏黑：陪伴下一步，与认领一项承诺",
      "en": "Yuji and Megumi: join the next step or own a commitment"
    },
    "paragraphs": [
      {
        "zh": "朋友第一次做纸板模型，本版虎杖角度先问要不要一起做一小步，重点是对方愿意接受的当下陪伴；伏黑角度先说清能负责哪一部分、能投入多少时间，重点是自己愿意认领的承诺。一起做不意味着代替完成，限定帮助范围也不意味着冷漠。",
        "en": "With a friend’s first cardboard model, Yuji’s lens asks whether they want company for one small step. Megumi’s specifies which part you can own and for how long. One concerns wanted company now, the other a commitment you choose. Joining does not mean taking over; bounding help does not imply indifference."
      },
      {
        "zh": "两场活动同时邀请你时，可以选择一场、提出有限帮助，或两场都不参加。时间改变时重新说明安排，比把角色名称当作必须兑现所有请求的理由更有用。虎杖次数不测同理心或牺牲精神；伏黑次数不评谁值得帮助、自我价值或战略能力。",
        "en": "If two activities invite you, choose one, offer limited help or decline both. When your time changes, renegotiate rather than treat a character name as an obligation to fulfil every request. Yuji counts measure no empathy or self-sacrifice; Megumi counts judge neither who deserves help nor self-worth or strategic ability."
      }
    ]
  },
  {
    "id": "jjk-nobara",
    "title": {
      "zh": "钉崎：在共同约定中保留自己的表达",
      "en": "Nobara: retain personal expression within a shared agreement"
    },
    "paragraphs": [
      {
        "zh": "共同插画约定统一风格时，钉崎角度是在可协商范围里留一个自己确实喜欢的细节，而不是推翻别人的贡献。它与伏黑不同：前者问“哪部分表达属于我”，后者问“哪部分责任由我认领”。接受共同格式与保留个人选择可以同时发生。",
        "en": "For an illustration with an agreed style, Nobara’s lens keeps a personally meaningful detail within negotiable space rather than overruling others. It differs from Megumi’s question: which expression is mine versus which responsibility will I own? Accepting a shared format can coexist with personal choice."
      },
      {
        "zh": "例如自己的同人刊物页看起来精致却不像自己，可以提出换一个配色或题材，并确认它是否影响排版约定。也可以决定这次先配合。高次数不证明更真实、更自信或更独立，更不推断性别、外貌或生活经历；低次数不表示缺少主见。",
        "en": "If a polished zine page does not feel like your contribution, suggest a colour or subject change and check it against the layout agreement. You may also choose to accommodate this time. Higher counts establish no greater authenticity, confidence or independence, and infer no gender, appearance or life history; lower counts establish no absence of preferences."
      }
    ]
  },
  {
    "id": "jjk-gojo-maki",
    "title": {
      "zh": "五条与真希：换一种示例，或练好一个具体步骤",
      "en": "Gojo and Maki: change the example or practise a specific step"
    },
    "paragraphs": [
      {
        "zh": "初学者听懂字面却做不出折纸时，五条角度先换一种演示或比喻，检查任务是否更容易理解；真希角度放慢一个动作，用有限的重复试着改善这一处。前者改变呈现方式，后者调整具体操作，不等于聪明与勤奋、天赋与努力的对立。",
        "en": "If a beginner understands the words but cannot make a fold, Gojo’s lens changes the demonstration or analogy and checks understanding. Maki’s slows one movement and tries bounded repetition. One changes presentation, the other a concrete operation; this is no opposition of intelligence and diligence or talent and effort."
      },
      {
        "zh": "新奇的解释可能只是有趣，并没有更清楚；继续重复也可能忽略不合适的材料或指令。可以问“刚才哪一步变清楚了”，试一遍后保留有效做法，必要时暂停或换设置。次数不评智商、教学水平、毅力、体能或真实熟练程度，也不分配固定学习风格。",
        "en": "A novel explanation may entertain without clarifying; repetition may overlook unsuitable materials or instructions. Ask which step became clearer, try once and retain what helps, pausing or changing the setup when needed. Counts assess no IQ, teaching skill, perseverance, physical ability or proficiency, and assign no fixed learning style."
      }
    ]
  },
  {
    "id": "jjk-toge",
    "title": {
      "zh": "狗卷：把意思、承诺和代表范围说清楚",
      "en": "Toge: clarify meaning, promises and whom a message represents"
    },
    "paragraphs": [
      {
        "zh": "官方资料把狗卷的特殊语言能力置于虚构设定中。[1] 本版转用一个普通表达问题：一条项目通知是否把观察说成命令、把建议说成批评，或替没有同意的人作了承诺？例如“我们周五交”与“我周五能交我的部分”代表不同范围。",
        "en": "The official guide places Toge’s unusual speech within fiction.[1] This edition instead asks an ordinary communication question: does a project note turn an observation into an order, a suggestion into criticism or a statement into an unagreed promise for someone else? We will deliver Friday and I can deliver my part Friday have different scopes."
      },
      {
        "zh": "它与伏黑的承诺角度相邻，但重点不同：伏黑选择自己愿意承担什么，狗卷检查话语是否准确表达这个安排。可以先问对方是否愿意听建议，再说一个具体观察。结果不要求沉默，也不推断语言障碍、危险性或对所有人感受的责任；不必反复检查每句话直到毫无歧义。",
        "en": "This sits beside Megumi’s commitment lens but has a different focus: Megumi chooses what to undertake, while Toge checks whether the message expresses that arrangement accurately. Ask whether advice is welcome, then offer a specific observation. Results require no silence and infer no speech disorder, danger or responsibility for everyone’s feelings; no sentence needs endless checking until all ambiguity disappears."
      }
    ]
  },
  {
    "id": "jjk-scoring",
    "title": {
      "zh": "24题怎样计分？六项计数与全部最高并列",
      "en": "How are twenty-four items scored? Six counts and every highest tie"
    },
    "paragraphs": [
      {
        "zh": "每题提供四个不同角度，选中一个就给该项加1。六位人物各出现16次，在A、B、C、D位置各出现4次；六项总和固定24，每项范围0—16。没出现和没选中的角度都不扣分。出现次数均衡是题本结构，不是信度、效度或准确度证据。",
        "en": "Each item offers four different lenses; selecting one adds one to its count. Each character appears sixteen times, four times in each A–D position. Counts sum to twenty-four and each ranges from zero to sixteen. Absent and unchosen lenses lose no points. Balanced exposure is a bank structure, not evidence of reliability, validity or accuracy."
      },
      {
        "zh": "全选A会六项各4，保留六份七节指南共42节。按页面次序，6、6、3、3、3、3保留虎杖与伏黑两份完整指南共14节；单项最高则保留该项7节。不会随机抽一位、按字母破同分或把近分自动合并。计数是本题组内的相对选择，不能转成人群百分位、角色相似概率或MBTI类型。",
        "en": "All A gives six counts of four and forty-two sections across six seven-section guides. In page order, 6, 6, 3, 3, 3, 3 retains fourteen sections for Yuji and Megumi; one highest lens retains seven. Randomness and letters do not break ties, and nearby counts do not merge automatically. These within-bank relative choices convert to no population percentile, character-similarity probability or MBTI type."
      }
    ]
  },
  {
    "id": "jjk-application",
    "title": {
      "zh": "同一本小刊物，六种回应可以先后出现",
      "en": "Six responses can happen within one small zine project"
    },
    "paragraphs": [
      {
        "zh": "一次自愿参与的小刊物创作，可以先陪新伙伴做一页草稿，再约清各自部分，保留个人题材，换示例解释排版，练一个折页细节，最后核对发布说明是否代表所有人。六种回应可以由同一个人先后采用，不需要给小组成员分配固定角色。",
        "en": "In a voluntary zine project, you might join a newcomer’s first draft, agree separate parts, keep a personal subject, explain layout with another example, practise a fold and check whether a publication note represents everyone. One person can use all six responses in succession without assigning permanent character roles to group members."
      },
      {
        "zh": "读完后找一个符合的例子和一个反例。例如你通常喜欢反复练习，但这次真正需要的是换材料。若愿意，试一个小调整并问参与者是否有帮助。重测时活动、时间余量和选项理解都可能变，角色名称变化不足以说明人格改变，也不能预测关系配对或创伤反应。",
        "en": "Find a fitting example and a counterexample after reading. You may usually repeat a movement while this occasion really calls for different materials. If useful, try one small adjustment and ask participants whether it helped. Activities, available time and interpretation can change on retake; a different name establishes no personality change and predicts neither compatibility nor trauma responses."
      }
    ]
  },
  {
    "id": "jjk-evidence",
    "title": {
      "zh": "人物来源、研究范围与完整免费阅读",
      "en": "Character sources, research scope and complete free access"
    },
    "paragraphs": [
      {
        "zh": "官方第一季人物页支持名称、年级、教师身份和有限背景。[1] 它不提供本站题本的测量证据，也没有授权这些计数代表官方人物分类。本版24题、映射和指南是独立非官方同人创作；尚未建立信度、效度、常模或中英文测量等价性。双语内容一致，不等于已证明跨语言分数可比。",
        "en": "The official first-season page supports names, school years, a teaching role and limited background.[1] It provides no measurement evidence for this bank or authority for its counts as official character categories. The twenty-four items, mappings and guides are independent unofficial fan work. Reliability, validity, norms and English–Chinese measurement equivalence remain unestablished; bilingual content consistency does not prove score comparability across languages."
      },
      {
        "zh": "全部题目、计数和六份指南免费。开始直接进入题目，无需额外同意、邮箱、账号或另一测评。答案在浏览器计分；主动保存才建立24小时标签页草稿，完成、重测或退出清除即删除。可选分享只带公开人物名和链接，不带私人答案或计数；也可以只读指南、不接受比喻或随时停止。",
        "en": "All items, counts and six guides are free. Start opens questions directly without another agreement, email, account or assessment. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft cleared on completion, retake or exit-and-clear. Optional sharing includes public names and a link, not private answers or counts. You may simply read guides, reject a metaphor or stop."
      }
    ]
  }
];

export const jujutsuKaisenLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "虎杖与伏黑都愿意帮助，区别在哪里？",
      "en": "How do Yuji and Megumi differ when both help?"
    },
    "answer": {
      "zh": "本版虎杖先陪对方尝试下一小步，伏黑先选自己能认领的承诺。两种回应可以同时采用，不比较善良或牺牲程度。",
      "en": "Yuji joins a wanted next step; Megumi chooses a commitment to own. Both can coexist without ranking kindness or self-sacrifice."
    }
  },
  {
    "question": {
      "zh": "钉崎结果要求我坚持自己、不让步吗？",
      "en": "Does Nobara require refusing compromise?"
    },
    "answer": {
      "zh": "不要求。它讨论共同约定中愿意保留的个人表达，调整或配合也可以，不评价自信、外貌或独立程度。",
      "en": "No. It concerns personal expression within shared agreements. Adjustment and accommodation remain valid without ranking confidence, appearance or independence."
    }
  },
  {
    "question": {
      "zh": "五条结果代表聪明或善于教学吗？",
      "en": "Does Gojo mean intelligence or teaching ability?"
    },
    "answer": {
      "zh": "不是。本版只看是否较想换一种示例或框架，并检查是否更清楚，不测智商、天赋或教学表现。",
      "en": "No. It concerns trying a different example or framing and checking clarity, not IQ, talent or teaching performance."
    }
  },
  {
    "question": {
      "zh": "真希次数低是否代表不够努力？",
      "en": "Does a low Maki count mean insufficient effort?"
    },
    "answer": {
      "zh": "不代表。它只反映是否相对更常选具体步骤练习。材料、时间和指令都会影响选择，不评价毅力、体能或熟练程度。",
      "en": "No. It records relative choices of concrete practice. Materials, time and instructions can affect choices without assessing perseverance, physical ability or proficiency."
    }
  },
  {
    "question": {
      "zh": "狗卷角度是不是要少说话？",
      "en": "Does Toge mean speaking less?"
    },
    "answer": {
      "zh": "不是。它关注措辞、承诺和代表范围是否清楚，也可以直接表达需要；不要求沉默或为每个人的感受负责。",
      "en": "No. It concerns clear wording, promises and representation, including direct requests. It requires neither silence nor responsibility for everyone’s feelings."
    }
  },
  {
    "question": {
      "zh": "全选A会出现哪位角色？",
      "en": "Which character appears if I choose A throughout?"
    },
    "answer": {
      "zh": "六项各4，全部最高并列，保留六份七节指南共42节，不随机选一位，也不称为理想人格。",
      "en": "All six counts are four, retaining forty-two sections without randomly selecting one character or claiming an ideal personality."
    }
  },
  {
    "question": {
      "zh": "6、6、3、3、3、3会显示什么？",
      "en": "What appears for 6, 6, 3, 3, 3, 3?"
    },
    "answer": {
      "zh": "按页面次序，虎杖与伏黑最高并列，显示两份完整指南共14节和全部六项计数。",
      "en": "In page order, Yuji and Megumi tie highest, retaining fourteen guide sections and all six counts."
    }
  },
  {
    "question": {
      "zh": "为什么没有宿傩、七海或乙骨？",
      "en": "Why are Sukuna, Nanami and Yuta absent?"
    },
    "answer": {
      "zh": "本版固定六个角度与24题映射，其他人物不计分，也不藏在付费结果里。未收录人物不表示你缺少某项特质。",
      "en": "This edition fixes six lenses and twenty-four mapped items. Other characters are not scored or hidden behind payment; absence implies no missing trait."
    }
  },
  {
    "question": {
      "zh": "开始后还需要同意、注册或填写邮箱吗？",
      "en": "Must I agree again, register or enter an email after starting?"
    },
    "answer": {
      "zh": "不需要。点击开始直接进入24题，完整计数和指南免费，无需额外同意、邮箱、账号或前置测试。",
      "en": "No. Start directly opens twenty-four questions. Complete counts and guides are free without another agreement, email, account or prerequisite test."
    }
  }
];
