import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Bespoke unofficial meme-reading supplement; source-bound items and reports stay intact. */
export const wojakLandingSections: QuestionnaireSection[] = [
  {
    "id": "wojak-edition",
    "title": {
      "zh": "Wojak测试探索什么？六种表达角度，不是整个人的类型",
      "en": "What does this Wojak Test explore? Six expression lenses, not a whole-person type"
    },
    "paragraphs": [
      {
        "zh": "Wojak／Feels Guy原是表达熟悉感受的反应图，后来出现许多不同变体；文化记录中的用法并不构成统一人格分类。[1] 本版只选六个名字，将它们联系到兴趣分享、歌单、手工、老游戏、每周帖子与轻松小挑战。题目问的是给定回应中现在更愿意选什么，不要求认出图片、知道出处或接受任何群体刻板印象。",
        "en": "Wojak / Feels Guy began as a reaction-image character, followed by many variants; documented cultural uses do not constitute a unified personality taxonomy.[1] This edition selects six names and connects them with hobby posts, playlists, crafts, games, weekly threads and lighthearted challenges. It asks which offered response you prefer now, without requiring image recognition, origin trivia or acceptance of group stereotypes."
      },
      {
        "zh": "18题与六种映射由费马独立编写，结果是这套文字选择的阅读角度，不是另一平台的量表或完整Wojak角色名册。Yes Chad、Soyjak、Trad Wife等不在本版六个结果中；未出现的角色不是被隐藏或排除的个人特征。角色集合不同的测试，名字相似也不能直接比较分数。",
        "en": "FermatMind independently authored eighteen items and six mappings. Results are reading angles for this text exercise, not another platform’s scale or the whole Wojak cast. Yes Chad, Soyjak and Trad Wife are outside this edition’s six results; an omitted character is no hidden or excluded personal trait. Similar names do not make scores comparable across different character sets."
      }
    ]
  },
  {
    "id": "wojak-recognition-possibility",
    "title": {
      "zh": "Feels Guy与Bloomer：先承认经历，还是先找一点可能",
      "en": "Feels Guy and Bloomer: recognising an experience or finding a small possibility"
    },
    "paragraphs": [
      {
        "zh": "Feels Guy在本版侧重“我懂这种普通时刻”的共鸣。朋友第一次手作不整齐，可以承认第一次照教程做也常有偏差，不必把话题变成自己的故事。反例是对方正在问具体尺寸，只有共鸣可能没有回答问题。选这些回应不证明共情能力更强，也不说明孤独、悲伤或希望别人透露隐私。",
        "en": "Here Feels Guy concerns recognising an ordinary moment. When a friend’s first craft is uneven, acknowledge how a first attempt can differ from a tutorial without making the conversation about your own life. A counterexample is someone asking for a measurement: recognition alone may not answer. Such choices establish neither greater empathy nor loneliness, sadness or a wish for private disclosure."
      },
      {
        "zh": "Bloomer在文化用法中常带乐观色彩，[2] 本版仅取“找一个做得到的小可能”。兴趣清单像作业时，可以挑一个仍好玩的部分，其余暂不决定。它与Feels Guy的差别是先承认经历还是先提小尝试，两者可以接着做。对方只想被听见时，建议未必合时；低计数也不表示悲观、缺少韧性或不愿改变。",
        "en": "Bloomer often has optimistic cultural associations,[2] but this form uses only the smaller idea of finding a manageable possibility. If a hobby list feels like homework, select one enjoyable part and leave the rest undecided. The distinction from Feels Guy is an initial acknowledgement versus a small experiment; both can follow one another. Suggestions may be poorly timed when someone wants to be heard, and a lower count establishes neither pessimism nor deficient resilience."
      }
    ]
  },
  {
    "id": "wojak-scepticism-familiarity",
    "title": {
      "zh": "Doomer与Boomer：质疑夸大承诺，或重访熟悉喜好",
      "en": "Doomer and Boomer: questioning inflated promises or revisiting a favourite"
    },
    "paragraphs": [
      {
        "zh": "Doomer这个梗带有灰暗的历史叙事，[3] 本版把它明确缩小为冷调评论和对夸大宣传的质疑。例如“一个技巧解决所有创作问题”，可以提醒材料与时间限制仍在，同时保留里面有用的小点子。它不是绝望、抑郁或人生前景的评估。反讽也不自动更真实、更聪明；朋友分享小开心时，降调评论可能并不合适。",
        "en": "Doomer carries a bleak historical narrative,[3] but this edition deliberately limits it to dry commentary and scepticism about exaggerated promises. If one tip supposedly solves every creative problem, note material and time constraints while keeping a useful idea. This assesses neither hopelessness, depression nor prospects. Irony is not automatically more truthful or intelligent; it may be unwelcome when a friend shares a small pleasure."
      },
      {
        "zh": "Boomer的梗用法涉及世代戏仿，[4] 这里仅指重新享受一个熟悉参考：老游戏的一段音效、仍喜欢的作品或带着具体回忆的物品。它与Doomer的区别是先回到喜欢的东西，还是先指出宣传与现实的落差。怀旧不必贬低新事物，也不能据此推算年龄、政治立场、技术水平或对年轻人的态度。",
        "en": "Boomer meme usage involves generational parody,[4] while this form concerns enjoying a familiar reference: a game sound, an old creation or an object with a particular memory. Its distinction from Doomer is returning to something enjoyed versus noting a gap between claims and reality. Nostalgia need not disparage new things and supplies no age, political, technical-skill or intergenerational-attitude estimate."
      }
    ]
  },
  {
    "id": "wojak-format-routine",
    "title": {
      "zh": "Zoomer与NPC：试新形式，或主动保留可重复流程",
      "en": "Zoomer and NPC: trying a format or choosing a repeatable routine"
    },
    "paragraphs": [
      {
        "zh": "Zoomer的文化称呼与世代戏仿有关，[5] 本版却只问对陌生形式的尝试意愿。例如兴趣记录换了呈现方式，可以先试一条，不必把所有内容迁移过去。它不是年轻、善用科技、注意力短或某种音乐品味的证据。喜欢新格式不等于相信效果宣传；试完继续用旧办法也可以是一次完整探索。",
        "en": "Zoomer’s cultural name involves generational parody,[5] but this form asks only about trying an unfamiliar format. If hobby records gain a new presentation, try one entry rather than migrate everything. This establishes neither youth, technical proficiency, short attention nor a music preference. Trying a format does not require believing its claims; returning to an older method can complete the exploration."
      },
      {
        "zh": "NPC原指游戏中的非玩家角色，其梗用法曾贬低真人的思考与内心语言。[6] 本版不采用这种判断，而明确改写为主动选择简单、可重复的兴趣流程。Zoomer问新形式会带来什么，NPC问怎样方便持续参加；一个新格式也可以成为新流程。低或高计数都不评价意识、自主性、原创性或人的价值。",
        "en": "NPC means non-player character in games, and meme usage has demeaned real people’s thought and inner speech.[6] This edition does not adopt that judgement: it explicitly remixes the name as voluntarily choosing a simple, repeatable hobby routine. Zoomer asks what a new format offers, while NPC asks how participation can be straightforward; a new format can become a routine. Neither high nor low counts judge consciousness, agency, originality or human worth."
      }
    ]
  },
  {
    "id": "wojak-counts-worked",
    "title": {
      "zh": "18题怎样计分？六项原始次数与全部最高并列",
      "en": "How are eighteen questions scored? Six raw counts and every highest tie"
    },
    "paragraphs": [
      {
        "zh": "每题有四项回应，选中给一个角度加1，六项合计18。每个角度参与12题，在四个位置各出现3次，另有6题没有该角度。缺席不计反对；没有反向题、加权、年龄或道德分。比如某角度选中6次，6／18是全部选择中的份额，6／12是它出现时的选中情况，都不是“有多像这个角色”的准确概率或人群百分位。",
        "en": "Each item offers four responses, and a selection adds one to one lens; the six counts sum to eighteen. Each lens appears in twelve items, three times in each position, and is absent from six. Absence is no vote against it. There are no reversal, weighting, age or morality points. Six selections can be expressed as six of all eighteen choices or six of that lens’s twelve appearances; neither is a resemblance probability or population percentile."
      },
      {
        "zh": "按页面顺序，6、6、2、2、1、1会保留Feels Guy与Bloomer两份七节报告，共14节；六项各3次则全部最高并列，六份报告共42节。最高只有一项时显示该项七节全文，其他公开指南仍可阅读。不按字母、题号或随机方式强选赢家。出现次数平衡只描述题目安排，不能证明选项吸引力相等或题本有效。",
        "en": "In page order, counts of 6, 6, 2, 2, 1, 1 retain Feels Guy and Bloomer’s two seven-section reports: fourteen sections. Six counts of three retain all six highest ties and forty-two sections. A single highest lens receives its seven-section guide, with all other public guides still readable. No alphabetical, item-order or random tie-break chooses a winner. Balanced exposure describes item design, not equal option appeal or validation."
      }
    ]
  },
  {
    "id": "wojak-one-post",
    "title": {
      "zh": "同一条兴趣帖可以容纳六种回应",
      "en": "One hobby post can accommodate all six responses"
    },
    "paragraphs": [
      {
        "zh": "分享一件第一次做的纸模型，可以承认过程有点手忙脚乱，选一处下次再试的小调整，给“十分钟完成杰作”的宣传开个温和玩笑，讲一个熟悉作品的细节，试新拍摄格式，再按固定方式记录。六个角度可以同时成立；题目要求一次只选一个优先回应，因此记录不了你完整的行动或情绪生活。",
        "en": "Sharing a first paper model might involve recognising an awkward process, choosing one small adjustment, gently joking about a ten-minute masterpiece promise, recalling a familiar creation, trying a photo format and making a routine record. All six angles can coexist. Selecting one priority per item cannot record your whole behaviour or emotional life."
      },
      {
        "zh": "阅读结果时，找一个最近符合的例子和一个不符合的例子，再问对方当时需要共鸣、建议、玩笑还是具体信息。近分可以并读，但相差一次没有经过验证的心理意义，也不自动产生混合型或隐藏身份。相同角色不证明两个人更合拍，重测变化也不够说明人格改变。",
        "en": "When reading, find a recent fitting example and a counterexample, then ask whether the other person wanted acknowledgement, suggestions, humour or specific information. Nearby guides can be read together, but a one-count gap has no validated psychological meaning and creates no automatic blend or hidden identity. Matching lenses establishes no better compatibility, and a changed retake does not establish personality change."
      }
    ]
  },
  {
    "id": "wojak-evidence-access",
    "title": {
      "zh": "文化来源、测量证据与免费使用",
      "en": "Cultural sources, measurement evidence and free access"
    },
    "paragraphs": [
      {
        "zh": "六条参考资料用于核对Wojak与各变体的文化用法，包括名称带来的刻板印象；它们不是创作者许可、官方分类或本问卷的心理测量研究。本卷尚未建立信度、效度、常模或中英文测量等价证据。这里的角色表达不能换算为MBTI、大五、临床分数、政治或职业结论。",
        "en": "Six references document cultural usage and associated stereotypes, not creator permission, an official taxonomy or psychometric research on this questionnaire. Form-specific reliability, validity, norms and English–Chinese measurement equivalence are unestablished. These expression lenses cannot be converted into MBTI, Big Five, clinical scores, political or career conclusions."
      },
      {
        "zh": "18题、六项计数与六份七节完整指南免费。点击开始直接作答；答案在浏览器计分，主动保存才建立本标签页24小时草稿，完成、清除或重测即删除。分享只含公开角色名与链接，不含选项或次数。参加与分享均自愿，任何结果都不应成为给别人贴标签、嘲弄或判断他人内心的依据。",
        "en": "All eighteen items, six counts and six seven-section guides are free. Start opens questions directly. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft, cleared on completion, clearing or retake. Sharing contains public names and a link, not selections or counts. Participation and sharing are voluntary; no result supplies grounds for labelling, ridiculing or judging another person’s inner life."
      }
    ]
  }
];

