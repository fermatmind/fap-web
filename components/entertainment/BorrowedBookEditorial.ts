import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const borrowedBookSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Borrowed-book quiz: make the small agreement visible",
      "zh": "借书约定方式测试：把一个小约定说清楚"
    },
    "paragraphs": [
      {
        "en": "Borrowing a book involves more than deciding what to read. These six ordinary scenes explore when it goes back, whether a reading conversation is wanted and how the owner wants the object handled. Each question asks which offered part of the arrangement you would focus on.",
        "zh": "借书不只有“读什么”。六个普通场景分别涉及何时归还、是否愿意交流阅读，以及所有者希望怎样使用这件物品。每题询问你更想关注给定约定中的哪一部分。"
      },
      {
        "en": "Imagine an ordinary book and somebody willing to lend or borrow it. Either person can say that the arrangement does not suit them. You do not need a title, reading history or another person’s private information; the result describes your choices in the scenes.",
        "zh": "想象一本普通书，以及愿意借出或借入的人。任何一方都可以表示这项安排不合适。无需提供书名、阅读记录或他人私人信息；结果描述你在这些场景中的选择。"
      }
    ]
  },
  {
    "id": "return-plan",
    "title": {
      "en": "A clear return plan includes a way to discuss changes",
      "zh": "清楚归期，也包括怎样商量变化"
    },
    "paragraphs": [
      {
        "en": "Return-related choices concern the owner’s preferred timing, an update before the due date and an agreed handover. “I have not finished” explains your situation; it does not by itself extend the loan. Ask whether a new date works, and allow the owner to need the book back.",
        "zh": "归还选项关注所有者希望的时间、到期前的更新与约好的交接。“我还没读完”说明你的情况，本身不会延长借期。可以问新日期是否合适，也接受所有者需要先拿回书。"
      },
      {
        "en": "For example: “You wanted it on Saturday. May I keep it until Tuesday, or would you prefer that I return it?” This is a conversation prompt, not a required script. A high return count shows which offered actions you selected, without establishing punctuality across your life.",
        "zh": "例如：“你原先周六要书，我能留到周二吗，还是先还给你更合适？”这是可参考的说法，不是必须照念的台词。归还次数较高，表示选了哪些给定动作，不证明生活中一贯守时。"
      }
    ]
  },
  {
    "id": "reading-thread",
    "title": {
      "en": "A reading exchange is an invitation, not a repayment",
      "zh": "阅读交流是邀请，不是借书的偿付"
    },
    "paragraphs": [
      {
        "en": "Reading-thread choices leave room for one question, passage or reaction to be shared when both people want it. A borrower need not finish, like the recommendation or produce a full review to deserve an ordinary loan. A different interpretation is compatible with a considerate return.",
        "zh": "阅读线索选项给双方愿意时分享一个问题、一段文字或一点感受留空间。普通借书不要求借者读完、喜欢推荐，或交出完整评论。理解不同，也可以好好归还。"
      },
      {
        "en": "Keep notes separate from the borrowed pages, and ask before discussing spoilers. You might say, “There is one scene I would enjoy talking about, if you want to.” A low thread count does not establish low curiosity, poor comprehension or lack of interest in the person.",
        "zh": "把笔记留在借书之外，涉及剧透前先问。可以说：“有个场景我挺想聊，你愿意的话我们再说。”阅读线索次数低，不证明好奇心少、理解差，或不在意对方。"
      }
    ]
  },
  {
    "id": "owner-preferences",
    "title": {
      "en": "Ask about this book, rather than assuming a universal care rule",
      "zh": "询问这一本书，而非假定统一爱惜标准"
    },
    "paragraphs": [
      {
        "en": "Care-related choices make the owner’s preferences explicit. Ask before writing, folding a page, adding a tab or lending the book onward. Something described as removable is not automatically suitable for every paper, binding or personal preference. A separate note can avoid altering the object.",
        "zh": "爱惜选项让所有者偏好明确。写字、折页、贴标签或再借给别人前，先询问。标着“可移除”，不代表适合所有纸张、装订与个人偏好。另纸记下，可以避免改变物件。"
      },
      {
        "en": "A meaningful copy may be difficult to lend even if another edition is easy to find. The owner can decline without being assigned a selfish type. If a preference cannot be met, consider a different copy or access method rather than using the result to argue for permission.",
        "zh": "一本有意义的书，即使另一个版本容易找到，也可能不便出借。所有者可以拒绝，不因此被归为自私类型。偏好无法满足时，可以换一本或换种阅读途径，不凭测试结果争取许可。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six choices produce three counts and preserve every highest tie",
      "zh": "六次选择形成三项次数，完整保留最高并列"
    },
    "paragraphs": [
      {
        "en": "Each question has one option for return arrangements, one for a reading thread and one for care preferences. The chosen option adds one point to its portrait. After all six answers, each total is zero to six and the three totals sum to six. Personal results appear only after completion.",
        "zh": "每题为归还安排、阅读线索与爱惜偏好各提供一个选项。选中某项，对应画像加1次。六题完成后，每项0至6次，三项合计6次；全部完成才显示个人结果。"
      },
      {
        "en": "All portraits with the highest total remain: return 3, thread 3, care 0 retains two, while 2–2–2 retains three. The return, thread, care order arranges tied explanations only. One more selection is one more selection in this set, not a calibrated amount of honesty or care.",
        "zh": "所有最高画像均保留：归还3、交流3、爱惜0显示两种；2—2—2显示三种。归还、交流、爱惜顺序只安排并列说明。多选1次就是本题组多选1次，不是校准过的诚实或爱惜程度。"
      }
    ]
  },
  {
    "id": "combinations",
    "title": {
      "en": "A leading portrait does not cancel the rest of the agreement",
      "zh": "某项领先，不取消约定的其他部分"
    },
    "paragraphs": [
      {
        "en": "Return and care can combine as a handover date plus an agreed way to carry the book. Return and thread can combine as giving it back on time while leaving a conversation for later. Thread and care can combine as discussing a separate note without writing in the copy. These illustrate complementary actions, not additional scored traits.",
        "zh": "归还与爱惜可以搭配为交回日期加上约好的携带方式；归还与交流可以搭配为按时还书，把话头留待以后；交流与爱惜可以搭配为聊另纸笔记，不在原书上写字。这些说明行动怎样搭配，没有新增计分特质。"
      },
      {
        "en": "Every scene requires choosing one offered action even when several would matter in life. A zero therefore does not prove that you neglect that part. In particular, choosing a return or reading option after a crease is not permission to conceal damage or substitute discussion for resolving the object issue.",
        "zh": "现实中几件事可能都重要，题目仍要求只选一个给定动作，因此0次不证明忽视该部分。尤其在出现折痕后选择归还或交流选项，不表示可以隐瞒损伤，也不能用聊书代替处理物件问题。"
      }
    ]
  },
  {
    "id": "handling",
    "title": {
      "en": "Practical book handling has its own material evidence",
      "zh": "书籍的实际使用，有独立的材料依据"
    },
    "paragraphs": [
      {
        "en": "The Library of Congress recommends a clean surface, careful removal from a shelf and support that avoids forcing an open book flat. These are preventive handling practices for books, not evidence for a personality portrait. Follow the requirements of the specific owner or collection as well. [1]",
        "zh": "美国国会图书馆建议使用清洁台面、谨慎从书架取书，并提供支撑，避免强迫书完全摊平。这是预防损伤的使用做法，不是人格画像的证据；同时也应遵循具体所有者或馆藏的要求。[1]"
      },
      {
        "en": "The US National Archives advises gentle handling and a thin paper or ribbon bookmark. Its preservation guidance also warns against attempting repairs to unique books or books intended for future generations. These examples do not establish that an owner’s permission makes an adhesive, marking method or repair suitable for a particular material. [2]",
        "zh": "美国国家档案馆建议轻柔使用，并采用薄纸或丝带书签；其保存指引也提醒，不应自行修补独特或希望代代保存的书。这些例子不表示只要所有者允许，某种胶、标记或修补就适合具体材料。[2]"
      }
    ]
  },
  {
    "id": "damage",
    "title": {
      "en": "Name an accidental change before trying to fix it",
      "zh": "意外发生后，先说明变化，再商量处理"
    },
    "paragraphs": [
      {
        "en": "If a crease or other change occurs, describe it plainly and ask what the owner prefers next. Agree on the handover rather than delaying because the conversation feels awkward. Separate the facts about the object from guesses about what either person must feel.",
        "zh": "出现折痕或其他变化时，可以直接说明，并问所有者接着希望怎样处理。约好交接，不因谈起来尴尬而拖延。把物件事实与对双方情绪的猜测分开。"
      },
      {
        "en": "Do not improvise tape, glue, heat or washing as a repair on someone else’s copy. The Canadian Conservation Institute explains that binding, materials, handling and environment affect damage, and recommends a professional conservator for significant intervention on historic bindings. This quiz does not inspect a book or prescribe treatment. [3]",
        "zh": "不要在别人的书上临时尝试胶带、胶水、加热或水洗修补。加拿大文物保护研究所说明，装订、材料、使用方式与环境都影响损伤；历史装帧需重大干预时，应咨询专业修复人员。本测试不检查书籍，也不制定处理方案。[3]"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "An original borrowing story, distinct from reading assessment",
      "zh": "原创借书故事，与阅读能力评估分开"
    },
    "paragraphs": [
      {
        "en": "These are original entertainment scenes and editorial portraits. Counting is reproducible, but no reliability study, validity study or population norms are supplied for this six-question game. It cannot establish trustworthiness, conscientiousness, a reading level or the quality of a friendship.",
        "zh": "这些是原创娱乐场景与编辑画像。计数可以复现，但本六题游戏不提供信度研究、效度研究或人群常模，无法据此判定可信程度、尽责性、阅读水平或友情质量。"
      },
      {
        "en": "Reading-taste quizzes suggest genres or books, whereas reading assessments examine abilities with their own tasks. This page does neither: it explores choices about one shared object. Answer for the ordinary lending scene rather than mixing in rare-book study, institutional loan rules or someone else’s conduct.",
        "zh": "阅读口味测验会推荐题材或书目，阅读评估则用相应任务考察能力。本页都不是：它探索一件共用物品的约定选择。请以普通借书场景为参照，不混入珍本查阅、机构借阅规则或对他人行为的评价。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Try a small agreement, with voluntary saving and sharing",
      "zh": "尝试一个小约定，自主保存与分享"
    },
    "paragraphs": [
      {
        "en": "For one ordinary loan, ask when the item is wanted back, one relevant care preference and whether any reading conversation is welcome. It is fine to leave discussion out. Check the actual arrangement with the other person rather than using a portrait as proof that you are a suitable borrower.",
        "zh": "一次普通借物，可以问何时要回、一项相关爱惜偏好，以及是否愿意聊阅读。不安排讨论也可以。与对方核对真实约定，不把画像当作自己适合借物的证明。"
      },
      {
        "en": "Start opens the first question directly. Optional tab progress lasts up to twenty-four hours and clears on completion, retake or exit-and-clear. Copying shares leading portrait names and public links, excluding answers and counts. You can finish without saving, sharing or taking another test.",
        "zh": "点击开始直接进入第一题。可选标签页进度最多保留二十四小时，完成、重测或退出清除即删除。复制分享最高画像名称与公开链接，不含答案与次数。不保存、不分享、不做其他测试，也可完整结束。"
      }
    ]
  }
];
export const borrowedBookFaq: FunFaq[] = [
  {
    "question": {
      "en": "Do I need to name a book or provide my reading history?",
      "zh": "需要填写书名或阅读历史吗？"
    },
    "answer": {
      "en": "No. Imagine an ordinary book and a willing lender or borrower. No name, book list, account or information about another person is required.",
      "zh": "不需要。想象一本普通书与愿意借还的人，无需姓名、书单、账户或他人资料。"
    }
  },
  {
    "question": {
      "en": "How long does it take, and what is free?",
      "zh": "需要多久，哪些内容免费？"
    },
    "answer": {
      "en": "Six three-option questions take about two minutes, without a time limit. Every question, count, highest tie and all three full public portraits are free.",
      "zh": "六道三选一约两分钟，不限时。全部题目、次数、最高并列和三篇公开完整画像免费。"
    }
  },
  {
    "question": {
      "en": "Why can more than one portrait appear?",
      "zh": "为什么会出现多种画像？"
    },
    "answer": {
      "en": "Each selected option adds one point to one portrait. All highest totals remain; 3–3–0 keeps two and 2–2–2 keeps three. Display order never removes a tie.",
      "zh": "每个选项给一种画像加1次，所有最高次数均保留；3—3—0保留两种，2—2—2保留三种，显示顺序不淘汰并列。"
    }
  },
  {
    "question": {
      "en": "Does a zero care count mean I damage borrowed books?",
      "zh": "爱惜0次表示会损坏借书吗？"
    },
    "answer": {
      "en": "No. One choice is required in each scene, so a zero records other offered priorities being chosen. The quiz neither observes handling nor estimates the chance of damage.",
      "zh": "不表示。每题只能选一项，0次记录的是选了其他给定侧重点。本测试没有观察实际使用，也不估计损坏概率。"
    }
  },
  {
    "question": {
      "en": "Must I finish a book before returning it?",
      "zh": "必须读完才能还书吗？"
    },
    "answer": {
      "en": "No. Use the agreed return arrangement and ask before extending it. A loan can end with a book unfinished; further reading or conversation can remain optional.",
      "zh": "不必。按已约归还安排，延长前先询问。尚未读完也可以结束借阅，继续阅读与交流都是可选的。"
    }
  },
  {
    "question": {
      "en": "May I annotate or lend the copy onward?",
      "zh": "可以批注或转借吗？"
    },
    "answer": {
      "en": "Ask the owner before altering or sharing their copy. A removable label is not blanket permission; a separate note may avoid changing the book.",
      "zh": "改变或再分享对方的书之前先问。“可移除”标签不代表普遍许可，另纸记录可以避免改变原书。"
    }
  },
  {
    "question": {
      "en": "What should I do about an accidental crease?",
      "zh": "不小心折出痕迹怎么办？"
    },
    "answer": {
      "en": "Describe the change and ask what the owner wants next. Agree on the handover and avoid unapproved repairs. A selected quiz option does not excuse concealing damage.",
      "zh": "说明变化，询问所有者接下来希望怎样，约好交接，避免未经同意修补。测试选项不能作为隐瞒损伤的理由。"
    }
  },
  {
    "question": {
      "en": "Does a reading-thread portrait require a review?",
      "zh": "阅读线索画像要求写读后感吗？"
    },
    "answer": {
      "en": "No. A small conversation is optional for both people. Returning the book does not require liking it, agreeing about it or supplying a full reading report.",
      "zh": "不要求。小对话对双方都是可选的，还书不要求喜欢这本书、理解一致或提交完整读书报告。"
    }
  },
  {
    "question": {
      "en": "Is this a scientific measure of trust or reading ability?",
      "zh": "这是诚信或阅读能力的科学测量吗？"
    },
    "answer": {
      "en": "No. It is an original six-choice entertainment story with no supplied psychometric validation. Its counts cannot be converted into reading levels, personality scores or friendship quality.",
      "zh": "不是。这是未提供心理测量验证的原创六次选择娱乐故事，次数不能换算阅读等级、人格分数或友情质量。"
    }
  },
  {
    "question": {
      "en": "Do I have to agree, register or complete another test first?",
      "zh": "要先勾选同意、注册或做其他测试吗？"
    },
    "answer": {
      "en": "No. Start goes directly to the first question. You can answer all six and see the complete result without saving progress or taking another assessment.",
      "zh": "不需要。开始直接进入第一题，不保存进度、不做其他测评，也可完成六题并查看完整结果。"
    }
  },
  {
    "question": {
      "en": "What is saved, and what does copying share?",
      "zh": "保存什么，复制分享会包含什么？"
    },
    "answer": {
      "en": "Only an optional draft in this tab, expiring after twenty-four hours and clearing on completion, retake or exit-and-clear. Copying includes leading portrait names and public links, not answers or counts.",
      "zh": "仅自愿保存本标签页草稿，二十四小时后失效，完成、重测或退出清除即删除。复制含最高画像名称与公开链接，不含答案或次数。"
    }
  }
];
