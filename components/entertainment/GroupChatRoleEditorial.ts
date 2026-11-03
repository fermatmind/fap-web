import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const groupChatRoleSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Group Chat Role Quiz: useful information, an opening to talk and personal welcome",
      "zh": "群聊角色趣味测试：信息、话题与具体的人"
    },
    "paragraphs": [
      {
        "en": "Six original scenes ask how you might respond when a dinner plan gets buried, someone shares a hobby, a conversation goes quiet, a new member arrives or a joke lands awkwardly. A final question asks what response to your contribution would please you. Choose for one casual group you enjoy, rather than every group you belong to.",
        "zh": "六道原创场景询问：聚餐安排被淹没、有人分享爱好、群里安静、新人加入或玩笑冷场时，你可能怎样回应；最后一题问你最喜欢别人怎样回应自己的贡献。请按一个自己喜欢的轻松群聊作答，不必代表加入过的全部群。"
      },
      {
        "en": "The three authored portraits are Signal Keeper, Spark Starter and Quiet Connector. They organize different functions a message can serve: making information findable, offering a light opening and noticing a particular person. No chat history, contact list, screenshot or messaging account is needed.",
        "zh": "三篇原创画像是信息整理员、话题点火者与安静的连接者，整理的是消息的不同作用：让信息容易找到、提供轻松入口，以及注意到具体的人。无需聊天记录、通讯录、截图或聊天软件账户。"
      }
    ]
  },
  {
    "id": "signal",
    "title": {
      "en": "Signal Keeper: make the current plan easy to recover",
      "zh": "信息整理员：让人能找回当前安排"
    },
    "paragraphs": [
      {
        "en": "A signal-oriented choice favors a short summary, a useful link or enough context for someone joining later. For example, after friends discuss a weekend exhibition, you might separate the agreed meeting time from a museum that is still only a suggestion. Clarity includes saying what has not yet been decided.",
        "zh": "信息侧重偏向简短汇总、有用链接，或给稍后加入的人补足背景。例如朋友讨论周末看展后，可以把已定见面时间与仍是建议的博物馆分开写。清楚也包括说明哪些事情尚未决定。"
      },
      {
        "en": "Threading is one product approach to keeping related messages together: Slack documents replies grouped around a specific message. This illustrates a tool feature, not evidence that a person has an organizational trait. In a casual group, ask whether a summary is wanted and avoid becoming the default recorder for every plan. [1]",
        "zh": "讨论串是让相关消息留在一起的一种产品做法；Slack说明了围绕特定消息组织回复的功能。这是工具功能示例，不证明某人具有组织特质。在轻松群里，可以先问是否需要汇总，也不必默认负责记录每次安排。[1]"
      }
    ]
  },
  {
    "id": "spark",
    "title": {
      "en": "Spark Starter: offer a small invitation, not a demand for activity",
      "zh": "话题点火者：给一个小邀请，不要求持续活跃"
    },
    "paragraphs": [
      {
        "en": "Spark choices provide a response people can make with little preparation: a short question, a playful caption or a light poll. An original example is asking which color people would give a rainy afternoon. Someone can answer briefly, react or simply read; a successful invitation does not require everyone to participate.",
        "zh": "话题选择给人一个无需太多准备就能接住的入口：短问题、有趣配文或轻松投票。例如问大家会给下雨的下午配哪种颜色。可以简答、做个反应，也可以只看；邀请不要求人人参与才算成立。"
      },
      {
        "en": "Silence can be an ordinary part of a casual chat. Repeating prompts, tagging everyone or making one person the joke may make joining less comfortable. The portrait concerns the alternatives you chose here, not popularity, extraversion, humor ability or a duty to entertain the group.",
        "zh": "安静可以是轻松群聊的普通状态。反复发题、不断全员提醒，或把某个人当笑点，可能让参与更不自在。画像讨论这里所选的做法，不测受欢迎程度、外向性或幽默能力，也不分配活跃全群的义务。"
      }
    ]
  },
  {
    "id": "connector",
    "title": {
      "en": "Quiet Connector: recognize a person without pressing for a reply",
      "zh": "安静的连接者：记得具体的人，不催答复"
    },
    "paragraphs": [
      {
        "en": "A connector-oriented response follows up on something a person actually shared or gives a newcomer a way into the conversation. You might ask whether a friend enjoyed the photography walk they mentioned, rather than asking them to explain why they have been quiet. Keep the question proportionate to the relationship.",
        "zh": "连接侧重会跟进对方实际分享过的事，或给新人一个加入的机会。可以问朋友上次提到的摄影散步是否有趣，而非追问为什么一直安静。问题的分寸应与实际关系相称。"
      },
      {
        "en": "The name Quiet Connector does not infer introversion, empathy level or an ability to know another person’s feelings. A private follow-up is still an invitation that may be declined. The recipient chooses what to disclose, and you are not responsible for interpreting every delay or managing everyone’s mood.",
        "zh": "“安静的连接者”不推断内向、共情水平或知晓别人感受的能力。私下跟进仍是对方可以拒绝的邀请；分享多少由对方决定，你也不必解释每次迟回或负责管理所有人的情绪。"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Keep one reference group and distinguish the purpose of a message",
      "zh": "固定一个参照群，并分清消息的用途"
    },
    "paragraphs": [
      {
        "en": "A family chat, hobby circle and time-sensitive work channel can call for different responses. This version asks about a casual group you enjoy. Use that same reference across all six questions; switching groups each time can make the counts harder to connect to a concrete experience.",
        "zh": "家庭群、爱好群与有时效要求的工作频道，可能需要不同回应。本版本询问你喜欢的轻松群，建议六题沿用同一个参照；每题更换群聊，会让次数更难对应具体经历。"
      },
      {
        "en": "Communication theory treats establishing sufficient shared understanding as a joint process shaped by purpose and medium. Clark and Brennan discuss how the costs and available techniques change across media. This helps frame why context matters; their chapter does not define or validate our three chat portraits. [2]",
        "zh": "沟通理论把达到当前目的所需的共同理解视为协作过程，受到用途和媒介影响。Clark与Brennan讨论了不同媒介的成本与可用做法。这有助于理解为何需要参照情境，但该章不定义或验证本站三种群聊画像。[2]"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six selections, three counts and every highest tie",
      "zh": "六次选择、三项次数与全部最高并列"
    },
    "paragraphs": [
      {
        "en": "Each selected option adds one to signal, spark or connector. All six questions must be complete before calculation. Each count is 0–6 and all three sum to 6. They summarize relative selections among these alternatives, not message frequency, reply speed, social ability or a comparison with other people.",
        "zh": "每个所选项给信息、话题或连接加一次，六题全部完成后计算。每项0至6，三项总和6，概括给定选项中的相对选择，不是消息频率、回复速度、社交能力或与他人的比较。"
      },
      {
        "en": "All directions with the highest count are retained. A 4–1–1 distribution gives one complete portrait, 3–3–0 gives two and 2–2–2 gives three. Seven highest sets are possible. Close unequal counts stay separate, and no random choice, question order or option position breaks a tie.",
        "zh": "同为最高的方向全部保留。4—1—1给一篇完整画像，3—3—0给两篇，2—2—2给三篇，共七种最高集合。相近不同分仍分开，不随机选择，也不按题序或选项位置破同分。"
      }
    ]
  },
  {
    "id": "reading",
    "title": {
      "en": "Read the complete portrait and its tradeoff",
      "zh": "一起读完整画像与它的取舍"
    },
    "paragraphs": [
      {
        "en": "Each public guide contains the full description, everyday example, possible use, tradeoff and optional experiment. Information can help someone catch up but interrupt enjoyable small talk; a prompt can open a conversation but become pressure; a follow-up can notice someone while also needing space for no reply.",
        "zh": "每篇公开指南包含完整描述、日常例子、可能用处、取舍与可选小尝试。信息整理可以方便补读，也可能打断愉快闲聊；话题能打开交流，也可能变成压力；跟进能注意到一个人，也需要容纳不答复。"
      },
      {
        "en": "A tied result makes several contributions visible. You may summarize an outing and then leave a light question, or welcome a newcomer by explaining the current plan. These are ways to consider the portraits together, not extra scored types. A lower count does not mean that contribution is absent from your real conversations.",
        "zh": "并列让几种贡献同时可见。可以汇总出行安排后留下轻松问题，也可以通过介绍当前计划欢迎新人。这些是一起读画像的方式，不是新增计分类型。次数较低不表示真实交流中没有那种贡献。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Scientific scope: an authored reflection, not a chat analysis",
      "zh": "科学性范围：原创反思，不是聊天记录分析"
    },
    "paragraphs": [
      {
        "en": "The quiz records your choice among supplied scenarios. It does not observe actual messages or measure whether other members found a contribution helpful. No reliability, construct validity, predictive validity or population norms have been established for this six-question set or its three portraits.",
        "zh": "测试记录你在给定场景中的选择，不观察实际消息，也不测量其他成员是否觉得这些贡献有帮助。本六题及其三篇画像尚未建立信度、构念效度、预测效度与人群常模。"
      },
      {
        "en": "Product features such as topics, threads, pins and notification settings can change how a chat works. Zulip, for example, describes topics that preserve conversational context across different response times. Such documentation illustrates design choices, not proof of a psychological classification, teamwork score or wellbeing effect. [3]",
        "zh": "话题、讨论串、置顶与通知设置等产品功能，会改变聊天的使用方式。例如Zulip说明了跨不同回复时间保留对话背景的话题结构。这类文档展示设计做法，不证明心理分类、团队协作分数或幸福感效果。[3]"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "One optional small change, with the group’s needs in mind",
      "zh": "一个可选小调整，结合群里的实际需要"
    },
    "paragraphs": [
      {
        "en": "Choose one ordinary situation rather than trying to perform your result. Offer a summary when an arrangement is hard to find, one easy question when you feel like talking, or a brief follow-up to something already shared. Notice whether the action suits both you and the others; there is no prescribed best role.",
        "zh": "选一个普通情境，不必表演结果标签。安排难找时可提出汇总；想聊天时可给一个容易回答的问题；也可简短跟进别人已分享的事。留意做法是否适合自己与他人，不预设哪种角色最好。"
      },
      {
        "en": "If a joke has hurt someone, changing the topic alone may leave the impact unaddressed. Acknowledge what happened when appropriate and respect what the person wants next. The quiz is not a moderation protocol, conflict-resolution assessment or substitute for a group’s safety rules.",
        "zh": "若玩笑已经伤到人，单纯换话题可能没有回应影响。适当时承认发生了什么，并尊重对方接下来想怎样处理。本测试不是群管理流程、冲突解决能力评估，也不代替群里的安全规则。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Direct entry, optional saving and public role guides",
      "zh": "直接开题、可选保存与公开角色指南"
    },
    "paragraphs": [
      {
        "en": "Start opens question one directly. Complete six selections to see raw counts and every highest full portrait. No agreement checkbox, account, chat export, screenshot, contact list or prior assessment is required. Optional saving lasts up to 24 hours in the current browser tab and clears on completion, exit-and-clear or retake.",
        "zh": "点击开始直接进入第一题。六次选择后查看原始次数与全部最高完整画像。无需同意勾选、账户、聊天导出、截图、通讯录或先做测评。可选保存只在当前浏览器标签页最长24小时，完成、退出清除或重测时删除。"
      },
      {
        "en": "All three public guides can be read without answering or sharing. Shared links identify public portraits, not your private choices or messages. A later result may differ with the reference group or selected answers; that difference alone does not show that your personality or friendships have changed.",
        "zh": "三篇公开指南可不作答、不分享直接阅读。分享链接使用公开画像身份，不带私人选择或消息。之后结果可能因参照群或所选答案不同而变化；单凭变化不说明人格或友谊已经改变。"
      }
    ]
  }
];
export const groupChatRoleFaq: FunFaq[] = [
  {
    "question": {
      "en": "What does the Group Chat Role Quiz explore?",
      "zh": "群聊角色趣味测试探索什么？"
    },
    "answer": {
      "en": "Six original scenarios compare keeping information clear, offering a light conversation opening and noticing a particular member. Results describe selected contributions in one casual group.",
      "zh": "六道原创场景比较理清信息、提供轻松话题入口与注意具体成员。结果描述一个轻松群聊中所选的贡献方式。"
    }
  },
  {
    "question": {
      "en": "How long does it take, and is the full result free?",
      "zh": "需要多久，完整结果免费吗？"
    },
    "answer": {
      "en": "About two minutes for six choices, without a time limit. All three full public guides and all highest tied portraits are free, without registration.",
      "zh": "六题约两分钟，不限时。三篇完整公开指南与全部最高并列画像免费，无需注册。"
    }
  },
  {
    "question": {
      "en": "Which group should I think about?",
      "zh": "应该参照哪个群？"
    },
    "answer": {
      "en": "Use one casual group you enjoy across all six questions. This version does not assess emergency work communication, moderation duties or every relationship in your life.",
      "zh": "六题沿用一个自己喜欢的轻松群。本版本不评估工作紧急沟通、群管理职责或生活中的全部关系。"
    }
  },
  {
    "question": {
      "en": "How are signal, spark and connector counted?",
      "zh": "信息、话题与连接怎样计数？"
    },
    "answer": {
      "en": "Each chosen option adds one to its assigned direction. After six answers, each count is 0–6 and their total is 6. These are relative selections, not ability or popularity scores.",
      "zh": "每个所选项给对应方向加一次。六题后各项0至6，总和6，是相对选择次数，不是能力或受欢迎程度分数。"
    }
  },
  {
    "question": {
      "en": "Can two or three roles tie?",
      "zh": "两个或三个角色可以并列吗？"
    },
    "answer": {
      "en": "Yes. All highest counts remain: 3–3–0 returns two complete portraits and 2–2–2 returns three. Seven highest sets are possible; unequal counts are not merged.",
      "zh": "可以。同为最高全部保留：3—3—0给两篇完整画像，2—2—2给三篇，共七种最高集合；不同次数不合并。"
    }
  },
  {
    "question": {
      "en": "Is Signal Keeper a permanent organizing duty?",
      "zh": "信息整理员意味着要一直负责组织吗？"
    },
    "answer": {
      "en": "No. It describes choices favoring summaries, context and useful links here. Organization can be shared, and a casual chat need not become a meeting agenda.",
      "zh": "不是。它描述这里侧重汇总、背景和实用链接的选择。组织工作可以分担，轻松群聊也不必变成会议议程。"
    }
  },
  {
    "question": {
      "en": "Does Spark Starter mean extraverted, popular or funny?",
      "zh": "话题点火者表示外向、受欢迎或有幽默能力吗？"
    },
    "answer": {
      "en": "No. It reflects choosing a low-preparation opening in these scenes. The quiz does not measure those traits or require you to keep the group active.",
      "zh": "不表示。它反映在这些场景里选择容易接住的入口，不测这些特质，也不要求持续活跃全群。"
    }
  },
  {
    "question": {
      "en": "Does Quiet Connector mean I know how everyone feels?",
      "zh": "安静的连接者说明我了解所有人的感受吗？"
    },
    "answer": {
      "en": "No. It names choices about follow-up and welcome. You cannot infer someone’s feelings from silence or assume they want a private message.",
      "zh": "不说明。它命名跟进与欢迎方面的选择，不能凭安静推断感受，也不能默认对方想收到私信。"
    }
  },
  {
    "question": {
      "en": "Is this a validated personality or communication assessment?",
      "zh": "这是已验证的人格或沟通能力测量吗？"
    },
    "answer": {
      "en": "No. It is an original reflection quiz with no established psychometric validation. Communication theory and product documentation provide context, not validation of these portraits.",
      "zh": "不是。这是尚未建立心理测量验证的原创反思测试。沟通理论与产品文档提供背景，不验证这些画像。"
    }
  },
  {
    "question": {
      "en": "Do you need my chat history or contacts?",
      "zh": "需要读取聊天记录或联系人吗？"
    },
    "answer": {
      "en": "No. Answer only the supplied scenarios. There is no chat connection, screenshot upload, contact import or real-message analysis.",
      "zh": "不需要。只回答给定场景，不连接聊天软件、不上传截图、不导入联系人，也不分析真实消息。"
    }
  },
  {
    "question": {
      "en": "Can I begin without agreeing, saving or sharing?",
      "zh": "可以不点同意、不保存、不分享就开始吗？"
    },
    "answer": {
      "en": "Yes. Start opens the first question directly. Saving is optional in the current tab for up to 24 hours. Full portraits do not depend on sharing or completing another test.",
      "zh": "可以。开始直接到第一题，保存可选，仅当前标签页最长24小时。完整画像不以分享或先做其他测试为条件。"
    }
  }
];