export const wojakLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "没见过这些梗图也可以做吗？",
      "en": "Can I take this without knowing these memes?"
    },
    "answer": {
      "zh": "可以。18题是原创兴趣交流情境，不考图片、出处、人物台词或网络知识；六份公开指南可先读。",
      "en": "Yes. Eighteen original hobby situations require no image recognition, origins, quotations or internet knowledge. All six public guides can be read first."
    }
  },
  {
    "question": {
      "zh": "Feels Guy与Bloomer在本卷有什么区别？",
      "en": "How do Feels Guy and Bloomer differ in this form?"
    },
    "answer": {
      "zh": "Feels Guy先承认一种普通经历，Bloomer先找一点做得到的尝试。可以先共鸣再建议，不是共情或乐观能力排名。",
      "en": "Feels Guy starts with recognising an experience; Bloomer starts with a manageable possibility. Acknowledgement can precede a suggestion without ranking empathy or optimism."
    }
  },
  {
    "question": {
      "zh": "Doomer结果代表悲观或心理状况吗？",
      "en": "Does a Doomer result establish pessimism or mental health?"
    },
    "answer": {
      "zh": "不代表。本版只取冷调评论与对夸大宣传的质疑，没有测量抑郁、绝望或人生前景。",
      "en": "No. This edition uses only dry commentary and scepticism about inflated claims, not measures of depression, hopelessness or prospects."
    }
  },
  {
    "question": {
      "zh": "Boomer与Zoomer结果会推算我的年龄吗？",
      "en": "Do Boomer and Zoomer results estimate my age?"
    },
    "answer": {
      "zh": "不会。这里分别表示熟悉喜好与新形式尝试，任何年龄都可以两者兼有。",
      "en": "No. Here they concern familiar favourites and trying new formats. People of any age can do both."
    }
  },
  {
    "question": {
      "zh": "6、6、2、2、1、1会显示哪些指南？",
      "en": "Which guides appear for counts of 6, 6, 2, 2, 1, 1?"
    },
    "answer": {
      "zh": "按页面次序，Feels Guy与Bloomer最高并列，两份七节全文共14节都显示，六项原始计数也全部保留。",
      "en": "In page order, Feels Guy and Bloomer tie highest, retaining fourteen sections across two complete seven-section guides and all six counts."
    }
  },
  {
    "question": {
      "zh": "全部选A会没有结果吗？",
      "en": "Does choosing A throughout produce no result?"
    },
    "answer": {
      "zh": "不会。本题组全A时六项各3次，全部最高并列，六份七节指南共42节，不随机删掉任何一项。",
      "en": "No. In this bank, all A produces six counts of three. All six tie highest, retaining forty-two sections across six seven-section guides without randomly discarding any."
    }
  },
  {
    "question": {
      "zh": "六项低计数代表缺少某种特质吗？",
      "en": "Does a low count mean a missing trait?"
    },
    "answer": {
      "zh": "不代表。每题只提供四个角度，计数反映本卷相对选择，不是完整特质清单或个人价值分数。",
      "en": "No. Each item offers four lenses. Counts describe relative choices in this bank, not a complete trait inventory or personal-worth score."
    }
  },
  {
    "question": {
      "zh": "重测后换了角色，是否说明性格改变？",
      "en": "Does a different retake lens mean my personality changed?"
    },
    "answer": {
      "zh": "不能仅凭角色名判断。先核对具体选择、活动情境与当时的余量；本卷没有区分人格变化与作答波动的测量证据。",
      "en": "A name alone cannot establish that. Examine choices, activity context and available energy; this bank has no evidence separating personality change from response variation."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要勾同意、填邮箱或付费吗？",
      "en": "Must I agree again, enter an email or pay after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入18题，无需额外同意、邮箱、注册或前置测评，全部完整指南免费。",
      "en": "No. Start opens eighteen items directly without another agreement, email, signup or prerequisite assessment. All complete guides are free."
    }
  }
];
